import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import MenuSpecials from "@/components/site/MenuSpecials";
import StoreInfo from "@/components/site/StoreInfo";
import Contact from "@/components/site/Contact";
import { CategoryChips } from "@/components/site/CategoryChips";
import { ProductGrid } from "@/components/site/ProductGrid";
import { getCategories, getProducts, getSettings } from "@/lib/data";

export const revalidate = 3600;

export default async function HomePage() {
  const [settings, categories, fresh, featured] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts({ fresh: true, inStockOnly: true, limit: 4 }),
    getProducts({ featured: true, limit: 8 }),
  ]);

  return (
    <>
      <Hero settings={settings} />

      {fresh.length > 0 && (
        <section id="fresh" className="bg-secondary/5 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 flex items-center gap-2 font-semibold uppercase tracking-wide text-secondary">
                  <Leaf className="h-5 w-5" /> Just arrived
                </p>
                <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Fresh this week</h2>
              </div>
              <Link href="/shop?fresh=1" className="font-medium text-primary hover:underline">
                See all fresh items →
              </Link>
            </div>
            <ProductGrid products={fresh} />
          </div>
        </section>
      )}

      <section id="products" className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center animate-fade-in-up">
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">Our Products</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Browse our selection of authentic African groceries, from fresh produce to traditional spices
            </p>
          </div>
          <div className="mb-10">
            <CategoryChips categories={categories} />
          </div>
          <ProductGrid products={featured} />
          <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link href="/shop">
                View all products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <About aboutText={settings.about_text} />
      <MenuSpecials whatsappNumber={settings.whatsapp_number} />
      <StoreInfo settings={settings} />
      <Contact whatsappNumber={settings.whatsapp_number} email={settings.email} />
    </>
  );
}
