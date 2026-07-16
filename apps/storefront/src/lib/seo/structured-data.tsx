import { siteConfig } from "@likiya/config";
import type { Product, ProductVariant, ProductImage, Brand, Review } from "@likiya/database";

/** Renders a `<script type="application/ld+json">` tag from a JSON-LD object. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.fullName,
    url: siteConfig.url,
    logo: new URL("/logo.png", siteConfig.url).toString(),
    sameAs: Object.values(siteConfig.links),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.fullName,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(
  product: Product & { brand: Brand | null; images: ProductImage[]; variants: ProductVariant[] },
  reviews: Review[] = [],
) {
  const prices = product.variants.map((v) => v.price);
  const lowPrice = Math.min(product.base_price, ...prices);
  const highPrice = Math.max(product.base_price, ...prices);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map((i) => i.url),
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    sku: product.variants[0]?.sku,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.currency,
      lowPrice,
      highPrice,
      offerCount: product.variants.length || 1,
      availability: "https://schema.org/InStock",
    },
    aggregateRating:
      product.review_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.avg_rating,
            reviewCount: product.review_count,
          }
        : undefined,
    review: reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: r.rating },
      author: { "@type": "Person", name: "Verified Buyer" },
      reviewBody: r.body ?? undefined,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
