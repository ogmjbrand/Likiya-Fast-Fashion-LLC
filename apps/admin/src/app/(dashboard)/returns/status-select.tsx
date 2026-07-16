"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@likiya/ui";
import type { ReturnStatus } from "@likiya/database";

import { updateReturnStatus } from "@/features/returns/actions";

const STATUSES: ReturnStatus[] = ["requested", "approved", "rejected", "received", "completed"];

export function ReturnStatusSelect({ returnId, status }: { returnId: string; status: ReturnStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={status}
      disabled={isPending}
      onValueChange={(value: ReturnStatus) =>
        startTransition(async () => {
          await updateReturnStatus(returnId, value);
          toast.success("Return status updated.");
        })
      }
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
