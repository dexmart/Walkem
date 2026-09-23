import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/supabase/server";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase.from("categories").select("id, name, slug, sort_order").order("sort_order");
  return (
    <div>
      <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary">
        ← All products
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold">Add product</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
