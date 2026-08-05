export const BuyStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESS: "success",
  FAILED: "failed",
} as const;

export type BuyStatus = (typeof BuyStatus)[keyof typeof BuyStatus];

export const BuyStatusLabel: Record<BuyStatus, string> = {
  [BuyStatus.PENDING]: "Menunggu",
  [BuyStatus.PROCESSING]: "Diproses",
  [BuyStatus.SUCCESS]: "Sukses",
  [BuyStatus.FAILED]: "Gagal",
};

export const BuyStatusBadgeClass: Record<BuyStatus, string> = {
  [BuyStatus.PENDING]: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  [BuyStatus.PROCESSING]: "bg-info/10 text-info border border-info/20",
  [BuyStatus.SUCCESS]: "bg-success/10 text-success border border-success/20",
  [BuyStatus.FAILED]: "bg-destructive/10 text-destructive border border-destructive/20",
};

export const BuyStatusLegacyBadgeClass: Record<BuyStatus, string> = {
  [BuyStatus.PENDING]: "bg-yellow-500 text-black",
  [BuyStatus.PROCESSING]: "bg-info text-info-foreground",
  [BuyStatus.SUCCESS]: "bg-green-500 text-white",
  [BuyStatus.FAILED]: "bg-red-500 text-white",
};

export const PaymentStatus = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  EXPIRED: "expired",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentStatusLabel: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Menunggu",
  [PaymentStatus.PAID]: "Lunas",
  [PaymentStatus.FAILED]: "Gagal",
  [PaymentStatus.EXPIRED]: "Kadaluarsa",
};

export const PaymentStatusBadgeClass: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  [PaymentStatus.PAID]: "bg-success/10 text-success border border-success/20",
  [PaymentStatus.FAILED]: "bg-destructive/10 text-destructive border border-destructive/20",
  [PaymentStatus.EXPIRED]: "bg-muted text-muted-foreground border border-border",
};

export const VALID_BUY_STATUSES: readonly BuyStatus[] = Object.values(BuyStatus);
export const VALID_PAYMENT_STATUSES: readonly PaymentStatus[] = Object.values(PaymentStatus);

/**
 * Normalizes buy status string to standard BuyStatus type regardless of casing or legacy Indonesian labels.
 */
export function normalizeBuyStatus(rawStatus?: string | null): BuyStatus {
  if (!rawStatus) return BuyStatus.PENDING;
  const lower = rawStatus.toLowerCase().trim();

  if (lower === "pending" || lower === "menunggu") return BuyStatus.PENDING;
  if (lower === "proses" || lower === "processing" || lower === "diproses") return BuyStatus.PROCESSING;
  if (lower === "sukses" || lower === "success") return BuyStatus.SUCCESS;
  if (lower === "gagal" || lower === "batal" || lower === "failed") return BuyStatus.FAILED;

  return BuyStatus.PENDING;
}

/**
 * Normalizes payment status string to standard PaymentStatus type regardless of casing.
 */
export function normalizePaymentStatus(rawStatus?: string | null): PaymentStatus {
  if (!rawStatus) return PaymentStatus.PENDING;
  const upper = rawStatus.toUpperCase().trim();

  if (upper === "PAID" || upper === "SUCCESS" || upper === "LUNAS") return PaymentStatus.PAID;
  if (upper === "EXPIRED" || upper === "KADALUARSA") return PaymentStatus.EXPIRED;
  if (upper === "FAILED" || upper === "GAGAL" || upper === "CANCELLED") return PaymentStatus.FAILED;
  if (upper === "PENDING" || upper === "UNPAID" || upper === "MENUNGGU") return PaymentStatus.PENDING;

  return PaymentStatus.PENDING;
}

