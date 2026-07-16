import "server-only";

import { createClient } from "@likiya/database/server";
import { getLowStockLevels } from "@likiya/inventory";

export async function getDashboardStats() {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [ordersResult, revenueResult, customersResult, pendingOrdersResult, lowStock] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo),
      supabase
        .from("orders")
        .select("total")
        .eq("status", "completed")
        .gte("created_at", thirtyDaysAgo),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "awaiting_payment", "processing"]),
      getLowStockLevels(supabase).catch(() => []),
    ]);

  const revenue = (revenueResult.data ?? []).reduce((sum, row) => sum + Number(row.total), 0);

  return {
    ordersLast30Days: ordersResult.count ?? 0,
    revenueLast30Days: revenue,
    totalCustomers: customersResult.count ?? 0,
    pendingOrders: pendingOrdersResult.count ?? 0,
    lowStockCount: lowStock.length,
    lowStockItems: lowStock.slice(0, 5),
  };
}

export async function getRecentOrders(limit = 8) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, guest_email, user_id, status, total, currency, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
