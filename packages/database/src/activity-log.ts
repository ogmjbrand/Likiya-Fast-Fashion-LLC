import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export interface LogActivityInput {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/** Records a staff/system action to `activity_logs` for the admin audit trail. */
export async function logActivity(supabase: SupabaseClient<Database>, input: LogActivityInput) {
  const { error } = await supabase.from("activity_logs").insert({
    actor_id: input.actorId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? null,
  });

  if (error) console.error("[activity_log] Failed to record activity", error);
}
