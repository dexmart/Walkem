import { getCategories, getProducts, getSettings } from "@/lib/data";
import { buildLlmsTxt } from "@/lib/seo";

export const revalidate = 3600;

export async function GET() {
  const [settings, categories, products] = await Promise.all([getSettings(), getCategories(), getProducts()]);
  return new Response(buildLlmsTxt(settings, categories, products), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
