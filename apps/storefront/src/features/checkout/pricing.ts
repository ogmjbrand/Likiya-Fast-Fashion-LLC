import "server-only";

/**
 * Deliberately simple flat-rate shipping and tax rules for Phase 1
 * (single-region launch). A real multi-region deployment should replace
 * this with a proper tax engine (e.g. Stripe Tax, TaxJar) and carrier-rate
 * shopping — see docs/ARCHITECTURE.md's roadmap section.
 */

const FREE_SHIPPING_THRESHOLD = 150;
const FLAT_SHIPPING_RATE = 12;
const US_SALES_TAX_RATE = 0.08;

export function calculateShipping(subtotal: number, countryCode: string): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return countryCode === "US" ? FLAT_SHIPPING_RATE : FLAT_SHIPPING_RATE * 1.5;
}

export function calculateTax(subtotal: number, countryCode: string): number {
  if (countryCode !== "US") return 0;
  return Math.round(subtotal * US_SALES_TAX_RATE * 100) / 100;
}
