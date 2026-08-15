import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";

const ALLOWED_TAGS = new Set([
  "catalog-games",
  "catalog-products",
  "catalog-categories",
  "catalog-payment",
  "settings",
  "marketplace",
]);

async function postHandler(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { success: false, message: "revalidate not configured" },
      { status: 503 },
    );
  }

  const provided = req.headers.get("x-revalidate-secret");
  if (!provided || provided !== secret) {
    return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { tags?: string[] } | null;
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const known = tags.filter((tag) => ALLOWED_TAGS.has(tag));
  if (known.length === 0) {
    return NextResponse.json({ success: false, message: "no known tags" }, { status: 400 });
  }

  for (const tag of known) {
    revalidateTag(tag, { expire: 0 });
  }

  logger.info("storefront cache revalidated", { tags: known });
  return NextResponse.json({ success: true, revalidated: known });
}

export const POST = withRequestLogging(postHandler);
