"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@likiya/database/server";
import { adjustInventory } from "@likiya/inventory";
import { requireStaff } from "@likiya/auth/server";

export async function adjustStock(variantId: string, warehouseId: string, quantityDelta: number, note: string) {
  const staff = await requireStaff();
  const supabase = await createClient();

  await adjustInventory(supabase, {
    variantId,
    warehouseId,
    quantityDelta,
    reason: "adjustment",
    note,
    createdBy: staff.id,
  });

  revalidatePath("/inventory");
}
