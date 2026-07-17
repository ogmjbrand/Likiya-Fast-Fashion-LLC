"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button, Input, Label } from "@likiya/ui";
import { requestPasswordReset, type AuthActionState } from "@/features/auth/actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    requestPasswordReset,
    null,
  );

  return (
    <div className="container-luxury flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="font-display text-3xl font-black uppercase">Reset Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {state?.error === null ? (
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, a reset link is on its way.
          </p>
        ) : (
          <form action={formAction} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>
        )}

        <Link href="/login" className="block text-sm text-muted-foreground underline underline-offset-4 hover:text-brand-pink">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
