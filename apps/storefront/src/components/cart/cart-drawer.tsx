"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, Button, Separator } from "@likiya/ui";
import { useCartStore } from "@/features/cart/store";
import { formatPrice } from "@likiya/utils";
import { Magnetic } from "@/components/motion/magnetic";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  return (
    <Sheet open={isOpen} onOpenChange={(open: boolean) => !open && close()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-xl font-black uppercase">
            Your Bag {items.length > 0 ? `(${items.length})` : ""}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-muted-foreground">Your bag is empty.</p>
            <Magnetic>
              <Button onClick={close} asChild className="rounded-none">
                <Link href="/collections/new-arrivals">Continue Shopping</Link>
              </Button>
            </Magnetic>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-4 py-5">
                    <div className="relative size-24 shrink-0 overflow-hidden bg-secondary">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-2">
                        <div>
                          <Link
                            href={`/products/${item.productSlug}`}
                            onClick={close}
                            className="text-sm font-medium hover:underline"
                          >
                            {item.productName}
                          </Link>
                          {item.variantTitle ? (
                            <p className="text-xs text-muted-foreground">{item.variantTitle}</p>
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
                        <div className="flex items-center gap-2 rounded-md border border-border">
                          <button
                            className="p-1.5 disabled:opacity-40"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-4 text-center text-sm">{item.quantity}</span>
                          <button
                            className="p-1.5 disabled:opacity-40"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxQuantity}
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <span className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="flex-col gap-4 border-t border-border px-6 py-6 sm:flex-col">
              <div className="flex w-full justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              <Separator />
              <Magnetic className="block w-full">
                <Button asChild size="lg" className="w-full rounded-none" onClick={close}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </Magnetic>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
