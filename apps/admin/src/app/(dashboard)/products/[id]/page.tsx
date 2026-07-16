import { notFound } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent, Badge } from "@likiya/ui";
import { formatPrice } from "@likiya/utils";

import { getAdminProductDetail } from "@/features/products/queries";
import { ProductStatusForm } from "./status-form";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProductDetail(id);

  if (!product) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{product.name}</h1>
          <p className="text-sm text-muted-foreground">{product.brand?.name ?? "No brand"}</p>
        </div>
        <Badge variant={product.status === "active" ? "default" : "secondary"}>{product.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{product.description}</p>
            <p className="text-muted-foreground">Material: {product.material ?? "—"}</p>
            <p className="font-medium">{formatPrice(product.base_price, product.currency)}</p>
            <p className="text-muted-foreground">
              Rating: {product.avg_rating} ({product.review_count} reviews)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductStatusForm
              productId={product.id}
              status={product.status}
              isFeatured={product.is_featured}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variants ({product.variants.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {product.variants.map((variant) => (
              <div key={variant.id} className="flex justify-between border-b border-border py-2 last:border-0">
                <span>{variant.title ?? variant.sku}</span>
                <span>{formatPrice(variant.price, product.currency)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images ({product.images.length})</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            {product.images.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image.id}
                src={image.url}
                alt={image.alt_text ?? product.name}
                className="aspect-square w-full rounded object-cover"
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
