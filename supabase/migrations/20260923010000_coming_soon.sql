-- "Coming soon" products are listed on the site but can't be ordered yet.
alter table public.products add column if not exists is_coming_soon boolean not null default false;
