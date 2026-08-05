"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Shield, User2 } from "lucide-react";

import { ContentLayout } from "@/components/panel/content-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiPath, withBasePath } from "@/lib/routes";

type AccountMe = {
  success?: boolean;
  data?: {
    id: number;
    name: string | null;
    email: string | null;
    whatsapp: string | null;
    role: string | null;
    login_provider?: string | null;
  };
  message?: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(withBasePath(url), { cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(json?.message || "Request gagal");
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
};

export default function AccountSettingsPage() {
  const { data: session, status } = useSession();

  const token =
    (session as any)?.accessToken ||
    (session as any)?.user?.token ||
    (session as any)?.user?.accessToken;

  const isAuthed = status === "authenticated" && Boolean(token);

  const {
    data: me,
    isLoading: meLoading,
    error: meError,
    mutate,
  } = useSWR<AccountMe>(isAuthed ? "/api/account/me" : null, fetcher);

  const role = me?.data?.role ?? "Member";
  const nameValue = me?.data?.name ?? "";

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const initialName = useMemo(() => (typeof nameValue === "string" ? nameValue : ""), [nameValue]);

  useEffect(() => {
    if (!name && initialName) setName(initialName);
  }, [initialName, name]);

  useEffect(() => {
    if ((meError as any)?.status === 401) {
      toast.error("Sesi kamu sudah habis. Silakan login ulang.");
    }
  }, [meError]);

  const saveProfile = async () => {
    const next = name.trim();
    if (next.length < 2) return toast.error("Nama minimal 2 karakter.");
    setSavingName(true);
    try {
      const res = await fetch(apiPath("/api/account/profile"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: next }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan profil.");
      toast.success("Profil berhasil diperbarui.");
      await mutate();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async () => {
    if (password !== passwordConfirmation) return toast.error("Konfirmasi password tidak sama.");
    setSavingPassword(true);
    try {
      const res = await fetch(apiPath("/api/account/password"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: oldPassword,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengubah password.");
      toast.success("Password diperbarui.");
      setOldPassword("");
      setPassword("");
      setPasswordConfirmation("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingPassword(false);
    }
  };

  if (status === "loading")
    return (
      <ContentLayout title="Akun">
        <div className="space-y-6">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </ContentLayout>
    );

  if (!isAuthed) {
    return (
      <ContentLayout title="Akun">
        <div className="space-y-4 rounded-2xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground">Kamu perlu login untuk mengakses halaman ini.</p>
          <Button onClick={() => signIn()} className="rounded-full px-8">
            Login Sekarang
          </Button>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Pengaturan Akun">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="bg-card border-primary/10 flex flex-col gap-4 rounded-3xl border p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-2xl">
              <User2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {meLoading ? <Skeleton className="h-6 w-32" /> : me?.data?.name || "User"}
              </h2>
              <div className="mt-1 flex gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full text-[10px] font-bold uppercase tracking-wider"
                >
                  <Shield className="mr-1 h-3 w-3" /> {role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2 md:col-span-1">
            <h3 className="font-bold">Informasi Pribadi</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Kelola identitas publik kamu yang akan tampil pada setiap transaksi.
            </p>
          </div>
          <Card className="rounded-2xl border-none shadow-sm md:col-span-2">
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-muted rounded-xl"
                />
              </div>
              <Button onClick={saveProfile} disabled={savingName} className="rounded-xl px-6">
                {savingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan Perubahan
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2 md:col-span-1">
            <h3 className="font-bold">Keamanan Akun</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Update password secara berkala untuk menjaga akun tetap aman.
            </p>
          </div>
          <Card className="rounded-2xl border-none shadow-sm md:col-span-2">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Password Lama</Label>
                  <Input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Password Baru</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Konfirmasi</Label>
                    <Input
                      type="password"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <Button
                  onClick={savePassword}
                  disabled={savingPassword}
                  className="rounded-xl px-6"
                >
                  {savingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update
                  Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
}
