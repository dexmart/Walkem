import { describe, it, expect } from "vitest";
import { cartReducer, cartTotal, cartCount, syncChanges } from "@/lib/cart";

const base = { productId: "1", slug: "yam", name: "Yam", price: 5.5, unit: "per lb", image: null, maxQty: 3 };

describe("cartReducer", () => {
  it("adds and merges, capped at maxQty", () => {
    let s = cartReducer({ items: [] }, { type: "add", item: base, qty: 2 });
    s = cartReducer(s, { type: "add", item: base, qty: 5 });
    expect(s.items).toHaveLength(1);
    expect(s.items[0].qty).toBe(3);
  });
  it("ignores add when maxQty is 0", () => {
    expect(cartReducer({ items: [] }, { type: "add", item: { ...base, maxQty: 0 }, qty: 1 }).items).toHaveLength(0);
  });
  it("setQty clamps and removes at 0", () => {
    const s = cartReducer({ items: [] }, { type: "add", item: base, qty: 1 });
    expect(cartReducer(s, { type: "setQty", productId: "1", qty: 9 }).items[0].qty).toBe(3);
    expect(cartReducer(s, { type: "setQty", productId: "1", qty: 0 }).items).toHaveLength(0);
  });
  it("sync removes unavailable, updates price and caps qty", () => {
    const s = { items: [{ ...base, qty: 3 }, { ...base, productId: "2", name: "Oil", qty: 1 }] };
    const out = cartReducer(s, {
      type: "sync",
      products: [{ id: "1", name: "Yam", price: 6, quantity: 2, in_stock: true, is_visible: true }],
    });
    expect(out.items).toEqual([{ ...base, price: 6, qty: 2, maxQty: 2 }]);
    expect(syncChanges(s.items, out.items)).toEqual([
      "Yam price changed to $6.00",
      "Yam quantity reduced to 2 (only 2 left)",
      "Oil is no longer available and was removed",
    ]);
  });
  it("totals", () => {
    const items = [{ ...base, qty: 2 }, { ...base, productId: "2", price: 1.25, qty: 4 }];
    expect(cartTotal(items)).toBe(16);
    expect(cartCount(items)).toBe(6);
  });
});
