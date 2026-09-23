import { it, expect } from "vitest";
import { isPurchasable, maxQty } from "@/lib/availability";

it("availability rule", () => {
  expect(isPurchasable({ is_visible: true, in_stock: true, quantity: 2 })).toBe(true);
  expect(isPurchasable({ is_visible: true, in_stock: true, quantity: 0 })).toBe(false);
  expect(isPurchasable({ is_visible: true, in_stock: false, quantity: 5 })).toBe(false);
  expect(isPurchasable({ is_visible: false, in_stock: true, quantity: 5 })).toBe(false);
  expect(maxQty({ is_visible: true, in_stock: true, quantity: 7 })).toBe(7);
  expect(maxQty({ is_visible: true, in_stock: false, quantity: 7 })).toBe(0);
});
