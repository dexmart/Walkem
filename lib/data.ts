import "server-only";
import { publicClient } from "./supabase/public";
import type { Category, Product, ProductWithCategory, StoreSettings } from "./types";

// Public read queries. They use the anonymous client, so RLS only returns visible products.
// On failure they log and return empty/default data so pages still render.

export const DEFAULT_SETTINGS: StoreSettings = {
  name: "Walkem Farm Market",
  tagline: "Bringing Africa's Flavours Closer to You",
  whatsapp_number: null,
  phone: null,
  email: null,
  address_line: null,
  city: "Moncton",
  province: "NB",
  postal_code: null,
  country: "CA",
  latitude: null,
  longitude: null,
  hours: [],
  hero_title: "Authentic African Groceries in Moncton",
  hero_subtitle: "Your Home for Authentic African & Caribbean Foods",
  about_text: null,
};

const PRODUCT_SELECT = "*, category:categories(name, slug)";

const toProduct = (row: ProductWithCategory): ProductWithCategory => ({ ...row, price: Number(row.price) });

export async function getSettings(): Promise<StoreSettings> {
  const { data, error } = await publicClient().from("store_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) {
    if (error) console.error("getSettings", error.message);
    return DEFAULT_SETTINGS;
  }
  return { ...DEFAULT_SETTINGS, ...data, hours: Array.isArray(data.hours) ? data.hours : [] };
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await publicClient().from("categories").select("id, name, slug, sort_order").order("sort_order");
  if (error) console.error("getCategories", error.message);
  return data ?? [];
}

export type ProductQuery = {
  categorySlug?: string;
  q?: string;
  inStockOnly?: boolean;
  fresh?: boolean;
  featured?: boolean;
  limit?: number;
};

export async function getProducts(opts: ProductQuery = {}): Promise<ProductWithCategory[]> {
  let query = publicClient()
    .from("products")
    .select(opts.categorySlug ? "*, category:categories!inner(name, slug)" : PRODUCT_SELECT)
    .eq("is_visible", true);

  if (opts.categorySlug) query = query.eq("category.slug", opts.categorySlug);
  if (opts.inStockOnly) query = query.eq("in_stock", true).eq("is_coming_soon", false).gt("quantity", 0);
  if (opts.fresh) query = query.eq("is_fresh", true);
  if (opts.featured) query = query.eq("is_featured", true);
  const term = opts.q?.replace(/[,()%*\\]/g, " ").trim();
  if (term) query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);

  query = query.order("in_stock", { ascending: false }).order("is_fresh", { ascending: false }).order("name");
  if (opts.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) {
    console.error("getProducts", error.message);
    return [];
  }
  return (data as unknown as ProductWithCategory[]).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  const { data, error } = await publicClient()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle();
  if (error) console.error("getProductBySlug", error.message);
  return data ? toProduct(data as unknown as ProductWithCategory) : null;
}

export type ProductStock = Pick<Product, "id" | "name" | "price" | "quantity" | "in_stock" | "is_visible" | "is_coming_soon">;

export async function getProductsByIds(ids: string[]): Promise<ProductStock[]> {
  if (!ids.length) return [];
  const { data, error } = await publicClient()
    .from("products")
    .select("id, name, price, quantity, in_stock, is_visible, is_coming_soon")
    .in("id", ids);
  if (error) {
    console.error("getProductsByIds", error.message);
    throw new Error("Could not check stock");
  }
  return (data ?? []).map((p) => ({ ...p, price: Number(p.price) }));
}
