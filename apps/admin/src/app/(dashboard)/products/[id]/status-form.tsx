"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Switch, Label } from "@likiya/ui";
import type { ProductStatus } from "@likiya/database";

import { updateProductStatus, toggleProductFeatured } from "@/features/products/actions";

export function ProductStatusForm({
  productId,
  status,
  isFeatured,
}: {
  productId: string;
  status: ProductStatus;
  isFeatured: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select
          defaultValue={status}
          disabled={isPending}
          onValueChange={(value: ProductStatus) =>
            startTransition(async () => {
              await updateProductStatus(productId, value);
              toast.success("Product status updated.");
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="featured">Featured on homepage</Label>
        <Switch
          id="featured"
          defaultChecked={isFeatured}
          disabled={isPending}
          onCheckedChange={(checked: boolean) =>
            startTransition(async () => {
              await toggleProductFeatured(productId, checked);
              toast.success("Updated.");
            })
          }
        />
      </div>
    </div>
  );
}
