import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Walkem African Food Market",
    short_name: "Walkem",
    description: "Authentic African & Caribbean groceries in Moncton, NB",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F5",
    theme_color: "#EE6A2B",
    icons: [
      { src: "/brand/walkem-mark-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/walkem-mark-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
