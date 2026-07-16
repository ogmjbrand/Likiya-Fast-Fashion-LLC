import "server-only";

import { createClient } from "@likiya/database/server";

export interface DailyRevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export async function getDailyRevenue(days = 30): Promise<DailyRevenuePoint[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("orders")
    .select("total, created_at")
    .eq("status", "completed")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (const order of data ?? []) {
    const day = order.created_at.slice(0, 10);
    const existing = byDay.get(day) ?? { revenue: 0, orders: 0 };
    existing.revenue += Number(order.total);
    existing.orders += 1;
    byDay.set(day, existing);
  }

  return Array.from(byDay.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
