import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@likiya/ui";
import { ProductGrid } from "@/components/product/product-grid";
import { getFeaturedProducts, getNewArrivals } from "@/features/products/queries";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Likiya | Considered Luxury Fashion",
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
      <section className="relative flex h-[85vh] min-h-[520px] items-end overflow-hidden bg-secondary">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800"
          alt="Likiya Autumn Collection"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="container-luxury relative z-10 pb-20 text-white">
          <p className="eyebrow text-white/80">The Autumn Edit</p>
          <h1 className="mt-3 max-w-xl font-heading text-5xl font-medium leading-[1.05] sm:text-6xl">
            Considered pieces, cut for longevity
          </h1>
          <Button asChild size="lg" className="mt-8 bg-white text-black hover:bg-white/90">
            <Link href="/collections/new-arrivals">Shop New Arrivals</Link>
          </Button>
        </div>
      </section>

      <section className="container-luxury py-20">
        <div className="grid gap-4 sm:grid-cols-3">
          <CategoryTile
            href="/collections/women"
            label="Women"
            image="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900"
          />
          <CategoryTile
            href="/collections/men"
            label="Men"
            image="https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900"
          />
          <CategoryTile
            href="/collections/accessories"
            label="Accessories"
            image="https://images.unsplash.com/photo-1591561954557-26941169b49e?w=900"
          />
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="container-luxury py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="eyebrow">Editor&apos;s Picks</p>
              <h2 className="mt-2 font-heading text-3xl">Featured Pieces</h2>
            </div>
            <Link href="/collections/best-sellers" className="text-sm underline underline-offset-4">
              View all
            </Link>
          </div>
          <ProductGrid products={featured} />
        </section>
      ) : null}

      <section className="relative flex h-[60vh] min-h-[420px] items-center justify-center overflow-hidden bg-primary">
        <div className="container-luxury text-center text-primary-foreground">
          <p className="eyebrow text-primary-foreground/70">Our Philosophy</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-heading text-4xl leading-tight">
            We design for the decade, not the season — considered fabrics, timeless silhouettes.
          </h2>
          <Button asChild variant="outline" className="mt-8 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
            <Link href="/about">Our Story</Link>
          </Button>
        </div>
      </section>

      {newArrivals.length > 0 ? (
        <section className="container-luxury py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="eyebrow">Just Landed</p>
              <h2 className="mt-2 font-heading text-3xl">New Arrivals</h2>
            </div>
            <Link href="/collections/new-arrivals" className="text-sm underline underline-offset-4">
              View all
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </section>
      ) : null}
    </div>
  );
}

function CategoryTile({ href, label, image }: { href: string; label: string; image: string }) {
  return (
    <Link href={href} className="group relative block aspect-[4/5] overflow-hidden bg-secondary">
      <Image
        src={image}
        alt={label}
        fill
        sizes="(min-width: 640px) 33vw, 100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
      <span className="absolute bottom-6 left-6 font-heading text-2xl text-white">{label}</span>
    </Link>
  );
}
