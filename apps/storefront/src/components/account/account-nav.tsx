"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@likiya/utils";
import { signOut } from "@/features/auth/actions";

const ACCOUNT_NAV = [
  { label: "Overview", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Returns", href: "/account/returns" },
  { label: "Settings", href: "/account/settings" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <aside className="space-y-1">
      {ACCOUNT_NAV.map((item) => {
        const isActive = item.href === "/account" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block border-l-2 px-3 py-2 text-sm transition-colors",
              isActive
                ? "border-brand-pink font-medium text-foreground"
                : "border-transparent text-foreground/80 hover:bg-secondary hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <form action={signOut}>
        <button className="block w-full border-l-2 border-transparent px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary">
          Sign Out
        </button>
      </form>
    </aside>
  );
}
