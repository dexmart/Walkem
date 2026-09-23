"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut, Package, Settings, ShoppingBag, Tags } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/settings", label: "Store settings", icon: Settings },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/products") : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <Link href="/admin" className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold">Walkem Admin</span>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden text-muted-foreground sm:inline">{email}</span>
          <form action={signOut}>
            <button type="submit" className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
              <span className="sr-only sm:hidden">Sign out</span>
            </button>
          </form>
        </div>
      </div>
      <nav className="container mx-auto flex gap-1 overflow-x-auto px-4 pb-2" aria-label="Admin">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active(href) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          View site <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </nav>
    </header>
  );
}
