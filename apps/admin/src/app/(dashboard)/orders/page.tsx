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
import { formatPrice, formatDate } from "@likiya/utils";
import { ORDER_STATUS_LABELS, FULFILLMENT_STATUS_LABELS } from "@likiya/types";

import { getAdminOrderList } from "@/features/orders/queries";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;
  const { orders, total, totalPages } = await getAdminOrderList(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">{total} total orders</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/orders/${order.id}`} className="font-medium hover:underline">
                        #{order.order_number}
                      </Link>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                    </TableCell>
                    <TableCell className="text-sm">{order.guest_email ?? "Registered customer"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {FULFILLMENT_STATUS_LABELS[order.fulfillment_status]}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(order.total, order.currency)}
                    </TableCell>
                  </TableRow>
                ))
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
              href={`/orders?page=${p}`}
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
