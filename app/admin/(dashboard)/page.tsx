import { ProductTable } from "@/components/admin/ProductTable";
import { requireAdmin } from "@/lib/supabase/server";
import type { Category, ProductWithCategory } from "@/lib/types";

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: products, error }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*, category:categories(name, slug)").order("updated_at", { ascending: false }),
    supabase.from("categories").select("id, name, slug, sort_order").order("sort_order"),
  ]);
  if (error) throw new Error(error.message);

  return (
    <ProductTable
      products={(products as ProductWithCategory[]).map((p) => ({ ...p, price: Number(p.price) }))}
      categories={(categories ?? []) as Category[]}
    />
  );
}
