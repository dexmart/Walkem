import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={c.path} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-4 w-4" aria-hidden />}
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-foreground">
                {c.name}
              </span>
            ) : (
              <Link href={c.path} className="hover:text-primary">
                {c.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
