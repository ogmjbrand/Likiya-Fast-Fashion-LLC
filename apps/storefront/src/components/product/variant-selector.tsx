"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Heart } from "lucide-react";

import { Button } from "@likiya/ui";
import { formatPrice } from "@likiya/utils";
import { analyticsEvents } from "@likiya/analytics";
import type { ProductWithRelations } from "@likiya/database";

import { useCartStore } from "@/features/cart/store";
import { addToWishlist } from "@/features/account/actions";
import { getColorSwatch, isColorOption } from "@/lib/colors";
import { cn } from "@likiya/utils";

export function VariantSelector({ product }: { product: ProductWithRelations }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const addItem = useCartStore((s) => s.addItem);
  const [isWishlisting, startWishlistTransition] = useTransition();

  const activeVariants = useMemo(
    () => product.variants.filter((v) => v.is_active),
    [product.variants],
  );

  const selectedValueIds = Object.values(selected);
  const matchedVariant = useMemo(() => {
    if (product.options.length === 0) return activeVariants[0];
    if (selectedValueIds.length !== product.options.length) return null;
    return activeVariants.find((v) =>
      selectedValueIds.every((id) => v.optionValueIds.includes(id)),
    );
  }, [activeVariants, selectedValueIds, product.options.length]);

  function handleAddToCart() {
    if (!matchedVariant) {
      toast.error("Select all options before adding to bag.");
      return;
    }

    addItem(
      {
        variantId: matchedVariant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantTitle: matchedVariant.title,
        sku: matchedVariant.sku,
        price: matchedVariant.price,
        compareAtPrice: matchedVariant.compare_at_price,
        imageUrl: product.images[0]?.url ?? null,
        maxQuantity: 10,
      },
      1,
    );

    analyticsEvents.addToCart(
      {
        item_id: matchedVariant.sku,
        item_name: product.name,
        price: matchedVariant.price,
        quantity: 1,
        item_variant: matchedVariant.title ?? undefined,
      },
      product.currency,
    );

    toast.success("Added to your bag.");
  }

  return (
    <div className="space-y-6">
      {product.options.map((option) => {
        const isColor = isColorOption(option.name);
        const selectedValue = option.values.find((v) => v.id === selected[option.id]);

        return (
          <div key={option.id} className="space-y-2">
            <p className="text-sm font-medium">
              {option.name}
              {isColor && selectedValue ? (
                <span className="ml-1 font-normal text-muted-foreground">&mdash; {selectedValue.value}</span>
              ) : null}
            </p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selected[option.id] === value.id;
                const isAvailable = activeVariants.some((v) => v.optionValueIds.includes(value.id));
                const swatch = isColor ? getColorSwatch(value.value) : null;

                if (swatch) {
                  return (
                    <button
                      key={value.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelected((prev) => ({ ...prev, [option.id]: value.id }))}
                      aria-label={value.value}
                      aria-pressed={isSelected}
                      title={value.value}
                      className={cn(
                        "relative size-9 rounded-full ring-1 ring-inset ring-black/10 transition-all disabled:cursor-not-allowed disabled:opacity-30",
                        isSelected
                          ? "outline outline-2 outline-offset-2 outline-primary"
                          : "hover:scale-110",
                      )}
                      style={{ background: swatch }}
                    >
                      {value.value.toLowerCase() === "white" ? (
                        <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/15" />
                      ) : null}
                    </button>
                  );
                }

                return (
                  <button
                    key={value.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelected((prev) => ({ ...prev, [option.id]: value.id }))}
                    className={`min-w-11 border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {value.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="space-y-3">
        <p className="text-2xl font-medium">
          {formatPrice(matchedVariant?.price ?? product.base_price, product.currency)}
        </p>
        <div className="flex gap-2">
          <Button size="lg" className="flex-1" onClick={handleAddToCart}>
            Add to Bag
          </Button>
          <Button
            size="lg"
            variant="outline"
            aria-label="Add to wishlist"
            disabled={!matchedVariant || isWishlisting}
            onClick={() =>
              startWishlistTransition(async () => {
                if (!matchedVariant) return;
                try {
                  await addToWishlist(matchedVariant.id);
                  toast.success("Added to wishlist.");
                } catch {
                  toast.error("Sign in to save items to your wishlist.");
                }
              })
            }
          >
            <Heart className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
