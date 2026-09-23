-- Walkem Farm Market: catalogue, store settings, admin access and product images.

create extension if not exists "pgcrypto";

-- Admins are identified by the email on their Supabase Auth account.
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

-- Keep updated_at current, and treat zero quantity as sold out.
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
create policy "categories admin write" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "products public read" on public.products for select using (is_visible or public.is_admin());
create policy "products admin write" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

create policy "settings public read" on public.store_settings for select using (true);
create policy "settings admin write" on public.store_settings for update
  using (public.is_admin()) with check (public.is_admin());

-- Product photos: anyone can view, only admins can change.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "product images admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
