"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

import { ContentLayout } from "@/components/panel/content-layout";
import { useSettings } from "@/context/settings-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const toInt = (v: any, fallback: number) => {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
};

const formatNumber = (n: number) => n.toLocaleString("id-ID");

export default function ZodiacCalculatorPage() {
  interface Settings {
    data: Record<string, any>;
  }

  const settings = useSettings() as unknown as Settings | null;

  const enabled = Boolean(settings?.data?.["enable_kalkulator_zodiac"]);
  const target = Math.max(1, toInt(settings?.data?.["kalkulator.zodiac.max_points"], 100));

  const WORST_CASE_STAR_PER_DRAW = 1.2;
  const COST_PER_DRAW = 20;

  const [points, setPoints] = useState<string>("0");

  const currentPoint = useMemo(() => {
    const v = toInt(points, 0);
    return Math.min(v, target);
  }, [points, target]);

  const helper = useMemo(() => {
    const raw = Number(points);
    if (!Number.isFinite(raw)) return "Masukkan angka yang valid.";
    if (raw < 0) return "Point tidak boleh negatif.";
    if (raw > target) return `Point kamu tidak boleh melebihi maksimal ${target}.`;
    return "";
  }, [points, target]);

  const calc = useMemo(() => {
    const remainingPoint = Math.max(0, target - currentPoint);
    const estimatedDraws = Math.ceil(remainingPoint / WORST_CASE_STAR_PER_DRAW);
    const totalDiamonds = estimatedDraws * COST_PER_DRAW;

    return { remainingPoint, estimatedDraws, totalDiamonds };
  }, [currentPoint, target]);

  return (
    <ContentLayout title="Kalkulator Zodiac">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge
            className="mb-3 border border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-200"
            variant="secondary"
          >
            Zodiac
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Cek Zodiac</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Estimasi worst-case agar user tidak kekurangan DM.
          </p>
        </div>

        {!enabled ? (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-sky-500" />
                Kalkulator Zodiac
                <Badge variant="secondary" className="ml-auto">
                  Nonaktif
                </Badge>
              </CardTitle>
              <CardDescription>Fitur ini sedang dinonaktifkan oleh admin.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/">Kembali ke Beranda</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-sky-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-sky-500" />
                Kalkulator Zodiac
                <Badge
                  className="ml-auto border border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-200"
                  variant="secondary"
                >
                  Max {formatNumber(target)} Point
                </Badge>
              </CardTitle>
              <CardDescription>Input point (0 sampai {formatNumber(target)}).</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="points">Point Zodiac Kamu</Label>
                <Input
                  id="points"
                  inputMode="numeric"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder={`0 - ${target}`}
                />
                {helper && <div className="text-destructive text-sm">{helper}</div>}
              </div>

              <Separator />

              <div className="space-y-3 rounded-lg border border-sky-500/20 p-4">
                <div className="text-sm font-medium">Hasil</div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="bg-secondary rounded-md p-3">
                    <div className="text-xs opacity-70">Point Kamu</div>
                    <div className="text-2xl font-semibold">{formatNumber(currentPoint)}</div>
                  </div>
                  <div className="bg-secondary rounded-md p-3">
                    <div className="text-xs opacity-70">Sisa Point</div>
                    <div className="text-2xl font-semibold">
                      {formatNumber(calc.remainingPoint)}
                    </div>
                  </div>
                  <div className="rounded-md border border-sky-500/20 bg-sky-500/10 p-3">
                    <div className="text-xs text-sky-700 dark:text-sky-200">
                      Membutuhkan Maksimal
                    </div>
                    <div className="text-2xl font-semibold text-sky-700 dark:text-sky-200">
                      {formatNumber(calc.totalDiamonds)} Diamonds
                    </div>
                  </div>
                </div>

                <div className="text-muted-foreground text-sm">
                  Estimasi: {formatNumber(calc.remainingPoint)} point ÷ 1.2 (worst-case) ={" "}
                  <span className="font-medium">{formatNumber(calc.estimatedDraws)}</span> draw,
                  biaya {formatNumber(COST_PER_DRAW)} DM/draw
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="secondary" onClick={() => setPoints("0")}>
                  Reset
                </Button>
                <Button asChild>
                  <Link href="/price-list">Topup Sekarang</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ContentLayout>
  );
}
