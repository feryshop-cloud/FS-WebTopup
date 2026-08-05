"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { ContentLayout } from "@/components/panel/content-layout";
import AuthCard from "@/components/auth/auth-card";
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
          <div className="flex h-[80vh] w-full items-center justify-center">
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
  const [email, setEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);

  const canSendEmail = !loadingEmail && isValidEmail(email);

  const handleSendEmail = async () => {
    if (!canSendEmail) return;
    setLoadingEmail(true);
    try {
      const res = await fetch(apiPath("/api/auth/password/forgot"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "email", email: email.trim() }),
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

  return (
    <AuthCard
      title="Lupa Password"
      description="Masukkan email kamu, lalu ikuti instruksi yang dikirimkan."
      footer={
        <div className="text-muted-foreground text-center text-sm">
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
          />
        </div>

        <Button onClick={handleSendEmail} disabled={!canSendEmail} className="h-10 w-full">
          {loadingEmail ? "Mengirim..." : "Kirim Link Reset"}
        </Button>

        <div className="text-muted-foreground text-xs">
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
