import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@likiya/ui";
import { formatPrice } from "@likiya/utils";
import { createAdminClient } from "@likiya/database/admin";

import { ClearCartOnMount } from "./clear-cart";
import { Reveal } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  if (!orderNumber) notFound();

  // Guest orders have no `user_id`, so RLS's owner check (`user_id =
  // auth.uid()`) can never match an anonymous visitor — even for their own
  // order. The service-role client is the correct tool here, not a gap:
  // `orderNumber` is an unguessable value only known to whoever was just
  // redirected here by our own checkout flow, and this query only ever
  // returns non-sensitive summary fields.
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, total, currency, status")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) notFound();

  return (
    <div className="container-luxury flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <ClearCartOnMount />
      <Reveal>
        <div className="mx-auto mb-6 h-px w-16 bg-brand-pink" />
        <p className="eyebrow-pink">Thank You</p>
        <h1 className="mt-3 font-display text-3xl font-black uppercase">Your order is confirmed</h1>
        <p className="mt-3 text-muted-foreground">
          Order #{order.order_number} &mdash; {formatPrice(order.total, order.currency)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ve emailed your confirmation. You can track your order anytime from your account.
        </p>
        <div className="mt-8 flex gap-4">
          <Magnetic>
            <Button asChild variant="outline" className="rounded-none">
              <Link href="/collections/new-arrivals">Continue Shopping</Link>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button asChild className="rounded-none">
              <Link href="/account/orders">View Orders</Link>
            </Button>
          </Magnetic>
        </div>
      </Reveal>
    </div>
  );
}
