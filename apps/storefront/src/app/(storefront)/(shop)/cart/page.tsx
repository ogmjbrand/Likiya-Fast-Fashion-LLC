"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";

import { Button, Separator } from "@likiya/ui";
import { formatPrice } from "@likiya/utils";

import { useCartStore } from "@/features/cart/store";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  if (items.length === 0) {
    return (
      <div className="container-luxury flex min-h-[50vh] flex-col items-center justify-center gap-6 py-20 text-center">
        <p className="eyebrow-pink">Your Bag</p>
        <h1 className="font-display text-3xl font-black uppercase">Empty for now</h1>
        <Magnetic>
          <Button asChild size="lg" className="rounded-none">
            <Link href="/collections/new-arrivals">Continue Shopping</Link>
          </Button>
        </Magnetic>
      </div>
    );
  }

  return (
    <div className="container-luxury py-12">
      <div className="border-b border-border pb-8">
        <p className="eyebrow-pink">{items.length} item{items.length === 1 ? "" : "s"}</p>
        <h1 className="text-display-2 mt-2 font-display font-black uppercase">Your Bag</h1>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border">
          {items.map((item, i) => (
            <li key={item.variantId} className="py-6">
              <Reveal delay={i * 0.05} className="flex gap-4">
                <div className="relative size-28 shrink-0 overflow-hidden bg-secondary">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.productName} fill sizes="112px" className="object-cover" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-2">
                    <div>
                      <Link href={`/products/${item.productSlug}`} className="font-medium hover:text-brand-pink hover:underline">
                        {item.productName}
                      </Link>
                      {item.variantTitle ? (
                        <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
                      ) : null}
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      aria-label={`Remove ${item.productName}`}
                      className="text-muted-foreground hover:text-brand-pink"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 border border-border">
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
              </Reveal>
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
          <Magnetic className="block">
            <Button asChild size="lg" className="w-full rounded-none">
              <Link href="/checkout">Checkout</Link>
            </Button>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}
