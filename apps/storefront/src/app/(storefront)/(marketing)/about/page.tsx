import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@likiya/ui";
import { buildMetadata } from "@/lib/seo/metadata";
import { Reveal, TextReveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { Magnetic } from "@/components/motion/magnetic";

export const metadata: Metadata = buildMetadata({
  title: "Our Story",
  description: "Likiya is luxury streetwear built at fast-fashion speed — modern African elegance, cut for a decade of wear.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div>
      <section className="section-ink relative flex h-[60vh] min-h-[420px] items-center justify-center overflow-hidden">
        <Parallax className="absolute inset-0" distance={100}>
          <Image
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1800"
            alt="Likiya atelier"
            fill
            priority
            sizes="100vw"
            className="scale-110 object-cover opacity-50"
          />
        </Parallax>
        <div className="container-luxury relative z-10 text-center">
          <p className="eyebrow-pink">Our Story</p>
          <h1 className="text-display-2 mx-auto mt-4 max-w-3xl font-display font-black uppercase leading-[1.05]">
            <TextReveal text="Speed without" />
            <br />
            <TextReveal text="compromise." delay={0.12} wordClassName="text-brand-pink" />
          </h1>
        </div>
      </section>

      <section className="container-luxury py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow-pink">Where We Started</p>
            <h2 className="mt-2 font-display text-2xl font-black uppercase">Lagos to everywhere</h2>
            <p className="mt-4 text-muted-foreground">
              Likiya started from a simple frustration: fast fashion moved at the speed culture
              demanded, but nothing about it felt considered. High fashion was considered, but it
              moved at the speed of a runway calendar, six months behind the street. We wanted
              both — pieces that respond to what&apos;s happening now, cut and finished like
              they&apos;re meant to last.
            </p>
            <p className="mt-4 text-muted-foreground">
              Every collection draws from modern African design language — bold silhouettes,
              considered color, pattern used with intent — filtered through a streetwear
              sensibility and finished to a genuine luxury standard. Not a reference. A starting
              point.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="relative aspect-[4/5] overflow-hidden bg-secondary">
            <Image
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200"
              alt="Likiya design studio"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40 py-20">
        <div className="container-luxury">
          <Reveal>
            <p className="eyebrow-pink">What We Believe</p>
            <h2 className="mt-2 font-display text-2xl font-black uppercase">Three things we won&apos;t compromise on</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <Reveal delay={0.05}>
              <span className="font-display text-4xl font-black text-brand-pink">01</span>
              <h3 className="mt-3 font-display text-lg font-black uppercase">Considered fabrics</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We choose materials for how they wear in, not just how they photograph on day one.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <span className="font-display text-4xl font-black text-brand-pink">02</span>
              <h3 className="mt-3 font-display text-lg font-black uppercase">Real construction</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Finished seams, real linings, hardware that survives more than one season of wear.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <span className="font-display text-4xl font-black text-brand-pink">03</span>
              <h3 className="mt-3 font-display text-lg font-black uppercase">Honest pricing</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Priced for what it costs to make something well — not inflated for a logo, not
                cut to hit a discount.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container-luxury py-20 text-center">
        <Reveal>
          <p className="eyebrow-pink">Join Us</p>
          <h2 className="text-display-2 mx-auto mt-4 max-w-2xl font-display font-black uppercase leading-[1.05]">
            Considered pieces, cut for the way you actually move.
          </h2>
          <Magnetic className="mt-8 inline-block">
            <Button asChild size="lg">
              <Link href="/collections/new-arrivals">Shop the Collection</Link>
            </Button>
          </Magnetic>
        </Reveal>
      </section>
    </div>
  );
}
