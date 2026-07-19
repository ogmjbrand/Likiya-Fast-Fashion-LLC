"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@likiya/ui";
import { Slideshow3D, type Slideshow3DSlide } from "@/components/home/slideshow-3d";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal, TextReveal } from "@/components/motion/reveal";

const SLIDES: (Slideshow3DSlide & { href: string })[] = [
  {
    image: { src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900", alt: "Women's edit" },
    title: "Women",
    href: "/collections/women",
  },
  {
    image: { src: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900", alt: "Men's edit" },
    title: "Men",
    href: "/collections/men",
  },
  {
    image: { src: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=900", alt: "Shoes edit" },
    title: "Shoes",
    href: "/collections/shoes",
  },
  {
    image: { src: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900", alt: "Bags edit" },
    title: "Bags",
    href: "/collections/bags",
  },
  {
    image: { src: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=900", alt: "Accessories edit" },
    title: "Accessories",
    href: "/collections/accessories",
  },
];

/**
 * Homepage hero: editorial copy + CTA beside a 3D coverflow of the core
 * categories. Clicking the centred card navigates to that category;
 * clicking a side card just brings it to centre first, matching how the
 * component already behaves everywhere else it's used.
 */
export function HeroSlideshow() {
  const router = useRouter();

  return (
    <section className="section-ink relative overflow-hidden">
      <div className="container-luxury grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <p className="eyebrow-pink">Fall/Winter — The Considered Edit</p>
          <h1 className="text-display-1 mt-4 font-display font-black uppercase text-white">
            <TextReveal text="Fast fashion," />
            <br />
            <TextReveal text="cut like" delay={0.12} />{" "}
            <TextReveal text="couture." delay={0.24} wordClassName="text-brand-pink" />
          </h1>
          <Reveal delay={0.6}>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Magnetic>
                <Button
                  asChild
                  size="lg"
                  className="rounded-none bg-white px-8 text-black hover:bg-brand-pink hover:text-black"
                >
                  <Link href="/collections/new-arrivals">Shop New Arrivals</Link>
                </Button>
              </Magnetic>
              <Link
                href="/collections/best-sellers"
                className="text-sm font-medium uppercase tracking-[0.2em] text-white/80 underline decoration-brand-pink underline-offset-8 hover:text-white"
              >
                View Best Sellers
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="mx-auto aspect-[9/8] w-full max-w-xl">
            <Slideshow3D
              slides={SLIDES}
              cardWidth={420}
              cardHeight={420}
              radius={2}
              tilt={12}
              sideTilt={8}
              gap={8}
              opacity={55}
              autoplay
              autoplayDelay={3.2}
              titleColor="#ffffff"
              onActiveClick={(i) => router.push(SLIDES[i]!.href)}
              className="w-full"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
