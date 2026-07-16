import { emailLayout } from "./layout";

export interface WelcomeEmailInput {
  siteName: string;
  siteUrl: string;
  discountCode?: string;
}

export function welcomeEmail(input: WelcomeEmailInput) {
  const bodyHtml = `
    <h1 style="font-size:22px;font-weight:500;margin:0 0 8px;">Welcome to ${input.siteName}</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:#4a453c;margin:0 0 24px;">
      You're on the list for early access to new arrivals and private sales.
    </p>
    ${
      input.discountCode
        ? `<p style="font-family:Arial,sans-serif;font-size:14px;color:#4a453c;margin:0 0 24px;">
             Use code <strong>${input.discountCode}</strong> on your first order.
           </p>`
        : ""
    }
    <div style="text-align:center;margin-top:24px;">
      <a href="${input.siteUrl}/collections/new-arrivals" style="display:inline-block;background:#1a1713;color:#f5f3ef;padding:12px 28px;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;">
        Shop New Arrivals
      </a>
    </div>
  `;

  return {
    subject: `Welcome to ${input.siteName}`,
    html: emailLayout({
      siteName: input.siteName,
      siteUrl: input.siteUrl,
      previewText: `Welcome to ${input.siteName}.`,
      bodyHtml,
    }),
  };
}
