import { sqlClient } from "@/lib/db";
import { pusherServer } from "./pusher-server";
import { logger } from "@/lib/logger";

interface NotificationParams {
  type: "order_failed" | "saldo_kritis";
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
  targetRoles: string[];
}

export async function createNotification(
  params: NotificationParams,
): Promise<void> {
  try {
    let notificationId: string;

    if (params.type === "order_failed") {
      const recent = await sqlClient<{ id: string; metadata: any }[]>`
        SELECT id, metadata
        FROM notifications
        WHERE type = 'order_failed'
          AND created_at > NOW() - INTERVAL '5 minutes'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (recent.length > 0) {
        const count = (recent[0].metadata?.count || 1) + 1;
        await sqlClient`
          UPDATE notifications
          SET
            title = ${`Order gagal berturut-turut`},
            body = ${`${count} order gagal dalam 5 menit terakhir. Silakan cek saldo deposit.`},
            metadata = jsonb_set(COALESCE(metadata, '{}'), '{count}', ${count}::jsonb)
          WHERE id = ${recent[0].id}
        `;
        notificationId = recent[0].id;
      } else {
        const result = await sqlClient<{ id: string }[]>`
          INSERT INTO notifications (type, title, body, metadata, target_roles)
          VALUES (
            ${params.type},
            ${params.title},
            ${params.body || null},
            ${JSON.stringify({ ...params.metadata, count: 1 })}::jsonb,
            ${params.targetRoles}
          )
          RETURNING id
        `;
        notificationId = result[0].id;
      }
    } else {
      const result = await sqlClient<{ id: string }[]>`
        INSERT INTO notifications (type, title, body, metadata, target_roles)
        VALUES (
          ${params.type},
          ${params.title},
          ${params.body || null},
          ${JSON.stringify(params.metadata || {})}::jsonb,
          ${params.targetRoles}
        )
        RETURNING id
      `;
      notificationId = result[0].id;
    }

    await pusherServer.trigger("admin-notifications", "new-notification", {
      id: notificationId,
      type: params.type,
      title: params.title,
      body: params.body,
      metadata: params.metadata,
      created_at: new Date().toISOString(),
    });

    logger.info("Notification created", {
      type: params.type,
      title: params.title,
    });
  } catch (error) {
    logger.error("Failed to create notification", {
      error,
      type: params.type,
    });
  }
}
