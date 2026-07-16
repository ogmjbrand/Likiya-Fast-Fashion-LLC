"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button, Badge } from "@likiya/ui";
import type { Address } from "@likiya/database";

import { deleteAddress } from "@/features/account/actions";

export function AddressList({ addresses }: { addresses: Address[] }) {
  const [isPending, startTransition] = useTransition();

  if (addresses.length === 0) {
    return <p className="text-sm text-muted-foreground">You haven&apos;t saved any addresses yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {addresses.map((address) => (
        <li key={address.id} className="flex items-start justify-between border border-border p-4">
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <p className="font-medium">{address.full_name}</p>
              {address.is_default ? <Badge variant="secondary">Default</Badge> : null}
            </div>
            <p className="text-muted-foreground">{address.line1}</p>
            {address.line2 ? <p className="text-muted-foreground">{address.line2}</p> : null}
            <p className="text-muted-foreground">
              {address.city}, {address.state} {address.postal_code}
            </p>
            <p className="text-muted-foreground">{address.country_code}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await deleteAddress(address.id);
                toast.success("Address removed.");
              })
            }
          >
            Remove
          </Button>
        </li>
      ))}
    </ul>
  );
}
