# ADR 0003: The Edge of the Map console replaces TinaCMS

- **Status:** Accepted on the `preview` branch; `main` still runs TinaCMS until cutover
- **Date:** 2026-09-29
- **Deciders:** Chris Baumgart
- **Supersedes:** [ADR 0002](./0002-tinacms-content-management.md) at cutover

## Context

TinaCMS made every deploy depend on TinaCloud indexing the branch, and the live site read its
content from TinaCloud at runtime with no fallback (DESIGN.md §6 recorded both failures). Owner
feedback on Tina: no click-to-edit on the page itself, and no way to size things by dragging.
Edge of the Map now runs one owner console for every customer site (StoryShaped's ADR-0007).

## Decision

Pages and Site Settings are documents in the Edge of the Map console. The console's schema for
this site (`console/schema/sites/spiritseeds.json` on the console branch) mirrors `tina/config.ts`
field for field, so the owner loses nothing:

| Tina | Console |
|---|---|
| Settings collection (title, tagline, logo, season, UI style, menu button, contact email) | `settings` singleton, same fields; the Preview link is help text pointing at `?preview` |
| Page collection with title, menu label, order, show in menu | `page`, same fields |
| Content Section, Service, Embed templates, every field | Blocks of the same names and fields |
| "Linked service" validator (must match a Service heading on the page) | `suggest` on the field: the page's Service headings are offered as you type, a mismatch is flagged at once, and publishing refuses it |
| `useTina` on-page editing | Live preview on the page, plus click-to-edit: pointing at a section shows an Edit button that opens it |
| Image width typed as a number | Also drag-to-size on the page: section width, side-image width, images inside rich text; snap to a 12-column grid or free |
| Media library of `public/uploads` | "Site photos" (every photo already used) or a pasted address; new uploads go to the site's photo bucket |
| Drag to reorder blocks | Move up and down, duplicate, remove |

Rich text changes storage: Markdown in the Tina files, sanitized HTML in the console.
`src/cms/fromTina.js` and `src/cms/markdown.js` convert, and `scripts/import-to-console.mjs`
moves the content in.

## Consequences

- No build-time or runtime TinaCloud dependency. `npm run build` is a plain Vite build.
- Until the console holds pages (or when it cannot be reached), the site renders the bundled
  `content/` files through the same converter, so a console outage shows the last imported
  copy of the Tina content rather than "Page not found".
- **Reconciling at cutover:** `main` keeps taking Tina edits until then. Merge `main` into
  `preview` (content files merge cleanly; `tina/` stays deleted), then run the import with
  `--replace` to carry any Tina edits into the console, and merge to `main`.
- New photos no longer land in the repo, so `optimize-uploads.yml` only covers the photos
  already there. The console resizes photos in the browser before upload instead.
- Unverified: the console rendering on the live SpiritSeeds styles, and the photo bucket (not
  set up yet; uploads answer 503 until it is).
