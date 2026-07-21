-- Spirit Seeds marketplace schema.
-- Run this in the Supabase SQL editor (or `supabase db push`) once per project.

create extension if not exists "pgcrypto";

-- Categories -----------------------------------------------------------------
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

-- Products -------------------------------------------------------------------
create table if not exists products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  slug           text not null unique,
  description    text not null default '',        -- markdown; inline images allowed
  price_cents    integer not null default 0,
  currency       text not null default 'usd',
  category_id    uuid references categories(id) on delete set null,
  tags           text[] not null default '{}',
  status         text not null default 'draft',    -- 'draft' | 'active'
  theme          text,                             -- optional per-product season override (spring|summer|fall|winter)
  ui_style       text,                             -- optional per-product style override (watercolor|layered|refined)
  featured_image text,                             -- image URL
  images         text[] not null default '{}',     -- gallery image URLs
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- Full-text search over name + description + tags (no external search service).
  search tsvector generated always as (
    to_tsvector(
      'english',
      coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || array_to_string(tags, ' ')
    )
  ) stored
);

-- For databases created before the appearance-override columns were added:
alter table products add column if not exists theme text;
alter table products add column if not exists ui_style text;

create index if not exists products_search_idx   on products using gin (search);
create index if not exists products_tags_idx      on products using gin (tags);
create index if not exists products_category_idx  on products (category_id);

-- Row-level security ---------------------------------------------------------
-- Public (anon key, used by the browser/storefront) may READ only ACTIVE
-- products and all categories. There are deliberately NO write policies, so the
-- anon/authenticated keys cannot insert/update/delete. Every write goes through
-- the server using the service-role key (which bypasses RLS) AFTER the owner is
-- authenticated — see lib/supabase/admin.ts and app/admin/actions.ts.
alter table products   enable row level security;
alter table categories enable row level security;

drop policy if exists "public read active products" on products;
create policy "public read active products" on products
  for select using (status = 'active');

drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories
  for select using (true);

-- Image storage --------------------------------------------------------------
-- A public bucket for product + inline images. Public read; uploads happen
-- server-side with the service-role key, so no write policy is needed here.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
