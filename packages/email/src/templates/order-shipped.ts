import { emailLayout } from "./layout";

export interface OrderShippedInput {
  siteName: string;
  siteUrl: string;
  orderNumber: string;
  customerName: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  orderUrl: string;
}

export function orderShippedEmail(input: OrderShippedInput) {
  const bodyHtml = `
    <h1 style="font-size:22px;font-weight:500;margin:0 0 8px;">Your order is on its way</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:#4a453c;margin:0 0 24px;">
      Hi ${input.customerName}, order <strong>#${input.orderNumber}</strong> has shipped via ${input.carrier}.
    </p>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:#4a453c;margin:0 0 24px;">
      Tracking number: <strong>${input.trackingNumber}</strong>
    </p>
    <div style="text-align:center;margin-top:24px;">
      <a href="${input.trackingUrl}" style="display:inline-block;background:#1a1713;color:#f5f3ef;padding:12px 28px;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;margin-right:8px;">
        Track Package
      </a>
    </div>
  `;

  return {
    subject: `Your order #${input.orderNumber} has shipped`,
    html: emailLayout({
      siteName: input.siteName,
      siteUrl: input.siteUrl,
      previewText: `Order #${input.orderNumber} shipped via ${input.carrier}.`,
      bodyHtml,
    }),
  };
}
