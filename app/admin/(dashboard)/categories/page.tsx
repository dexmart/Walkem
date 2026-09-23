import { CategoryManager } from "@/components/admin/CategoryManager";
import { requireAdmin } from "@/lib/supabase/server";

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order, products(count)")
    .order("sort_order");
  if (error) throw new Error(error.message);

  const categories = data.map(({ products, ...c }) => ({
    ...c,
    product_count: (products as unknown as { count: number }[])[0]?.count ?? 0,
  }));
  return <CategoryManager categories={categories} />;
}
