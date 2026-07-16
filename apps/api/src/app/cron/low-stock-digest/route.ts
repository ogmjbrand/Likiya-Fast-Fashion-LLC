import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@likiya/database/admin";
import { getLowStockLevels } from "@likiya/inventory";
import { sendEmail, emailLayout } from "@likiya/email";
import { clientEnv } from "@likiya/config";

import { requireCronAuth } from "@/lib/require-cron-auth";

/**
 * Scheduled daily (see vercel.json) to email every admin/super_admin a
 * digest of variants at or below their low-stock threshold. Skips sending
 * entirely when nothing is low, so staff aren't trained to ignore the email.
 */
export async function GET(request: NextRequest) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  const supabase = createAdminClient();
  const lowStock = await getLowStockLevels(supabase);

  if (lowStock.length === 0) {
    return NextResponse.json({ sent: false, reason: "No low-stock variants." });
  }

  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["admin", "super_admin"]);

  const recipients: string[] = [];
  for (const admin of admins ?? []) {
    const { data } = await supabase.auth.admin.getUserById(admin.id);
    if (data.user?.email) recipients.push(data.user.email);
  }

  if (recipients.length === 0) {
    return NextResponse.json({ sent: false, reason: "No admin recipients found." });
  }

  const rows = lowStock
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;">${item.variant.product.name} — ${item.variant.sku}</td><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;text-align:right;">${item.quantity_on_hand} left</td></tr>`,
    )
    .join("");

  const html = emailLayout({
    siteName: "Likiya",
    siteUrl: clientEnv.NEXT_PUBLIC_STOREFRONT_URL ?? clientEnv.NEXT_PUBLIC_SITE_URL,
    previewText: `${lowStock.length} variants are running low on stock.`,
    bodyHtml: `
      <h1 style="font-size:20px;font-weight:500;margin:0 0 16px;">Low Stock Alert</h1>
      <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    `,
  });

  await Promise.all(
    recipients.map((to) => sendEmail({ to, subject: `Low stock alert: ${lowStock.length} variants`, html })),
  );

  return NextResponse.json({ sent: true, recipients: recipients.length, items: lowStock.length });
}
