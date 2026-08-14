import { describe, expect, it } from "vitest";
import { getPriceByRole } from "@/lib/pricing";

describe("pricing", () => {
  it("mengembalikan selling_price saat flag member mati", () => {
    expect(getPriceByRole({ selling_price: "15000" })).toBe(15000);
  });

  it("mengabaikan role saat flag member mati", () => {
    expect(getPriceByRole({ selling_price: "15000", selling_price_gold: 12000 }, "gold")).toBe(
      15000,
    );
  });

  it("null -> 0", () => {
    expect(getPriceByRole(null)).toBe(0);
  });

  it("menangani nilai string", () => {
    expect(getPriceByRole({ selling_price: "5000" })).toBe(5000);
  });
});
