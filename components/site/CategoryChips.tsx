import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function CategoryChips({ categories, active, query = "" }: { categories: Category[]; active?: string; query?: string }) {
  const chip = (isActive: boolean) =>
    cn(
      "whitespace-nowrap rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors",
      isActive ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-background hover:border-primary",
    );
  return (
    <nav aria-label="Categories" className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <ul className="flex gap-2 sm:flex-wrap sm:justify-center">
        <li>
          <Link href={`/shop${query}`} className={chip(!active)}>
            All Products
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/shop/${c.slug}${query}`} className={chip(active === c.slug)}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
