import { notFound } from "next/navigation";

import { getCurrentUser } from "@likiya/auth/server";
import { formatPrice, formatDate } from "@likiya/utils";
import { ORDER_STATUS_LABELS, FULFILLMENT_STATUS_LABELS } from "@likiya/types";
import { Badge, Separator } from "@likiya/ui";

import { getMyOrderDetail } from "@/features/account/queries";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const order = await getMyOrderDetail(user.id, id);
  if (!order) notFound();

  const shippingAddress = order.shipping_address as Record<string, string> | null;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl">Order #{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status]}</Badge>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">
          Fulfillment: {FULFILLMENT_STATUS_LABELS[order.fulfillment_status]}
        </p>
        {order.tracking_number ? (
          <p className="text-sm text-muted-foreground">
            Tracking: {order.tracking_number} ({order.carrier})
          </p>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-lg">Items</h2>
          <ul className="mt-3 space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <div>
                  <p>{item.product_name}</p>
                  {item.variant_title ? (
                    <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                </div>
                <span>{formatPrice(item.total, order.currency)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal, order.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatPrice(order.shipping_total, order.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(order.tax_total, order.currency)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total, order.currency)}</span>
            </div>
          </div>
        </div>

        {shippingAddress ? (
          <div>
            <h2 className="font-heading text-lg">Shipping Address</h2>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>{shippingAddress.full_name}</p>
              <p>{shippingAddress.line1}</p>
              {shippingAddress.line2 ? <p>{shippingAddress.line2}</p> : null}
              <p>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
              </p>
              <p>{shippingAddress.country_code}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
