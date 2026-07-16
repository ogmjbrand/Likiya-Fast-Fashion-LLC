import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm space-y-8 rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-semibold uppercase tracking-[0.1em]">
            Likiya Admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in with your staff account.</p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
