import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Walkem Farm Market",
    short_name: "Walkem",
    description: "Authentic African & Caribbean groceries in Moncton, NB",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F5",
    theme_color: "#EE6A2B",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
