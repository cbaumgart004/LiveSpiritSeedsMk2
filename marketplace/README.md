# Spirit Seeds — Marketplace

A standalone online store for Spirit Seeds Wellness. It's an independent package
(its own `package.json`, deploy, and domain) that lives in the same repo as the
brochure site but shares nothing with it at runtime.

- **Stack:** Next.js (App Router, TypeScript) · Supabase (Postgres + Storage + Auth) · Stripe · Tailwind
- **Owner admin:** `/admin` — categorize, upload images, inline images in descriptions, price, tags
- **Storefront:** `/` — search + category/tag filters; product pages with Buy (Stripe Checkout)
- **Cost:** ~$0/month until real volume (Supabase free tier + Vercel Hobby + Stripe per-transaction)

> This store is intentionally **not linked from the brochure site's navbar** yet.

## 1. Create the accounts (you do this — Claude never enters your keys)

1. **Supabase** → create a project. From **Project Settings → API** copy the
   Project URL, the `anon` public key, and the `service_role` key.
2. **Stripe** → from **Developers → API keys** copy the Secret key (`sk_test_…`
   to start in test mode).

## 2. Configure

```bash
cd marketplace
cp .env.example .env.local     # then paste your keys into .env.local
npm install
```

## 3. Set up the database

In the Supabase dashboard **SQL editor**, paste and run
[`supabase/schema.sql`](./supabase/schema.sql). It creates the `products` and
`categories` tables, full-text search, row-level security, and the public
`product-images` storage bucket.

## 4. Create the owner login

In Supabase **Authentication → Users → Add user**, create yourself an
email + password user. That's the only account that can reach `/admin`.
(Optional: turn off public sign-ups under Authentication → Providers.)

## 5. Run it

```bash
npm run dev        # http://localhost:3000  (store)
# http://localhost:3000/admin  → sign in, add products
```

## 6. Wire up Stripe payments (when ready)

- Local webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
  and put the printed `whsec_…` in `STRIPE_WEBHOOK_SECRET`.
- In production, add a webhook endpoint in the Stripe dashboard pointing at
  `https://YOUR-STORE-DOMAIN/api/stripe/webhook` and use its signing secret.
- Order fulfillment (recording orders / emailing) is a `TODO` in
  `app/api/stripe/webhook/route.ts`.

## Deploy (cheapest path)

Deploy the **`marketplace/` folder as its own project** (independent of the
brochure site):

- **Vercel:** New Project → same repo → set **Root Directory = `marketplace`**.
  Add all `.env.local` vars in the project's Environment Variables. Point a
  subdomain like `store.spiritseedswellness.com` at it.
- Supabase and Stripe are already hosted; nothing else to run.

## Reuse in another repo (this package is self-contained)

Nothing in `app/` or `lib/` imports outside this folder, so the store is drop-in
portable:

1. Copy the whole `marketplace/` folder into the other repo (or make it the repo root).
2. `npm install`, add `.env.local`, run `supabase/schema.sql` — done.

The **only** host-repo touch point is `scripts/sync-brand.mjs`, which optionally
reads a sibling brochure's `content/settings/index.json` to inherit season/style.
In a different repo you can:
- point it at that repo's settings with `BRAND_SETTINGS_SRC=path/to/settings.json`, or
- ignore it — it skips when the file is absent, and `brand-settings.json` / the
  `NEXT_PUBLIC_SITE_THEME` + `NEXT_PUBLIC_UI_STYLE` env vars become the source, or
- delete the `predev`/`prebuild` hooks from `package.json` to drop the feature.

Swap the brand palette/fonts in `app/brand.css` to rebrand for a different site.

## Architecture notes

- **Writes are server-only.** The browser only ever uses the Supabase `anon`
  key, and RLS exposes just *active* products. All create/update/delete/upload
  goes through server actions (`app/admin/actions.ts`) that first `requireOwner()`
  then use the `service_role` key (`lib/supabase/admin.ts`).
- **Search** is Postgres full-text (a generated `tsvector`), no extra service.
- **Images** (product, gallery, inline) live in Supabase Storage; descriptions
  are markdown, so inline images are just `![](url)` and render on the product page.
- Pages that read data are `force-dynamic` and degrade to a "not configured"
  notice until the env vars are present — so `next build` works out of the box.

## Theming (matches the brochure site)

The store inherits the main site's look so it feels like one brand:

- **Season + UX style are inherited.** On `predev`/`prebuild`, `scripts/sync-brand.mjs`
  copies the brochure's `content/settings/index.json` → `brand-settings.json`. If that
  file isn't in the deploy's build context, the committed `brand-settings.json` (or env)
  is used instead. Force a value with `NEXT_PUBLIC_SITE_THEME`
  (`spring|summer|fall|winter`) and `NEXT_PUBLIC_UI_STYLE` (`watercolor|layered|refined`).
- Palettes, fonts, and style tokens are ported in `app/brand.css` and applied via
  `<body class="{season} style-{style}">` — the same vocabulary as the brochure.
- **Per-product override:** each product can optionally set its own Season/Style in the
  admin ("Appearance" section). That product's page re-scopes to the override; blank =
  inherit the store default. Listing cards always use the store default for a uniform grid.
