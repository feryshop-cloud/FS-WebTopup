/**
 * Standard PostgreSQL ENUMs for Order Statuses.
 * Synchronized with Database ENUMs: public.order_payment_status & public.order_buy_status
 */

export enum OrderBuyStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCESS = "success",
  FAILED = "failed",
}

export type BuyStatus = OrderBuyStatus;
export const BuyStatus = OrderBuyStatus;

export const BuyStatusLabel: Record<OrderBuyStatus, string> = {
  [OrderBuyStatus.PENDING]: "Menunggu",
  [OrderBuyStatus.PROCESSING]: "Diproses",
  [OrderBuyStatus.SUCCESS]: "Sukses",
  [OrderBuyStatus.FAILED]: "Gagal",
};

export const BuyStatusBadgeClass: Record<OrderBuyStatus, string> = {
  [OrderBuyStatus.PENDING]: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  [OrderBuyStatus.PROCESSING]: "bg-info/10 text-info border border-info/20",
  [OrderBuyStatus.SUCCESS]: "bg-success/10 text-success border border-success/20",
  [OrderBuyStatus.FAILED]: "bg-destructive/10 text-destructive border border-destructive/20",
};

export const BuyStatusLegacyBadgeClass: Record<OrderBuyStatus, string> = {
  [OrderBuyStatus.PENDING]: "bg-yellow-500 text-black",
  [OrderBuyStatus.PROCESSING]: "bg-info text-info-foreground",
  [OrderBuyStatus.SUCCESS]: "bg-green-500 text-white",
  [OrderBuyStatus.FAILED]: "bg-red-500 text-white",
};

export enum OrderPaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  SUCCESS = "success",
  FAILED = "failed",
  EXPIRED = "expired",
}

export type PaymentStatus = OrderPaymentStatus;
export const PaymentStatus = OrderPaymentStatus;

export const PaymentStatusLabel: Record<OrderPaymentStatus, string> = {
  [OrderPaymentStatus.PENDING]: "Menunggu",
  [OrderPaymentStatus.PAID]: "Lunas",
  [OrderPaymentStatus.SUCCESS]: "Sukses",
  [OrderPaymentStatus.FAILED]: "Gagal",
  [OrderPaymentStatus.EXPIRED]: "Kadaluarsa",
};

export const PaymentStatusBadgeClass: Record<OrderPaymentStatus, string> = {
  [OrderPaymentStatus.PENDING]: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  [OrderPaymentStatus.PAID]: "bg-success/10 text-success border border-success/20",
  [OrderPaymentStatus.SUCCESS]: "bg-success/10 text-success border border-success/20",
  [OrderPaymentStatus.FAILED]: "bg-destructive/10 text-destructive border border-destructive/20",
  [OrderPaymentStatus.EXPIRED]: "bg-muted text-muted-foreground border border-border",
};

export const VALID_BUY_STATUSES: readonly OrderBuyStatus[] = Object.values(OrderBuyStatus);
export const VALID_PAYMENT_STATUSES: readonly OrderPaymentStatus[] =
  Object.values(OrderPaymentStatus);

/**
 * Normalizes buy status string to standard BuyStatus type regardless of casing or legacy Indonesian labels.
 */
export function normalizeBuyStatus(rawStatus?: string | null): BuyStatus {
  if (!rawStatus) return BuyStatus.PENDING;
  const lower = rawStatus.toLowerCase().trim();

  if (lower === "pending" || lower === "menunggu") return BuyStatus.PENDING;
  if (lower === "proses" || lower === "processing" || lower === "diproses")
    return BuyStatus.PROCESSING;
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
  if (upper === "PENDING" || upper === "UNPAID" || upper === "MENUNGGU")
    return PaymentStatus.PENDING;

  return PaymentStatus.PENDING;
}
