import type { Metadata } from "next";

import { siteConfig } from "@likiya/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { LegalPageLayout } from "@/components/marketing/legal-page-layout";

export const metadata: Metadata = buildMetadata({
  title: "Accessibility",
  description: "Our commitment to making Likiya Fast Fashion usable for everyone.",
  path: "/legal/accessibility",
});

export default function AccessibilityPage() {
  return (
    <LegalPageLayout title="Accessibility" lastUpdated="July 17, 2026">
      <section>
        <h2>Our Commitment</h2>
        <p>
          We want everyone to be able to browse, shop, and manage an account on {siteConfig.name}{" "}
          regardless of ability. We build against the Web Content Accessibility Guidelines (WCAG)
          2.1 at Level AA as our target standard — covering things like keyboard navigation, color
          contrast, screen reader support, and clear focus states throughout the site.
        </p>
      </section>

      <section>
        <h2>What We&apos;ve Built</h2>
        <ul>
          <li>Full keyboard navigation across browsing, cart, and checkout</li>
          <li>Visible focus indicators on every interactive element</li>
          <li>Descriptive alt text on product imagery</li>
          <li>Semantic HTML and ARIA labeling for screen readers</li>
          <li>Reduced-motion support — animations respect your system&apos;s motion preference</li>
          <li>Sufficient color contrast between text and background throughout</li>
        </ul>
      </section>

      <section>
        <h2>Ongoing Work</h2>
        <p>
          Accessibility isn&apos;t a one-time project — we test and refine as we build new
          features. If you encounter a barrier anywhere on the site, we want to know about it.
        </p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          If you have trouble accessing any part of this site, or have feedback on how we can do
          better, please reach out at{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>. We aim to
          respond to accessibility feedback within one business day.
        </p>
      </section>
    </LegalPageLayout>
  );
}
