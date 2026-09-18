"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { ContentLayout } from "@/components/panel/content-layout";
import AuthCard from "@/components/auth/auth-card";
import TurnstileWidget, { type TurnstileWidgetHandle } from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiPath } from "@/lib/routes";

const DUPLICATE_MESSAGE =
  "Akun Dengan Email/WhatsApp Tersebut Sudah Terdaftar, Silahkan Masuk Dengan Email Tersebut.";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  return (
    <ContentLayout title="Daftar">
      <Suspense
        fallback={
          <div className="flex h-[80vh] w-full items-center justify-center">
            <LoadingSpinner size={40} />
          </div>
        }
      >
        <SignupContent />
      </Suspense>
    </ContentLayout>
  );
}

function SignupContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [settings, setSettings] = useState<Record<string, any>>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [turnstileTokenEmail, setTurnstileTokenEmail] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null);

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

  const [signupError, setSignupError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);

  const captchaReadyEmail =
    !turnstileEnabled || (turnstileEnabled && turnstileTokenEmail.length > 10);

  const canRegisterEmail =
    captchaReadyEmail &&
    !loadingEmail &&
    name.trim().length >= 2 &&
    isValidEmail(email) &&
    password.length >= 6;

  const showDuplicateAlert = () => setSignupError(DUPLICATE_MESSAGE);

  const handleRegisterEmail = async () => {
    if (!canRegisterEmail) return;
    setLoadingEmail(true);
    setSignupError(null);

    try {
      const res = await fetch(apiPath("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          ...(turnstileEnabled ? { turnstile_token: turnstileTokenEmail } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));
      const msg = String(data?.message || "Gagal mendaftar");

      if (!res.ok || !data?.success) {
        if (msg.toLowerCase().includes("sudah terdaftar")) showDuplicateAlert();
        else setSignupError(msg);
        turnstileRef.current?.reset();
        setTurnstileTokenEmail("");
        return;
      }

      toast.success("Berhasil mendaftar. Silakan masuk.");
      router.push(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } catch {
      setSignupError("Gagal menghubungi server");
      turnstileRef.current?.reset();
      setTurnstileTokenEmail("");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <AuthCard
      title="Daftar"
      description="Buat akun baru dengan email."
      footer={
        <div className="text-muted-foreground text-center text-sm">
          Sudah punya akun?{" "}
          <Link href="/signin" className="text-primary underline underline-offset-4">
            Masuk sekarang
          </Link>
        </div>
      }
    >
      {signupError ? (
        <Alert variant="destructive">
          <AlertTitle>Gagal Mendaftar</AlertTitle>
          <AlertDescription>{signupError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-4" role="tabpanel">
        <div className="space-y-2">
          <Label htmlFor="name">Nama</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kamu"
            autoComplete="name"
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            type="password"
            autoComplete="new-password"
          />
        </div>

        {turnstileEnabled && turnstileSiteKey ? (
          <div className="pt-1">
            <TurnstileWidget
              ref={turnstileRef}
              siteKey={turnstileSiteKey}
              action="signup"
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

        <Button onClick={handleRegisterEmail} disabled={!canRegisterEmail} className="h-10 w-full">
          {loadingEmail ? "Memproses..." : "Daftar"}
        </Button>
      </div>
    </AuthCard>
  );
}
