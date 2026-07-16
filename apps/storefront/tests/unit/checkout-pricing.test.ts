import { describe, it, expect } from "vitest";

import { calculateShipping, calculateTax } from "@/features/checkout/pricing";

describe("calculateShipping", () => {
  it("is free at or above the free-shipping threshold", () => {
    expect(calculateShipping(150, "US")).toBe(0);
    expect(calculateShipping(200, "US")).toBe(0);
  });

  it("charges the flat US rate below the threshold", () => {
    expect(calculateShipping(50, "US")).toBe(12);
  });

  it("charges a higher rate for international orders below the threshold", () => {
    expect(calculateShipping(50, "GB")).toBe(18);
  });
});

describe("calculateTax", () => {
  it("applies US sales tax to the subtotal", () => {
    expect(calculateTax(100, "US")).toBeCloseTo(8);
  });

  it("charges no tax for non-US orders", () => {
    expect(calculateTax(100, "GB")).toBe(0);
  });

  it("rounds to two decimal places", () => {
    expect(calculateTax(33.33, "US")).toBeCloseTo(2.67, 2);
  });
});
