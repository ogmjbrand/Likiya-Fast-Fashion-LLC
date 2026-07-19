import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@likiya/ui";
import { ProductGrid } from "@/components/product/product-grid";
import { getFeaturedProducts, getNewArrivals } from "@/features/products/queries";
import { buildMetadata } from "@/lib/seo/metadata";
import { Reveal, TextReveal } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/marketing/marquee";
import { HeroSlideshow } from "@/components/home/hero-slideshow";

export const metadata: Metadata = buildMetadata({
  title: "Likiya | Luxury Streetwear, Considered",
  path: "/",
});

export const revalidate = 300;

export default async function HomePage() {
  const [featured, newArrivals] = await Promise.all([
    getFeaturedProducts(4).catch(() => []),
    getNewArrivals(8).catch(() => []),
  ]);

  return (
    <div>
      <HeroSlideshow />

      <Marquee />

      <section className="container-luxury py-24">
        <Reveal>
          <p className="eyebrow-pink">Shop By Category</p>
          <h2 className="mt-2 font-display text-2xl font-black uppercase">Every Section</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CategoryTile
            href="/collections/women"
            label="Women"
            index="01"
            image="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900"
          />
          <CategoryTile
            href="/collections/men"
            label="Men"
            index="02"
            image="https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900"
          />
          <CategoryTile
            href="/collections/shoes"
            label="Shoes"
            index="03"
            image="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=900"
          />
          <CategoryTile
            href="/collections/bags"
            label="Bags"
            index="04"
            image="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900"
          />
          <CategoryTile
            href="/collections/accessories"
            label="Accessories"
            index="05"
            image="https://images.unsplash.com/photo-1591561954557-26941169b49e?w=900"
          />
          <CategoryTile
            href="/collections/body-cream"
            label="Body Cream"
            index="06"
            image="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=900"
          />
          <CategoryTile
            href="/collections/hair-oil"
            label="Hair Oil"
            index="07"
            image="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=900"
          />
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="container-luxury py-24">
          <Reveal>
            <div className="mb-12 flex items-end justify-between border-b border-border pb-6">
              <div>
                <p className="eyebrow-pink">Editor&apos;s Picks</p>
                <h2 className="text-display-2 mt-2 font-display font-black uppercase">Featured Pieces</h2>
              </div>
              <Link
                href="/collections/best-sellers"
                className="text-sm font-medium uppercase tracking-wide underline underline-offset-4 hover:text-brand-pink"
              >
                View all
              </Link>
            </div>
          </Reveal>
          <ProductGrid products={featured} />
        </section>
      ) : null}

      <section className="section-ink relative flex h-[70vh] min-h-[480px] items-center justify-center overflow-hidden">
        <div className="container-luxury relative z-10 text-center">
          <p className="eyebrow-pink">Our Philosophy</p>
          <h2 className="text-display-2 mx-auto mt-6 max-w-3xl font-display font-black uppercase leading-[1.05]">
            <TextReveal text="Streetwear confidence." />
            <br />
            <TextReveal text="High-fashion" delay={0.1} />{" "}
            <TextReveal text="conviction." delay={0.2} wordClassName="text-brand-pink" />
          </h2>
          <Reveal delay={0.5}>
            <Magnetic className="mt-10 inline-block">
              <Button
                asChild
                variant="outline"
                className="rounded-none border-white/40 bg-transparent text-white hover:border-brand-pink hover:bg-transparent hover:text-brand-pink"
              >
                <Link href="/about">Our Story</Link>
              </Button>
            </Magnetic>
          </Reveal>
        </div>
      </section>

      {newArrivals.length > 0 ? (
        <section className="container-luxury py-24">
          <Reveal>
            <div className="mb-12 flex items-end justify-between border-b border-border pb-6">
              <div>
                <p className="eyebrow-pink">Just Landed</p>
                <h2 className="text-display-2 mt-2 font-display font-black uppercase">New Arrivals</h2>
              </div>
              <Link
                href="/collections/new-arrivals"
                className="text-sm font-medium uppercase tracking-wide underline underline-offset-4 hover:text-brand-pink"
              >
                View all
              </Link>
            </div>
          </Reveal>
          <ProductGrid products={newArrivals} />
        </section>
      ) : null}
    </div>
  );
}

function CategoryTile({
  href,
  label,
  image,
  index,
}: {
  href: string;
  label: string;
  image: string;
  index: string;
}) {
  return (
    <Reveal>
      <Link href={href} className="group relative block aspect-[4/5] overflow-hidden bg-secondary">
        <Image
          src={image}
          alt={label}
          fill
          sizes="(min-width: 640px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/40" />
        <span className="absolute left-6 top-6 font-display text-xs font-bold text-white/70">{index}</span>
        <div className="absolute bottom-6 left-6 right-6">
          <span className="font-display text-3xl font-black uppercase text-white">{label}</span>
          <span className="mt-2 block h-px w-0 bg-brand-pink transition-all duration-500 group-hover:w-16" />
        </div>
      </Link>
    </Reveal>
  );
}
