import Image from "next/image";
import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = buildMetadata({
  title: "Sustainability",
  description: "How Likiya thinks about durability, sourcing, and making fewer, better things.",
  path: "/sustainability",
});

export default function SustainabilityPage() {
  return (
    <div>
      <section className="container-luxury py-16">
        <Reveal>
          <p className="eyebrow-pink">Sustainability</p>
          <h1 className="text-display-2 mt-2 max-w-2xl font-display font-black uppercase leading-[1.05]">
            Fewer, better things.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            &quot;Fast fashion&quot; describes how quickly we move, not how disposable we think
            clothing should be. Considered doesn&apos;t have to mean slow — it means we don&apos;t
            treat speed as an excuse to cut corners on what a garment is actually made of.
          </p>
        </Reveal>
      </section>

      <section className="container-luxury grid gap-12 pb-20 lg:grid-cols-2">
        <Reveal className="relative aspect-[4/5] overflow-hidden bg-secondary">
          <Image
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200"
            alt="Fabric sourcing"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </Reveal>
        <Reveal delay={0.1} className="space-y-8">
          <div>
            <h2 className="font-display text-lg font-black uppercase">Built to be worn for years</h2>
            <p className="mt-3 text-muted-foreground">
              We design every piece to survive real, repeated wear — not just a single season. A
              coat you keep for five years has a far smaller footprint per wear than five cheaper
              coats you replace every year, even before accounting for what ends up in landfill.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-black uppercase">Considered materials</h2>
            <p className="mt-3 text-muted-foreground">
              We choose fabrics for durability and hand-feel first — natural fibers where they
              perform best, technical blends where they genuinely extend a garment&apos;s life.
              Material details are always listed on the product page.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-black uppercase">Producing to demand</h2>
            <p className="mt-3 text-muted-foreground">
              We run smaller, more frequent production runs rather than one enormous seasonal
              drop — it means less overproduction, less markdown-driven waste, and inventory that
              actually reflects what customers want.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-border bg-secondary/40 py-16">
        <div className="container-luxury max-w-2xl text-center">
          <Reveal>
            <p className="eyebrow-pink">Still Learning</p>
            <p className="mt-3 text-muted-foreground">
              We don&apos;t claim to have this fully solved — supply chains are complicated, and
              we&apos;re a young company still building out formal certifications and reporting.
              This page will keep growing as that work does.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
