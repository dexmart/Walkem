import { it, expect } from "vitest";
import { storagePathFromUrl } from "@/lib/images";

it("extracts storage path from a public URL", () => {
  expect(storagePathFromUrl("https://x.supabase.co/storage/v1/object/public/product-images/a/b.webp")).toBe("a/b.webp");
  expect(storagePathFromUrl("/seed/x.jpg")).toBeNull();
});

import { squareCrop } from "@/lib/images";

it("centre-crops portrait photos to a square", () => {
  expect(squareCrop(3000, 4000, 1200)).toEqual({ sx: 0, sy: 500, side: 3000, size: 1200 });
});

it("centre-crops landscape photos to a square", () => {
  expect(squareCrop(800, 600, 1200)).toEqual({ sx: 100, sy: 0, side: 600, size: 600 });
});

it("never upscales small photos", () => {
  expect(squareCrop(500, 500, 1200)).toEqual({ sx: 0, sy: 0, side: 500, size: 500 });
});
