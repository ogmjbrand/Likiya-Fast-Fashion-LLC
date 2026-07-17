import Link from "next/link";
import type { Metadata } from "next";

import { siteConfig } from "@likiya/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { LegalPageLayout } from "@/components/marketing/legal-page-layout";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: "The terms that govern your use of the Likiya Fast Fashion website and your orders.",
  path: "/legal/terms",
});

// A reasonable starting point covering the platform's actual behavior
// (accounts, ordering, three payment providers, returns) - not a
// substitute for review by qualified legal counsel before launch.
export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="July 17, 2026">
      <section>
        <h2>Acceptance of Terms</h2>
        <p>
          By using {siteConfig.fullName}&apos;s website, creating an account, or placing an order,
          you agree to these terms. If you don&apos;t agree, please don&apos;t use the site.
        </p>
      </section>

      <section>
        <h2>Accounts</h2>
        <p>
          You&apos;re responsible for keeping your account credentials secure and for all activity
          under your account. You must provide accurate information when creating an account or
          placing an order.
        </p>
      </section>

      <section>
        <h2>Orders and Payment</h2>
        <p>
          Placing an order is an offer to purchase, which we accept when your order is confirmed
          and payment is processed. Payment is handled by Stripe, Paystack, or Flutterwave,
          depending on the method you choose at checkout — we never see or store your full card
          details. We reserve the right to refuse or cancel an order, including in cases of
          suspected fraud, pricing errors, or inventory unavailable at the time of purchase.
        </p>
      </section>

      <section>
        <h2>Pricing and Availability</h2>
        <p>
          Prices are listed in the currency shown at checkout and may change without notice.
          Product availability is not guaranteed until your order is confirmed — occasionally an
          item sells out between browsing and checkout, in which case we&apos;ll refund that line
          item.
        </p>
      </section>

      <section>
        <h2>Returns and Refunds</h2>
        <p>
          Our return policy is described in full on the{" "}
          <Link href="/shipping-returns">Shipping &amp; Returns</Link> page, which forms part of these
          terms.
        </p>
      </section>

      <section>
        <h2>Intellectual Property</h2>
        <p>
          All content on this site — including designs, photography, text, and the Likiya name and
          marks — is owned by {siteConfig.fullName} or its licensors and may not be reproduced
          without permission.
        </p>
      </section>

      <section>
        <h2>Limitation of Liability</h2>
        <p>
          The site and products are provided &quot;as is.&quot; To the fullest extent permitted by
          law, {siteConfig.fullName} is not liable for indirect, incidental, or consequential
          damages arising from your use of the site or purchase of our products.
        </p>
      </section>

      <section>
        <h2>Changes to These Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the site after a change
          means you accept the updated terms.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
