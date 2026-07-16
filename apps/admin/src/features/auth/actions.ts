"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { signInWithPassword as signInWithPasswordOp, signOut as signOutOp } from "@likiya/auth/server";
import { loginSchema } from "@likiya/auth";

export type AuthActionState = { error: string | null } | null;

export async function signInWithPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await signInWithPasswordOp(parsed.data.email, parsed.data.password);

  if (error) {
    return { error: "Incorrect email or password." };
  }

  revalidatePath("/", "layout");
  redirect((formData.get("redirect") as string) || "/");
}

export async function signOut() {
  await signOutOp();
  revalidatePath("/", "layout");
  redirect("/login");
}
