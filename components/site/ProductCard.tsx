import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AddToCart } from "@/components/cart/AddToCart";
import { isPurchasable } from "@/lib/availability";
import { formatPrice } from "@/lib/format";
import { coverImage } from "@/lib/site";
import type { ProductWithCategory } from "@/lib/types";

export function ProductCard({ product, priority = false }: { product: ProductWithCategory; priority?: boolean }) {
  const available = isPurchasable(product);
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-card shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
        <Image
          src={coverImage(product.images)}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${available || product.is_coming_soon ? "" : "opacity-60 grayscale"}`}
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.is_fresh && available && <Badge className="bg-secondary text-secondary-foreground">Fresh</Badge>}
          {product.is_coming_soon ? (
            <Badge className="bg-accent text-accent-foreground">Coming soon</Badge>
          ) : (
            !available && <Badge variant="secondary" className="bg-foreground/80 text-background">Sold out</Badge>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="mb-1 text-sm font-semibold leading-snug text-foreground sm:text-base">
          <Link href={`/products/${product.slug}`} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        {product.description && (
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground sm:text-sm">{product.description}</p>
        )}
        <div className="mb-3 mt-auto flex flex-wrap items-baseline gap-x-1">
          <span className="text-lg font-bold text-primary sm:text-2xl">{formatPrice(product.price)}</span>
          <span className="text-xs text-muted-foreground sm:text-sm">{product.unit}</span>
        </div>
        <AddToCart product={product} compact />
      </div>
    </article>
  );
}
