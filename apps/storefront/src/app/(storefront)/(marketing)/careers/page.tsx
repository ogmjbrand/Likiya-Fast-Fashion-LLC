import type { Metadata } from "next";

import { siteConfig } from "@likiya/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = buildMetadata({
  title: "Careers",
  description: "Open roles at Likiya Fast Fashion.",
  path: "/careers",
});

export default function CareersPage() {
  return (
    <div className="container-luxury max-w-2xl py-16">
      <Reveal>
        <p className="eyebrow-pink">Careers</p>
        <h1 className="text-display-2 mt-2 font-display font-black uppercase leading-[1.05]">
          Help us build the wardrobe.
        </h1>
        <p className="mt-4 text-muted-foreground">
          We&apos;re a small, fast-moving team working across design, engineering, operations, and
          customer care. We don&apos;t have a formal careers portal yet, but we&apos;re always
          interested in hearing from people who care about the same things we do — considered
          design, real craft, and building something that lasts.
        </p>
        <p className="mt-4 text-muted-foreground">
          If that sounds like you, reach out to{" "}
          <a href={`mailto:${siteConfig.supportEmail}`} className="text-foreground underline hover:text-brand-pink">
            {siteConfig.supportEmail}
          </a>{" "}
          with a short note about what you&apos;d want to work on and a link to relevant work —
          no formal application needed.
        </p>
      </Reveal>
    </div>
  );
}
