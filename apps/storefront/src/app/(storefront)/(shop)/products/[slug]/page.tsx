import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Badge } from "@likiya/ui";
import { JsonLd, productJsonLd, breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@likiya/config";

import {
  getProductBySlug,
  getProductReviews,
  getRelatedProducts,
} from "@/features/products/queries";
import { VariantSelector } from "@/components/product/variant-selector";
import { ReviewsSection } from "@/components/product/reviews-section";
import { ProductGrid } from "@/components/product/product-grid";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return buildMetadata({ title: "Product", path: `/products/${slug}` });

  return buildMetadata({
    title: product.seo_title ?? product.name,
    description: product.seo_description ?? product.description ?? undefined,
    path: `/products/${slug}`,
    image: product.images[0]?.url,
  });
}

export const revalidate = 300;

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, relatedProducts] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(
      product.id,
      product.categories.map((c) => c.id),
    ),
  ]);

  const isOnSale = product.compare_at_price && product.compare_at_price > product.base_price;

  return (
    <div className="container-luxury py-12">
      <JsonLd data={productJsonLd(product, reviews)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: product.name, url: `${siteConfig.url}/products/${product.slug}` },
        ])}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          {product.images.map((image, i) =>
            i === 0 ? (
              <div key={image.id} className="relative col-span-2 aspect-[3/4] overflow-hidden bg-secondary">
                <Parallax className="absolute inset-0" distance={40}>
                  <Image
                    src={image.url}
                    alt={image.alt_text ?? product.name}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    priority
                    className="scale-110 object-cover"
                  />
                </Parallax>
              </div>
            ) : (
              <Reveal key={image.id} delay={i * 0.08} className="relative aspect-[3/4] overflow-hidden bg-secondary">
                <Image
                  src={image.url}
                  alt={image.alt_text ?? product.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </Reveal>
            ),
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {product.brand ? (
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              {product.brand.name}
            </p>
          ) : null}
          <h1 className="text-display-2 mt-1 font-display font-black uppercase">{product.name}</h1>
          {isOnSale ? (
            <Badge className="mt-3 rounded-none bg-brand-pink text-black">Sale</Badge>
          ) : null}

          <div className="mt-6">
            <VariantSelector product={product} />
          </div>

          {product.description ? (
            <div className="mt-8 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
              <p>{product.description}</p>
              {product.material ? <p>Material: {product.material}</p> : null}
              {product.care_instructions ? <p>Care: {product.care_instructions}</p> : null}
            </div>
          ) : null}
        </div>
      </div>

      <ReviewsSection
        productId={product.id}
        productSlug={product.slug}
        reviews={reviews}
        avgRating={product.avg_rating}
      />

      {relatedProducts.length > 0 ? (
        <section className="border-t border-border py-16">
          <h2 className="mb-8 font-heading text-2xl">You May Also Like</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      ) : null}
    </div>
  );
}
