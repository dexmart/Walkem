import { describe, it, expect } from "vitest";
import { buildOrderMessage, buildWhatsAppUrl, normalizePhone, buildContactMessage, orderProblem } from "@/lib/whatsapp";
import type { CartItem, CustomerDetails } from "@/lib/types";

const yam: CartItem = { productId: "1", slug: "premium-yam", name: "Premium Yam", price: 5.49, unit: "per lb", image: null, qty: 3, maxQty: 10 };
const oil: CartItem = { productId: "2", slug: "red-palm-oil", name: "Red Palm Oil", price: 12.99, unit: "per bottle", image: null, qty: 1, maxQty: 4 };

const STORE = { name: "Walkem African Food Market", interacEmail: "walkemfoods@gmail.com" };
const ada: CustomerDetails = { name: "Ada Obi", phone: "(506) 555-0123", fulfilment: "Pickup", payment: "Later" };

describe("buildOrderMessage", () => {
  it("lays out customer, items, subtotal, fulfilment and payment", () => {
    expect(buildOrderMessage([yam, oil], STORE, ada)).toBe(
      [
        "🛒 *New order — Walkem African Food Market*",
        "",
        "*Customer*",
        "Name: Ada Obi",
        "Phone: (506) 555-0123",
        "",
        "*Items*",
        "1. Premium Yam — 3 × $5.49 (per lb) = $16.47",
        "2. Red Palm Oil — 1 × $12.99 (per bottle) = $12.99",
        "",
        "*Subtotal: $29.46 CAD* (4 items)",
        "",
        "*Pickup* at the store",
        "",
        "*Payment:* Pay on pickup",
      ].join("\n"),
    );
  });

  it("includes the delivery address and a delivery-fee note for delivery orders", () => {
    const msg = buildOrderMessage([oil], STORE, { ...ada, fulfilment: "Delivery", address: " 12 King St, Moncton ", payment: "Later" });
    expect(msg).toContain("*Delivery*\nAddress: 12 King St, Moncton\nDelivery fee (if any) to be confirmed.");
    expect(msg).toContain("*Payment:* Pay on delivery");
  });

  it("describes Interac payment and whether it was sent", () => {
    const sent = buildOrderMessage([oil], STORE, { ...ada, payment: "Interac", interacSent: true });
    expect(sent).toContain("*Payment:* Interac e-Transfer to walkemfoods@gmail.com — ✅ sent ($12.99)");
    const notYet = buildOrderMessage([oil], STORE, { ...ada, payment: "Interac", interacSent: false });
    expect(notYet).toContain("*Payment:* Interac e-Transfer to walkemfoods@gmail.com — ⏳ sending now ($12.99)");
  });

  it("adds notes last and omits empty ones", () => {
    expect(buildOrderMessage([oil], STORE, { ...ada, notes: "  After 5pm " }).endsWith("\n\n*Notes:* After 5pm")).toBe(true);
    expect(buildOrderMessage([oil], STORE, { ...ada, notes: "  " })).not.toContain("Notes");
  });
});

describe("orderProblem", () => {
  const ok: CustomerDetails = { fulfilment: "Pickup", name: "Ada", phone: "506 555 0123", payment: "Later" };
  it("accepts a complete pickup order", () => expect(orderProblem(ok)).toBeNull());
  it("asks for each missing field in order", () => {
    expect(orderProblem({ ...ok, fulfilment: undefined })).toBe("Choose pickup or delivery");
    expect(orderProblem({ ...ok, name: " " })).toBe("Add your name");
    expect(orderProblem({ ...ok, phone: "" })).toBe("Add your phone number");
    expect(orderProblem({ ...ok, phone: "555-01" })).toBe("Check your phone number");
    expect(orderProblem({ ...ok, fulfilment: "Delivery", address: "  " })).toBe("Add your delivery address");
    expect(orderProblem({ ...ok, payment: undefined })).toBe("Choose how you'll pay");
  });
  it("accepts delivery with an address", () => {
    expect(orderProblem({ ...ok, fulfilment: "Delivery", address: "12 King St" })).toBeNull();
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
    "Hi Walkem African Food Market! Message from the website:\n\nDo you stock ogiri?\n\nName: Ada\nPhone: 506",
  );
});
