import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = buildMetadata({ title: "Checkout", path: "/checkout", noIndex: true });

export default function CheckoutPage() {
  return (
    <div className="container-luxury py-12">
      <h1 className="font-heading text-3xl">Checkout</h1>
      <div className="mt-10">
        <CheckoutForm />
      </div>
    </div>
  );
}
