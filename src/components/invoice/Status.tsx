import { Transaction } from "@/types";

interface InvoiceStatusProps {
  order: Transaction | null;
  getBackgroundPayStatusColor: () => string;
  getBackgroundBuyStatusColor: () => string;
}

export function InvoiceStatus({
  order,
  getBackgroundPayStatusColor,
  getBackgroundBuyStatusColor,
}: InvoiceStatusProps) {
  if (!order) return null;

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <span className="text-muted-foreground md:w-1/3">Status Pembayaran</span>
      <span
        className={`inline-flex w-fit rounded-md px-2 py-1 text-xs font-semibold uppercase ${getBackgroundPayStatusColor()}`}
      >
        {order.payment_status}
      </span>
      <span className="text-muted-foreground md:w-1/3">Status Transaksi</span>
      <span
        className={`inline-flex w-fit rounded-md px-2 py-1 text-xs font-semibold uppercase ${getBackgroundBuyStatusColor()}`}
      >
        {order.buy_status}
      </span>
    </div>
  );
}
