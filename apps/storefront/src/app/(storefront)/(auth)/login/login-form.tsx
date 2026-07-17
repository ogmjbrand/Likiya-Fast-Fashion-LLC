"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button, Input, Label, Separator } from "@likiya/ui";
import { signInWithPassword, signInWithOAuth, type AuthActionState } from "@/features/auth/actions";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/account";
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    signInWithPassword,
    null,
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-brand-pink hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

      <div className="space-y-2">
        <form action={async () => signInWithOAuth("google")}>
          <Button type="submit" variant="outline" className="w-full">
            Continue with Google
          </Button>
        </form>
        <form action={async () => signInWithOAuth("apple")}>
          <Button type="submit" variant="outline" className="w-full">
            Continue with Apple
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline underline-offset-4 hover:text-brand-pink">
          Create one
        </Link>
      </p>
    </div>
  );
}
