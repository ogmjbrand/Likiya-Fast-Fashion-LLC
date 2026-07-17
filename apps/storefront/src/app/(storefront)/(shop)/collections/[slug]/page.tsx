import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/product/product-grid";
import { SortSelect } from "@/components/product/sort-select";
import { getProductList } from "@/features/products/queries";
import { buildMetadata } from "@/lib/seo/metadata";
import { createClient } from "@likiya/database/server";
import { Reveal } from "@/components/motion/reveal";

type SortOption = "newest" | "price_asc" | "price_desc";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

async function getCollectionOrCategory(slug: string) {
  const supabase = await createClient();

  const { data: collection } = await supabase
    .from("collections")
    .select("name, slug, description, seo_title, seo_description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (collection) return { ...collection, kind: "collection" as const };

  const { data: category } = await supabase
    .from("categories")
    .select("name, slug, description, seo_title, seo_description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (category) return { ...category, kind: "category" as const };

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getCollectionOrCategory(slug);
  if (!entry) return buildMetadata({ title: "Collection", path: `/collections/${slug}` });

  return buildMetadata({
    title: entry.seo_title ?? entry.name,
    description: entry.seo_description ?? entry.description ?? undefined,
    path: `/collections/${slug}`,
  });
}

export const revalidate = 120;

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { sort, page: pageParam } = await searchParams;

  const entry = await getCollectionOrCategory(slug);
  if (!entry) notFound();

  const page = Number(pageParam ?? "1") || 1;
  const { products, total, totalPages } = await getProductList({
    collectionSlug: entry.kind === "collection" ? slug : undefined,
    categorySlug: entry.kind === "category" ? slug : undefined,
    sort: (sort as SortOption) ?? "newest",
    page,
  });

  return (
    <div className="container-luxury py-12">
      <Reveal>
        <div className="mb-10 border-b border-border pb-8">
          <p className="eyebrow-pink">{entry.kind === "collection" ? "Collection" : "Category"}</p>
          <h1 className="text-display-2 mt-2 font-display font-black uppercase">{entry.name}</h1>
          {entry.description ? (
            <p className="mt-3 max-w-2xl text-muted-foreground">{entry.description}</p>
          ) : null}
        </div>
      </Reveal>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} items</p>
        <SortSelect />
      </div>

      <ProductGrid products={products} />

      {totalPages > 1 ? (
        <nav className="mt-16 flex justify-center gap-2 text-sm" aria-label="Pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/collections/${slug}?page=${p}${sort ? `&sort=${sort}` : ""}`}
              className={p === page ? "font-semibold text-brand-pink underline" : "text-muted-foreground"}
            >
              {p}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
