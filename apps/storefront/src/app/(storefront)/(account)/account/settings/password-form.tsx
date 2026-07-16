"use client";

import { useActionState } from "react";

import { Button, Input, Label } from "@likiya/ui";

import { updatePassword } from "@/features/auth/actions";
import type { AuthActionState } from "@/features/auth/actions";

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    updatePassword,
    null,
  );

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">New Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}
