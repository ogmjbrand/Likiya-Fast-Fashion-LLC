import { notFound } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent, Badge, Separator } from "@likiya/ui";
import { formatPrice, formatDate } from "@likiya/utils";
import { PAYMENT_STATUS_LABELS } from "@likiya/types";

import { getAdminOrderDetail } from "@/features/orders/queries";
import { OrderStatusForm } from "./status-form";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderDetail(id);

  if (!order) notFound();

  const shippingAddress = order.shipping_address as Record<string, string> | null;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Order #{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <Badge variant="secondary">{order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  {item.variant_title ? (
                    <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                </div>
                <span>{formatPrice(item.total, order.currency)}</span>
              </div>
            ))}
            <Separator />
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
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fulfillment</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusForm
                orderId={order.id}
                status={order.status}
                fulfillmentStatus={order.fulfillment_status}
              />
            </CardContent>
          </Card>

          {shippingAddress ? (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{shippingAddress.full_name}</p>
                <p>{shippingAddress.line1}</p>
                {shippingAddress.line2 ? <p>{shippingAddress.line2}</p> : null}
                <p>
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                </p>
                <p>{shippingAddress.country_code}</p>
              </CardContent>
            </Card>
          ) : null}

          {order.payments.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between">
                    <span className="capitalize text-muted-foreground">{payment.provider}</span>
                    <span>
                      {formatPrice(payment.amount, payment.currency)} —{" "}
                      {PAYMENT_STATUS_LABELS[payment.status]}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
