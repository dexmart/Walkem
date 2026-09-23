export const BUCKET = "product-images";

/** Every uploaded product photo is stored as a square of (at most) this many pixels. */
export const PRODUCT_IMAGE_SIZE = 1200;

const marker = `/storage/v1/object/public/${BUCKET}/`;

/** Storage object path for an uploaded image URL, or null for other images (e.g. the /seed photos). */
export function storagePathFromUrl(url: string): string | null {
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

/** Largest centred square in a width × height photo, and the output size (never upscaled). */
export function squareCrop(width: number, height: number, target = PRODUCT_IMAGE_SIZE) {
  const side = Math.min(width, height);
  return {
    sx: Math.round((width - side) / 2),
    sy: Math.round((height - side) / 2),
    side,
    size: Math.min(side, target),
  };
}

/**
 * Browser only: centre-crop a photo to a square, shrink it to PRODUCT_IMAGE_SIZE and re-encode as WebP,
 * so every product photo has the same shape and phone photos upload fast.
 */
export async function toSquareWebp(file: File, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const { sx, sy, side, size } = squareCrop(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!blob) throw new Error("Could not process image");
  return blob;
}
