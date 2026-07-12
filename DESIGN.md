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
    ValuesSection/     Reused by the values block
  styles/              Layered global CSS (see §6)
  utils/               buttonFlashHandler.js — global click-flash effect
  assets/              Seasonal logos/backgrounds (referenced by CSS themes)
public/
  uploads/             CMS-uploaded images (repo-based media); favicon
```

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
  `siteTitle`, `tagline`, `logo`, `contactEmail`.
- **Page** (`content/pages/*.json`) — `title`, `navLabel`, `order`, `showInNav`, and an ordered
  `blocks[]`. Block types (the editor palette): `splitSection`, `stackedSection`, `serviceCard`,
  `cardGrid` (heading + grid of mini-cards, e.g. home "Our Services"), `valuesSection`,
  `eventSection` — each renders through a §6 CSS primitive.

(`siteConfig.js` now only holds the fallback default theme applied before the CMS loads.)

## 6. Subsystems

**Content / CMS.** Pages render from git-backed content files through TinaCMS. `DynamicPage`
queries a page by slug via the generated client and passes `blocks[]` to `Blocks.jsx`, which
maps each block type to a CSS primitive. `useTina` enables on-page editing at `/admin`; uploaded
images are repo-based (in `public/uploads`, compressed by a push-time GitHub Action). Governed by
[ADR 0002](./docs/adr/0002-tinacms-content-management.md).

Block-renderer behaviors (`Blocks.jsx`): image sides **auto-alternate** left/right by position
(`imageSide: 'auto'`, recomputed on drag-reorder; `left`/`right` pin a side); per-card **image
size** via `imageSize` (`sm`/`md`/`lg` → `.media--*`); rich-text bodies render via `TinaMarkdown`
and are stored on disk as **markdown strings, not AST objects** (see the playbook §4); buttons
carry a `status` (`active`/`coming-soon`) — coming-soon renders non-clickable, prefixed
"Coming Soon - ". `serviceCard`s can set `offersThaiCompress` to show a per-session Thai Herbal
Compress button (active link when `THAI_COMPRESS_AVAILABLE` in `siteConfig.js` is on + a
`compressUrl` is set, else a disabled "Coming Soon"). Reusable setup + gotchas: [TinaCMS Vite playbook](./docs/tinacms-vite-playbook.md).

**Seasonal theming.** The season lives in the **Settings** doc. To avoid a theme flash, `main.jsx`
imports `content/settings/index.json` at build time and applies its `theme` as a `<body>` class
**before first paint** (the page is `visibility: hidden` until then — see `index.html`);
`siteConfig.js`'s `SITE_THEME` is only a fallback for a missing/invalid value. `App.jsx` re-applies
the theme from the CMS on load (same value on first render; updates during live editing). The CSS
themes in `src/styles/themes.css` key off that class.

**Global CSS layers.** Loaded in this order in `main.jsx` — order matters for cascade:
`variables.css` → `themes.css` → `index.css` (base elements) → `layout.css` (shared layout)
→ `components.css` (buttons/cards) → `animations.css` (keyframes). Individual components may
additionally use **CSS Modules** (`*.module.css`).

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

- **One control panel:** season and feature availability live in `siteConfig.js`, not scattered
  in components.
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
