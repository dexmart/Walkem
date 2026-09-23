import { describe, it, expect } from "vitest";
import { buildOrderMessage, buildWhatsAppUrl, normalizePhone, buildContactMessage } from "@/lib/whatsapp";
import type { CartItem } from "@/lib/types";

const yam: CartItem = { productId: "1", slug: "premium-yam", name: "Premium Yam", price: 5.49, unit: "per lb", image: null, qty: 3, maxQty: 10 };
const oil: CartItem = { productId: "2", slug: "red-palm-oil", name: "Red Palm Oil", price: 12.99, unit: "per bottle", image: null, qty: 1, maxQty: 4 };

describe("buildOrderMessage", () => {
  it("lists items, line totals and estimated total", () => {
    const msg = buildOrderMessage([yam, oil], "Walkem Farm Market");
    expect(msg).toBe(
      [
        "Hi Walkem Farm Market! I'd like to order:",
        "• Premium Yam × 3 (per lb) — $16.47",
        "• Red Palm Oil × 1 (per bottle) — $12.99",
        "",
        "Estimated total: $29.46 CAD",
      ].join("\n"),
    );
  });

  it("appends customer details only when given", () => {
    const msg = buildOrderMessage([oil], "Walkem Farm Market", { name: "Ada", fulfilment: "Delivery", notes: "After 5pm" });
    expect(msg.endsWith("Name: Ada\nPickup / Delivery: Delivery\nNotes: After 5pm")).toBe(true);
  });
});

describe("buildWhatsAppUrl", () => {
  it("uses digits only and encodes text", () => {
    expect(buildWhatsAppUrl("+1 (506) 555-0123", "Hi & bye")).toBe("https://wa.me/15065550123?text=Hi%20%26%20bye");
  });
});

it("normalizePhone strips non-digits", () => expect(normalizePhone("+1 506-555")).toBe("1506555"));

it("buildContactMessage includes provided fields", () => {
  expect(buildContactMessage({ name: "Ada", phone: "506", message: "Do you stock ogiri?" })).toBe(
    "Hi Walkem Farm Market! Message from the website:\n\nDo you stock ogiri?\n\nName: Ada\nPhone: 506",
  );
});
