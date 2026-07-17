import type { Metadata } from "next";

import { siteConfig } from "@likiya/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { LegalPageLayout } from "@/components/marketing/legal-page-layout";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Likiya Fast Fashion collects, uses, and protects your information.",
  path: "/legal/privacy",
});

// This is a reasonable, honest starting point covering what the platform
// actually does (Supabase auth/storage, Stripe/Paystack/Flutterwave,
// GA4/Clarity, Resend) - not a substitute for review by qualified legal
// counsel before this goes live in any specific jurisdiction.
export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="July 17, 2026">
      <section>
        <h2>Information We Collect</h2>
        <p>
          When you create an account, place an order, or contact us, we collect information you
          provide directly: your name, email address, shipping and billing addresses, phone
          number, and order history. We do not store your full payment card details — payment
          processing is handled by our payment providers (Stripe, Paystack, and Flutterwave), each
          of which maintains its own privacy and security practices.
        </p>
        <p>
          We also collect some information automatically: pages you visit, device and browser
          type, and general location inferred from IP address, via Google Analytics and Microsoft
          Clarity. This helps us understand how the site is used and where it breaks.
        </p>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <ul>
          <li>To process and fulfill your orders, and communicate with you about them</li>
          <li>To maintain your account, wishlist, and order history</li>
          <li>To respond to support requests submitted through our Contact page</li>
          <li>To send transactional emails (order confirmation, shipping updates)</li>
          <li>To send marketing emails, only if you&apos;ve opted in via our newsletter signup</li>
          <li>To improve the site based on aggregate usage patterns</li>
        </ul>
      </section>

      <section>
        <h2>Cookies and Local Storage</h2>
        <p>
          We use cookies to keep you signed in and to maintain your session during checkout. Your
          shopping bag is stored in your browser&apos;s local storage so it persists between
          visits on the same device. Analytics cookies from Google Analytics and Microsoft Clarity
          are used only if you don&apos;t opt out where your browser or region requires consent.
        </p>
      </section>

      <section>
        <h2>Sharing Your Information</h2>
        <p>
          We share information with the service providers that operate the store on our behalf:
          Supabase (database and authentication), our payment providers, Resend (transactional
          email), and our analytics providers. We don&apos;t sell your personal information to
          third parties.
        </p>
      </section>

      <section>
        <h2>Data Retention</h2>
        <p>
          We retain account and order information for as long as your account is active, and as
          needed to comply with tax and accounting obligations. You can request deletion of your
          account at any time by contacting us.
        </p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>
          Depending on where you live, you may have the right to access, correct, or delete your
          personal information, or to object to certain processing. To exercise any of these
          rights, contact us at{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
        </p>
      </section>

      <section>
        <h2>Children&apos;s Privacy</h2>
        <p>
          Likiya is not directed at children under 16, and we do not knowingly collect personal
          information from children.
        </p>
      </section>

      <section>
        <h2>Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Material changes will be reflected by
          updating the date at the top of this page.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent to{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
