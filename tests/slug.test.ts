import { it, expect } from "vitest";
import { slugify } from "@/lib/slug";

it("slugifies", () => {
  expect(slugify("Egusi Seeds (Ground)")).toBe("egusi-seeds-ground");
  expect(slugify("  Plantains & Bananas ")).toBe("plantains-bananas");
  expect(slugify("Crème Fraîche")).toBe("creme-fraiche");
});
