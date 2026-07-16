import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@likiya/ui";
import { formatPrice } from "@likiya/utils";
import { createClient } from "@likiya/database/server";

import { ClearCartOnMount } from "./clear-cart";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  if (!orderNumber) notFound();

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, total, currency, status")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) notFound();

  return (
    <div className="container-luxury flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <ClearCartOnMount />
      <p className="eyebrow">Thank you</p>
      <h1 className="mt-3 font-heading text-3xl">Your order is confirmed</h1>
      <p className="mt-2 text-muted-foreground">
        Order #{order.order_number} — {formatPrice(order.total, order.currency)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        We&apos;ve emailed your confirmation. You can track your order anytime from your account.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild variant="outline">
          <Link href="/collections/new-arrivals">Continue Shopping</Link>
        </Button>
        <Button asChild>
          <Link href="/account/orders">View Orders</Link>
        </Button>
      </div>
    </div>
  );
}
