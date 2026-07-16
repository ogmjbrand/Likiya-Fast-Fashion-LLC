import Link from "next/link";

import { requireUser } from "@likiya/auth/server";
import { signOut } from "@/features/auth/actions";

const ACCOUNT_NAV = [
  { label: "Overview", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Returns", href: "/account/returns" },
  { label: "Settings", href: "/account/settings" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="container-luxury grid gap-10 py-12 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-1">
        {ACCOUNT_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
        <form action={signOut}>
          <button className="block w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary">
            Sign Out
          </button>
        </form>
      </aside>
      <div>{children}</div>
    </div>
  );
}
