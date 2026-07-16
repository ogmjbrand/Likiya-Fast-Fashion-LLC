import { NextResponse } from "next/server";

import { createClient } from "@likiya/database/server";
import { newsletterSchema } from "@/lib/validations/newsletter";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      { email: parsed.data.email, is_subscribed: true, subscribed_at: new Date().toISOString() },
      { onConflict: "email" },
    );

  if (error) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
