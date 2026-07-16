/**
 * Hand-authored types mirroring supabase/migrations/*.sql.
 *
 * In a real deployment, regenerate this file from the live schema with
 * `npm run db:types` (wraps `supabase gen types typescript --linked`) and
 * commit the result — this file exists so the app type-checks before a
 * Supabase project is provisioned.
 */

export type UserRole = "customer" | "staff" | "admin" | "super_admin";
export type AddressType = "shipping" | "billing";
export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded"
  | "failed";
export type FulfillmentStatus =
  | "unfulfilled"
  | "partially_fulfilled"
  | "fulfilled"
  | "shipped"
  | "delivered"
  | "returned";
export type PaymentProvider =
  | "stripe"
  | "paystack"
  | "flutterwave"
  | "paypal"
  | "gift_card";
export type PaymentStatus =
  | "pending"
  | "authorized"
  | "succeeded"
  | "failed"
  | "refunded"
  | "partially_refunded";
export type DiscountType = "percentage" | "fixed_amount";
export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "received"
  | "completed";
export type RefundStatus = "pending" | "approved" | "rejected" | "completed";
export type NotificationType =
  | "order_placed"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "return_updated"
  | "refund_processed"
  | "price_drop"
  | "back_in_stock"
  | "loyalty_points"
  | "system";
export type ContentStatus = "draft" | "published" | "archived";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  loyalty_points: number;
  marketing_opt_in: boolean;
  default_shipping_address_id: string | null;
  default_billing_address_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  type: AddressType;
  full_name: string;
  company: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country_code: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  position: number;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_flash_sale: boolean;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  position: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  brand_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  care_instructions: string | null;
  material: string | null;
  status: ProductStatus;
  base_price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  currency: string;
  is_featured: boolean;
  avg_rating: number;
  review_count: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  position: number;
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  value: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  barcode: string | null;
  title: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  weight_grams: number | null;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  alt_text: string | null;
  position: number;
  created_at: string;
}

export interface ProductWithRelations extends Product {
  brand: Brand | null;
  images: ProductImage[];
  variants: ProductVariant[];
  options: (ProductOption & { values: ProductOptionValue[] })[];
  categories: Category[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_item_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_token: string | null;
  currency: string;
  coupon_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  price_at_add: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct extends CartItem {
  variant: ProductVariant & {
    product: Pick<Product, "id" | "name" | "slug">;
    image_url: string | null;
  };
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  currency: string;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  total: number;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  coupon_id: string | null;
  customer_notes: string | null;
  internal_notes: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  placed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string | null;
  product_name: string;
  variant_title: string | null;
  sku: string;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  total: number;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_subtotal: number | null;
  max_uses: number | null;
  max_uses_per_user: number | null;
  uses_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface InventoryLevel {
  id: string;
  variant_id: string;
  warehouse_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_incoming: number;
  low_stock_threshold: number;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country_code: string | null;
  is_active: boolean;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  variant_id: string;
  warehouse_id: string;
  quantity_delta: number;
  reason: string;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  warehouse_id: string;
  status: string;
  expected_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  variant_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: PaymentProvider;
  provider_reference: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  raw_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Refund {
  id: string;
  payment_id: string;
  order_id: string;
  amount: number;
  reason: string | null;
  status: RefundStatus;
  provider_reference: string | null;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string | null;
  status: ReturnStatus;
  reason: string;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReturnItem {
  id: string;
  return_id: string;
  order_item_id: string;
  quantity: number;
  condition: string | null;
  restocked: boolean;
}

export interface GiftCard {
  id: string;
  code: string;
  initial_balance: number;
  current_balance: number;
  currency: string;
  issued_to_email: string | null;
  purchased_by: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface GiftCardTransaction {
  id: string;
  gift_card_id: string;
  order_id: string | null;
  amount: number;
  type: string;
  created_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  type: string;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  author_id: string | null;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  variant_id: string;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_subscribed: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface ProductCategoryLink {
  product_id: string;
  category_id: string;
}

export interface ProductCollectionLink {
  product_id: string;
  collection_id: string;
  position: number;
}

export interface CouponRedemption {
  id: string;
  coupon_id: string;
  user_id: string | null;
  order_id: string;
  amount_discounted: number;
  created_at: string;
}

// The `& Record<string, unknown>` intersections below aren't redundant: they
// satisfy postgrest-js's `GenericTable` constraint, which requires an index
// signature. Plain interfaces (no index signature) fail that `extends`
// check, which silently collapses every query's row type to `never`.
type TableDef<TRow> = {
  Row: TRow & Record<string, unknown>;
  Insert: Partial<TRow> & Record<string, unknown>;
  Update: Partial<TRow> & Record<string, unknown>;
  Relationships: [];
};

/**
 * Hand-authored Supabase `Database` generic so `createClient<Database>()`
 * type-checks against every table used by the app. Regenerate from the
 * live schema with `npm run db:types` once a Supabase project exists.
 */
export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      addresses: TableDef<Address>;
      brands: TableDef<Brand>;
      categories: TableDef<Category>;
      collections: TableDef<Collection>;
      products: TableDef<Product>;
      product_options: TableDef<ProductOption>;
      product_option_values: TableDef<ProductOptionValue>;
      product_variants: TableDef<ProductVariant>;
      product_variant_option_values: TableDef<{ variant_id: string; option_value_id: string }>;
      product_images: TableDef<ProductImage>;
      product_categories: TableDef<ProductCategoryLink>;
      product_collections: TableDef<ProductCollectionLink>;
      reviews: TableDef<Review>;
      wishlists: TableDef<Wishlist>;
      wishlist_items: TableDef<WishlistItem>;
      carts: TableDef<Cart>;
      cart_items: TableDef<CartItem>;
      orders: TableDef<Order>;
      order_items: TableDef<OrderItem>;
      coupons: TableDef<Coupon>;
      coupon_redemptions: TableDef<CouponRedemption>;
      gift_cards: TableDef<GiftCard>;
      gift_card_transactions: TableDef<GiftCardTransaction>;
      payments: TableDef<Payment>;
      refunds: TableDef<Refund>;
      returns: TableDef<ReturnRequest>;
      return_items: TableDef<ReturnItem>;
      notifications: TableDef<Notification>;
      loyalty_transactions: TableDef<LoyaltyTransaction>;
      activity_logs: TableDef<ActivityLog>;
      blog_posts: TableDef<BlogPost>;
      newsletter_subscribers: TableDef<NewsletterSubscriber>;
      warehouses: TableDef<Warehouse>;
      inventory_levels: TableDef<InventoryLevel>;
      inventory_movements: TableDef<InventoryMovement>;
      suppliers: TableDef<Supplier>;
      purchase_orders: TableDef<PurchaseOrder>;
      purchase_order_items: TableDef<PurchaseOrderItem>;
    };
    Views: Record<string, never>;
    Functions: {
      adjust_inventory: {
        Args: {
          p_variant_id: string;
          p_warehouse_id: string;
          p_quantity_delta: number;
          p_reason: string;
          p_reference_type: string | null;
          p_reference_id: string | null;
          p_note: string | null;
          p_created_by: string | null;
        };
        Returns: void;
      };
    };
  };
}
