"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { ContentLayout } from "@/components/panel/content-layout";
import AuthCard from "@/components/auth/auth-card";
import { apiPath } from "@/lib/routes";
import TurnstileWidget, { type TurnstileWidgetHandle } from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignInPage() {
  return (
    <ContentLayout title="Masuk">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size={40} />
          </div>
        }
      >
        <SignInContent />
      </Suspense>
    </ContentLayout>
  );
}

function SignInContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

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

  const turnstileSiteKey = useMemo(
    () =>
      String(
        settings?.["turnstile.site_key"] ||
          process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
          "0x4AAAAAAE8YJ66GAChhwJAe",
      ),
    [settings],
  );

  const turnstileEnabled = useMemo(() => {
    const v = settings?.["turnstile.enabled"];
    if (v !== undefined) {
      return v === true || String(v).toLowerCase() === "true" || String(v) === "1";
    }
    return !!turnstileSiteKey;
  }, [settings, turnstileSiteKey]);

  useEffect(() => {
    if (session) redirect("/dashboard");
  }, [session]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);

  const [turnstileTokenEmail, setTurnstileTokenEmail] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null);

  const captchaReadyEmail =
    !turnstileEnabled || (turnstileEnabled && turnstileTokenEmail.length > 10);

  const canEmailLogin =
    captchaReadyEmail && !loadingEmail && isValidEmail(email) && password.length >= 6;

  const handleEmailLogin = async () => {
    if (!canEmailLogin) return;
    setLoadingEmail(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
        ...(turnstileEnabled ? { turnstile_token: turnstileTokenEmail } : {}),
      });

      if (!result?.ok) {
        toast.error("Email atau password salah");
        turnstileRef.current?.reset();
        setTurnstileTokenEmail("");
        return;
      }

      toast.success("Berhasil masuk");
      router.push(callbackUrl);
    } catch {
      toast.error("Gagal masuk");
      turnstileRef.current?.reset();
      setTurnstileTokenEmail("");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <AuthCard
      title="Masuk"
      description="Masuk dengan email dan password, atau lanjutkan dengan Google."
      footer={
        <div className="text-muted-foreground text-center text-sm">
          Belum punya akun?{" "}
          <Link href="/signup" className="text-primary underline underline-offset-4">
            Daftar sekarang
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
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
        </div>

        {turnstileEnabled && turnstileSiteKey ? (
          <div className="pt-1">
            <TurnstileWidget
              ref={turnstileRef}
              siteKey={turnstileSiteKey}
              action="login"
              onToken={(t) => setTurnstileTokenEmail(t)}
              onExpire={() => setTurnstileTokenEmail("")}
              onError={() => setTurnstileTokenEmail("")}
              className="flex justify-center"
            />
            {settingsLoaded && !turnstileTokenEmail ? (
              <div className="text-muted-foreground mt-2 text-center text-xs">
                Selesaikan captcha dulu untuk melanjutkan.
              </div>
            ) : null}
          </div>
        ) : null}

        <Button onClick={handleEmailLogin} disabled={!canEmailLogin} className="h-10 w-full">
          {loadingEmail ? "Memproses..." : "Login"}
        </Button>

        <div className="text-muted-foreground text-xs">
          Kesulitan masuk?{" "}
          <Link href="/forgot-password" className="underline underline-offset-4">
            Coba pemulihan akun
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
