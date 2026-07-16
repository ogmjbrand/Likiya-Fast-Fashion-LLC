interface EmailLayoutOptions {
  siteName: string;
  siteUrl: string;
  previewText: string;
  bodyHtml: string;
}

/** Minimal, table-free HTML shell that renders consistently across major email clients. */
export function emailLayout({ siteName, siteUrl, previewText, bodyHtml }: EmailLayoutOptions): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${siteName}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f3ef;font-family:Georgia,'Times New Roman',serif;color:#1a1713;">
    <span style="display:none;max-height:0;overflow:hidden;">${previewText}</span>
    <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
      <div style="text-align:center;margin-bottom:40px;">
        <a href="${siteUrl}" style="font-size:22px;letter-spacing:0.2em;text-transform:uppercase;color:#1a1713;text-decoration:none;font-weight:600;">
          ${siteName}
        </a>
      </div>
      <div style="background:#ffffff;padding:40px;border:1px solid #e5e0d8;">
        ${bodyHtml}
      </div>
      <p style="text-align:center;font-size:12px;color:#8a8478;margin-top:32px;font-family:Arial,sans-serif;">
        &copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.
      </p>
    </div>
  </body>
</html>`;
}
