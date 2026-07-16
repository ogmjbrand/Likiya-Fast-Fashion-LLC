import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@likiya/utils";
import type { ProductWithRelations } from "@likiya/database";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];
  const isOnSale = product.compare_at_price && product.compare_at_price > product.base_price;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt_text ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
        ) : null}
        {secondaryImage ? (
          <Image
            src={secondaryImage.url}
            alt={secondaryImage.alt_text ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        ) : null}
        {isOnSale ? (
          <span className="absolute left-3 top-3 bg-accent px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-accent-foreground">
            Sale
          </span>
        ) : null}
      </div>
      <div className="mt-3 space-y-1">
        {product.brand ? (
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.brand.name}
          </p>
        ) : null}
        <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className={isOnSale ? "text-accent-foreground" : "text-foreground"}>
            {formatPrice(product.base_price, product.currency)}
          </span>
          {isOnSale ? (
            <span className="text-muted-foreground line-through">
              {formatPrice(product.compare_at_price!, product.currency)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[3/4] animate-pulse bg-secondary" />
      <div className="h-3 w-1/3 animate-pulse bg-secondary" />
      <div className="h-4 w-2/3 animate-pulse bg-secondary" />
    </div>
  );
}
