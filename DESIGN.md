# Live Spirit Seeds Mk2 — Design & Orientation

A token-efficient map of this repo. Read this first; open source only for the file(s) you're about to edit.

## 1. What it is

A static marketing/brochure website for the **Live Spirit Seeds** wellness & massage-therapy
practice. It's a client-side React SPA — no backend, no database, no auth. Page content is
hardcoded in components and driven by a small config file.

## 2. Stack & entry points

- **Vite 6** + **React 18** + **react-router-dom 7**, plain JSX (no TypeScript).
- `index.html` → `src/main.jsx` → mounts `<App>`. `main.jsx` also imports the global CSS
  layers (in order) and applies the theme class to `<body>`.
- Routing lives in `src/App.jsx`.
- `@` is aliased to `src/` (see `vite.config.js`).
- Deployed on **Vercel** (`vercel.json`). Production build emits brotli (`.br`) + gzip (`.gz`)
  compressed assets and sets long-lived immutable cache headers.

### Scripts
- `npm run dev` — Vite dev server on port 5173 (`host: true`, so reachable over LAN/mobile).
- `npm run build` — production build.
- `npm run lint` — ESLint.
- `npm run preview` — preview the built site.

## 3. Layout

```
content/               CMS content (git-backed, editable in /admin) — see ADR 0002
  settings/index.json  Site Settings (theme, siteTitle, tagline, logo, contact)
  pages/*.json         One file per page; filename = route slug; holds blocks[]
tina/
  config.ts            TinaCMS schema (Settings + Page collections, block palette)
  __generated__/       Generated GraphQL client + types (committed)
src/
  main.jsx              App bootstrap: CSS imports + default theme class + render
  App.jsx              Router (dynamic /:slug) + theme load + button-flash effect
  config/siteConfig.js Fallback default theme (SITE_THEME) applied before CMS loads
  cms/site.js          Data helpers over the Tina client (settings, pages, theme)
  pages/DynamicPage.jsx Loads a Page by slug, renders its blocks, enables useTina
  components/
    cms/Blocks.jsx     Renders blocks[] into the CSS primitives (§6)
    Nav.jsx            Nav generated from the CMS page list; Hamburger, ScrollToTop
    TaglineArt.jsx     The "You are Resilient" banner, in 3 themeable layers (§6)
    PreviewBar.jsx     Non-destructive style/season preview toolbar (§6 Preview mode)
    ValuesSection/     Reused by the values block
  styles/              Layered global CSS (see §6)
  utils/               buttonFlashHandler.js — global click-flash effect
                       preview.js — non-destructive style/season preview state (§6)
                       useUiStyle.js — watches the <body> style class (§6 UX styles)
  assets/              Seasonal logos/backgrounds (referenced by CSS themes)
public/
  uploads/             CMS-uploaded images (repo-based media); favicon
marketplace/           SEPARATE package — the online store (not part of the SPA)
```

> **`marketplace/` is an independent app, not part of the brochure site.** It's a
> Next.js + Supabase + Stripe store with its own `package.json`, build, and deploy
> (own subdomain), sharing nothing at runtime with the Vite SPA above. Owner admin at
> `/admin` (categories, image upload, inline images, price, tags, search). Deliberately
> **not linked from the SPA navbar** yet. Full setup + architecture: [`marketplace/README.md`](./marketplace/README.md).

## 4. Routes

Routing is **dynamic** (`src/App.jsx`): content, not code, defines the pages.

| Path      | Renders                                                        |
|-----------|---------------------------------------------------------------|
| `/`       | `DynamicPage` → `content/pages/home.json`                     |
| `/:slug`  | `DynamicPage` → `content/pages/<slug>.json` (404 panel if missing) |

Adding a page = adding a content file (via `/admin`); it appears in the nav automatically.
`<ScrollToTop>` resets scroll on every route change.

## 5. Domain model

Content is **data**, managed via TinaCMS (git-backed) — see [ADR 0002]. Two collections:

- **Settings** (`content/settings/index.json`) — `theme` (`spring`/`summer`/`fall`/`winter`),
  `uiStyle` (`watercolor`/`editorial`/`sanctuary`/`immersive` — see §6 UX styles), `siteTitle`, `tagline`,
  `logo`, `contactEmail`, and `navCtaLabel`/`navCtaUrl` (the navbar action button — rendered only by
  the alternate styles; blank hides it).
- **Page** (`content/pages/*.json`) — `title`, `navLabel`, `order`, `showInNav`, and an ordered
  `blocks[]`. The palette is **three** block types:
  - **`contentSection`** — a general section with a `layout` picker choosing the look:
    `splash` (hero photo with the type stack laid **over** it), `imageText` (image beside text),
    `centered` (centered text), `cardGrid` (heading + grid of mini-cards, e.g. home "Our Services"),
    `values` (values list), `event` (announcement + images). `splash` additionally uses `eyebrow`
    (the small tracked line above the heading) and `overlayAlign`
    (`center`/`bottomLeft`/`bottomCenter` — where the text sits on the photo).
  - **`service`** — a bookable offering: `status` (`available`/`coming-soon`), `bookingOptions[]`
    (each with `addOns[]`), plus the shared fields below.
  - **`embed`** — a generic third-party widget: `source` (offeringtree/canva/kit/other, a label),
    `mode` (`url` iframe link **or** `code` raw snippet), `url`/`code`, `height`, `caption`. The
    consolidation point for OfferingTree schedules, Canva designs, and Kit forms — see §6.

  Both types share: `imageSide`, `imageWidth` (% of the row, 20–70), `spacing`
  (`compact`/`normal`/`airy`), a unified `buttons[]` list, and `showHomeButton`. Each renders
  through a §6 CSS primitive. (Legacy note: files created before this consolidation used six
  templates — `splitSection`/`stackedSection`/`serviceCard`/`cardGrid`/`valuesSection`/
  `eventSection` — migrated 1:1 into the two above.)

(`siteConfig.js` now only holds the fallback default season (`SITE_THEME`) and UI style
(`SITE_UI_STYLE`) applied before the CMS loads.)

## 6. Subsystems

**Content / CMS.** Pages render from git-backed content files through TinaCMS. `DynamicPage`
queries a page by slug via the generated client and passes `blocks[]` to `Blocks.jsx`, which
maps each block type to a CSS primitive. `useTina` enables on-page editing at `/admin`; uploaded
images are repo-based (in `public/uploads`, compressed by a push-time GitHub Action). Governed by
[ADR 0002](./docs/adr/0002-tinacms-content-management.md).

> **Deploys depend on TinaCloud, per branch.** `npm run build` is `tinacms build`, which regenerates
> `tina/__generated__/client.ts` — the committed copy points at `http://localhost:4001/graphql` (the
> local dev server) and is *always* overwritten at build time, so never treat it as the real endpoint.
> The build needs `TINA_CLIENT_ID` + `TINA_TOKEN`, and serves content for the branch in
> `tina/config.ts` (`TINA_BRANCH` → `VERCEL_GIT_COMMIT_REF` → `main`). **A preview deploy of a feature
> branch therefore fails until that branch has been indexed in the TinaCloud dashboard** — the code is
> the branch's but the content query goes to TinaCloud, and an unknown branch (or one whose indexed
> schema predates a new field) errors. Note also that the SPA queries TinaCloud **at runtime**, so the
> live site has a runtime dependency on it; there is no static content fallback yet.

Block-renderer behaviors (`Blocks.jsx`): a `contentSection` dispatches on its `layout`; a `service`
renders the bookable card; an `embed` renders a third-party widget (see **Live embeds** below).
Image sides **auto-alternate** left/right by position (`imageSide:
'auto'`, recomputed on drag-reorder; `left`/`right` pin a side) for the image-bearing looks
(`imageText` + `service`); **image width** is a percent (`imageWidth`, 20–70) applied via the
`--media-basis` CSS custom property so mobile can still force full-width; **vertical spacing**
(`spacing`) maps to `.section--compact`/`.section--airy`. Rich-text bodies render via `TinaMarkdown`
and are stored on disk as **markdown strings, not AST objects** (see the playbook §4).

**Unified buttons.** Every block shares one `buttons[]` list. A button is a plain link with a manual
`status` (`active`/`coming-soon` — coming-soon renders non-clickable, prefixed "Coming Soon - "),
**or** it names a `service` on the page and inherits *that* service's availability/link (the same
`Heading → {status, slug, bookUrl}` map used by booking add-ons; typed name validated on save).
`service` blocks additionally carry their own `status` (coming-soon shows a badge and disables
booking) and `bookingOptions[]`; each **booking option** (session) can list `addOns[]`, so every
session gets its own "Book w/ &lt;add-on&gt;" button derived from the referenced service's status
(owner-editable in `/admin`; no code flag). Every block has a `showHomeButton` toggle (default on).
New pages/blocks start from `ui.defaultItem` presets rather than a blank form. Reusable setup +
gotchas, including the block-model design patterns: [TinaCMS Vite playbook](./docs/tinacms-vite-playbook.md) (§8).

**Live embeds (source consolidation).** The `embed` block (`EmbedBlock` in `Blocks.jsx`) is the one
place to drop any external tool's copy-paste widget so the site stays live off that source instead of
hand-maintained links — OfferingTree schedules/offerings, Canva designs, Kit/ConvertKit forms all
hand you a snippet. Two modes: **`url`** renders a themed `<iframe>` (radius/shadow tokens, so it
reads as part of the site under every UI style) — simplest, best for Canva "smart embed" links and
OfferingTree share URLs; **`code`** renders `RawEmbed`, which sets the snippet as innerHTML **and
re-executes its `<script>` tags** (a script inserted via innerHTML does not run per spec — this is
required for Kit's JS form embeds). Empty blocks show an `/admin` hint instead of breaking. The
"Practice With Me" page (`content/pages/practice-with-me.json`) is built from these. OfferingTree has
no public REST API; embed widgets, Zapier, and Google-Calendar sync are the integration surfaces.

**Seasonal theming.** The season lives in the **Settings** doc. To avoid a theme flash, `main.jsx`
imports `content/settings/index.json` at build time and applies its `theme` as a `<body>` class
**before first paint** (the page is `visibility: hidden` until then — see `index.html`);
`siteConfig.js`'s `SITE_THEME` is only a fallback for a missing/invalid value. `App.jsx` re-applies
the theme from the CMS on load (same value on first render; updates during live editing). The CSS
themes in `src/styles/themes.css` key off that class.

**UX styles.** A second `<body>` class axis, **orthogonal to the season**. The season owns the
**color** tokens; the UX style owns **structure + type + scroll motion** (display font, borders,
radius, shadows, layering, and scroll behaviour) via `src/styles/ui-styles.css` (`body.style-<x>`),
so switching the look never changes the palette — every style consumes the current season's colors.
Body text is **Merriweather Sans** in every style. The three alternates are grounded in real
yoga/wellness sites (a Firecrawl review of Lila Lolling, Wild Owl Yoga, Seven Senses). Four looks:
- `watercolor` — the **original** (Euphoria Script + Farsan display, painterly bands, thick
  borders). The untouched baseline, so it has *no* overrides here; also the default and the
  fallback for any missing/invalid value.
- `editorial` — light editorial minimalism (ref: Lila Lolling): **Fraunces** display, flat crisp
  bands (no wash), hairline rules, small radii, a centered `❖` glyph divider under stacked
  headings, a flattened transparent navbar, and a gentle fade-up reveal.
- `sanctuary` — whimsical & soft (ref: Wild Owl Yoga): **Playfair Display** display + a **Caveat**
  hand-lettered script accent (with a drawn SVG underline swash), big arch/petal-rounded media
  tiles, floating `✦` sparkle glyphs, the watercolor wash kept but drifting; content rises in.
- `immersive` — cinematic full-bleed (ref: Seven Senses): **Cormorant Garamond** display, seamless
  edge-to-edge bands, a soft neutral vignette for depth, ghost/outline buttons, a transparent
  hairline navbar, and strong wide parallax the content rises over. **Season colors are untouched
  — the dark cinematic drama comes from real full-bleed photography (see media note below).**

**A UX style changes STRUCTURE, not just tokens.** The first pass of these alternates was only fonts,
radii and shadows, which read as one site in three typefaces. What differentiates them is DOM shape,
so two pieces are style-aware in markup rather than CSS alone:

- **Splash / hero** (`section--splash`, `SplashSection` in `Blocks.jsx`) — a `contentSection` layout
  where the photo and a scrim fill the band and the content (eyebrow → heading → body → buttons) is
  layered *on top*, instead of a text panel stacked above an image. The base shape lives in
  `layout.css`; each style rewrites height, scrim strength (`--splash-scrim`) and type scale:
  editorial a tall quiet band running under the translucent bar, sanctuary an arch-topped tile with a
  script eyebrow, immersive a full-`100svh` edge-to-edge scene with ghost buttons. Text alignment is
  the **editor's** choice (`overlayAlign`) and no style overrides it. The splash deliberately avoids
  the `.media` class so scroll reveals never offset a hero.
- **Tagline artwork** (`TaglineArt.jsx`) — the "Your Integrative Healer / You are Resilient" banner.
  The supplied `Tagline.svg` was a 26MB export with the lettering converted to outlines and the
  washes embedded as base64 rasters: unshippable, and impossible to theme as a single `<img>`. It is
  split into three layers in `src/assets/` — `tagline-art.webp` (the painted washes + bowl photo,
  75KB), `tagline-flower.webp` (the flower, separated so it can be tinted, 32KB) and
  `tagline-text.svg` (the lettering as paths, `fill="currentColor"`, inlined via `?raw` so it
  inherits the page `color`; ~174KB raw but ~23KB brotli). The ink follows `--text-color`; the
  flower is a bitmap so it can only be **tinted**, via a per-season `--tagline-hue` token in
  `themes.css`. The lettering carries no machine-readable text, so `TAGLINE_COPY` supplies a
  visually-hidden accessible equivalent — **keep the two in sync**.
- **Splash pair mode** — a `splash` block with `withTagline` renders the artwork beside the photo as
  a two-up banner instead of type-over-photo. In this mode the photo is a real column with
  `object-fit: contain` (never cropped), the block's heading/eyebrow/body are not shown because the
  artwork carries the words, and the brushstroke band lifted out of the SVG (`wash-band.webp`) is
  stretched across **both** columns at the top and bottom so the pair reads as one composition.
- **Navbar shape** (`Nav.jsx`) — watercolor keeps the original framed-title-plus-hamburger bar; the
  three alternates render the CMS page links **inline** on desktop (collapsing to the shared hamburger
  overlay under 900px) plus the optional Settings action button. Editorial and sanctuary put the title
  left with the menu right; immersive stacks a centred title over a centred menu row. `Nav.jsx` reads
  the active style with `useUiStyle()` — a `MutationObserver` on the `<body>` class, so Preview-mode
  chips restyle the navbar live without a reload — and exposes it as `data-nav-variant`.

> **Where navbar rules live:** the navbar's classes are CSS-module-scoped and therefore unreachable
> from `ui-styles.css`. The split is: the **layout** of the bar (row vs. stacked, title framing, the
> inline menu and CTA) lives in `Nav.module.css` keyed off `[data-nav-variant]`; the **paint**
> (background, borders, display font) stays in `ui-styles.css` via `nav:has(h1)`. Don't try to reach
> a hashed module class from the global sheet.

Owner-selectable in `/admin` (Settings → **UI Style**). Applied like the season: `main.jsx` bakes
`style-<uiStyle>` onto `<body>` from the build-time Settings import (no flash); `App.jsx` re-applies
it from the CMS on load via `applyUiStyle` (`cms/site.js`) for live editing. Fonts are imported once
in `index.css`. **Motion safety:** reveal/parallax live inside a
`@supports (animation-timeline: view())` + `prefers-reduced-motion: no-preference` guard and animate
the `translate` property **only — never `opacity`**. That rule is load-bearing, not stylistic: a
`fill: both` animation starting at `opacity: 0` renders its before-phase whenever its clock hasn't
advanced, and a page loaded in a **background/hidden tab** has both a frozen document timeline and
unresolved `view()` timelines — so every section computed to `opacity: 0` and the site rendered
blank (the 2026-07-22 "content disappeared" bug). A stalled *translate* leaves content fully
readable, just a few px off, so the reveal cannot fail closed. If a fade is ever wanted back, use
`@starting-style` + `transition` (resting state = visible), not an animation. Animating `translate`
rather than `transform` also lets it compose with `.card:hover`. The navbar's classes are CSS-module-scoped, so per-style navbar
rules reach the top bar via the real `nav:has(h1)` element (only the top bar holds the `<h1>` title).

**Media notes (alternate styles).** All three alternates ship CSS-only (no new binary assets), reusing
the season washes/backgrounds and drawing decorative marks in CSS/inline-SVG. To reach parity with
their reference sites they'd benefit from real media, currently **placeholdered**: `immersive` wants
full-bleed **photography per season** (uses the season wash + a neutral vignette as a stand-in — this is
the biggest gap); `sanctuary`'s gold doodles are CSS `✦` glyphs and its script underline is an inline
SVG swash (a hand-drawn sparkle/underline set would elevate it), and a paper-grain texture overlay is
optional; `editorial` uses the season's light background flat (a full-bleed hero photo would need a
hero/media DOM change, not just CSS). None of these block shipping — they're upgrades.

**Preview mode.** A non-destructive way to try a UX style + season on the live content *before*
publishing — the owner's "preview before going live" for styles (content edits are already previewed
on-page in `/admin` via `useTina`). Opened by URL (`?preview`, or `?style=immersive&season=winter`),
so ordinary visitors never see it. `utils/preview.js` seeds the choice from those params, holds it in
`sessionStorage` (survives navigation between pages), and **never writes to the CMS**; `App.jsx`
applies any override *after* the saved defaults so it wins, and renders `components/PreviewBar.jsx` —
a tap-friendly bottom toolbar (Style + Season chips) sized for mobile. Exiting restores the saved
defaults and strips the params. The owner then sets the winner as the real default in `/admin`.

**Global CSS layers.** Loaded in this order in `main.jsx` — order matters for cascade:
`variables.css` → `themes.css` → `index.css` (base elements) → `layout.css` (shared layout)
→ `components.css` (buttons/cards) → `ui-styles.css` (UI-style axis; overrides the primitives)
→ `animations.css` (keyframes). Individual components may additionally use **CSS Modules**
(`*.module.css`).

> **Styling architecture is governed by [ADR 0001](./docs/adr/0001-hybrid-css-architecture.md):**
> hybrid model — global layer owns tokens/theme/base + a fixed set of **primitives**
> (`.section`, `.panel`, `.card`, `.btn`, `.button-row`); modules own only component-unique
> styles and **never redefine** a global class. Global = `kebab-case`, module = `camelCase`.
> The design vocabulary is defined in [`CONTEXT.md`](./CONTEXT.md). This is the **target** model;
> a migration to it (deleting the globally-imported component CSS files, deduping the panel/button
> variants) is pending.

**Button click-flash.** `utils/buttonFlashHandler.js` (`setupButtonClickFlash`) is invoked once
from `App`'s `useEffect` to attach a global visual flash on button clicks.

**Navigation.** `components/Nav.jsx` (+ `Hamburger.jsx` for mobile) provide site nav.

## 7. Conventions & gotchas

- **Content, not code, drives availability:** season, UI style (both Settings doc) and
  service/add-on/button status (per `service` block, referenced by name) are owner-editable in
  `/admin`. `siteConfig.js` now holds only the `SITE_THEME` + `SITE_UI_STYLE` fallbacks.
- **Season and UI style are two independent axes:** season = color, UI style = structure/type.
  A UI style must never set a color token, so any season works under any look (see §6).
- **Two styling systems coexist:** global CSS + CSS Modules. Match the component you're editing.
- **CSS load order is load-bearing** — see §6 before reorganizing style imports.
- No tests, no TypeScript, no state management library. Keep it simple.
- `assetsInlineLimit: 0` in the build — assets are always emitted as files, never inlined.

## 8. Decisions

ADRs live in `docs/adr/`; domain vocabulary in [`CONTEXT.md`](./CONTEXT.md).

- [ADR 0001 — Hybrid CSS architecture with a single-primitive design system](./docs/adr/0001-hybrid-css-architecture.md)
- [ADR 0002 — TinaCMS (git-backed) for owner-editable content](./docs/adr/0002-tinacms-content-management.md)

Reusable how-to (portable across repos): [TinaCMS on a Vite + React SPA — Playbook](./docs/tinacms-vite-playbook.md)
— setup recipe, the on-page editing wiring, and a cheap-diagnosis checklist (§7) for editing bugs.

In progress (`feature/admin-cms` branch): making content owner-editable via TinaCMS — pages will
render from git-backed content files instead of hardcoded JSX, with on-page editing at `/admin`.
