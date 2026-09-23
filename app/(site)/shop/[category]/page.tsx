import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CategoryChips } from "@/components/site/CategoryChips";
import { ProductGrid } from "@/components/site/ProductGrid";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 3600;

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }));
}

async function findCategory(slug: string) {
  const categories = await getCategories();
  return { categories, category: categories.find((c) => c.slug === slug) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await findCategory((await params).category);
  if (!category) return {};
  return {
    title: `${category.name} – African Groceries in Moncton`,
    description: `Shop ${category.name.toLowerCase()} at Walkem Farm Market in Moncton, NB. Authentic African & Caribbean groceries — order on WhatsApp.`,
    alternates: { canonical: `/shop/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categories, category } = await findCategory((await params).category);
  if (!category) notFound();
  const products = await getProducts({ categorySlug: category.slug });

  return (
    <div className="container mx-auto px-4 pb-20 pt-28">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: category.name, path: `/shop/${category.slug}` },
        ]}
      />
      <h1 className="mb-3 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">{category.name}</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Authentic {category.name.toLowerCase()} available at Walkem Farm Market in Moncton.{" "}
        <Link href="/shop" className="text-primary hover:underline">
          Search all products
        </Link>
      </p>
      <div className="mb-8">
        <CategoryChips categories={categories} active={category.slug} />
      </div>
      <ProductGrid products={products} empty="Nothing in this category right now — check back soon or message us on WhatsApp." />
    </div>
  );
}
