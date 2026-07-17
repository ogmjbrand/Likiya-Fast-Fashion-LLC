"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@likiya/ui";
import type { ProductWithRelations } from "@likiya/database";

import { VariantSelector } from "@/components/product/variant-selector";

/**
 * Hover affordance on product cards that opens variant selection + add-to-
 * bag without leaving the grid. Reuses the same `VariantSelector` the PDP
 * uses — no separate add-to-cart logic to keep in sync.
 */
export function QuickView({ product }: { product: ProductWithRelations }) {
  const [open, setOpen] = useState(false);
  const primaryImage = product.images[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 translate-y-2 items-center gap-2 whitespace-nowrap bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-black opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-brand-pink"
      >
        <Eye className="size-3.5" />
        Quick View
      </button>
      <DialogContent className="max-w-3xl gap-0 rounded-none p-0" showCloseButton>
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid gap-0 sm:grid-cols-2">
          <div className="relative aspect-[3/4] bg-secondary">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt_text ?? product.name}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="p-6 sm:p-8">
            {product.brand ? (
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand.name}</p>
            ) : null}
            <h3 className="mt-1 font-display text-2xl font-black uppercase">{product.name}</h3>
            <div className="mt-6">
              <VariantSelector product={product} />
            </div>
            <Link
              href={`/products/${product.slug}`}
              className="mt-6 inline-block text-sm underline underline-offset-4 hover:text-brand-pink"
              onClick={() => setOpen(false)}
            >
              View full details
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
