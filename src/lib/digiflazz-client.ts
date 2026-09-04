import { logger } from "@/lib/logger";

export interface DigiflazzExecutionParams {
  orderId: string;
  sku: string;
  customerNo: string;
  amount?: number;
  testing?: boolean;
}

export interface DigiflazzExecutionResult {
  ok: boolean;
  status: "pending" | "success" | "failed" | "unknown";
  refId: string;
  orderId: string;
  serialNumber?: string;
  rc?: string;
  message: string;
  balanceBefore?: number;
  balanceAfter?: number;
}

export interface DigiflazzBalanceResult {
  deposit: number;
  cached: boolean;
  lastChecked: string;
}

function getServiceUrl(): string {
  return process.env.DIGIFLAZZ_SERVICE_URL || "http://fs-digiflazz-service:3002";
}

function getServiceHeaders(): Record<string, string> {
  const apiKey = process.env.DIGIFLAZZ_SERVICE_API_KEY || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  return headers;
}

/**
 * Memicu eksekusi transaksi top-up ke fs-digiflazz-service.
 * Dipanggil secara aman setelah pembayaran user terkonfirmasi settlement (payment.paid).
 */
export async function triggerDigiflazzTransaction(
  params: DigiflazzExecutionParams,
): Promise<DigiflazzExecutionResult> {
  const url = `${getServiceUrl()}/v1/transactions`;
  logger.info("Triggering Digiflazz transaction fulfillment", {
    orderId: params.orderId,
    sku: params.sku,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getServiceHeaders(),
      body: JSON.stringify(params),
    });

    const json = (await response.json()) as {
      ok: boolean;
      data: DigiflazzExecutionResult;
      error?: string;
      message?: string;
    };

    if (!response.ok && response.status !== 422) {
      throw new Error(
        `Digiflazz service error HTTP ${response.status}: ${json.message || json.error || "Unknown"}`,
      );
    }

    return json.data;
  } catch (error) {
    logger.error("Failed to call Digiflazz microservice", {
      orderId: params.orderId,
      error,
    });
    return {
      ok: false,
      status: "unknown",
      refId: `FS-${params.orderId}-FAIL`,
      orderId: params.orderId,
      message: error instanceof Error ? error.message : "Gagal terhubung ke microservice Digiflazz",
    };
  }
}

/**
 * Mengambil informasi saldo deposit Digiflazz saat ini dari fs-digiflazz-service.
 */
export async function getDigiflazzBalance(
  forceRefresh = false,
): Promise<DigiflazzBalanceResult | null> {
  const url = `${getServiceUrl()}/v1/balance${forceRefresh ? "?refresh=true" : ""}`;
  try {
    const response = await fetch(url, {
      headers: getServiceHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Balance query HTTP ${response.status}`);
    }
    const json = (await response.json()) as {
      ok: boolean;
      data: DigiflazzBalanceResult;
    };
    return json.data;
  } catch (error) {
    logger.error("Failed to query Digiflazz balance", { error });
    return null;
  }
}
