import "server-only";
import { NextResponse, type NextRequest } from "next/server";

import { serverEnv } from "@likiya/config/server";

/** Verifies the `Authorization: Bearer <CRON_SECRET>` header Vercel Cron sends on scheduled hits. */
export function requireCronAuth(request: NextRequest): NextResponse | null {
  if (!serverEnv.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
