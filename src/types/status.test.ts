import { describe, expect, it } from "vitest";
import {
  normalizeBuyStatus,
  normalizePaymentStatus,
  BuyStatus,
  PaymentStatus,
} from "@/types/status";

describe("normalizeBuyStatus", () => {
  it("returns PENDING for null/undefined/empty", () => {
    expect(normalizeBuyStatus(null)).toBe(BuyStatus.PENDING);
    expect(normalizeBuyStatus(undefined)).toBe(BuyStatus.PENDING);
    expect(normalizeBuyStatus("")).toBe(BuyStatus.PENDING);
  });

  it("normalizes standard English statuses (case-insensitive)", () => {
    expect(normalizeBuyStatus("pending")).toBe(BuyStatus.PENDING);
    expect(normalizeBuyStatus("PENDING")).toBe(BuyStatus.PENDING);
    expect(normalizeBuyStatus("Pending")).toBe(BuyStatus.PENDING);
    expect(normalizeBuyStatus("processing")).toBe(BuyStatus.PROCESSING);
    expect(normalizeBuyStatus("PROCESSING")).toBe(BuyStatus.PROCESSING);
    expect(normalizeBuyStatus("success")).toBe(BuyStatus.SUCCESS);
    expect(normalizeBuyStatus("SUCCESS")).toBe(BuyStatus.SUCCESS);
    expect(normalizeBuyStatus("failed")).toBe(BuyStatus.FAILED);
    expect(normalizeBuyStatus("FAILED")).toBe(BuyStatus.FAILED);
  });

  it("normalizes legacy Indonesian labels", () => {
    expect(normalizeBuyStatus("menunggu")).toBe(BuyStatus.PENDING);
    expect(normalizeBuyStatus("Menunggu")).toBe(BuyStatus.PENDING);
    expect(normalizeBuyStatus("proses")).toBe(BuyStatus.PROCESSING);
    expect(normalizeBuyStatus("diproses")).toBe(BuyStatus.PROCESSING);
    expect(normalizeBuyStatus("Diproses")).toBe(BuyStatus.PROCESSING);
    expect(normalizeBuyStatus("sukses")).toBe(BuyStatus.SUCCESS);
    expect(normalizeBuyStatus("Sukses")).toBe(BuyStatus.SUCCESS);
    expect(normalizeBuyStatus("gagal")).toBe(BuyStatus.FAILED);
    expect(normalizeBuyStatus("batal")).toBe(BuyStatus.FAILED);
    expect(normalizeBuyStatus("Batal")).toBe(BuyStatus.FAILED);
  });

  it("trims whitespace before normalizing", () => {
    expect(normalizeBuyStatus("  success  ")).toBe(BuyStatus.SUCCESS);
    expect(normalizeBuyStatus("\tfailed\n")).toBe(BuyStatus.FAILED);
  });

  it("returns PENDING for unknown status strings", () => {
    expect(normalizeBuyStatus("unknown")).toBe(BuyStatus.PENDING);
    expect(normalizeBuyStatus("cancelled")).toBe(BuyStatus.PENDING);
    expect(normalizeBuyStatus("xyz")).toBe(BuyStatus.PENDING);
  });
});

describe("normalizePaymentStatus", () => {
  it("returns PENDING for null/undefined/empty", () => {
    expect(normalizePaymentStatus(null)).toBe(PaymentStatus.PENDING);
    expect(normalizePaymentStatus(undefined)).toBe(PaymentStatus.PENDING);
    expect(normalizePaymentStatus("")).toBe(PaymentStatus.PENDING);
  });

  it("normalizes PAID variants", () => {
    expect(normalizePaymentStatus("PAID")).toBe(PaymentStatus.PAID);
    expect(normalizePaymentStatus("paid")).toBe(PaymentStatus.PAID);
    expect(normalizePaymentStatus("SUCCESS")).toBe(PaymentStatus.PAID);
    expect(normalizePaymentStatus("success")).toBe(PaymentStatus.PAID);
    expect(normalizePaymentStatus("LUNAS")).toBe(PaymentStatus.PAID);
    expect(normalizePaymentStatus("lunas")).toBe(PaymentStatus.PAID);
  });

  it("normalizes EXPIRED variants", () => {
    expect(normalizePaymentStatus("EXPIRED")).toBe(PaymentStatus.EXPIRED);
    expect(normalizePaymentStatus("expired")).toBe(PaymentStatus.EXPIRED);
    expect(normalizePaymentStatus("KADALUARSA")).toBe(PaymentStatus.EXPIRED);
    expect(normalizePaymentStatus("kadaluarsa")).toBe(PaymentStatus.EXPIRED);
  });

  it("normalizes FAILED variants", () => {
    expect(normalizePaymentStatus("FAILED")).toBe(PaymentStatus.FAILED);
    expect(normalizePaymentStatus("failed")).toBe(PaymentStatus.FAILED);
    expect(normalizePaymentStatus("GAGAL")).toBe(PaymentStatus.FAILED);
    expect(normalizePaymentStatus("gagal")).toBe(PaymentStatus.FAILED);
    expect(normalizePaymentStatus("CANCELLED")).toBe(PaymentStatus.FAILED);
    expect(normalizePaymentStatus("cancelled")).toBe(PaymentStatus.FAILED);
  });

  it("normalizes PENDING variants", () => {
    expect(normalizePaymentStatus("PENDING")).toBe(PaymentStatus.PENDING);
    expect(normalizePaymentStatus("UNPAID")).toBe(PaymentStatus.PENDING);
    expect(normalizePaymentStatus("unpaid")).toBe(PaymentStatus.PENDING);
    expect(normalizePaymentStatus("MENUNGGU")).toBe(PaymentStatus.PENDING);
    expect(normalizePaymentStatus("menunggu")).toBe(PaymentStatus.PENDING);
  });

  it("trims whitespace before normalizing", () => {
    expect(normalizePaymentStatus("  PAID  ")).toBe(PaymentStatus.PAID);
    expect(normalizePaymentStatus("\texpired\n")).toBe(PaymentStatus.EXPIRED);
  });

  it("returns PENDING for unknown status strings", () => {
    expect(normalizePaymentStatus("unknown")).toBe(PaymentStatus.PENDING);
    expect(normalizePaymentStatus("refunded")).toBe(PaymentStatus.PENDING);
  });
});
