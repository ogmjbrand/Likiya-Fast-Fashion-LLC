import Link from "next/link";

import { FOOTER_LINKS, siteConfig } from "@likiya/config";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { InstagramIcon, TikTokIcon } from "@likiya/ui";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="container-luxury grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div className="space-y-4">
          <span className="font-heading text-2xl font-semibold uppercase tracking-[0.15em]">
            {siteConfig.name}
          </span>
          <p className="max-w-xs text-sm text-muted-foreground">{siteConfig.description}</p>
          <div className="flex gap-3 pt-2">
            <Link href={siteConfig.links.instagram} aria-label="Instagram" className="text-muted-foreground hover:text-foreground">
              <InstagramIcon className="size-5" />
            </Link>
            <Link href={siteConfig.links.tiktok} aria-label="TikTok" className="text-muted-foreground hover:text-foreground">
              <TikTokIcon className="size-5" />
            </Link>
          </div>
        </div>

        <FooterColumn title="Shop" links={FOOTER_LINKS.shop} />
        <FooterColumn title="Support" links={FOOTER_LINKS.support} />
        <FooterColumn title="Company" links={FOOTER_LINKS.company} />

        <div className="space-y-4">
          <h3 className="eyebrow">Join the list</h3>
          <p className="text-sm text-muted-foreground">
            Early access to new arrivals, private sales, and considered edits.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container-luxury flex flex-col items-center justify-between gap-4 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {siteConfig.fullName}. All rights reserved.</p>
          <div className="flex gap-6">
            {FOOTER_LINKS.legal.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div className="space-y-4">
      <h3 className="eyebrow">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-foreground/80 hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
