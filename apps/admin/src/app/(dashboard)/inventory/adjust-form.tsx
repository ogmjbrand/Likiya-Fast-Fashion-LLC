"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button, Input, Popover, PopoverTrigger, PopoverContent, Label } from "@likiya/ui";

import { adjustStock } from "@/features/inventory/actions";

export function AdjustStockButton({
  variantId,
  warehouseId,
}: {
  variantId: string;
  warehouseId: string;
}) {
  const [delta, setDelta] = useState("0");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Adjust
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="delta">Quantity change</Label>
          <Input
            id="delta"
            type="number"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder="e.g. -2 or 10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note">Note</Label>
          <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason" />
        </div>
        <Button
          size="sm"
          className="w-full"
          disabled={isPending || Number(delta) === 0}
          onClick={() =>
            startTransition(async () => {
              await adjustStock(variantId, warehouseId, Number(delta), note);
              toast.success("Stock adjusted.");
              setOpen(false);
              setDelta("0");
              setNote("");
            })
          }
        >
          {isPending ? "Saving…" : "Save"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
