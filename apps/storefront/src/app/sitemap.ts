import type { MetadataRoute } from "next";

import { createClient } from "@likiya/database/server";
import { siteConfig } from "@likiya/config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }, { data: collections }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("status", "active"),
    supabase.from("categories").select("slug, updated_at").eq("is_active", true),
    supabase.from("collections").select("slug, updated_at").eq("is_active", true),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/search`, changeFrequency: "weekly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((product) => ({
    url: `${siteConfig.url}/products/${product.slug}`,
    lastModified: product.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((category) => ({
    url: `${siteConfig.url}/collections/${category.slug}`,
    lastModified: category.updated_at,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = (collections ?? []).map((collection) => ({
    url: `${siteConfig.url}/collections/${collection.slug}`,
    lastModified: collection.updated_at,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...collectionRoutes];
}
