# Walkem Farm Market — E-commerce Rebuild Design

Date: 2026-09-22
Status: Approved in chat, pending spec review

## Goal

Turn the Lovable-generated Vite landing page into a live, owner-managed grocery
shop for Walkem Farm Market (Moncton, NB):

- Remove every trace of Lovable.
- Owner manages products, photos, prices, stock and store details from an admin area.
- Customers build a cart; checkout hands the order to WhatsApp. No on-site payment.
- Responsive on all devices; strong SEO for search engines and AI assistants (ChatGPT, Perplexity, etc.).
- Hosted on GitHub + Vercel with auto-deploy from `main`, same as tech2mr.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Backend | Supabase (Postgres, Auth, Storage) | One free service for data, login and images |
| Framework | Next.js (App Router) on Vercel | Server-rendered HTML per product so crawlers and AI bots that don't run JS can read the catalogue |
| Admin access | Any admin user can do everything | 1–3 trusted owners; no role tiers |
| Payments | None — WhatsApp handoff | Price and delivery agreed in chat |

## Architecture

- **Next.js App Router**, TypeScript, Tailwind, existing shadcn/ui components and
  design tokens (colours, Poppins / Playfair Display fonts) ported from the Vite app.
- **Supabase**
  - `@supabase/ssr` for cookie-based auth in server components, route handlers and middleware.
  - Public pages read with the anon key (RLS allows `select` on visible rows only).
  - Admin writes go through server actions using the logged-in user's session; RLS
    checks the user is in `admins`.
  - Storage bucket `product-images` (public read, admin write).
- **Freshness**: public pages are statically generated with ISR. Every admin server
  action calls `revalidatePath` for the affected routes (`/`, `/shop`,
  `/products/[slug]`, `/sitemap.xml`, `/llms.txt`), so edits appear live within seconds.
- **Removed**: `lovable-tagger`, Vite config, `bun.lockb`, Lovable README, Lovable
  OG/Twitter tags, default favicon, `src/App.tsx`/`main.tsx`/react-router setup,
  and shadcn components that nothing imports.

### Routes

| Route | Type | Purpose |
|---|---|---|
| `/` | public, ISR | Hero, Fresh this week, featured products, about, store info, contact |
| `/shop` | public, ISR | All visible products; category filter, search, in-stock toggle (filters in URL query) |
| `/shop/[category]` | public, ISR | Category landing page (SEO) |
| `/products/[slug]` | public, ISR | Product detail |
| `/admin/login` | public | Email + password sign-in |
| `/admin` | protected | Product list + quick toggles |
| `/admin/products/new`, `/admin/products/[id]` | protected | Product form with image upload |
| `/admin/categories` | protected | Category CRUD + ordering |
| `/admin/settings` | protected | Store settings |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/manifest.webmanifest` | generated | SEO / AI discovery |

Middleware redirects unauthenticated `/admin/*` requests to `/admin/login`, and
authenticated non-admins to `/admin/login?error=not-admin`.

## Data model (Supabase)

```
categories
  id uuid pk, name text, slug text unique, sort_order int, created_at

products
  id uuid pk
  name text not null
  slug text unique not null          -- auto from name, editable
  description text
  price numeric(10,2) not null       -- CAD
  unit text not null                 -- "per lb", "per pack", "per bottle"...
  category_id uuid fk -> categories (on delete restrict)
  images text[] default '{}'         -- storage paths, index 0 = cover
  quantity int not null default 0
  in_stock boolean not null default true
  is_fresh boolean default false     -- "Fresh this week"
  is_featured boolean default false
  is_visible boolean default true
  created_at, updated_at (trigger)

store_settings                        -- single row, id = 1
  name, tagline, whatsapp_number (E.164 digits), phone, email,
  address_line, city, province, postal_code, country,
  latitude, longitude, hours jsonb,  -- [{day, open, close, closed}]
  hero_title, hero_subtitle, about_text

admins
  user_id uuid pk fk -> auth.users
```

**Availability rule** (single source of truth, used by storefront and JSON-LD):
a product is purchasable when `is_visible && in_stock && quantity > 0`. Saving
`quantity = 0` in admin sets `in_stock = false` automatically; the owner can
still mark an item out of stock with quantity remaining.

**RLS**
- `categories`, `store_settings`: select for everyone; insert/update/delete for admins.
- `products`: select for everyone where `is_visible`; admins select all and write.
- `admins`: select own row only; managed via Supabase dashboard / SQL.
- Storage `product-images`: public read; write/delete for admins.

Delivered as SQL migrations in `supabase/migrations/` plus `supabase/seed.sql`
containing the current 8 products, 6 categories and store settings (placeholders
the owner replaces in admin). Seed images are uploaded by a one-off script
`scripts/seed-images.ts`.

## Storefront

- Existing sections (Navigation, Hero, ProductCatalog, About, StoreInfo, Contact,
  Footer) ported to server components fed by Supabase; Products (menu specials
  section) kept as static content.
- Store info, WhatsApp link, map embed (from lat/long) and footer all read
  `store_settings` — no hard-coded contact details.
- Product card: cover image, name, price + unit, badges (Fresh, Sold out),
  quantity stepper and Add to cart; links to detail page.
- Product detail: image gallery, description, price, availability, quantity,
  Add to cart, related products from same category, breadcrumbs.
- Responsive: mobile-first, tested at 360 / 768 / 1280 px; sticky header with
  cart button showing item count.

## Cart → WhatsApp

- Client-side cart (React context + `localStorage`, try/catch guarded) storing
  `{productId, slug, name, price, unit, qty}`.
- Drawer (shadcn `Sheet`): line items, qty steppers, remove, estimated total,
  optional name + "Pickup / Delivery" choice + notes.
- Quantity capped at product `quantity`; sold-out items can't be added.
- On open, the cart re-validates items against the current catalogue (removes
  hidden/sold-out items, updates prices) and tells the user what changed.
- "Order on WhatsApp" builds the message and opens
  `https://wa.me/<number>?text=<encoded>`:

```
Hi Walkem Farm Market! I'd like to order:
• Premium Yam × 3 (per lb) — $16.47
• Red Palm Oil × 1 (per bottle) — $12.99
Estimated total: $29.46 CAD
Name: <name>
Pickup / Delivery: <choice>
Notes: <notes>
```

- Cart is not cleared automatically (customer may return); "Clear cart" button provided.
- No orders are stored on the site.

## Admin

- Sign in with Supabase email/password. Admin accounts are created in the
  Supabase dashboard and added to `admins` (documented in README).
- **Products list**: table on desktop, cards on mobile; cover thumb, name, price,
  quantity, category; inline switches for In stock / Fresh / Visible (optimistic,
  toast on error); search + category filter.
- **Product form** (react-hook-form + zod): all fields; slug auto-generated;
  image uploader accepting files or phone camera (`accept="image/*"`), images
  resized client-side to max 1600 px and converted to WebP before upload,
  drag to reorder, first image = cover, delete removes from storage.
- **Categories**: add, rename, reorder, delete (blocked if products exist).
- **Settings**: edit `store_settings`, including weekly hours editor.
- Errors surface as toasts; server actions validate with the same zod schemas.

## SEO & AI discoverability

- `generateMetadata` per route: title template `%s | Walkem Farm Market`,
  description, canonical, OG + Twitter (`summary_large_image`).
- OG images: static branded `/og-image.png` (1200×630) for site pages; product
  pages use the product cover image.
- JSON-LD:
  - Site-wide `GroceryStore` (address, geo, hours, phone, url, logo, `sameAs`),
    `WebSite` with `SearchAction` to `/shop?q=`.
  - Product pages: `Product` + `Offer` (`priceCurrency: CAD`,
    `availability` InStock/OutOfStock), `BreadcrumbList`.
  - Shop page: `ItemList`.
- `sitemap.xml`: home, shop, categories, every visible product with `lastModified`.
- `robots.txt`: allow all incl. GPTBot, OAI-SearchBot, ChatGPT-User,
  PerplexityBot, ClaudeBot, Google-Extended, Bingbot; disallow `/admin`; sitemap link.
- `llms.txt`: store summary, location, hours, how to order (WhatsApp), category
  and product list with prices and availability — generated from live data.
- Semantic HTML (one `h1` per page, `alt` text from product names), `next/image`
  with Supabase remote pattern, `next/font` for Poppins / Playfair Display.
- Branding: new Walkem favicon (`icon.png`, `favicon.ico`), `apple-icon.png`,
  web manifest, theme colour from existing palette.

## Deployment

- `git init` in project root; `.gitignore` excludes `node_modules`, `.next`,
  `.env*.local`, the nested duplicate `walkem-market-africa-main/`, `*.zip`, `dist`.
- Push to a new GitHub repo (name/visibility confirmed with user before pushing).
- Vercel project imported from GitHub; env vars: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`. The service-role key is
  used only by the local seed script and never deployed.
- `.env.example` committed; README rewritten (setup, Supabase, adding an admin,
  deploy).

## Error handling

- Supabase unreachable on a public page: ISR keeps serving the last good page;
  on first build failure, pages render a friendly "catalogue unavailable" state
  with the WhatsApp contact.
- WhatsApp number missing in settings: order button disabled with a message
  (admin sees a warning banner in the dashboard).
- Image upload failure: per-file error, form stays usable.

## Testing / verification

- Unit tests (Vitest): WhatsApp message builder, cart reducer (caps, sold-out,
  revalidation), slug generation, availability rule.
- Manual run in browser at mobile / tablet / desktop: browse, filter, search,
  add to cart, WhatsApp link content; admin login, create product with image,
  toggle stock, confirm storefront updates.
- SEO checks: view-source contains product content and JSON-LD; `sitemap.xml`,
  `robots.txt`, `llms.txt` render; build passes `next build` with no type errors.

## Out of scope (for now)

Online payments, order storage/history, customer accounts, staff roles,
multi-language, inventory decrement on WhatsApp orders.

## Needed from the user

Supabase project (URL + anon key + service-role key for seeding), real WhatsApp
number / address / hours / email (can be entered in admin later), domain if any,
logo if any, GitHub repo name + visibility.
