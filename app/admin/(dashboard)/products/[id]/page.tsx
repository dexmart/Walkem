import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name, slug, sort_order").order("sort_order"),
  ]);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary">
        ← All products
      </Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Edit {product.name}</h1>
        {product.is_visible && (
          <a
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View on site <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <ProductForm product={{ ...(product as Product), price: Number(product.price) }} categories={categories ?? []} />
    </div>
  );
}
