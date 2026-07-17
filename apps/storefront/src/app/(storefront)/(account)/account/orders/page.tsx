import Link from "next/link";

import { getCurrentUser } from "@likiya/auth/server";
import { formatPrice, formatDate } from "@likiya/utils";
import { ORDER_STATUS_LABELS } from "@likiya/types";
import { Badge } from "@likiya/ui";

import { getMyOrders } from "@/features/account/queries";

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();
  const orders = user ? await getMyOrders(user.id) : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase">Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between py-4">
              <div>
                <Link href={`/account/orders/${order.id}`} className="font-medium hover:text-brand-pink hover:underline">
                  #{order.order_number}
                </Link>
                <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status]}</Badge>
                <span className="text-sm font-medium">{formatPrice(order.total, order.currency)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
