import "server-only";

import { createClient } from "@likiya/database/server";

export async function getAdminCustomerList(page = 1, pageSize = 20) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, loyalty_points, created_at", { count: "exact" })
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    customers: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}
