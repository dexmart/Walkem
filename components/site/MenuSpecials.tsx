import Link from "next/link";
import type { ProductWithCategory } from "@/lib/types";
import { ProductGrid } from "./ProductGrid";

/** Restaurant & Bar dishes: regular products in the "restaurant-bar" category, so they go through the cart. */
export default function MenuSpecials({ products }: { products: ProductWithCategory[] }) {
  if (products.length === 0) return null;
  return (
    <section id="restaurant" className="bg-background py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center animate-fade-in-up md:mb-16">
          <h2 className="mb-6 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">Restaurant &amp; Bar</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Experience authentic Nigerian cuisine and enjoy refreshing drinks at our bar
          </p>
        </div>
        <ProductGrid products={products} />
        <p className="mt-10 text-center">
          <Link href="/shop/restaurant-bar" className="font-medium text-primary hover:underline">
            See the full menu →
          </Link>
        </p>
      </div>
    </section>
  );
}
