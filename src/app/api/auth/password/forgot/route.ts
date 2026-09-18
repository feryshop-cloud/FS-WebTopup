import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").trim();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email wajib diisi" }, { status: 400 });
    }

    if (process.env.TURNSTILE_SECRET) {
      const turnstileToken =
        typeof body.turnstile_token === "string"
          ? body.turnstile_token
          : typeof body["cf-turnstile-response"] === "string"
            ? body["cf-turnstile-response"]
            : "";

      const clientIp =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("cf-connecting-ip") ||
        null;

      const turnstileResult = await verifyTurnstileToken({
        token: turnstileToken,
        expectedAction: "reset_password",
        clientIp,
      });

      if (!turnstileResult.success) {
        return NextResponse.json(
          { success: false, message: "Verifikasi bot (Turnstile) gagal. Silakan coba lagi." },
          { status: 403 },
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Link reset password telah dikirim ke email Anda",
      },
      { status: 200 },
    );
  } catch (err) {
    logger.error("Gagal mengirim link reset password", { error: err });
    return NextResponse.json(
      { success: false, message: "Gagal mengirim link reset password" },
      { status: 500 },
    );
  }
}
