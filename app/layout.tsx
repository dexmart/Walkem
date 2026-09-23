import type { Metadata, Viewport } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/site";
import { SITE_DESCRIPTION } from "@/lib/seo";
import "./globals.css";

const sans = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const display = Playfair_Display({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-display", display: "swap" });

const TITLE = "Walkem Farm Market – Authentic African Groceries in Moncton";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | Walkem Farm Market" },
  description: SITE_DESCRIPTION,
  applicationName: "Walkem Farm Market",
  keywords: [
    "African grocery Moncton",
    "African store Moncton",
    "Nigerian food Moncton",
    "Caribbean grocery New Brunswick",
    "yam",
    "plantain",
    "palm oil",
    "egusi",
    "African spices",
    "Walkem Farm Market",
  ],
  authors: [{ name: "Walkem Farm Market" }],
  alternates: { canonical: "/", types: { "text/plain": "/llms.txt" } },
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "Walkem Farm Market",
    title: TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: false },
  other: { "geo.region": "CA-NB", "geo.placename": "Moncton" },
};

export const viewport: Viewport = { themeColor: "#EE6A2B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
