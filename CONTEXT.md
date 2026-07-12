# CONTEXT.md — Live Spirit Seeds glossary (ubiquitous language)

The shared vocabulary for this project. When code, class names, or docs name one of these
concepts, use **this** term — don't drift to a synonym. Terms below were pinned during a design
grilling session (see [ADR 0001](./docs/adr/0001-hybrid-css-architecture.md)).

## Styling / design-system terms

- **Token** — a CSS custom property in `src/styles/variables.css` that is the single source of
  truth for a design value (`--space-*`, `--radius-*`, `--shadow-*`, fonts). Never hardcode a
  value that a token already expresses.
- **Theme** — the seasonal look, selected by `SITE_THEME` in `src/config/siteConfig.js` and
  applied as a `<body>` class. Themes only reassign color/asset tokens (`themes.css`); they
  never change layout.
- **Primitive** — a small, fixed set of **global** design classes that every page composes from:
  `.section`, `.panel`, `.card`, `.btn`, `.button-row`. Primitives live in the global layer
  (kebab-case). Modules may use them but must never redefine them.
- **Section** — a full-width, themed-background band that wraps page content. One primitive
  `.section` with modifiers: `--split` (image beside panel), `--stack` (stacked, centered),
  `--reverse` (mirrored). Supersedes the old names `section-container`, `serviceSection`,
  `values-section`, `upcoming-section`.
- **Panel** — a static bordered content box (bg-light + primary border + radius + shadow).
  The primitive `.panel`. Supersedes `serviceText`, `upcoming-box`, and the bordered Nav
  `title` box. **Do not call this a "box".**
- **Card** — a **panel that is an interactive grid tile** (adds a hover lift). Use "card" only
  when it's a repeating, hoverable item in a grid; otherwise it's a **panel**.
- **Button** — the primitive `.btn`. The only button style. Supersedes `learnMore`.
- **Button-row** — the primitive `.button-row`, a horizontal group of buttons. Supersedes
  `buttonRow` and `upcoming-buttons`.

## Naming rule

- **Global** design classes: `kebab-case`.
- **CSS Module** classes: `camelCase`.
- A module class **never** redefines a global class name. (This rule exists because a duplicated
  global `.section-container` silently broke layout by import order — see ADR 0001.)

## Domain / content terms

- **Offering** — a service the practice provides (e.g. Abhyanga, Thai, Chi Nei Tsang, Tuning
  Forks, sessions). Note: the site historically also used "Services" / "Offering Tree" for this
  concept; **"offering" is the preferred term** going forward. An offering has an
  **availability** (currently a build-time boolean flag such as `THAI_COMPRESS_AVAILABLE`).
- **Event** — a scheduled, time-bound happening (e.g. the Bali retreat), distinct from a
  standing offering. Currently hardcoded in JSX; a future admin portal will make offerings and
  events data-driven.
