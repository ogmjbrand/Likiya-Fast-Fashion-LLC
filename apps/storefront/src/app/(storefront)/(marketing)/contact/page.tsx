import Link from "next/link";
import type { Metadata } from "next";

import { siteConfig } from "@likiya/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with Likiya Fast Fashion.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container-luxury py-16">
      <Reveal>
        <p className="eyebrow-pink">Get In Touch</p>
        <h1 className="text-display-2 mt-2 max-w-xl font-display font-black uppercase">Contact Us</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Questions about an order, a product, or anything else — we read every message and
          typically reply within one business day.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>

        <Reveal delay={0.2} className="h-fit space-y-6 border border-border p-6">
          <div>
            <p className="eyebrow-pink">Email</p>
            <a href={`mailto:${siteConfig.supportEmail}`} className="mt-1 block hover:text-brand-pink hover:underline">
              {siteConfig.supportEmail}
            </a>
          </div>
          <div>
            <p className="eyebrow-pink">Response Time</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Monday&ndash;Friday, 9am&ndash;6pm. We aim to reply within one business day.
            </p>
          </div>
          <div>
            <p className="eyebrow-pink">Order Support</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Already have an order? You can track it anytime from{" "}
              <Link href="/account/orders" className="text-foreground underline hover:text-brand-pink">
                your account
              </Link>
              .
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
