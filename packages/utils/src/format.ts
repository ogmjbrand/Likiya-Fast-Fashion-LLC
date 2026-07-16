import { siteConfig } from "@likiya/config";

export function formatPrice(amount: number, currency: string = siteConfig.currency): string {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat(siteConfig.locale, {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function formatOrderStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
