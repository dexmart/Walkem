export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

export const absoluteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

export const FALLBACK_IMAGE = "/seed/product-spices.jpg";

export const coverImage = (images: string[] | null | undefined) => images?.[0] ?? FALLBACK_IMAGE;
