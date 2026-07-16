import type { Metadata } from "next";

import { siteConfig } from "@likiya/config";

interface BuildMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

/** Builds a consistent Metadata object (title, OG, Twitter) for a page. */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.ogImage,
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const imageUrl = image.startsWith("http") ? image : new URL(image, siteConfig.url).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.fullName,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
