import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@likiya/utils";
import type { ProductWithRelations } from "@likiya/database";

import { TiltCard } from "@/components/motion/tilt-card";
import { QuickView } from "@/components/product/quick-view";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];
  const isOnSale = product.compare_at_price && product.compare_at_price > product.base_price;

  return (
    <div className="group">
      <div className="relative">
        <TiltCard maxTilt={6}>
          <Link href={`/products/${product.slug}`} className="block">
            <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt_text ?? product.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className={
                    secondaryImage
                      ? "object-cover transition-opacity duration-500 group-hover:opacity-0"
                      : "object-cover"
                  }
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
                <span className="absolute left-3 top-3 bg-brand-pink px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                  Sale
                </span>
              ) : null}
            </div>
          </Link>
        </TiltCard>

        <QuickView product={product} />
      </div>

      <Link href={`/products/${product.slug}`} className="mt-3 block space-y-1">
        {product.brand ? (
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand.name}</p>
        ) : null}
        <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className={isOnSale ? "font-semibold text-brand-pink" : "text-foreground"}>
            {formatPrice(product.base_price, product.currency)}
          </span>
          {isOnSale ? (
            <span className="text-muted-foreground line-through">
              {formatPrice(product.compare_at_price!, product.currency)}
            </span>
          ) : null}
        </div>
      </Link>
    </div>
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
