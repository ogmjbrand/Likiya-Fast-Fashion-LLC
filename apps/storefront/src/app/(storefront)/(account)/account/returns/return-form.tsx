"use client";

import { useActionState } from "react";

import { Button, Textarea, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@likiya/ui";
import type { Order } from "@likiya/database";

import { requestReturn, type ReturnRequestState } from "@/features/account/actions";

export function ReturnForm({ eligibleOrders }: { eligibleOrders: Order[] }) {
  const [state, formAction, isPending] = useActionState<ReturnRequestState, FormData>(
    requestReturn,
    null,
  );

  if (eligibleOrders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You don&apos;t have any completed orders eligible for return.
      </p>
    );
  }

  return (
    <form action={formAction} className="max-w-md space-y-4 border border-border p-6">
      <div className="space-y-1.5">
        <Label htmlFor="orderId">Order</Label>
        <Select name="orderId" required>
          <SelectTrigger className="w-full" id="orderId">
            <SelectValue placeholder="Select an order" />
          </SelectTrigger>
          <SelectContent>
            {eligibleOrders.map((order) => (
              <SelectItem key={order.id} value={order.id}>
                #{order.order_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reason">Reason for return</Label>
        <Textarea id="reason" name="reason" rows={4} required />
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state?.error === null ? (
        <p className="text-sm text-accent-foreground">Return request submitted.</p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting…" : "Request Return"}
      </Button>
    </form>
  );
}
