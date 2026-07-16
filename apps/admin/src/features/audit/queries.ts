import "server-only";

import { createClient } from "@likiya/database/server";
import type { ActivityLog } from "@likiya/database";

export async function getRecentActivity(limit = 50): Promise<ActivityLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
