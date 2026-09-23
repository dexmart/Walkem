import { it, expect } from "vitest";
import { isPurchasable, maxQty } from "@/lib/availability";

const p = (o: Partial<{ is_visible: boolean; in_stock: boolean; quantity: number; is_coming_soon: boolean }> = {}) => ({
  is_visible: true,
  in_stock: true,
  quantity: 5,
  is_coming_soon: false,
  ...o,
});

it("availability rule", () => {
  expect(isPurchasable(p({ quantity: 2 }))).toBe(true);
  expect(isPurchasable(p({ quantity: 0 }))).toBe(false);
  expect(isPurchasable(p({ in_stock: false }))).toBe(false);
  expect(isPurchasable(p({ is_visible: false }))).toBe(false);
  expect(maxQty(p({ quantity: 7 }))).toBe(7);
  expect(maxQty(p({ in_stock: false, quantity: 7 }))).toBe(0);
});

it("coming-soon products can't be ordered", () => {
  expect(isPurchasable(p({ is_coming_soon: true }))).toBe(false);
  expect(maxQty(p({ is_coming_soon: true }))).toBe(0);
});
