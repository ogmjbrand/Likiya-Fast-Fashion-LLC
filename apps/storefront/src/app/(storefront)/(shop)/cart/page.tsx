"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";

import { Button, Separator } from "@likiya/ui";
import { formatPrice } from "@likiya/utils";

import { useCartStore } from "@/features/cart/store";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  if (items.length === 0) {
    return (
      <div className="container-luxury flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="font-heading text-2xl">Your bag is empty</h1>
        <Button asChild size="lg">
          <Link href="/collections/new-arrivals">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-luxury py-12">
      <h1 className="font-heading text-3xl">Your Bag</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-4 py-6">
              <div className="relative size-28 shrink-0 overflow-hidden bg-secondary">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.productName} fill sizes="112px" className="object-cover" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <div>
                    <Link href={`/products/${item.productSlug}`} className="font-medium hover:underline">
                      {item.productName}
                    </Link>
                    {item.variantTitle ? (
                      <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
                    ) : null}
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    aria-label={`Remove ${item.productName}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-md border border-border">
                    <button
                      className="p-2 disabled:opacity-40"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      className="p-2 disabled:opacity-40"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxQuantity}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit space-y-4 border border-border p-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
          <Separator />
          <Button asChild size="lg" className="w-full">
            <Link href="/checkout">Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
