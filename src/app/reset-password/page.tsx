"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { ContentLayout } from "@/components/panel/content-layout";
import AuthCard from "@/components/auth/auth-card";
import TurnstileWidget from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiPath } from "@/lib/routes";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
  return (
    <ContentLayout title="Lupa Password">
      <Suspense
        fallback={
          <div className="w-full h-[80vh] flex justify-center items-center">
            <LoadingSpinner size={40} />
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </ContentLayout>
  );
}

function ForgotPasswordForm() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(apiPath("/api/settings"), { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!mounted) return;
        setSettings(json?.data || {});
      } catch {
      } finally {
        if (mounted) setSettingsLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const turnstileEnabled = useMemo(() => {
    const v = settings?.["turnstile.enabled"];
    return v === true || String(v).toLowerCase() === "true" || String(v) === "1";
  }, [settings]);

  const turnstileSiteKey = useMemo(() => String(settings?.["turnstile.site_key"] || ""), [settings]);

  const [turnstileTokenEmail, setTurnstileTokenEmail] = useState("");

  const [email, setEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);

  const captchaReadyEmail = !turnstileEnabled || (turnstileEnabled && turnstileTokenEmail.length > 10);
  const canSendEmail = captchaReadyEmail && !loadingEmail && isValidEmail(email);

  const handleSendEmail = async () => {
    if (!canSendEmail) return;
    setLoadingEmail(true);

    try {
      const res = await fetch(apiPath("/api/auth/password/forgot"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "email",
          email: email.trim(),
          ...(turnstileEnabled ? { turnstile_token: turnstileTokenEmail } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        toast.error(data?.message || "Gagal mengirim link reset");
        return;
      }

      toast.success("Jika email terdaftar, link reset akan dikirim");
    } catch {
      toast.error("Gagal menghubungi server");
    } finally {
      setLoadingEmail(false);
    }
  };

  const showTurnstileForEmail = turnstileEnabled && !!turnstileSiteKey;

  return (
    <AuthCard
      title="Lupa Password"
      description="Masukkan email kamu, lalu ikuti instruksi yang dikirimkan."
      footer={
        <div className="text-sm text-muted-foreground text-center">
          Ingat password?{" "}
          <Link href="/signin" className="text-primary underline underline-offset-4">
            Masuk
          </Link>
        </div>
      }
    >
      <div className="space-y-4" role="tabpanel">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            autoComplete="email"
            inputMode="email"
            disabled={loadingEmail}
          />
        </div>

        {showTurnstileForEmail ? (
          <div className="pt-1">
            <TurnstileWidget
              siteKey={turnstileSiteKey}
              onToken={(t) => setTurnstileTokenEmail(t)}
              onExpire={() => setTurnstileTokenEmail("")}
              onError={() => setTurnstileTokenEmail("")}
              className="flex justify-center"
            />
            {settingsLoaded && !turnstileTokenEmail ? (
              <div className="text-xs text-muted-foreground text-center mt-2">
                Selesaikan captcha dulu untuk melanjutkan.
              </div>
            ) : null}
          </div>
        ) : null}

        <Button onClick={handleSendEmail} disabled={!canSendEmail} className="w-full h-10">
          {loadingEmail ? "Mengirim..." : "Kirim Link Reset"}
        </Button>

        <div className="text-xs text-muted-foreground">
          Jika link sudah kamu dapat, lanjutkan ke halaman{" "}
          <Link href="/reset-password" className="underline underline-offset-4">
            reset password
          </Link>
          .
        </div>
      </div>
    </AuthCard>
  );
}
