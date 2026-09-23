import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CategoryChips } from "@/components/site/CategoryChips";
import { ProductGrid } from "@/components/site/ProductGrid";
import { ShopFilters } from "@/components/site/ShopFilters";
import { JsonLd } from "@/components/site/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Shop African Groceries in Moncton",
  description:
    "Browse yam, plantain, palm oil, egusi, spices, flours and more at Walkem Farm Market in Moncton, NB. Add to cart and order on WhatsApp.",
  alternates: { canonical: "/shop" },
};

type Props = { searchParams: Promise<{ q?: string; stock?: string; fresh?: string }> };

export default async function ShopPage({ searchParams }: Props) {
  const { q, stock, fresh } = await searchParams;
  const [settings, categories, products] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts({ q, inStockOnly: stock === "1", fresh: fresh === "1" }),
  ]);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
  ];
  const ask = settings.whatsapp_number
    ? buildWhatsAppUrl(settings.whatsapp_number, `Hi ${settings.name}! Do you have ${q ?? "something I'm looking for"}?`)
    : null;

  return (
    <div className="container mx-auto px-4 pb-20 pt-28">
      <JsonLd data={[breadcrumbJsonLd(crumbs), itemListJsonLd("All products", products)]} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mb-3 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">Shop African Groceries</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Add what you need to your cart, then send the list to us on WhatsApp. We&apos;ll confirm prices and pickup or delivery.
      </p>
      <div className="mb-6">
        <Suspense>
          <ShopFilters />
        </Suspense>
      </div>
      <div className="mb-8">
        <CategoryChips categories={categories} />
      </div>
      {q && (
        <p className="mb-4 text-sm text-muted-foreground">
          {products.length} result{products.length === 1 ? "" : "s"} for “{q}”
        </p>
      )}
      <ProductGrid
        products={products}
        empty={
          <>
            <p className="mb-2">No products match your search.</p>
            {ask && (
              <a href={ask} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                Ask us on WhatsApp — we may have it in store.
              </a>
            )}
          </>
        }
      />
    </div>
  );
}
