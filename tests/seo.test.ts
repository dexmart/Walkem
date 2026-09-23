import { describe, it, expect } from "vitest";
import { breadcrumbJsonLd, buildLlmsTxt, productJsonLd, storeJsonLd } from "@/lib/seo";
import type { Category, ProductWithCategory, StoreSettings } from "@/lib/types";

const settings: StoreSettings = {
  name: "Walkem Farm Market",
  tagline: "Bringing Africa's Flavours Closer to You",
  whatsapp_number: null,
  phone: null,
  email: "hello@example.com",
  address_line: null,
  city: "Moncton",
  province: "NB",
  postal_code: null,
  country: "CA",
  latitude: 46.09,
  longitude: -64.78,
  hours: [
    { day: "Monday", open: "09:00", close: "20:00", closed: false },
    { day: "Sunday", open: "", close: "", closed: true },
  ],
  hero_title: null,
  hero_subtitle: null,
  about_text: null,
};

const yam: ProductWithCategory = {
  id: "1",
  name: "Premium Yam",
  slug: "premium-yam",
  description: "Fresh white yam",
  price: 5.49,
  unit: "per lb",
  category_id: "c1",
  images: ["/seed/product-yam.jpg"],
  quantity: 0,
  in_stock: false,
  is_fresh: true,
  is_featured: true,
  is_visible: true,
  created_at: "2026-09-22T00:00:00Z",
  updated_at: "2026-09-22T00:00:00Z",
  category: { name: "Root Vegetables", slug: "root-vegetables" },
};

describe("productJsonLd", () => {
  it("describes a sold-out product offer in CAD with absolute image URLs", () => {
    const ld = productJsonLd(yam, settings) as Record<string, any>;
    expect(ld["@type"]).toBe("Product");
    expect(ld.offers.availability).toBe("https://schema.org/OutOfStock");
    expect(ld.offers.priceCurrency).toBe("CAD");
    expect(ld.offers.price).toBe("5.49");
    expect(ld.image[0]).toMatch(/^https?:\/\/.+\/seed\/product-yam\.jpg$/);
    expect(ld.category).toBe("Root Vegetables");
  });
});

describe("storeJsonLd", () => {
  it("omits unknown contact fields and lists only open days", () => {
    const ld = storeJsonLd(settings) as Record<string, any>;
    expect(ld["@type"]).toBe("GroceryStore");
    expect(ld.telephone).toBeUndefined();
    expect(ld.address.streetAddress).toBeUndefined();
    expect(ld.address.addressLocality).toBe("Moncton");
    expect(ld.openingHoursSpecification).toEqual([
      { "@type": "OpeningHoursSpecification", dayOfWeek: "https://schema.org/Monday", opens: "09:00", closes: "20:00" },
    ]);
    expect(ld.geo).toEqual({ "@type": "GeoCoordinates", latitude: 46.09, longitude: -64.78 });
  });
});

it("breadcrumbJsonLd numbers items with absolute URLs", () => {
  const ld = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
  ]) as Record<string, any>;
  expect(ld.itemListElement[1]).toMatchObject({ position: 2, name: "Shop" });
  expect(ld.itemListElement[1].item).toMatch(/\/shop$/);
});

it("buildLlmsTxt summarises the store and lists products", () => {
  const cats: Category[] = [{ id: "c1", name: "Root Vegetables", slug: "root-vegetables", sort_order: 1 }];
  const txt = buildLlmsTxt(settings, cats, [yam]);
  expect(txt.startsWith("# Walkem Farm Market")).toBe(true);
  expect(txt).toContain("Moncton");
  expect(txt).toContain("WhatsApp");
  expect(txt).toMatch(/- \[Premium Yam\]\(https?:\/\/[^)]+\/products\/premium-yam\): \$5\.49 per lb — Sold out/);
});
