import "server-only";

import { createClient } from "@likiya/database/server";

export async function getAdminCouponList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
