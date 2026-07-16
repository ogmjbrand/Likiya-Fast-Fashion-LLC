"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label } from "@likiya/ui";
import type { OrderStatus, FulfillmentStatus } from "@likiya/database";

import { updateOrderStatus, updateFulfillmentStatus } from "@/features/orders/actions";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "awaiting_payment",
  "processing",
  "completed",
  "cancelled",
  "refunded",
  "failed",
];

const FULFILLMENT_STATUSES: FulfillmentStatus[] = [
  "unfulfilled",
  "partially_fulfilled",
  "fulfilled",
  "shipped",
  "delivered",
  "returned",
];

export function OrderStatusForm({
  orderId,
  status,
  fulfillmentStatus,
}: {
  orderId: string;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Order Status</Label>
        <Select
          defaultValue={status}
          disabled={isPending}
          onValueChange={(value: OrderStatus) =>
            startTransition(async () => {
              await updateOrderStatus(orderId, value);
              toast.success("Order status updated.");
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Fulfillment Status</Label>
        <Select
          defaultValue={fulfillmentStatus}
          disabled={isPending}
          onValueChange={(value: FulfillmentStatus) =>
            startTransition(async () => {
              await updateFulfillmentStatus(orderId, value);
              toast.success("Fulfillment status updated.");
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FULFILLMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
