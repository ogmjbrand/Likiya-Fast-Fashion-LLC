"use client";

import { useActionState } from "react";

import { Button, Input, Label, Checkbox } from "@likiya/ui";

import { saveAddress, type AddressActionState } from "@/features/account/actions";

export function AddressForm() {
  const [state, formAction, isPending] = useActionState<AddressActionState, FormData>(
    saveAddress,
    null,
  );

  return (
    <form action={formAction} className="space-y-4 border border-border p-6">
      <h2 className="font-display text-base font-black uppercase tracking-wide">Add Address</h2>
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="line1">Address</Label>
        <Input id="line1" name="line1" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="line2">Apartment, suite, etc.</Label>
        <Input id="line2" name="line2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input id="postalCode" name="postalCode" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="countryCode">Country Code</Label>
          <Input id="countryCode" name="countryCode" maxLength={2} placeholder="US" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isDefault" />
        Set as default address
      </label>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save Address"}
      </Button>
    </form>
  );
}
