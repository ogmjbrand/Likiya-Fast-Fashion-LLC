import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", service: "@likiya/api", timestamp: new Date().toISOString() });
}
