import type { Metadata } from "next";

import { Input } from "@likiya/ui";
import { ProductGrid } from "@/components/product/product-grid";
import { searchProducts } from "@/features/products/queries";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ title: "Search", path: "/search", noIndex: true });

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const products = query ? await searchProducts(query).catch(() => []) : [];

  return (
    <div className="container-luxury py-12">
      <p className="eyebrow-pink">Search</p>
      <h1 className="mt-2 font-display text-3xl font-black uppercase">
        {query ? `Results for "${query}"` : "Find Something"}
      </h1>

      <form action="/search" method="GET" className="mt-6 max-w-md">
        <Input name="q" defaultValue={query} placeholder="Search products…" autoFocus className="rounded-none" />
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        {query ? `${products.length} products found` : "Enter a search term to get started."}
      </p>

      <div className="mt-10">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
