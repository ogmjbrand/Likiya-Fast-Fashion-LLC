/**
 * Canonical RBAC permission keys, seeded into `public.permissions` and
 * checked by the admin app when gating a nav item or mutation. Keeping this
 * list in a shared package means storefront, admin, and future apps agree
 * on the same permission strings without importing across app boundaries.
 */
export const PERMISSIONS = {
  PRODUCTS_READ: "products.read",
  PRODUCTS_WRITE: "products.write",
  ORDERS_READ: "orders.read",
  ORDERS_WRITE: "orders.write",
  CUSTOMERS_READ: "customers.read",
  CUSTOMERS_WRITE: "customers.write",
  INVENTORY_READ: "inventory.read",
  INVENTORY_WRITE: "inventory.write",
  COUPONS_WRITE: "coupons.write",
  MARKETING_WRITE: "marketing.write",
  CMS_WRITE: "cms.write",
  STAFF_MANAGE: "staff.manage",
  SETTINGS_MANAGE: "settings.manage",
  ANALYTICS_READ: "analytics.read",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
