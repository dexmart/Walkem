import { it, expect } from "vitest";
import { storagePathFromUrl } from "@/lib/images";

it("extracts storage path from a public URL", () => {
  expect(storagePathFromUrl("https://x.supabase.co/storage/v1/object/public/product-images/a/b.webp")).toBe("a/b.webp");
  expect(storagePathFromUrl("/seed/x.jpg")).toBeNull();
});
