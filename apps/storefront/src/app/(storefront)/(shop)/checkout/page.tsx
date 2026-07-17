import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = buildMetadata({ title: "Checkout", path: "/checkout", noIndex: true });

export default function CheckoutPage() {
  return (
    <div className="container-luxury py-12">
      <p className="eyebrow-pink">Secure Checkout</p>
      <h1 className="mt-2 font-display text-3xl font-black uppercase">Checkout</h1>
      <div className="mt-10">
        <CheckoutForm />
      </div>
    </div>
  );
}
