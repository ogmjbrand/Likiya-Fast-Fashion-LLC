-- Enumerated types shared across the schema.

create type user_role as enum ('customer', 'staff', 'admin', 'super_admin');

create type address_type as enum ('shipping', 'billing');

create type product_status as enum ('draft', 'active', 'archived');

create type order_status as enum (
  'pending',
  'awaiting_payment',
  'processing',
  'completed',
  'cancelled',
  'refunded',
  'failed'
);

create type fulfillment_status as enum (
  'unfulfilled',
  'partially_fulfilled',
  'fulfilled',
  'shipped',
  'delivered',
  'returned'
);

create type payment_provider as enum ('stripe', 'paystack', 'flutterwave', 'paypal', 'gift_card');

create type payment_status as enum (
  'pending',
  'authorized',
  'succeeded',
  'failed',
  'refunded',
  'partially_refunded'
);

create type discount_type as enum ('percentage', 'fixed_amount');

create type return_status as enum (
  'requested',
  'approved',
  'rejected',
  'received',
  'completed'
);

create type refund_status as enum ('pending', 'approved', 'rejected', 'completed');

create type inventory_movement_reason as enum (
  'sale',
  'return',
  'restock',
  'adjustment',
  'damaged',
  'transfer_in',
  'transfer_out',
  'purchase_order_received'
);

create type purchase_order_status as enum (
  'draft',
  'submitted',
  'partially_received',
  'received',
  'cancelled'
);

create type notification_type as enum (
  'order_placed',
  'order_shipped',
  'order_delivered',
  'order_cancelled',
  'return_updated',
  'refund_processed',
  'price_drop',
  'back_in_stock',
  'loyalty_points',
  'system'
);

create type loyalty_transaction_type as enum ('earn', 'redeem', 'expire', 'adjustment');

create type gift_card_transaction_type as enum ('issue', 'redemption', 'adjustment', 'refund');

create type content_status as enum ('draft', 'published', 'archived');
