"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, Heart, User, ShoppingBag } from "lucide-react";

import { NAV_LINKS, siteConfig } from "@likiya/config";
import { Button, Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@likiya/ui";
import { useCartStore } from "@/features/cart/store";
import { cn } from "@likiya/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.open);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-luxury flex h-18 items-center justify-between py-4">
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="font-heading text-2xl">{siteConfig.name}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-3 text-sm uppercase tracking-wide text-foreground/90 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <Link
          href="/"
          className="font-heading text-2xl font-semibold tracking-[0.15em] uppercase lg:flex-1"
        >
          {siteConfig.name}
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium uppercase tracking-wide text-foreground/80 transition-colors hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Search" asChild>
            <Link href="/search">
              <Search className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Wishlist" asChild className="hidden sm:inline-flex">
            <Link href="/account/wishlist">
              <Heart className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Account" asChild className="hidden sm:inline-flex">
            <Link href="/account">
              <User className="size-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Cart, ${itemCount} items`}
            className="relative"
            onClick={openCart}
          >
            <ShoppingBag className="size-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>
    </header>
  );
}
