// Set NEXT_PUBLIC_SITE_URL to the real domain. On Vercel, fall back to the project's production URL
// so canonical links and the sitemap never point at localhost.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:8080")
).replace(/\/+$/, "");

export const absoluteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

export const FALLBACK_IMAGE = "/seed/product-spices.jpg";

export const coverImage = (images: string[] | null | undefined) => images?.[0] ?? FALLBACK_IMAGE;
