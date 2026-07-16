import Link from "next/link";
import { DollarSign, ShoppingCart, Users, AlertTriangle } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
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
import { ORDER_STATUS_LABELS } from "@likiya/types";

import { StatTile } from "@/components/dashboard/stat-tile";
import { getDashboardStats, getRecentOrders } from "@/features/dashboard/queries";

export default async function DashboardPage() {
  const [stats, recentOrders] = await Promise.all([getDashboardStats(), getRecentOrders()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Last 30 days at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Revenue" value={formatPrice(stats.revenueLast30Days)} icon={DollarSign} />
        <StatTile label="Orders" value={String(stats.ordersLast30Days)} icon={ShoppingCart} />
        <StatTile label="Customers" value={String(stats.totalCustomers)} icon={Users} />
        <StatTile
          label="Low Stock Items"
          value={String(stats.lowStockCount)}
          icon={AlertTriangle}
          tone={stats.lowStockCount > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link href={`/orders/${order.id}`} className="font-medium hover:underline">
                          #{order.order_number}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{order.guest_email ?? "Registered customer"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status]}</Badge>
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

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">All variants are well stocked.</p>
            ) : (
              stats.lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.variant.product.name}</p>
                    <p className="text-xs text-muted-foreground">{item.variant.sku}</p>
                  </div>
                  <Badge variant="destructive">{item.quantity_on_hand} left</Badge>
                </div>
              ))
            )}
            <Link href="/inventory" className="block pt-2 text-sm underline underline-offset-4">
              View inventory
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
