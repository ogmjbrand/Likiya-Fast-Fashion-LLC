import type {
  OrderStatus,
  FulfillmentStatus,
  PaymentStatus,
  ReturnStatus,
  RefundStatus,
} from "@likiya/database";

/** Consistent human-readable labels for status enums — shared so storefront and admin never drift. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  awaiting_payment: "Awaiting Payment",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  failed: "Failed",
};

export const FULFILLMENT_STATUS_LABELS: Record<FulfillmentStatus, string> = {
  unfulfilled: "Unfulfilled",
  partially_fulfilled: "Partially Fulfilled",
  fulfilled: "Fulfilled",
  shipped: "Shipped",
  delivered: "Delivered",
  returned: "Returned",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  authorized: "Authorized",
  succeeded: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  partially_refunded: "Partially Refunded",
};

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  received: "Received",
  completed: "Completed",
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};
