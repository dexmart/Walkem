"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartButton } from "@/components/cart/CartButton";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/#about" },
  { name: "Store Info", href: "/#store-info" },
  { name: "Contact", href: "/#contact" },
];

export default function Navigation({ storeName }: { storeName: string }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        // Frosted-glass bar that always floats above the page.
        "fixed inset-x-0 top-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl backdrop-saturate-150 transition-shadow duration-300 supports-[backdrop-filter]:bg-white/50",
        isScrolled || isMobileMenuOpen ? "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)]" : "shadow-none",
      )}
    >
      <nav className="container mx-auto px-4 py-3" aria-label="Main">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" aria-label={`${storeName} home`} className="flex min-w-0 shrink items-center" onClick={() => setIsMobileMenuOpen(false)}>
            <BrandLogo name={storeName} />
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-foreground",
                )}
              >
                {link.name}
              </Link>
            ))}
            <Button asChild>
              <Link href="/shop">Shop Now</Link>
            </Button>
            <CartButton />
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <CartButton />
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center text-foreground"
              onClick={() => setIsMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="mt-3 space-y-1 pb-3 animate-fade-in-up md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-lg px-2 py-3 font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
            <Button asChild className="mt-2 w-full">
              <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)}>
                Shop Now
              </Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
