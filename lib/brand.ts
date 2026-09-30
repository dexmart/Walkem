import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** The Walkem logo mark as a data URL, for images generated with next/og (they can't load /public paths). */
export async function logoMarkDataUrl(): Promise<string> {
  const png = await readFile(join(process.cwd(), "public/brand/walkem-mark-512.png"));
  return `data:image/png;base64,${png.toString("base64")}`;
}
