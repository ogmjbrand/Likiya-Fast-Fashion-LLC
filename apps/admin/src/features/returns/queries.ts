import "server-only";

import { createClient } from "@likiya/database/server";
import type { ReturnStatus } from "@likiya/database";

export interface AdminReturnRow {
  id: string;
  status: ReturnStatus;
  reason: string;
  created_at: string;
  order: { order_number: string } | null;
}

export async function getAdminReturnsList(): Promise<AdminReturnRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("returns")
    .select("id, status, reason, created_at, order:orders(order_number)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AdminReturnRow[];
}
