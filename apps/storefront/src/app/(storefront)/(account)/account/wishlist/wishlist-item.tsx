"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@likiya/ui";
import { formatPrice } from "@likiya/utils";

import { removeWishlistItem } from "@/features/account/actions";
import { useCartStore } from "@/features/cart/store";
import type { WishlistItemWithProduct } from "@/features/account/queries";

export function WishlistItemCard({ item }: { item: WishlistItemWithProduct }) {
  const [isPending, startTransition] = useTransition();
  const addItem = useCartStore((s) => s.addItem);
  const image = item.variant.images[0];

  return (
    <div className="group relative">
      <Link href={`/products/${item.variant.product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
          {image ? (
            <Image src={image.url} alt={item.variant.product.name} fill sizes="25vw" className="object-cover" />
          ) : null}
        </div>
        <p className="mt-2 text-sm font-medium">{item.variant.product.name}</p>
        <p className="text-sm text-muted-foreground">{formatPrice(item.variant.price)}</p>
      </Link>
      <div className="mt-2 flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          onClick={() =>
            addItem(
              {
                variantId: item.variant.id,
                productId: item.variant.product.id,
                productName: item.variant.product.name,
                productSlug: item.variant.product.slug,
                variantTitle: item.variant.title,
                sku: item.variant.sku,
                price: item.variant.price,
                compareAtPrice: item.variant.compare_at_price,
                imageUrl: image?.url ?? null,
                maxQuantity: 10,
              },
              1,
            )
          }
        >
          Add to Bag
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await removeWishlistItem(item.id);
              toast.success("Removed from wishlist.");
            })
          }
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
