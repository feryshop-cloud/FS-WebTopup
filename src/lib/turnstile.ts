import { logger } from "@/lib/logger";

export interface VerifyTurnstileOptions {
  token: string | null | undefined;
  expectedAction: string;
  clientIp?: string | null;
}

export interface VerifyTurnstileResult {
  success: boolean;
  reason?: string;
  hostname?: string;
  action?: string;
  errorCodes?: string[];
}

/**
 * Canonical server-side Turnstile siteverify implementation.
 * Verifies single-use token against challenges.cloudflare.com/turnstile/v0/siteverify,
 * enforcing action and allowed hostname match.
 */
export async function verifyTurnstileToken({
  token,
  expectedAction,
  clientIp,
}: VerifyTurnstileOptions): Promise<VerifyTurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) {
    logger.error("TURNSTILE_SECRET is not configured");
    return { success: false, reason: "Turnstile secret is not configured" };
  }

  const expectedHostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? "localhost,127.0.0.1,feryshop.com,stagging.feryshop.com")
      .split(",")
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  );

  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 2048 ||
    expectedHostnames.size === 0
  ) {
    logger.warn("Turnstile token invalid format or empty hostname allowlist", {
      tokenType: typeof token,
      tokenLength: typeof token === "string" ? token.length : 0,
      hostnamesCount: expectedHostnames.size,
    });
    return { success: false, reason: "invalid-token" };
  }

  try {
    const bodyParams = new URLSearchParams({
      secret,
      response: token,
    });

    if (clientIp) {
      bodyParams.set("remoteip", clientIp);
    }

    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: bodyParams,
    });

    if (!r.ok) {
      logger.error("Turnstile siteverify HTTP failure", { status: r.status });
      return { success: false, reason: `siteverify ${r.status}` };
    }

    const result = (await r.json()) as {
      success: boolean;
      "error-codes"?: string[];
      challenge_ts?: string;
      hostname?: string;
      action?: string;
      cdata?: string;
    };

    if (!result.success) {
      logger.warn("Turnstile challenge verification failed", {
        errorCodes: result["error-codes"],
      });
      return {
        success: false,
        reason: "verification-failed",
        errorCodes: result["error-codes"],
      };
    }

    if (result.action && result.action !== expectedAction) {
      logger.warn("Turnstile action mismatch", {
        expected: expectedAction,
        received: result.action,
      });
      return {
        success: false,
        reason: "action-mismatch",
      };
    }

    if (result.hostname && !expectedHostnames.has(result.hostname)) {
      logger.warn("Turnstile hostname not permitted", {
        received: result.hostname,
        allowed: Array.from(expectedHostnames),
      });
      return {
        success: false,
        reason: "hostname-mismatch",
      };
    }

    return {
      success: true,
      action: result.action,
      hostname: result.hostname,
    };
  } catch (err) {
    logger.error("Turnstile siteverify exception", { error: err });
    return {
      success: false,
      reason: "siteverify-exception",
    };
  }
}
