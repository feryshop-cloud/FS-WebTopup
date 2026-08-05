"use client";

import { ContentLayout } from "@/components/panel/content-layout";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useOrders } from "@/hooks/use-orders";
import useRealtimeTransactions from "@/hooks/use-realtime-transactions";
import { apiPath } from "@/lib/routes";
import { BuyStatus, BuyStatusLabel, VALID_BUY_STATUSES } from "@/types/status";

export default function InvoiceSearchPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"orderId" | "whatsapp">("orderId");
  const [orderId, setOrderId] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: orders, isLoading } = useRealtimeTransactions();

  const handleSubmitOrderId = async (e: FormEvent) => {
    e.preventDefault();

    if (!orderId.trim()) {
      toast.error("Nomor invoice tidak boleh kosong!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        apiPath(`/api/invoices/search?order_id=${encodeURIComponent(orderId)}`),
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || `Error ${response.status}`);
        return;
      }

      if (data.success && data.data) {
        router.push(`/invoices/${orderId}`);
      } else {
        toast.error(data.error || "Invoice tidak ditemukan!");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mencari invoice.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWhatsapp = async (e: FormEvent) => {
    e.preventDefault();

    const trimmed = whatsapp.trim();

    if (!/^62\d{9,13}$/.test(trimmed)) {
      toast.error("Nomor WhatsApp harus diawali dengan 62 dan terdiri dari 10-15 digit!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        apiPath(`/api/invoices/search-by-whatsapp?whatsapp=${encodeURIComponent(trimmed)}`),
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || `Error ${response.status}`);
        return;
      }

      if (data.data && data.data.length > 0) {
        router.push(`/invoices/whatsapp/${encodeURIComponent(trimmed)}`);
      } else {
        toast.error("Data order dengan nomor WhatsApp tersebut tidak ditemukan.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Terjadi kesalahan saat mencari data WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentLayout title="Search Invoice">
      <main className="relative">
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="space-y-3 text-center">
            <motion.h1
              className="text-foreground text-3xl font-bold tracking-tight md:text-4xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Cari Invoice Anda
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-sm md:text-base"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Masukkan nomor invoice atau nomor WhatsApp Anda untuk melihat detail transaksi
              pembelian.
            </motion.p>
          </div>

          <div className="border-border mt-8 flex justify-center space-x-4 border-b">
            <button
              type="button"
              onClick={() => setActiveTab("orderId")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "orderId"
                  ? "border-my-color text-my-color border-b-2"
                  : "text-muted-foreground hover:text-foreground"
              } transition`}
            >
              Order ID
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("whatsapp")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "whatsapp"
                  ? "border-my-color text-my-color border-b-2"
                  : "text-muted-foreground hover:text-foreground"
              } transition`}
            >
              No. WhatsApp
            </button>
          </div>

          {activeTab === "orderId" && (
            <motion.form
              onSubmit={handleSubmitOrderId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-background border-border mt-6 space-y-4 rounded-2xl border p-6 shadow-sm"
            >
              <div className="space-y-1">
                <label htmlFor="orderId" className="text-foreground text-sm font-medium">
                  Nomor Invoice
                </label>
                <motion.input
                  type="text"
                  name="orderId"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Contoh: INV-123456789"
                  className="border-input bg-muted text-foreground placeholder:text-muted-foreground focus:ring-my-color h-11 w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="bg-my-color hover:bg-my-hoverColor inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? "Mencari..." : "Cari Invoice"}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 25 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    opacity="0.4"
                    d="M11.1384 21L8.96382 20.1117C8.49095 19.919 7.95874 19.9346 7.49852 20.1545L6.72695 20.5232C5.91647 20.9115 4.97852 20.3199 4.97949 19.4209L4.98922 6.98335C4.98922 4.52368 6.35722 3 8.81203 3H16.2202C18.6819 3 20.0197 4.52368 20.0197 6.98335V11.2742"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.0011 19.4999L20.3931 20.8899M16.8328 14.9844C18.3195 14.9844 19.5241 16.1899 19.5241 17.6766C19.5241 19.1623 18.3195 20.3678 16.8328 20.3678C15.3461 20.3678 14.1406 19.1623 14.1406 17.6766C14.1406 16.1899 15.3461 14.9844 16.8328 14.9844Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </motion.form>
          )}

          {activeTab === "whatsapp" && (
            <motion.form
              onSubmit={handleSubmitWhatsapp}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-background border-border mt-6 space-y-4 rounded-2xl border p-6 shadow-sm"
            >
              <div className="space-y-1">
                <label htmlFor="whatsapp" className="text-foreground text-sm font-medium">
                  Nomor WhatsApp
                </label>
                <motion.input
                  type="tel"
                  name="whatsapp"
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 6281234567890"
                  className="border-input bg-muted text-foreground placeholder:text-muted-foreground focus:ring-my-color h-11 w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="bg-my-color hover:bg-my-hoverColor inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? "Mencari..." : "Cari Order"}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 25 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    opacity="0.4"
                    d="M11.1384 21L8.96382 20.1117C8.49095 19.919 7.95874 19.9346 7.49852 20.1545L6.72695 20.5232C5.91647 20.9115 4.97852 20.3199 4.97949 19.4209L4.98922 6.98335C4.98922 4.52368 6.35722 3 8.81203 3H16.2202C18.6819 3 20.0197 4.52368 20.0197 6.98335V11.2742"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.0011 19.4999L20.3931 20.8899M16.8328 14.9844C18.3195 14.9844 19.5241 16.1899 19.5241 17.6766C19.5241 19.1623 18.3195 20.3678 16.8328 20.3678C15.3461 20.3678 14.1406 19.1623 14.1406 17.6766C14.1406 16.1899 15.3461 14.9844 16.8328 14.9844Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </motion.form>
          )}
        </motion.section>

        <div className="mx-auto w-full max-w-6xl lg:rounded-lg lg:border lg:p-6">
          <h2 className="mb-2 text-left text-xl font-bold lg:text-center">Transaksi Real-Time</h2>
          <p className="mb-6 text-left text-sm text-gray-400 lg:text-center">
            Berikut ini Real-Time data pesanan masuk terbaru.
          </p>

          <div className="-mx-4 overflow-x-auto lg:mx-0">
            <table className="min-w-full whitespace-nowrap text-sm">
              <thead>
                <tr className="border-border text-muted-foreground bg-muted/20 border-b border-t text-left text-xs font-semibold uppercase tracking-wider">
                  <th className="p-3.5 text-left">Waktu</th>
                  <th className="p-3.5 text-left">Pelanggan / Invoice</th>
                  <th className="p-3.5 text-left">Game</th>
                  <th className="p-3.5 text-left">Produk</th>
                  <th className="p-3.5 text-left">Info / Harga</th>
                  <th className="p-3.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders?.data && orders.data.length > 0 ? (
                  orders.data.map((order: any, index: number) => {
                    const timeVal = order.created_at;
                    const displayTime = (() => {
                      if (!timeVal) return "-";
                      try {
                        const d = new Date(timeVal);
                        if (!isNaN(d.getTime())) {
                          return d.toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        }
                      } catch {}
                      return String(timeVal);
                    })();

                    const rawId = order.order_id || "";
                    const displayId = (() => {
                      if (rawId && typeof rawId === "string") {
                        if (rawId.length >= 6) {
                          return `${rawId.slice(0, 3)}***${rawId.slice(-3)}`;
                        }
                        return rawId;
                      }
                      return `TRX-${order.id || index + 1001}`;
                    })();

                    const displayGame = String(order.game || "Game");
                    const displayProduct = String(order.product || "-");

                    const displayExtra = (() => {
                      if (order.whatsapp) {
                        const wa = String(order.whatsapp);
                        return wa.length > 5 ? wa.replace(/.(?=.{3})/g, "*") : "628********";
                      }
                      const rawPrice = order.total_price;
                      if (rawPrice !== undefined && rawPrice !== null) {
                        const num = Number(rawPrice);
                        if (!isNaN(num) && num > 0) {
                          const formatted = num.toLocaleString("id-ID");
                          const firstDot = formatted.indexOf(".");
                          if (firstDot !== -1) {
                            const prefix = formatted.slice(0, firstDot);
                            const digitsBefore = prefix.replace(/\D/g, "").length;
                            const maskedLen = Math.max(2, String(rawPrice).length - digitsBefore);
                            return `Rp. ${prefix}.${"x".repeat(maskedLen)}`;
                          }
                          return `Rp. ${formatted}`;
                        }
                      }
                      return "-";
                    })();

                    const rawStatus = order.buy_status as string;
                    const isValidStatus = VALID_BUY_STATUSES.includes(rawStatus as BuyStatus);
                    if (!isValidStatus && rawStatus) {
                      console.warn(`Invalid buy_status: ${rawStatus}`);
                    }
                    const status = isValidStatus ? (rawStatus as BuyStatus) : BuyStatus.PENDING;
                    const statusLabel = BuyStatusLabel[status];
                    const badgeClass =
                      status === BuyStatus.PENDING
                        ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                        : status === BuyStatus.PROCESSING
                          ? "bg-info/10 text-info border border-info/20"
                          : status === BuyStatus.FAILED
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : status === BuyStatus.SUCCESS
                              ? "bg-success/10 text-success border border-success/20"
                              : "bg-muted text-muted-foreground border border-border";

                    return (
                      <motion.tr
                        key={rawId || order.id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-border/40 hover:bg-muted/40 border-b text-xs transition-colors"
                      >
                        <td className="text-muted-foreground p-3.5 font-medium">{displayTime}</td>
                        <td className="text-foreground p-3.5 font-mono font-semibold">
                          {displayId}
                        </td>
                        <td className="text-foreground p-3.5 font-medium">{displayGame}</td>
                        <td className="text-muted-foreground p-3.5">{displayProduct}</td>
                        <td className="text-muted-foreground p-3.5 font-mono">{displayExtra}</td>
                        <td className="p-3.5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${badgeClass}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr key="empty">
                    <td colSpan={6} className="text-muted-foreground p-8 text-center">
                      Belum ada transaksi masuk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </ContentLayout>
  );
}
