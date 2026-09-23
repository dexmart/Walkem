import { describe, it, expect } from "vitest";
import { productSchema, settingsSchema, categorySchema } from "@/lib/schemas";

const product = {
  name: "Egusi Seeds",
  slug: "egusi-seeds",
  description: "Ground melon seeds",
  price: "5.5",
  unit: "per pack",
  category_id: null,
  images: ["/seed/product-spices.jpg"],
  quantity: "3",
  in_stock: true,
  is_fresh: false,
  is_featured: false,
  is_visible: true,
};

describe("productSchema", () => {
  it("coerces numbers", () => {
    const p = productSchema.parse(product);
    expect(p.price).toBe(5.5);
    expect(p.quantity).toBe(3);
  });
  it("rejects negative price and bad slug", () => {
    expect(productSchema.safeParse({ ...product, price: "-1" }).success).toBe(false);
    expect(productSchema.safeParse({ ...product, slug: "Egusi Seeds" }).success).toBe(false);
  });
  it("rounds price to cents", () => {
    expect(productSchema.parse({ ...product, price: "2.999" }).price).toBe(3);
  });
});

describe("settingsSchema", () => {
  const base = { name: "Walkem Farm Market", city: "Moncton", province: "NB", hours: [] };
  it("normalises WhatsApp number to digits", () => {
    expect(settingsSchema.parse({ ...base, whatsapp_number: "+1 (506) 555-0123" }).whatsapp_number).toBe("15065550123");
  });
  it("rejects too-short WhatsApp numbers and allows empty", () => {
    expect(settingsSchema.safeParse({ ...base, whatsapp_number: "12" }).success).toBe(false);
    expect(settingsSchema.parse({ ...base, whatsapp_number: "" }).whatsapp_number).toBeNull();
  });
  it("turns blank optional text into null and parses coordinates", () => {
    const s = settingsSchema.parse({ ...base, email: " ", latitude: "46.0878", longitude: "" });
    expect(s.email).toBeNull();
    expect(s.latitude).toBeCloseTo(46.0878);
    expect(s.longitude).toBeNull();
  });
});

it("categorySchema requires a name", () => {
  expect(categorySchema.safeParse({ name: " ", slug: "x" }).success).toBe(false);
});
