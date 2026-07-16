import Link from "next/link";

import {
  Card,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
} from "@likiya/ui";

import { getInventoryList } from "@/features/inventory/queries";
import { AdjustStockButton } from "./adjust-form";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;
  const { levels, total, totalPages } = await getInventoryList(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-muted-foreground">{total} tracked variants, lowest stock first</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>On Hand</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {levels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No inventory records yet.
                  </TableCell>
                </TableRow>
              ) : (
                levels.map((level) => {
                  const isLow = level.quantity_on_hand <= level.low_stock_threshold;
                  return (
                    <TableRow key={level.id}>
                      <TableCell>
                        <p className="font-medium">{level.variant.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {level.variant.title ?? level.variant.sku}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {level.warehouse.name}
                      </TableCell>
                      <TableCell>
                        {isLow ? (
                          <Badge variant="destructive">{level.quantity_on_hand}</Badge>
                        ) : (
                          level.quantity_on_hand
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {level.quantity_reserved}
                      </TableCell>
                      <TableCell>
                        <AdjustStockButton variantId={level.variant_id} warehouseId={level.warehouse_id} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <div className="flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/inventory?page=${p}`}
              className={p === page ? "font-semibold underline" : "text-muted-foreground"}
            >
              {p}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
