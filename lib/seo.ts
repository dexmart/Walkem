import { isPurchasable } from "./availability";
import { formatPrice, groupHours } from "./format";
import { SITE_URL, absoluteUrl, coverImage } from "./site";
import type { Category, ProductWithCategory, StoreSettings } from "./types";

// Structured data (schema.org JSON-LD) and the llms.txt summary.
// Search engines and AI assistants read these to understand what the store sells and where it is.

export const SITE_DESCRIPTION =
  "Shop authentic African & Caribbean groceries in Moncton, NB — yam, plantain, palm oil, egusi, spices, flours and more. Browse online, add to cart and order on WhatsApp.";

const STORE_ID = `${SITE_URL}/#store`;

function compact<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== "")) as T;
}

export function storeJsonLd(s: StoreSettings) {
  return compact({
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    "@id": STORE_ID,
    name: s.name,
    description: SITE_DESCRIPTION,
    slogan: s.tagline,
    url: SITE_URL,
    logo: absoluteUrl("/icon"),
    image: absoluteUrl("/opengraph-image"),
    telephone: s.phone ?? (s.whatsapp_number ? `+${s.whatsapp_number}` : null),
    email: s.email,
    priceRange: "$",
    currenciesAccepted: "CAD",
    servesCuisine: "African, Nigerian, Caribbean",
    areaServed: { "@type": "City", name: `${s.city}, ${s.province}` },
    address: compact({
      "@type": "PostalAddress",
      streetAddress: s.address_line,
      addressLocality: s.city,
      addressRegion: s.province,
      postalCode: s.postal_code,
      addressCountry: s.country,
    }),
    geo: s.latitude != null && s.longitude != null ? { "@type": "GeoCoordinates", latitude: s.latitude, longitude: s.longitude } : null,
    hasMap:
      s.latitude != null && s.longitude != null ? `https://maps.google.com/?q=${s.latitude},${s.longitude}` : null,
    openingHoursSpecification: s.hours
      .filter((h) => !h.closed)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${h.day}`,
        opens: h.open,
        closes: h.close,
      })),
    potentialAction: s.whatsapp_number
      ? { "@type": "OrderAction", target: `https://wa.me/${s.whatsapp_number}`, name: "Order on WhatsApp" }
      : null,
  });
}

export function websiteJsonLd(s: StoreSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: s.name,
    url: SITE_URL,
    inLanguage: "en-CA",
    publisher: { "@id": STORE_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/shop?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(p: ProductWithCategory, s: StoreSettings) {
  const url = absoluteUrl(`/products/${p.slug}`);
  return compact({
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.name,
    description: p.description ?? `${p.name}, sold ${p.unit} at ${s.name} in ${s.city}, ${s.province}.`,
    image: (p.images.length ? p.images : [coverImage(p.images)]).map(absoluteUrl),
    sku: p.slug,
    category: p.category?.name,
    brand: { "@type": "Brand", name: s.name },
    url,
    offers: {
      "@type": "Offer",
      url,
      price: p.price.toFixed(2),
      priceCurrency: "CAD",
      availability: isPurchasable(p) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": STORE_ID },
      areaServed: { "@type": "City", name: `${s.city}, ${s.province}` },
    },
  });
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

export function itemListJsonLd(name: string, products: ProductWithCategory[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/products/${p.slug}`),
      name: p.name,
    })),
  };
}

/** Plain-text store summary for AI assistants (https://llmstxt.org). */
export function buildLlmsTxt(s: StoreSettings, categories: Category[], products: ProductWithCategory[]): string {
  const location = [s.address_line, `${s.city}, ${s.province}${s.postal_code ? ` ${s.postal_code}` : ""}`, "Canada"]
    .filter(Boolean)
    .join(", ");
  const lines = [
    `# ${s.name}`,
    "",
    `> ${s.name} is an African and Caribbean grocery store in ${s.city}, New Brunswick, Canada. It sells authentic African foods such as yam, plantain, palm oil, egusi, spices and flours, plus Nigerian dishes from its restaurant and bar.`,
    "",
    "## Store details",
    "",
    `- Location: ${location}`,
  ];
  if (s.phone) lines.push(`- Phone: ${s.phone}`);
  if (s.whatsapp_number) lines.push(`- WhatsApp: +${s.whatsapp_number} (https://wa.me/${s.whatsapp_number})`);
  if (s.email) lines.push(`- Email: ${s.email}`);
  const hours = groupHours(s.hours);
  if (hours.length) lines.push(`- Opening hours: ${hours.map((h) => `${h.label} ${h.value}`).join("; ")}`);
  lines.push(
    `- Website: ${SITE_URL}`,
    "",
    "## How to order",
    "",
    "Customers browse products on the website, add them to a cart and tap “Order now”. This opens WhatsApp with the order list already written; the store confirms the final price and arranges pickup or local delivery in the chat. No payment is taken on the website. Prices are in Canadian dollars (CAD).",
    "",
    "## Categories",
    "",
    ...categories.map((c) => `- [${c.name}](${absoluteUrl(`/shop/${c.slug}`)})`),
    "",
    "## Products",
    "",
    ...products.map(
      (p) =>
        `- [${p.name}](${absoluteUrl(`/products/${p.slug}`)}): ${formatPrice(p.price)} ${p.unit} — ${p.is_coming_soon ? "Coming soon" : isPurchasable(p) ? "In stock" : "Sold out"}${p.description ? `. ${p.description}` : ""}`,
    ),
    "",
    "## Pages",
    "",
    `- [Shop all products](${absoluteUrl("/shop")})`,
    `- [Store hours and location](${absoluteUrl("/#store-info")})`,
    `- [Contact](${absoluteUrl("/#contact")})`,
    "",
  );
  return lines.join("\n");
}
