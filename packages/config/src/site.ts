import { clientEnv } from "./env";

export const siteConfig = {
  name: "Likiya",
  fullName: "Likiya Fast Fashion",
  description:
    "Likiya is a luxury fashion house delivering considered, editorial menswear and womenswear — designed for longevity, cut for the modern wardrobe.",
  url: clientEnv.NEXT_PUBLIC_SITE_URL,
  ogImage: "/og-image.jpg",
  links: {
    instagram: "https://instagram.com/likiya",
    tiktok: "https://tiktok.com/@likiya",
    pinterest: "https://pinterest.com/likiya",
  },
  supportEmail: "care@likiya.com",
  currency: "USD",
  locale: "en-US",
} as const;

export const NAV_LINKS = [
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Women", href: "/collections/women" },
  { label: "Men", href: "/collections/men" },
  { label: "Accessories", href: "/collections/accessories" },
  { label: "Sale", href: "/collections/sale" },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { label: "New Arrivals", href: "/collections/new-arrivals" },
    { label: "Best Sellers", href: "/collections/best-sellers" },
    { label: "Gift Cards", href: "/gift-cards" },
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping & Returns", href: "/shipping-returns" },
    { label: "FAQ", href: "/faq" },
    { label: "Track Order", href: "/account/orders" },
  ],
  company: [
    { label: "Our Story", href: "/about" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Careers", href: "/careers" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "Accessibility", href: "/legal/accessibility" },
  ],
} as const;
