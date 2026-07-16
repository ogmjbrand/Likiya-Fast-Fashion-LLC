import "server-only";

import { createClient } from "@likiya/database/server";
import type {
  Brand,
  Category,
  Product,
  ProductImage,
  ProductOption,
  ProductOptionValue,
  ProductVariant,
  ProductWithRelations,
  Review,
} from "@likiya/database";

const PRODUCT_SELECT = `
  *,
  brand:brands(*),
  images:product_images(*),
  variants:product_variants(*, option_values:product_variant_option_values(option_value:product_option_values(*, option:product_options(*)))),
  options:product_options(*, values:product_option_values(*)),
  categories:product_categories(category:categories(*))
`;

type RawProduct = Product & {
  brand: Brand | null;
  images: ProductImage[];
  variants: (ProductVariant & {
    option_values: { option_value: ProductOptionValue & { option: ProductOption } }[];
  })[];
  options: (ProductOption & { values: ProductOptionValue[] })[];
  categories: { category: Category }[];
};

function mapProduct(raw: RawProduct): ProductWithRelations {
  return {
    ...raw,
    brand: raw.brand,
    images: [...raw.images].sort((a, b) => a.position - b.position),
    variants: [...raw.variants]
      .sort((a, b) => a.position - b.position)
      .map((variant) => ({
        ...variant,
        optionValueIds: variant.option_values.map((ov) => ov.option_value.id),
      })),
    options: [...raw.options].sort((a, b) => a.position - b.position),
    categories: raw.categories.map((c) => c.category),
  };
}

export async function getFeaturedProducts(limit = 8): Promise<ProductWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as unknown as RawProduct[]).map(mapProduct);
}

export async function getNewArrivals(limit = 12): Promise<ProductWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as unknown as RawProduct[]).map(mapProduct);
}

interface ProductListFilters {
  categorySlug?: string;
  collectionSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "best_selling";
  page?: number;
  pageSize?: number;
}

export async function getProductList(filters: ProductListFilters = {}) {
  const supabase = await createClient();
  const { page = 1, pageSize = 24 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("status", "active");

  if (filters.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .single();
    if (category) {
      const { data: productIds } = await supabase
        .from("product_categories")
        .select("product_id")
        .eq("category_id", category.id);
      query = query.in("id", (productIds ?? []).map((p) => p.product_id));
    }
  }

  if (filters.collectionSlug) {
    const { data: collection } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", filters.collectionSlug)
      .single();
    if (collection) {
      const { data: productIds } = await supabase
        .from("product_collections")
        .select("product_id")
        .eq("collection_id", collection.id);
      query = query.in("id", (productIds ?? []).map((p) => p.product_id));
    }
  }

  if (filters.minPrice !== undefined) query = query.gte("base_price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("base_price", filters.maxPrice);

  switch (filters.sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  return {
    products: ((data ?? []) as unknown as RawProduct[]).map(mapProduct),
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapProduct(data as unknown as RawProduct);
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getRelatedProducts(
  productId: string,
  categoryIds: string[],
  limit = 4,
): Promise<ProductWithRelations[]> {
  if (categoryIds.length === 0) return [];

  const supabase = await createClient();
  const { data: productIds } = await supabase
    .from("product_categories")
    .select("product_id")
    .in("category_id", categoryIds)
    .neq("product_id", productId);

  const ids = Array.from(new Set((productIds ?? []).map((p) => p.product_id))).slice(0, limit);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("id", ids)
    .eq("status", "active");

  if (error) throw error;
  return ((data ?? []) as unknown as RawProduct[]).map(mapProduct);
}

export async function searchProducts(query: string, limit = 20): Promise<ProductWithRelations[]> {
  if (!query.trim()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .textSearch("search_vector", query, { type: "websearch", config: "english" })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as unknown as RawProduct[]).map(mapProduct);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("position");

  if (error) throw error;
  return data ?? [];
}
