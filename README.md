# Walkem Farm Market

Online shop for Walkem Farm Market, an African & Caribbean grocery store in Moncton, NB.

- Customers browse products, add them to a cart and send the order on **WhatsApp**. The store confirms the price and pickup/delivery in the chat. No payment is taken on the site.
- The owner manages products, photos, prices, stock, categories, opening hours and contact details at **`/admin`**.
- Every product has its own page with structured data, plus a sitemap, `robots.txt` and `llms.txt`, so Google and AI assistants such as ChatGPT can find and describe the catalogue.

Built with Next.js (App Router), Tailwind + shadcn/ui and Supabase (database, login, photo storage). Hosted on Vercel.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:8080
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → Publishable key |
| `NEXT_PUBLIC_SITE_URL` | The public address of the site, e.g. `https://walkemfarmmarket.com` (no trailing slash) |

Other commands: `npm test` (unit tests), `npm run lint`, `npm run build`.

## Database

The schema, security rules and starter products live in `supabase/`. To apply them to a Supabase project:

```bash
npx supabase db push --db-url "postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres" --include-seed
```

Row-level security means anyone can read visible products, but only admins can change anything.

## Adding an admin

1. Supabase dashboard → **Authentication → Users → Add user**. Enter the email and a password and tick **Auto confirm user**.
2. Supabase dashboard → **SQL Editor**, run (email in lower case):
   ```sql
   insert into public.admins (email) values ('owner@example.com');
   ```
3. Sign in at `/admin/login`.

To remove an admin: `delete from public.admins where email = 'owner@example.com';`

## Deploying (Vercel)

1. Import this GitHub repo in Vercel (framework: Next.js; no build settings to change).
2. Add the three environment variables above. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
3. Deploy. Every push to `main` deploys automatically.
4. In Supabase → **Authentication → URL Configuration**, set **Site URL** to the production domain.
5. After the domain is live, submit `https://<domain>/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## How it fits together

- `app/(site)` holds the public pages. They're generated as static HTML and refreshed within seconds whenever an admin saves a change.
- `app/admin` holds the admin screens. `app/admin/actions.ts` has every write, and each one checks the user is an admin.
- `lib/` holds the domain logic (cart, availability, WhatsApp message, SEO data) with tests in `tests/`.
- `proxy.ts` keeps admin sessions fresh and sends logged-out visitors to the login page.
