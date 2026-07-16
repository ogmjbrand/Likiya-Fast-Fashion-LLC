import { ProductCard } from "@/components/product/product-card";
import type { ProductWithRelations } from "@likiya/database";

export function ProductGrid({ products }: { products: ProductWithRelations[] }) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        No products found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
