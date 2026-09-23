import type { ReactNode } from "react";
import type { ProductWithCategory } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, empty }: { products: ProductWithCategory[]; empty?: ReactNode }) {
  if (products.length === 0) {
    return <div className="rounded-xl bg-muted/50 px-6 py-12 text-center text-muted-foreground">{empty ?? "No products yet."}</div>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
