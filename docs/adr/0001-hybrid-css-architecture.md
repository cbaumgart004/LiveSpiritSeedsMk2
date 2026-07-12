# ADR 0001 — Hybrid CSS architecture with a single-primitive design system

- **Status:** Accepted
- **Date:** 2026-07-12
- **Deciders:** Chris Baumgart

## Context

The styling had drifted into **three competing mechanisms** with no rule for which owns
what:

1. **Global design CSS** (`src/styles/*.css`, kebab-case) — tokens, theme, `.card`, `.btn`,
   `.section-container`.
2. **Globally-imported component CSS** (`ServicesSection.css`, `ValuesSection.css`,
   `UpcomingPage.css`, `App.css`) — *looks* component-scoped but is a plain import, so it
   leaks into the global namespace.
3. **CSS Modules** (`Nav.module.css`, `ServiceCard.module.css`, camelCase) — genuinely scoped.

Concrete damage this caused:

- **`.section-container` defined twice, globally** (`layout.css` = row, `ServicesSection.css`
  = column). Import order silently decides which wins app-wide.
- **Button implemented three times:** `.btn` (global), `.learnMore` (a near-copy in a module),
  and a broken `.btn:hover` in `App.css` referencing the never-defined `var(--button-hover)`.
  Three names for the row: `.button-row` / `.buttonRow` / `.upcoming-buttons`.
- **"Bordered panel" copy-pasted four times** (`.card`, `.serviceText`, Nav `.title`,
  `.upcoming-box`) with drifting values — border `3px` vs `4px`, shadow `0 8px 24px` vs
  `0 0 12px`.
- **The 4-line text-shadow outline** duplicated verbatim in four places.
- **A token system built then bypassed** — `--space-*`, `--radius-*`, `--shadow-*` exist but
  are mostly ignored; `--shadow-1`'s literal value is hardcoded into `.section-container`.
- **Shipping dead/undefined variables** — `--accent-color`, `--button-hover`; and
  `--section-bg-image` mixes `url('../assets/…')` with `url('/src/assets/…')`, the latter of
  which **breaks in the production build**.

## Decision

### 1. Hybrid model with a hard boundary rule

- **Global** (`src/styles/`) owns: **design tokens**, **theme** (seasonal vars), **base element
  styles**, and a **fixed set of named primitives**.
- **CSS Modules** own only what is unique to one component.
- A module may **use** a primitive (via `composes:` or by applying the global class in JSX) but
  must **never redefine** a global class name.
- **Naming convention:** global = `kebab-case`, module = `camelCase`. This split makes a
  collision like the double `.section-container` impossible to write by accident.
- **Delete the globally-imported component CSS files** (`ServicesSection.css`,
  `ValuesSection.css`, `UpcomingPage.css`, `App.css`) — they are the leak. Their content moves
  into either a primitive (if shared) or a `*.module.css` (if unique).

### 2. Single-primitive design system

Collapse the four section-wrappers and four panels into **one primitive each, plus modifiers**.
Tokens are the single source of truth for every spacing/radius/shadow value.

| Primitive | Canonical spec | Modifiers |
|-----------|----------------|-----------|
| `.section` | full-width themed band: `background-image: var(--section-bg-image)` cover/center; `border-radius: var(--radius-2)`; padding from `--space-*` | `--split` (row: image ∣ panel), `--stack` (column, centered), `--reverse` (mirror via `::before` pseudo — **not** the `scaleX(-1)`-on-all-children hack) |
| `.panel` | `background: var(--bg-color-light)`; `border: 4px solid var(--primary-color)`; `border-radius: var(--radius-2)`; `box-shadow: var(--shadow-2)`; `padding: var(--space-4)` | — |
| `.card` | `.panel` **plus** interactive hover lift (`translateY(-4px) scale(1.02)`) | — |
| `.btn` | single global definition (gradient, hover→`--gradient-reverse`, active grow) | `--shimmer` (optional sweep, replaces `.learnMore`), `--disabled` |
| `.button-row` | the one canonical button row | — |

Reconciliations frozen by this ADR (drift resolved toward the majority / the token):
- Panel border = **4px** (3 of 4 existing panels used 4px).
- Panel/section shadow = **`var(--shadow-2)`**, radius = **`var(--radius-2)`** — always the token,
  never a literal.
- The text-shadow outline becomes a single reusable declaration (utility class or variable),
  defined once.

### 3. Fix the shipped defects as part of the migration

- Remove references to undefined `--accent-color` and `--button-hover`.
- Normalise `--section-bg-image` to the relative `url('../assets/…')` form (the `/src/…` form
  breaks the production build).
- Delete duplicated `reduced-motion` and triple-defined `.menuOverlay` blocks.

## Consequences

- **Positive:** one name per concept; dedup becomes mechanical; the token system finally does its
  job; the class-name collision class of bug is eliminated by the naming rule; a future admin
  portal (see backlog) inherits a clean, predictable style surface.
- **Cost:** a one-time migration pass touching every page and the module files; each page loses
  bespoke section quirks in favour of the shared primitive + a small module tweak.
- **Guardrail:** the boundary rule is only as strong as adherence — "modules never redefine a
  global class" is the line to hold in review.

## Glossary

Design vocabulary defined in [`CONTEXT.md`](../../CONTEXT.md): **section**, **panel**, **card**,
**button**, **button-row**, **primitive**, **token**, **theme**.
