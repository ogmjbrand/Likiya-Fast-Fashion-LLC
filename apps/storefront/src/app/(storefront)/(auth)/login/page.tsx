import { Suspense } from "react";
import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";
import { LoginForm } from "./login-form";

export const metadata: Metadata = buildMetadata({ title: "Sign In", path: "/login", noIndex: true });

export default function LoginPage() {
  return (
    <div className="container-luxury flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-black uppercase">Welcome Back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your Likiya account.</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
