export const BUCKET = "product-images";

const marker = `/storage/v1/object/public/${BUCKET}/`;

/** Storage object path for an uploaded image URL, or null for other images (e.g. the /seed photos). */
export function storagePathFromUrl(url: string): string | null {
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

/** Browser only: shrink a photo to fit maxSize and re-encode as WebP, so phone photos upload fast. */
export async function resizeToWebp(file: File, maxSize = 1600, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!blob) throw new Error("Could not process image");
  return blob;
}
