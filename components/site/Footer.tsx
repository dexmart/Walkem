import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Category, StoreSettings } from "@/lib/types";

export default function Footer({ settings: s, categories }: { settings: StoreSettings; categories: Category[] }) {
  const year = new Date().getFullYear();
  const cityLine = [s.city, s.province].filter(Boolean).join(", ") + (s.postal_code ? ` ${s.postal_code}` : "");

  return (
    <footer className="bg-foreground py-12 text-background">
      <div className="container mx-auto px-4">
        <div className="mb-8 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span className="font-display text-2xl font-bold">{s.name}</span>
            </div>
            <p className="mb-4 max-w-md text-background/80">
              Your trusted source for authentic African &amp; Caribbean groceries and fresh produce in {s.city}, New
              Brunswick.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-background/80 transition-colors hover:text-primary">
                  All products
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/shop/${c.slug}`} className="text-background/80 transition-colors hover:text-primary">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-2 text-background/80">
              {s.address_line && <li>{s.address_line}</li>}
              <li>{cityLine}</li>
              {s.phone && (
                <li className="pt-2">
                  <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="hover:text-primary">
                    {s.phone}
                  </a>
                </li>
              )}
              {s.whatsapp_number && (
                <li>
                  <a href={`https://wa.me/${s.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    WhatsApp us
                  </a>
                </li>
              )}
              {s.email && (
                <li className="break-words">
                  <a href={`mailto:${s.email}`} className="hover:text-primary">
                    {s.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-background/20 pt-8 text-center text-sm text-background/70 sm:flex-row">
          <p>
            &copy; {year} {s.name}. All rights reserved.
          </p>
          <p>
            Developed by{" "}
            <a
              href="https://techtomister.ca"
              target="_blank"
              rel="noopener"
              className="font-medium text-background/90 underline-offset-4 hover:text-primary hover:underline"
            >
              techtomister.ca
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
