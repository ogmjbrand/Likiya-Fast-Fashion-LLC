import type { MetadataRoute } from "next";

import { siteConfig } from "@likiya/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/checkout", "/cart", "/api", "/auth"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
