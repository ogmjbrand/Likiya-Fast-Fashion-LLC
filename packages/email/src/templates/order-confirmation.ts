import { emailLayout } from "./layout";

export interface OrderConfirmationItem {
  name: string;
  variantTitle: string | null;
  quantity: number;
  total: string;
}

export interface OrderConfirmationInput {
  siteName: string;
  siteUrl: string;
  orderNumber: string;
  customerName: string;
  items: OrderConfirmationItem[];
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  orderUrl: string;
}

export function orderConfirmationEmail(input: OrderConfirmationInput) {
  const itemRows = input.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0ede6;font-family:Arial,sans-serif;font-size:14px;">
          ${item.name}${item.variantTitle ? ` <span style="color:#8a8478;">— ${item.variantTitle}</span>` : ""}<br />
          <span style="color:#8a8478;font-size:12px;">Qty ${item.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #f0ede6;font-family:Arial,sans-serif;font-size:14px;text-align:right;">
          ${item.total}
        </td>
      </tr>`,
    )
    .join("");

  const bodyHtml = `
    <h1 style="font-size:22px;font-weight:500;margin:0 0 8px;">Thank you, ${input.customerName}</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:#4a453c;margin:0 0 24px;">
      Your order <strong>#${input.orderNumber}</strong> has been confirmed. We'll email you again once it ships.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemRows}
      <tr><td style="padding-top:16px;font-family:Arial,sans-serif;font-size:14px;color:#8a8478;">Subtotal</td><td style="padding-top:16px;text-align:right;font-family:Arial,sans-serif;font-size:14px;">${input.subtotal}</td></tr>
      <tr><td style="font-family:Arial,sans-serif;font-size:14px;color:#8a8478;">Shipping</td><td style="text-align:right;font-family:Arial,sans-serif;font-size:14px;">${input.shipping}</td></tr>
      <tr><td style="font-family:Arial,sans-serif;font-size:14px;color:#8a8478;">Tax</td><td style="text-align:right;font-family:Arial,sans-serif;font-size:14px;">${input.tax}</td></tr>
      <tr><td style="padding-top:8px;font-family:Arial,sans-serif;font-size:15px;font-weight:600;">Total</td><td style="padding-top:8px;text-align:right;font-family:Arial,sans-serif;font-size:15px;font-weight:600;">${input.total}</td></tr>
    </table>
    <div style="text-align:center;margin-top:32px;">
      <a href="${input.orderUrl}" style="display:inline-block;background:#1a1713;color:#f5f3ef;padding:12px 28px;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;">
        View Order
      </a>
    </div>
  `;

  return {
    subject: `Order confirmed — #${input.orderNumber}`,
    html: emailLayout({
      siteName: input.siteName,
      siteUrl: input.siteUrl,
      previewText: `Your Likiya order #${input.orderNumber} is confirmed.`,
      bodyHtml,
    }),
  };
}
