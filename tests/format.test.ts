import { it, expect } from "vitest";
import { formatPrice } from "@/lib/format";

it("formats CAD", () => {
  expect(formatPrice(12.9)).toBe("$12.90");
  expect(formatPrice(1234.5)).toBe("$1,234.50");
});
