# Walkem Farm Market E-commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Lovable Vite landing page with a Next.js + Supabase shop where admins manage products and customers order via WhatsApp, deployed from GitHub to Vercel.

**Architecture:** Next.js App Router in the project root (Vite removed). Public pages are statically generated and read Supabase with a cookie-less anon client; admin server actions write with the user's session and call `revalidatePath`. Supabase RLS (via `is_admin()`) is the security boundary. Cart lives in `localStorage` and is serialised into a `wa.me` link.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 3 + tailwindcss-animate, shadcn/ui (Radix), `@supabase/supabase-js` + `@supabase/ssr`, zod, react-hook-form, sonner, lucide-react, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-22-walkem-ecommerce-design.md`

## Global Constraints

- Nothing referencing Lovable may remain (`grep -ri lovable` over tracked files returns nothing).
- Currency is CAD; prices formatted `$12.99` via `formatPrice`.
- Purchasable ⇔ `is_visible && in_stock && quantity > 0` (`isPurchasable` in `lib/availability.ts` is the only implementation).
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`. No secret keys in the repo or on Vercel. The DB connection string is only used locally via the `SUPABASE_DB_URL` env var to push migrations.
- Next 16 conventions: request interception lives in `proxy.ts` (not `middleware.ts`); `params`/`searchParams` are Promises; `cookies()` is async.
- Public pages must not call `cookies()` (keeps them static); only `/admin/**` is dynamic.
- Mobile first; every page usable at 360 px width with no horizontal scroll.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Structure

```
app/
  layout.tsx                 root: fonts, metadata base, JSON-LD GroceryStore, CartProvider, Toaster
  globals.css                ported from src/index.css
  page.tsx                   homepage
  shop/page.tsx              all products + filters (searchParams)
  shop/[category]/page.tsx   category landing
  products/[slug]/page.tsx   product detail
  not-found.tsx
  icon.tsx, apple-icon.tsx, opengraph-image.tsx   generated brand images
  sitemap.ts, robots.ts, manifest.ts
  llms.txt/route.ts
  admin/login/page.tsx       sign in form (client)
  admin/(dashboard)/layout.tsx   auth gate + admin nav
  admin/(dashboard)/page.tsx     products list
  admin/(dashboard)/products/new/page.tsx
  admin/(dashboard)/products/[id]/page.tsx
  admin/(dashboard)/categories/page.tsx
  admin/(dashboard)/settings/page.tsx
  admin/actions.ts           all admin server actions
components/
  site/  Navigation, Hero, FreshThisWeek, ProductGrid, ProductCard, ShopFilters,
         About, MenuSpecials, StoreInfo, Contact, Footer, JsonLd
  cart/  CartProvider, CartButton, CartSheet, AddToCart
  admin/ ProductTable, ProductForm, ImageUploader, CategoryManager, SettingsForm, AdminNav
  ui/    shadcn (only files still imported)
lib/
  types.ts        Product, Category, StoreSettings, CartItem
  format.ts       formatPrice, formatHours
  slug.ts         slugify
  availability.ts isPurchasable, maxQty
  whatsapp.ts     buildOrderMessage, buildWhatsAppUrl, buildContactMessage
  cart.ts         cartReducer + actions (pure)
  schemas.ts      zod schemas for product/category/settings forms
  images.ts       resizeToWebp (browser), storagePathFromUrl
  data.ts         public read queries (anon, cached)
  supabase/public.ts   cookie-less anon client
  supabase/server.ts   cookie-aware server client
  supabase/browser.ts  browser client
  site.ts         SITE_URL, absoluteUrl
  utils.ts        cn (existing)
proxy.ts          refresh session, guard /admin
supabase/migrations/20260922000000_init.sql
supabase/seed.sql
public/seed/*.jpg (moved from src/assets)
tests/*.test.ts
```

---

### Task 1: Replace Vite + Lovable with a Next.js shell that renders the current homepage

**Files:**
- Delete: `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/App.css`, `src/vite-env.d.ts`, `src/pages/`, `tsconfig.app.json`, `tsconfig.node.json`, `bun.lockb`, `public/favicon.ico`, `public/placeholder.svg`, `public/robots.txt`, `README.md` (rewritten in Task 11)
- Move: `src/components` → `components/site` (non-ui) and `components/ui`; `src/lib` → `lib`; `src/hooks` → `hooks`; `src/assets/*.jpg` → `public/seed/`
- Create: `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/not-found.tsx`, `vitest.config.ts`
- Modify: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `components.json`, `eslint.config.js` → `eslint.config.mjs`

**Interfaces:**
- Produces: `@/*` path alias → project root; `font-display` = Playfair Display, `font-sans` = Poppins via `next/font` CSS vars `--font-display`, `--font-sans`.

- [ ] **Step 1: Swap dependencies**

```bash
npm uninstall lovable-tagger vite @vitejs/plugin-react-swc react-router-dom @tanstack/react-query react-day-picker date-fns embla-carousel-react input-otp react-resizable-panels recharts vaul cmdk
npm install next@16 react@19 react-dom@19 @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers sonner lucide-react
npm install -D @types/react@19 @types/react-dom@19 vitest eslint-config-next@16
```

Delete `components/ui` files for removed libs: `calendar.tsx`, `carousel.tsx`, `chart.tsx`, `command.tsx`, `drawer.tsx`, `input-otp.tsx`, `resizable.tsx`, and the old toast system (`toast.tsx`, `toaster.tsx`, `use-toast.ts`, `hooks/use-toast.ts`) — sonner replaces it.

- [ ] **Step 2: Scripts**

```json
"scripts": {
  "dev": "next dev -p 8080",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "test": "vitest run",
  "db:push": "supabase db push --db-url \"$SUPABASE_DB_URL\" --include-seed"
}
```

- [ ] **Step 3: Config files**

`next.config.ts`:
```ts
import type { NextConfig } from "next";

const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co").hostname;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
```

`tsconfig.json`: standard Next config (`"jsx": "preserve"`, `"moduleResolution": "bundler"`, `"plugins": [{ "name": "next" }]`, `"paths": { "@/*": ["./*"] }`, include `next-env.d.ts`, `**/*.ts`, `**/*.tsx`, `.next/types/**/*.ts`, exclude `node_modules`, `walkem-market-africa-main`).

`tailwind.config.ts`: content → `["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"]`; fontFamily → `sans: ["var(--font-sans)", "sans-serif"]`, `display: ["var(--font-display)", "serif"]`; replace `require("tailwindcss-animate")` with an ESM import.

`components.json`: `"rsc": true`, `"css": "app/globals.css"`.

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: { include: ["tests/**/*.test.ts"] },
});
```

- [ ] **Step 4: Layout + page**

`app/globals.css` = old `src/index.css` unchanged.

`app/layout.tsx`: load `Poppins` (400–700) and `Playfair_Display` (700, 800) with `next/font/google`, variables `--font-sans` / `--font-display`; `<html lang="en-CA">`; render `children` and `<Toaster />` from `components/ui/sonner`. Metadata: title "Walkem Farm Market – Authentic African Groceries in Moncton" (full SEO in Task 10).

`app/page.tsx` renders the moved components in the old order. Every component using hooks/events gets `"use client"`. Replace `font-['Playfair_Display']` with `font-display` across components. Replace `@/assets/x.jpg` imports with `next/image` `src="/seed/x.jpg"`.

`components/ui/sonner.tsx`: remove `next-themes` usage (hard-code `theme="light"`) and `npm uninstall next-themes`.

- [ ] **Step 5: Verify**

Run: `npm run build` → succeeds. Run `npm run dev`, open http://localhost:8080 → homepage looks as before.
Run: `git grep -il lovable` → no output.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "chore: migrate from Vite/Lovable to Next.js"`

---

### Task 2: Pure domain logic (TDD)

**Files:**
- Create: `lib/types.ts`, `lib/format.ts`, `lib/slug.ts`, `lib/availability.ts`, `lib/whatsapp.ts`, `lib/cart.ts`
- Test: `tests/format.test.ts`, `tests/slug.test.ts`, `tests/availability.test.ts`, `tests/whatsapp.test.ts`, `tests/cart.test.ts`

**Interfaces (Produces):**

```ts
// lib/types.ts
export type Category = { id: string; name: string; slug: string; sort_order: number };
export type Product = {
  id: string; name: string; slug: string; description: string | null;
  price: number; unit: string; category_id: string | null; images: string[];
  quantity: number; in_stock: boolean; is_fresh: boolean; is_featured: boolean; is_visible: boolean;
  created_at: string; updated_at: string;
};
export type ProductWithCategory = Product & { category: Pick<Category, "name" | "slug"> | null };
export type DayHours = { day: string; open: string; close: string; closed: boolean };
export type StoreSettings = {
  name: string; tagline: string | null; whatsapp_number: string | null; phone: string | null; email: string | null;
  address_line: string | null; city: string; province: string; postal_code: string | null; country: string;
  latitude: number | null; longitude: number | null; hours: DayHours[];
  hero_title: string | null; hero_subtitle: string | null; about_text: string | null;
};
export type CartItem = { productId: string; slug: string; name: string; price: number; unit: string; image: string | null; qty: number; maxQty: number };
export type CustomerDetails = { name?: string; fulfilment?: "Pickup" | "Delivery"; notes?: string };
```

```ts
// lib/format.ts
export function formatPrice(n: number): string            // 12.9 -> "$12.90"
// lib/slug.ts
export function slugify(input: string): string            // "Egusi Seeds (Ground)" -> "egusi-seeds-ground"
// lib/availability.ts
export function isPurchasable(p: Pick<Product,"is_visible"|"in_stock"|"quantity">): boolean
export function maxQty(p: Pick<Product,"is_visible"|"in_stock"|"quantity">): number   // 0 when not purchasable, else quantity
// lib/whatsapp.ts
export function normalizePhone(raw: string): string        // strips non-digits
export function buildOrderMessage(items: CartItem[], storeName: string, d?: CustomerDetails): string
export function buildContactMessage(f: { name: string; email?: string; phone?: string; message: string }): string
export function buildWhatsAppUrl(phone: string, message: string): string  // https://wa.me/<digits>?text=<encoded>
// lib/cart.ts
export type CartState = { items: CartItem[] };
export type CartAction =
  | { type: "add"; item: Omit<CartItem, "qty">; qty: number }
  | { type: "setQty"; productId: string; qty: number }
  | { type: "remove"; productId: string }
  | { type: "clear" }
  | { type: "hydrate"; items: CartItem[] }
  | { type: "sync"; products: Pick<Product,"id"|"name"|"price"|"quantity"|"in_stock"|"is_visible">[] };
export function cartReducer(state: CartState, action: CartAction): CartState
export function cartTotal(items: CartItem[]): number
export function cartCount(items: CartItem[]): number
export function syncChanges(before: CartItem[], after: CartItem[]): string[]   // human messages, e.g. "Red Palm Oil is now sold out and was removed"
```

- [ ] **Step 1: Write failing tests**

`tests/whatsapp.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildOrderMessage, buildWhatsAppUrl, normalizePhone, buildContactMessage } from "@/lib/whatsapp";
import type { CartItem } from "@/lib/types";

const yam: CartItem = { productId: "1", slug: "premium-yam", name: "Premium Yam", price: 5.49, unit: "per lb", image: null, qty: 3, maxQty: 10 };
const oil: CartItem = { productId: "2", slug: "red-palm-oil", name: "Red Palm Oil", price: 12.99, unit: "per bottle", image: null, qty: 1, maxQty: 4 };

describe("buildOrderMessage", () => {
  it("lists items, line totals and estimated total", () => {
    const msg = buildOrderMessage([yam, oil], "Walkem Farm Market");
    expect(msg).toBe(
      [
        "Hi Walkem Farm Market! I'd like to order:",
        "• Premium Yam × 3 (per lb) — $16.47",
        "• Red Palm Oil × 1 (per bottle) — $12.99",
        "",
        "Estimated total: $29.46 CAD",
      ].join("\n"),
    );
  });

  it("appends customer details only when given", () => {
    const msg = buildOrderMessage([oil], "Walkem Farm Market", { name: "Ada", fulfilment: "Delivery", notes: "After 5pm" });
    expect(msg.endsWith("Name: Ada\nPickup / Delivery: Delivery\nNotes: After 5pm")).toBe(true);
  });
});

describe("buildWhatsAppUrl", () => {
  it("uses digits only and encodes text", () => {
    expect(buildWhatsAppUrl("+1 (506) 555-0123", "Hi & bye")).toBe("https://wa.me/15065550123?text=Hi%20%26%20bye");
  });
});

it("normalizePhone strips non-digits", () => expect(normalizePhone("+1 506-555")).toBe("1506555"));

it("buildContactMessage includes provided fields", () => {
  expect(buildContactMessage({ name: "Ada", phone: "506", message: "Do you stock ogiri?" })).toBe(
    "Hi Walkem Farm Market! Message from the website:\n\nDo you stock ogiri?\n\nName: Ada\nPhone: 506",
  );
});
```

`tests/cart.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { cartReducer, cartTotal, cartCount, syncChanges } from "@/lib/cart";

const base = { productId: "1", slug: "yam", name: "Yam", price: 5.5, unit: "per lb", image: null, maxQty: 3 };

describe("cartReducer", () => {
  it("adds and merges, capped at maxQty", () => {
    let s = cartReducer({ items: [] }, { type: "add", item: base, qty: 2 });
    s = cartReducer(s, { type: "add", item: base, qty: 5 });
    expect(s.items).toHaveLength(1);
    expect(s.items[0].qty).toBe(3);
  });
  it("ignores add when maxQty is 0", () => {
    expect(cartReducer({ items: [] }, { type: "add", item: { ...base, maxQty: 0 }, qty: 1 }).items).toHaveLength(0);
  });
  it("setQty clamps and removes at 0", () => {
    const s = cartReducer({ items: [] }, { type: "add", item: base, qty: 1 });
    expect(cartReducer(s, { type: "setQty", productId: "1", qty: 9 }).items[0].qty).toBe(3);
    expect(cartReducer(s, { type: "setQty", productId: "1", qty: 0 }).items).toHaveLength(0);
  });
  it("sync removes unavailable, updates price and caps qty", () => {
    const s = { items: [{ ...base, qty: 3 }, { ...base, productId: "2", name: "Oil", qty: 1 }] };
    const out = cartReducer(s, {
      type: "sync",
      products: [{ id: "1", name: "Yam", price: 6, quantity: 2, in_stock: true, is_visible: true }],
    });
    expect(out.items).toEqual([{ ...base, price: 6, qty: 2, maxQty: 2 }]);
    expect(syncChanges(s.items, out.items)).toEqual([
      "Yam price changed to $6.00",
      "Yam quantity reduced to 2 (only 2 left)",
      "Oil is no longer available and was removed",
    ]);
  });
  it("totals", () => {
    const items = [{ ...base, qty: 2 }, { ...base, productId: "2", price: 1.25, qty: 4 }];
    expect(cartTotal(items)).toBe(16);
    expect(cartCount(items)).toBe(6);
  });
});
```

`tests/slug.test.ts`, `tests/availability.test.ts`, `tests/format.test.ts`:
```ts
import { it, expect } from "vitest";
import { slugify } from "@/lib/slug";
it("slugifies", () => {
  expect(slugify("Egusi Seeds (Ground)")).toBe("egusi-seeds-ground");
  expect(slugify("  Plantains & Bananas ")).toBe("plantains-bananas");
  expect(slugify("Crème Fraîche")).toBe("creme-fraiche");
});
```
```ts
import { it, expect } from "vitest";
import { isPurchasable, maxQty } from "@/lib/availability";
it("availability rule", () => {
  expect(isPurchasable({ is_visible: true, in_stock: true, quantity: 2 })).toBe(true);
  expect(isPurchasable({ is_visible: true, in_stock: true, quantity: 0 })).toBe(false);
  expect(isPurchasable({ is_visible: true, in_stock: false, quantity: 5 })).toBe(false);
  expect(isPurchasable({ is_visible: false, in_stock: true, quantity: 5 })).toBe(false);
  expect(maxQty({ is_visible: true, in_stock: true, quantity: 7 })).toBe(7);
  expect(maxQty({ is_visible: true, in_stock: false, quantity: 7 })).toBe(0);
});
```
```ts
import { it, expect } from "vitest";
import { formatPrice } from "@/lib/format";
it("formats CAD", () => {
  expect(formatPrice(12.9)).toBe("$12.90");
  expect(formatPrice(1234.5)).toBe("$1,234.50");
});
```

- [ ] **Step 2: Run** `npm test` → FAIL (modules missing).

- [ ] **Step 3: Implement**

```ts
// lib/format.ts
const fmt = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol" });
export function formatPrice(n: number): string {
  return fmt.format(n);
}
```
```ts
// lib/slug.ts
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```
```ts
// lib/availability.ts
import type { Product } from "./types";
type Avail = Pick<Product, "is_visible" | "in_stock" | "quantity">;
export const isPurchasable = (p: Avail) => p.is_visible && p.in_stock && p.quantity > 0;
export const maxQty = (p: Avail) => (isPurchasable(p) ? p.quantity : 0);
```
```ts
// lib/whatsapp.ts
import type { CartItem, CustomerDetails } from "./types";
import { formatPrice } from "./format";
import { cartTotal } from "./cart";

export const normalizePhone = (raw: string) => raw.replace(/\D/g, "");

export function buildOrderMessage(items: CartItem[], storeName: string, d: CustomerDetails = {}): string {
  const lines = [`Hi ${storeName}! I'd like to order:`];
  for (const i of items) lines.push(`• ${i.name} × ${i.qty} (${i.unit}) — ${formatPrice(i.price * i.qty)}`);
  lines.push("", `Estimated total: ${formatPrice(cartTotal(items))} CAD`);
  const extra: string[] = [];
  if (d.name?.trim()) extra.push(`Name: ${d.name.trim()}`);
  if (d.fulfilment) extra.push(`Pickup / Delivery: ${d.fulfilment}`);
  if (d.notes?.trim()) extra.push(`Notes: ${d.notes.trim()}`);
  if (extra.length) lines.push("", ...extra);
  return lines.join("\n");
}

export function buildContactMessage(f: { name: string; email?: string; phone?: string; message: string }): string {
  const lines = ["Hi Walkem Farm Market! Message from the website:", "", f.message.trim(), "", `Name: ${f.name.trim()}`];
  if (f.email?.trim()) lines.push(`Email: ${f.email.trim()}`);
  if (f.phone?.trim()) lines.push(`Phone: ${f.phone.trim()}`);
  return lines.join("\n");
}

export const buildWhatsAppUrl = (phone: string, message: string) =>
  `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
```
```ts
// lib/cart.ts
import type { CartItem, Product } from "./types";
import { maxQty } from "./availability";
import { formatPrice } from "./format";

export type CartState = { items: CartItem[] };
export type CartAction =
  | { type: "add"; item: Omit<CartItem, "qty">; qty: number }
  | { type: "setQty"; productId: string; qty: number }
  | { type: "remove"; productId: string }
  | { type: "clear" }
  | { type: "hydrate"; items: CartItem[] }
  | { type: "sync"; products: Pick<Product, "id" | "name" | "price" | "quantity" | "in_stock" | "is_visible">[] };

const clamp = (n: number, max: number) => Math.max(0, Math.min(Math.floor(n), max));

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.items.find((i) => i.productId === action.item.productId);
      const qty = clamp((existing?.qty ?? 0) + action.qty, action.item.maxQty);
      if (qty === 0) return state;
      const next = { ...action.item, qty };
      return { items: existing ? state.items.map((i) => (i.productId === next.productId ? next : i)) : [...state.items, next] };
    }
    case "setQty":
      return {
        items: state.items
          .map((i) => (i.productId === action.productId ? { ...i, qty: clamp(action.qty, i.maxQty) } : i))
          .filter((i) => i.qty > 0),
      };
    case "remove":
      return { items: state.items.filter((i) => i.productId !== action.productId) };
    case "clear":
      return { items: [] };
    case "hydrate":
      return { items: action.items };
    case "sync": {
      const byId = new Map(action.products.map((p) => [p.id, p]));
      const items: CartItem[] = [];
      for (const i of state.items) {
        const p = byId.get(i.productId);
        if (!p) continue;
        const max = maxQty(p);
        if (max === 0) continue;
        items.push({ ...i, name: p.name, price: Number(p.price), maxQty: max, qty: Math.min(i.qty, max) });
      }
      return { items };
    }
  }
}

export const cartTotal = (items: CartItem[]) => Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100;
export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.qty, 0);

export function syncChanges(before: CartItem[], after: CartItem[]): string[] {
  const out: string[] = [];
  const byId = new Map(after.map((i) => [i.productId, i]));
  for (const b of before) {
    const a = byId.get(b.productId);
    if (!a) { out.push(`${b.name} is no longer available and was removed`); continue; }
    if (a.price !== b.price) out.push(`${a.name} price changed to ${formatPrice(a.price)}`);
    if (a.qty < b.qty) out.push(`${a.name} quantity reduced to ${a.qty} (only ${a.maxQty} left)`);
  }
  return out;
}
```

- [ ] **Step 4: Run** `npm test` → all PASS.
- [ ] **Step 5: Commit** — `feat: add cart, availability and WhatsApp message logic`

---

### Task 3: Supabase schema, security and seed data

**Files:**
- Create: `supabase/config.toml` (via `npx supabase init`), `supabase/migrations/20260922000000_init.sql`, `supabase/seed.sql`

**Interfaces (Produces):** tables `categories`, `products`, `store_settings` (row id=1), `admins(email)`; function `public.is_admin()`; public storage bucket `product-images`. Seed products reference images as `/seed/<file>.jpg` (served from `public/seed`), so no service key is needed.

- [ ] **Step 1: Migration**

```sql
-- supabase/migrations/20260922000000_init.sql
create extension if not exists "pgcrypto";

create table public.admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null check (price >= 0),
  unit text not null default 'each',
  category_id uuid references public.categories(id) on delete restrict,
  images text[] not null default '{}',
  quantity int not null default 0 check (quantity >= 0),
  in_stock boolean not null default true,
  is_fresh boolean not null default false,
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);

create or replace function public.products_before_write() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  if new.quantity = 0 then new.in_stock := false; end if;
  return new;
end $$;
create trigger products_before_write before insert or update on public.products
for each row execute function public.products_before_write();

create table public.store_settings (
  id int primary key default 1 check (id = 1),
  name text not null default 'Walkem Farm Market',
  tagline text,
  whatsapp_number text,
  phone text,
  email text,
  address_line text,
  city text not null default 'Moncton',
  province text not null default 'NB',
  postal_code text,
  country text not null default 'CA',
  latitude double precision,
  longitude double precision,
  hours jsonb not null default '[]',
  hero_title text,
  hero_subtitle text,
  about_text text,
  updated_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.store_settings enable row level security;

create policy "admins read self" on public.admins for select
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy "categories public read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "products public read" on public.products for select using (is_visible or public.is_admin());
create policy "products admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "settings public read" on public.store_settings for select using (true);
create policy "settings admin write" on public.store_settings for update using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/webp','image/jpeg','image/png'])
on conflict (id) do nothing;

create policy "product images admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
```

- [ ] **Step 2: Seed** — `supabase/seed.sql` inserts the 6 categories (sort 1–6: Grains & Flours, Oils & Fats, Plantains & Bananas, Proteins, Root Vegetables, Spices & Seasonings), the 8 existing products (names, descriptions, prices, units, categories and images exactly as in the old `ProductCatalog.tsx`, images `{'/seed/product-spices.jpg'}` etc., quantity 20, `is_featured` true for the first 4, `is_fresh` true for Premium Yam and both plantains), and `store_settings` row 1 with name, tagline "Bringing Africa's Flavours Closer to You", hero texts from the current Hero, about text from About, Moncton/NB, hours Mon–Sat 09:00–19:00, Sun 12:00–17:00, all contact fields NULL. Everything uses `on conflict do nothing` so re-running is safe.

- [ ] **Step 3: Apply**

```bash
npx supabase init   # answer N to IDE prompts
SUPABASE_DB_URL='<connection string>' npm run db:push
```
Expected: migration + seed applied.

- [ ] **Step 4: Verify RLS** with a node `pg` check in scratchpad: `select count(*) from products` = 8; as `anon` role (`set role anon`), `insert into products ...` fails with RLS error; `select public.is_admin()` = false.

- [ ] **Step 5: Commit** — `feat: add Supabase schema, RLS and seed data`

---

### Task 4: Supabase clients, data layer, session proxy

**Files:**
- Create: `lib/site.ts`, `lib/supabase/public.ts`, `lib/supabase/server.ts`, `lib/supabase/browser.ts`, `lib/data.ts`, `proxy.ts`, `.env.example`, `.env.local` (gitignored)

**Interfaces (Produces):**
```ts
// lib/site.ts
export const SITE_URL: string;               // NEXT_PUBLIC_SITE_URL ?? "http://localhost:8080", no trailing slash
export const absoluteUrl: (path: string) => string;
export const imageSrc: (path: string) => string;   // absolute URLs pass through; "/seed/.." kept relative
// lib/supabase/public.ts
export function publicClient(): SupabaseClient      // persistSession false, no cookies
// lib/supabase/server.ts
export async function serverClient(): Promise<SupabaseClient>   // @supabase/ssr createServerClient with await cookies()
export async function requireAdmin(): Promise<{ supabase: SupabaseClient; email: string }>  // redirect("/admin/login") if no user; redirect("/admin/login?error=not-admin") if is_admin() false
// lib/supabase/browser.ts
export function browserClient(): SupabaseClient
// lib/data.ts  (all use publicClient; only visible products)
export async function getSettings(): Promise<StoreSettings>
export async function getCategories(): Promise<Category[]>
export async function getProducts(opts?: { categorySlug?: string; q?: string; inStockOnly?: boolean; fresh?: boolean; featured?: boolean; limit?: number }): Promise<ProductWithCategory[]>
export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null>
export async function getProductsByIds(ids: string[]): Promise<Pick<Product,"id"|"name"|"price"|"quantity"|"in_stock"|"is_visible">[]>
```

- [ ] **Step 1:** `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xssladedipceqpgsfmyj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=https://walkem.vercel.app
# local only, never on Vercel: SUPABASE_DB_URL=postgresql://...
```
Copy to `.env.local` with real URL + publishable key.

- [ ] **Step 2:** Implement clients. `getProducts` query:
```ts
let q = publicClient().from("products").select("*, category:categories(name, slug)").eq("is_visible", true);
if (opts.categorySlug) q = q.eq("categories.slug", opts.categorySlug).not("category", "is", null);  // with !inner join
```
Use `categories!inner(name, slug)` when filtering by category. Search: `.or(\`name.ilike.%${esc}%,description.ilike.%${esc}%\`)` where `esc` strips `,()%` characters. Order: `is_fresh desc, name asc`. On error: `console.error` and return `[]` (spec: friendly empty state). `getSettings` falls back to a hard-coded default `StoreSettings` object on error.

- [ ] **Step 3:** `proxy.ts` — standard `@supabase/ssr` session refresh (`createServerClient` with request/response cookie adapters, `await supabase.auth.getUser()`), `export const config = { matcher: ["/admin/:path*"] }`. Non-authenticated requests to `/admin/*` except `/admin/login` redirect to `/admin/login`.

- [ ] **Step 4: Verify** — temporary `console.log(await getProducts())` in `app/page.tsx`, run dev, see 8 products in server log; remove log.
- [ ] **Step 5: Commit** — `feat: add Supabase clients and data layer`

---

### Task 5: Storefront pages fed by Supabase

**Files:**
- Create: `components/site/ProductCard.tsx`, `components/site/ProductGrid.tsx`, `components/site/ShopFilters.tsx` (client), `components/site/FreshThisWeek.tsx`, `app/shop/page.tsx`, `app/shop/[category]/page.tsx`, `app/products/[slug]/page.tsx`, `components/site/ProductGallery.tsx` (client)
- Modify: `app/page.tsx`, `components/site/Navigation.tsx`, `Hero.tsx`, `About.tsx`, `StoreInfo.tsx`, `Footer.tsx`, `Contact.tsx`; delete `components/site/ProductCatalog.tsx`; rename `Products.tsx` → `MenuSpecials.tsx`

**Interfaces:**
- Consumes: `lib/data.ts`, `lib/format.ts`, `lib/availability.ts`, `lib/site.ts#imageSrc`, `AddToCart` (Task 6 — render a placeholder `<AddToCart product={p} />` import; Task 6 creates it, so implement Task 6 Step 1 stub first: `export function AddToCart({ product }: { product: ProductWithCategory }) { return null }`).
- Produces: `ProductCard({ product }: { product: ProductWithCategory })`, `ProductGrid({ products, emptyText? })`.

- [ ] **Step 1: Homepage** (`export const revalidate = 3600`): Navigation → Hero (settings.hero_title/subtitle, buttons link to `/shop` and `#store-info`) → FreshThisWeek (`getProducts({ fresh: true, limit: 8 })`, hidden if empty) → "Our Products" section with category chips linking to `/shop/<slug>` and `ProductGrid` of `getProducts({ featured: true, limit: 8 })` + "View all products" → About (settings.about_text) → MenuSpecials (static) → StoreInfo → Contact → Footer.

- [ ] **Step 2: Navigation** — links: Home `/`, Shop `/shop`, About `/#about`, Store Info `/#store-info`, Contact `/#contact`; right side `CartButton` slot (Task 6 — stub). Use `next/link`; keep scroll-shadow behaviour; mobile menu closes on navigation; solid background on all pages except home top.

- [ ] **Step 3: ProductCard** — `Link` to `/products/<slug>` wrapping `next/image` (`sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"`, aspect-square, cover from `images[0]` else `/seed/product-spices.jpg`), badges "Fresh" (secondary) / "Sold out" (muted) top-left, name (`h3`), description (2-line clamp), price + unit, `<AddToCart product compact />`. Grid: `grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6` (2 columns on phones).

- [ ] **Step 4: /shop** — `searchParams: Promise<{ q?: string; stock?: string }>`; `h1` "Shop African Groceries"; `ShopFilters` (client: search input submitting `?q=`, "In stock only" switch toggling `?stock=1`, category chips as links); grid; empty state "No products match — message us on WhatsApp and we'll check for you" with WhatsApp link from settings. Page is dynamic because of searchParams — acceptable; category pages carry the SEO.

- [ ] **Step 5: /shop/[category]** — `generateStaticParams` from `getCategories()`, `revalidate = 3600`, `notFound()` for unknown slug, `h1` = category name, breadcrumb Home › Shop › Category.

- [ ] **Step 6: /products/[slug]** — `generateStaticParams` from all products, `revalidate = 3600`, `notFound()` if missing. Layout: gallery (main image + thumbnails, client) | name `h1`, price + unit, availability line ("In stock — 12 available" / "Sold out"), description, `<AddToCart product />` with quantity stepper, "Ask about this on WhatsApp" link, breadcrumb; below: "More from <category>" grid (4, excluding current).

- [ ] **Step 7: StoreInfo / Footer / Contact** read settings. Address rendered only when set; map iframe `https://maps.google.com/maps?q=<lat>,<lng>&z=15&output=embed` when lat/lng set, else `q=<encoded "Walkem Farm Market, Moncton NB">`. Hours from `settings.hours`. Contact form (client): same fields; on submit validates and opens `buildWhatsAppUrl(settings.whatsapp_number, buildContactMessage(form))`; if no number, falls back to `mailto:` with settings.email; if neither, button disabled with "Contact details coming soon". Remove the fake "Message Sent!" toast.

- [ ] **Step 8: Verify** — `npm run build` passes (static paths generated for 8 products, 6 categories). Browser at 375 / 768 / 1280: home, /shop, /shop/root-vegetables, /products/premium-yam render; no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`).
- [ ] **Step 9: Commit** — `feat: storefront pages backed by Supabase`

---

### Task 6: Cart and WhatsApp checkout

**Files:**
- Create: `components/cart/CartProvider.tsx`, `components/cart/CartButton.tsx`, `components/cart/CartSheet.tsx`, `components/cart/AddToCart.tsx`, `components/cart/QtyStepper.tsx`, `app/api/cart-sync/route.ts`
- Modify: `app/layout.tsx` (wrap in `CartProvider`, pass `settings` to it), `Navigation.tsx`

**Interfaces:**
- Produces:
```ts
// CartProvider.tsx ("use client")
export function CartProvider({ children, storeName, whatsappNumber }: { children: ReactNode; storeName: string; whatsappNumber: string | null }): JSX.Element
export function useCart(): {
  items: CartItem[]; count: number; total: number; open: boolean; setOpen(o: boolean): void;
  add(p: ProductWithCategory, qty: number): void; setQty(id: string, qty: number): void; remove(id: string): void; clear(): void;
  storeName: string; whatsappNumber: string | null;
}
```
- `POST /api/cart-sync` body `{ ids: string[] }` → `getProductsByIds(ids)` JSON (≤ 50 ids, validated with zod).

- [ ] **Step 1:** `CartProvider` uses `useReducer(cartReducer)`; hydrates from `localStorage["walkem-cart-v1"]` in `useEffect` (try/catch); persists on change (try/catch). `add()` builds item `{ productId, slug, name, price: Number(price), unit, image: images[0] ?? null, maxQty: maxQty(p) }`, dispatches, opens sheet, `toast.success("Added <name>")`.
- [ ] **Step 2:** When the sheet opens and items exist, POST ids to `/api/cart-sync`, dispatch `sync`, show `syncChanges` messages as an inline notice in the sheet.
- [ ] **Step 3:** `CartSheet` (shadcn `Sheet`, `side="right"`, full width on mobile): line items (thumb, name link, unit price, `QtyStepper` bounded 1..maxQty, line total, remove), "Estimated total", optional Name input, Pickup/Delivery radio group, Notes textarea, "Order on WhatsApp" button (`<a target="_blank" rel="noopener">` to `buildWhatsAppUrl(...)`, disabled with explanatory text when `whatsappNumber` is null), "Clear cart" link, and footnote "Final price and delivery are confirmed with you on WhatsApp. No payment is taken on this site." Empty state links to `/shop`.
- [ ] **Step 4:** `CartButton` — bag icon with count badge (`aria-label="Open cart, N items"`). `AddToCart` — if not purchasable: disabled "Sold out"; else `QtyStepper` (hidden when `compact`) + "Add to cart".
- [ ] **Step 5: Verify** in browser: add yam ×3 and oil ×1, reload page (cart persists), open cart, read the WhatsApp link `href` and URL-decode it → matches the spec message format. Set a product quantity to 1 in DB, reopen cart → notice shows and qty capped.
- [ ] **Step 6: Commit** — `feat: cart drawer with WhatsApp checkout`

---

### Task 7: Admin authentication

**Files:**
- Create: `app/admin/login/page.tsx`, `app/admin/login/LoginForm.tsx` (client), `app/admin/(dashboard)/layout.tsx`, `components/admin/AdminNav.tsx`, `app/admin/actions.ts` (signOut only for now)
- Modify: `proxy.ts` (already guards)

**Interfaces:**
- Produces: `requireAdmin()` used at the top of every dashboard layout/page and every server action; `signOut()` server action.

- [ ] **Step 1:** Login form: email + password, `browserClient().auth.signInWithPassword`, on success `router.replace("/admin")` + `router.refresh()`; errors inline. Shows `?error=not-admin` message: "This account isn't an admin. Ask the owner to add your email."
- [ ] **Step 2:** Dashboard layout calls `requireAdmin()`, renders `AdminNav` (Products, Categories, Store settings, View site ↗, Sign out; horizontal scroll tabs on mobile) and a warning banner when `settings.whatsapp_number` is empty. `export const dynamic = "force-dynamic"`; `metadata.robots = { index: false }`.
- [ ] **Step 3: Seed admin** — add the owner's email: `insert into admins(email) values ('<owner email lower-case>')` (email provided by user); user creates the auth user in Supabase dashboard → Authentication → Add user (auto-confirm).
- [ ] **Step 4: Verify** — `/admin` logged out → redirected to login; wrong password → error; admin login → dashboard; non-admin user → not-admin message.
- [ ] **Step 5: Commit** — `feat: admin login and route protection`

---

### Task 8: Admin product management with image upload

**Files:**
- Create: `lib/schemas.ts`, `lib/images.ts`, `components/admin/ProductTable.tsx` (client), `components/admin/ProductForm.tsx` (client), `components/admin/ImageUploader.tsx` (client), `app/admin/(dashboard)/page.tsx`, `app/admin/(dashboard)/products/new/page.tsx`, `app/admin/(dashboard)/products/[id]/page.tsx`
- Modify: `app/admin/actions.ts`
- Test: `tests/schemas.test.ts`, `tests/images.test.ts`

**Interfaces:**
```ts
// lib/schemas.ts
export const productSchema: z.ZodObject<{ name, slug, description, price (coerce number >=0, 2dp), unit, category_id (uuid|null),
  images (string url or /path)[] max 8, quantity (coerce int >=0), in_stock, is_fresh, is_featured, is_visible }>
export type ProductInput = z.infer<typeof productSchema>;
export const categorySchema; export const settingsSchema;   // settings.whatsapp_number: digits 8-15 after normalizePhone, or empty
// lib/images.ts
export async function resizeToWebp(file: File, maxSize = 1600, quality = 0.85): Promise<Blob>   // browser only (createImageBitmap + canvas)
export function storagePathFromUrl(url: string): string | null   // ".../object/public/product-images/<path>" -> "<path>", else null
// app/admin/actions.ts ("use server"), all return { ok: true } | { ok: false; error: string }
export async function saveProduct(id: string | null, input: ProductInput): Promise<Result & { id?: string }>
export async function toggleProductField(id: string, field: "in_stock" | "is_fresh" | "is_visible" | "is_featured", value: boolean): Promise<Result>
export async function deleteProduct(id: string): Promise<Result>
export async function deleteImage(url: string): Promise<Result>
export function revalidateStorefront(slugs?: string[]): void   // internal: "/", "/shop", "/shop/[category]" (layout), "/products/<slug>", "/sitemap.xml", "/llms.txt"
```

- [ ] **Step 1: Tests** — `tests/schemas.test.ts`: valid product parses and coerces `"5.5"` → 5.5; negative price rejected; quantity `"3"` → 3; settings rejects whatsapp `"12"` and accepts `"+1 (506) 555-0123"` → `"15065550123"`. `tests/images.test.ts`: `storagePathFromUrl("https://x.supabase.co/storage/v1/object/public/product-images/a/b.webp")` → `"a/b.webp"`, `storagePathFromUrl("/seed/x.jpg")` → `null`. Run → FAIL; implement; run → PASS.
- [ ] **Step 2: Products list page** — server page fetches all products (incl. hidden) + categories with `requireAdmin().supabase`; `ProductTable` shows search + category filter; desktop `Table` (thumb, name, category, price, qty, switches In stock / Fresh / Visible, Edit); mobile cards with the same switches. Switches call `toggleProductField` optimistically, revert + `toast.error` on failure. "Add product" button.
- [ ] **Step 3: ProductForm** — react-hook-form + zodResolver(productSchema). Name auto-fills slug until slug edited manually. Category select, price, unit (datalist: per lb, per kg, per pack, per bag, per bottle, each), quantity, description textarea, four switches, `ImageUploader`. Submit → `saveProduct` → toast → `router.push("/admin")`. Edit page also has "Delete product" with `AlertDialog` confirm.
- [ ] **Step 4: ImageUploader** — `<input type="file" accept="image/*" multiple>` (phones offer camera) + drop zone; each file → `resizeToWebp` → `browserClient().storage.from("product-images").upload(\`${crypto.randomUUID()}.webp\`, blob, { contentType: "image/webp" })` → `getPublicUrl` → appended to form `images`. Per-file progress/error. Thumbnails with "Make cover" (moves to index 0), ←/→ reorder buttons (touch-friendly, no drag library), remove (calls `deleteImage` for storage URLs after save; removed immediately from form state).
- [ ] **Step 5: Server actions** — each calls `requireAdmin()`, validates with zod, writes, maps Postgres unique violation `23505` on slug to "A product with this URL already exists", calls `revalidateStorefront([slug, oldSlug])`.
- [ ] **Step 6: Verify** in browser: create "Egusi Seeds" with an uploaded photo, qty 5 → appears on `/`, `/shop`, `/products/egusi-seeds` within seconds on `next start`; toggle In stock off → product page shows Sold out; set qty 0 → saves as out of stock. Check on 375 px width.
- [ ] **Step 7: Commit** — `feat: admin product management with image upload`

---

### Task 9: Admin categories and store settings

**Files:**
- Create: `components/admin/CategoryManager.tsx`, `components/admin/SettingsForm.tsx`, `app/admin/(dashboard)/categories/page.tsx`, `app/admin/(dashboard)/settings/page.tsx`
- Modify: `app/admin/actions.ts`

**Interfaces:**
```ts
export async function saveCategory(id: string | null, input: { name: string; slug: string }): Promise<Result>
export async function moveCategory(id: string, direction: "up" | "down"): Promise<Result>   // swaps sort_order with neighbour
export async function deleteCategory(id: string): Promise<Result>   // FK 23503 -> "Move or delete the products in this category first"
export async function saveSettings(input: SettingsInput): Promise<Result>   // revalidatePath("/", "layout")
```

- [ ] **Step 1:** Categories page: list with inline rename, ↑/↓, delete (confirm), add form. Product count shown per category.
- [ ] **Step 2:** Settings form sections: Contact (WhatsApp with helper text "Include country code, e.g. 1 506 555 0123", phone, email), Address (line, city, province, postal code, latitude/longitude with a "Find on Google Maps" helper link), Opening hours (7 rows: closed switch + open/close `type="time"`), Homepage (hero title, hero subtitle, tagline, about text).
- [ ] **Step 3: Verify** — set WhatsApp number → admin warning banner disappears, cart button enabled, footer shows number; rename category → chip updates; deleting non-empty category shows the error.
- [ ] **Step 4: Commit** — `feat: admin categories and store settings`

---

### Task 10: SEO and AI discoverability

**Files:**
- Create: `components/site/JsonLd.tsx`, `lib/seo.ts`, `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `app/llms.txt/route.ts`
- Modify: `app/layout.tsx`, all public pages (`generateMetadata`)
- Test: `tests/seo.test.ts`

**Interfaces:**
```ts
// lib/seo.ts
export function storeJsonLd(s: StoreSettings): object          // GroceryStore
export function websiteJsonLd(): object                         // WebSite + SearchAction /shop?q={search_term_string}
export function productJsonLd(p: ProductWithCategory, s: StoreSettings): object   // Product + Offer
export function breadcrumbJsonLd(items: { name: string; path: string }[]): object
export function buildLlmsTxt(s: StoreSettings, cats: Category[], products: ProductWithCategory[]): string
// components/site/JsonLd.tsx
export function JsonLd({ data }: { data: object | object[] }): JSX.Element   // <script type="application/ld+json"> with "<" escaped as <
```

- [ ] **Step 1: Tests** — `productJsonLd` for a sold-out product has `offers.availability === "https://schema.org/OutOfStock"`, `offers.priceCurrency === "CAD"`, `offers.price === "5.49"`, absolute image URLs; `storeJsonLd` omits `telephone`/`address.streetAddress` when null and emits `openingHoursSpecification` only for open days; `buildLlmsTxt` contains "# Walkem Farm Market", "Moncton", the WhatsApp ordering explanation and a line `- [Premium Yam](<SITE_URL>/products/premium-yam): $5.49 per lb — In stock`. Run → FAIL; implement; PASS.
- [ ] **Step 2: Metadata** — root: `metadataBase: new URL(SITE_URL)`, title template `%s | Walkem Farm Market`, default title "Walkem Farm Market – Authentic African Groceries in Moncton", description "Shop authentic African & Caribbean groceries in Moncton, NB — yam, plantain, palm oil, spices, flours and more. Order online and confirm on WhatsApp.", keywords, `openGraph` (type website, locale en_CA, siteName), `twitter.card = summary_large_image`, `alternates.canonical`, `robots` index/follow, `formatDetection.telephone = false`, geo `other` tags (`geo.region: CA-NB`, `geo.placename: Moncton`). Each page `generateMetadata` sets title, description, canonical; products use cover image as OG image (absolute) and description fallback "Buy <name> (<unit>) at Walkem Farm Market in Moncton — <price>."
- [ ] **Step 3: JSON-LD** — layout: store + website. Product page: product + breadcrumb. Category/shop: breadcrumb + `ItemList` of product URLs.
- [ ] **Step 4: Brand images** via `next/og` `ImageResponse`: `icon.tsx` (32×32, orange `#EB6A2E` rounded square, white "W" serif bold), `apple-icon.tsx` (180×180 same), `opengraph-image.tsx` (1200×630: warm cream background, "Walkem Farm Market" in large serif, "Authentic African & Caribbean Groceries · Moncton, NB", orange accent bar; alt text set). Product pages override with product photo.
- [ ] **Step 5: sitemap / robots / manifest / llms**
  - `sitemap.ts`: `/`, `/shop`, each category, each visible product (`lastModified: updated_at`, product `images` included).
  - `robots.ts`: `rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }, ...["GPTBot","OAI-SearchBot","ChatGPT-User","PerplexityBot","ClaudeBot","Claude-SearchBot","Google-Extended","Bingbot","Applebot-Extended"].map(ua => ({ userAgent: ua, allow: "/", disallow: ["/admin", "/api"] }))]`, `sitemap: absoluteUrl("/sitemap.xml")`, `host`.
  - `manifest.ts`: name, short_name "Walkem", theme `#EB6A2E`, background `#FAF7F2`, icons from `/icon` and `/apple-icon`.
  - `app/llms.txt/route.ts`: `export const revalidate = 3600`; returns `buildLlmsTxt(...)` as `text/plain; charset=utf-8`. Layout adds `<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM summary">` via `metadata.alternates.types`.
- [ ] **Step 6: Verify** — `npm run build`; `curl -s localhost:8080/products/premium-yam` (after `npm start`) contains `<h1`, "Premium Yam", `application/ld+json`, `og:image`; `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/icon`, `/opengraph-image` return 200.
- [ ] **Step 7: Commit** — `feat: SEO metadata, structured data, sitemap, robots and llms.txt`

---

### Task 11: README, final verification, push to GitHub

**Files:**
- Create: `README.md`
- Modify: `package.json` name → `walkem-farm-market`

- [ ] **Step 1: README** — what it is; local setup (`npm install`, `.env.local` from `.env.example`, `npm run dev`); database (`npm run db:push` with `SUPABASE_DB_URL`); adding an admin (Supabase → Authentication → Add user, then `insert into admins(email) values ('...')` in SQL editor); Vercel deploy (import repo, set the 3 env vars, set `NEXT_PUBLIC_SITE_URL` to the production domain, redeploy); Supabase Auth → URL configuration → Site URL = production domain.
- [ ] **Step 2: Full verification** — `npm test`, `npm run lint`, `npm run build` all pass; `git grep -il lovable` empty; `git status` clean except intended; browser walk-through at 375/768/1280 of home → shop → product → cart → WhatsApp link, and admin login → edit product → storefront updated.
- [ ] **Step 3: Push**
```bash
git remote add origin https://github.com/dexmart/Walkem.git
git push -u origin main
```
- [ ] **Step 4:** Hand over Vercel steps and outstanding owner inputs (WhatsApp number, address, hours, admin email, domain).
