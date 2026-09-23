import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToCart } from "@/components/cart/AddToCart";
import { Breadcrumbs, type Crumb } from "@/components/site/Breadcrumbs";
import { ProductGallery } from "@/components/site/ProductGallery";
import { ProductGrid } from "@/components/site/ProductGrid";
import { isPurchasable } from "@/lib/availability";
import { getProductBySlug, getProducts, getSettings } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { absoluteUrl, coverImage } from "@/lib/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  const description =
    product.description?.trim() ||
    `Buy ${product.name} (${product.unit}) at Walkem Farm Market in Moncton — ${formatPrice(product.price)}.`;
  const image = absoluteUrl(coverImage(product.images));
  return {
    title: `${product.name} – ${formatPrice(product.price)} ${product.unit}`,
    description: `${description} Order on WhatsApp from Walkem Farm Market, Moncton NB.`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { type: "website", title: product.name, description, images: [{ url: image, alt: product.name }] },
    twitter: { card: "summary_large_image", title: product.name, description, images: [image] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product) notFound();

  const available = isPurchasable(product);
  const related = product.category
    ? (await getProducts({ categorySlug: product.category.slug, limit: 5 })).filter((p) => p.id !== product.id).slice(0, 4)
    : [];
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    ...(product.category ? [{ name: product.category.name, path: `/shop/${product.category.slug}` }] : []),
    { name: product.name, path: `/products/${product.slug}` },
  ];
  const ask = settings.whatsapp_number
    ? buildWhatsAppUrl(
        settings.whatsapp_number,
        `Hi ${settings.name}! I have a question about ${product.name}: ${absoluteUrl(`/products/${product.slug}`)}`,
      )
    : null;

  return (
    <div className="container mx-auto px-4 pb-20 pt-28">
      <Breadcrumbs items={crumbs} />

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} name={product.name} soldOut={!available} />

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {product.category && <Badge variant="outline">{product.category.name}</Badge>}
            {product.is_fresh && available && <Badge className="bg-secondary text-secondary-foreground">Fresh this week</Badge>}
          </div>
          <h1 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl">{product.name}</h1>
          <p className="mb-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            <span className="text-muted-foreground">{product.unit}</span>
          </p>
          <p className={`mb-6 flex items-center gap-2 font-medium ${available ? "text-secondary" : "text-muted-foreground"}`}>
            {available ? (
              <>
                <CheckCircle2 className="h-5 w-5" /> In stock
                {product.quantity <= 10 && <span className="font-normal text-muted-foreground">— only {product.quantity} left</span>}
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" /> Sold out — ask us when it&apos;s back
              </>
            )}
          </p>
          {product.description && <p className="mb-8 whitespace-pre-line leading-relaxed text-foreground/90">{product.description}</p>}

          <AddToCart product={product} />

          {ask && (
            <a
              href={ask}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <MessageCircle className="h-4 w-4" /> Ask about this on WhatsApp
            </a>
          )}

          <p className="mt-8 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            Ordering works through WhatsApp: add items to your cart and send the list. We confirm the final price, pickup
            or delivery with you there — no payment is taken on this site.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">More {product.category?.name}</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
