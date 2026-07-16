"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@likiya/database/server";
import type { ReturnStatus } from "@likiya/database";

export async function updateReturnStatus(returnId: string, status: ReturnStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("returns").update({ status }).eq("id", returnId);
  if (error) throw error;
  revalidatePath("/returns");
}
