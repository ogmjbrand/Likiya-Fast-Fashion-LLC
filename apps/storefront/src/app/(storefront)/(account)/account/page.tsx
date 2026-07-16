import Link from "next/link";

import { getCurrentUser, getCurrentProfile } from "@likiya/auth/server";
import { formatPrice, formatDate } from "@likiya/utils";
import { ORDER_STATUS_LABELS } from "@likiya/types";

import { getMyOrders } from "@/features/account/queries";

export default async function AccountOverviewPage() {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();
  const orders = user ? await getMyOrders(user.id) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You have {profile?.loyalty_points ?? 0} loyalty points.
        </p>
      </div>

      <div>
        <h2 className="font-heading text-lg">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id} className="flex items-center justify-between py-3">
                <div>
                  <Link href={`/account/orders/${order.id}`} className="font-medium hover:underline">
                    #{order.order_number}
                  </Link>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right text-sm">
                  <p>{formatPrice(order.total, order.currency)}</p>
                  <p className="text-muted-foreground">{ORDER_STATUS_LABELS[order.status]}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
