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
src/
  main.jsx              App bootstrap: CSS imports + theme class + render
  App.jsx              Router + routes; wires global button-flash effect
  config/siteConfig.js CONTROL PANEL: SITE_THEME + feature flags
  pages/               One component per route (Home, Services, About, Upcoming)
  components/          Reusable UI; some grouped by feature (Home/, Services/,
                       ServicesSection/, ValuesSection/) + Nav, Hamburger, ScrollToTop
  styles/              Layered global CSS (see §6)
  utils/               buttonFlashHandler.js — global click-flash effect
  assets/              Seasonal logos/backgrounds, service photos, event imagery
public/                Static passthrough (favicon)
```

## 4. Routes

Defined in `src/App.jsx`:

| Path         | Page component        |
|--------------|-----------------------|
| `/`          | `pages/Home.jsx`      |
| `/services`  | `pages/Services.jsx`  |
| `/about`     | `pages/About.jsx`     |
| `/upcoming`  | `pages/Upcoming.jsx`  |

`<ScrollToTop>` is rendered above `<Routes>` and resets scroll position on every route change.

## 5. Domain model

There isn't a runtime data model — it's a brochure site. The closest thing to "state" is
build-time configuration in `src/config/siteConfig.js`:

- `SITE_THEME` — one of `spring` | `summer` | `fall` | `winter`. Selects the seasonal look.
- Feature flags (e.g. `THAI_COMPRESS_AVAILABLE`) — gate whether certain offerings/content show.

Prefer adding new toggles here over hardcoding availability inside components.

## 6. Subsystems

**Seasonal theming.** `SITE_THEME` (a single constant in `siteConfig.js`) is added as a class
on `<body>` in `main.jsx`. The CSS themes in `src/styles/themes.css` key off that class, and
seasonal assets (logos/backgrounds) are chosen accordingly. Change the season in one place.

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

In progress (`feature/admin-cms` branch): making content owner-editable via TinaCMS — pages will
render from git-backed content files instead of hardcoded JSX, with on-page editing at `/admin`.
