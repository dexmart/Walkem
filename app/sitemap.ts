import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const latest = products.reduce((max, p) => (p.updated_at > max ? p.updated_at : max), new Date(0).toISOString());
  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/shop"), lastModified: latest, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({
      url: absoluteUrl(`/shop/${c.slug}`),
      lastModified: latest,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/products/${p.slug}`),
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: p.images.map(absoluteUrl),
    })),
  ];
}
