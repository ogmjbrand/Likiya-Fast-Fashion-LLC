import Link from "next/link";
import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = buildMetadata({
  title: "Shipping & Returns",
  description: "Shipping rates and timelines, and how to start a return or exchange at Likiya.",
  path: "/shipping-returns",
});

export default function ShippingReturnsPage() {
  return (
    <div className="container-luxury max-w-3xl py-16">
      <Reveal>
        <p className="eyebrow-pink">Support</p>
        <h1 className="text-display-2 mt-2 font-display font-black uppercase">Shipping &amp; Returns</h1>
      </Reveal>

      <div className="mt-10 space-y-10">
        <Reveal delay={0.05}>
          <h2 className="font-display text-lg font-black uppercase">Shipping</h2>
          <div className="mt-4 space-y-3 text-muted-foreground">
            <p>Free standard shipping on all orders over $150. Below that, a flat rate applies at checkout.</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Standard (US): 5–7 business days</li>
              <li>Standard (international): 7–14 business days</li>
              <li>Orders are processed within 1–2 business days before shipping</li>
            </ul>
            <p>
              You&apos;ll receive a shipping confirmation email with tracking as soon as your order
              leaves our warehouse. You can also track any order from{" "}
              <Link href="/account/orders" className="text-foreground underline hover:text-brand-pink">
                your account
              </Link>
              .
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="font-display text-lg font-black uppercase">Returns</h2>
          <div className="mt-4 space-y-3 text-muted-foreground">
            <p>
              We accept returns of unworn, unwashed items with original tags attached within 30
              days of delivery, for a full refund to your original payment method.
            </p>
            <ol className="list-inside list-decimal space-y-1">
              <li>
                Go to{" "}
                <Link href="/account/returns" className="text-foreground underline hover:text-brand-pink">
                  Account &rarr; Returns
                </Link>{" "}
                and select the order and item you&apos;d like to return.
              </li>
              <li>We&apos;ll email you a prepaid return shipping label.</li>
              <li>Drop the package off at any listed carrier location.</li>
              <li>Refunds are issued within 5–7 business days of us receiving the return.</li>
            </ol>
            <p>Sale items marked final sale are not eligible for return — this is called out on the product page.</p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <h2 className="font-display text-lg font-black uppercase">Exchanges</h2>
          <p className="mt-4 text-muted-foreground">
            We don&apos;t process direct exchanges — return the original item for a refund and place a
            new order for the size or color you want, so you&apos;re not waiting on the return to
            process before the replacement ships.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
