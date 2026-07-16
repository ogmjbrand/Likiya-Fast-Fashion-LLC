import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Ticket,
  Undo2,
  BarChart3,
  ScrollText,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Products", href: "/products", icon: Package },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Inventory", href: "/inventory", icon: Warehouse },
  { label: "Coupons", href: "/coupons", icon: Ticket },
  { label: "Returns", href: "/returns", icon: Undo2 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Audit Logs", href: "/audit-logs", icon: ScrollText },
];
