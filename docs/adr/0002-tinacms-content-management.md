# ADR 0002 — TinaCMS (git-backed) for owner-editable content

- **Status:** Accepted
- **Date:** 2026-07-12
- **Deciders:** Chris Baumgart

## Context

Content is currently hand-coded JSX; any change (price, event, new section) requires Chris to
edit code and deploy (see [ADR 0001] backlog). The goal is to let the practice owner (Melissa)
edit content herself: upload images, add/remove sections, drag-drop to reorder them, and edit
title/body text with the site's existing formatting.

Requirements that shaped the choice:
- **On-page editing** — Melissa strongly prefers editing the live site directly, not a separate
  back-office form.
- **Low/no cost** and **low maintenance** — Chris owns backups/ops and wants minimal burden.
- **Keep the Vite/React SPA** — Chris is newer to coding and chose Vite deliberately; a Next.js
  migration is undesirable.
- **Reusable** — another of Chris's clients needs inline images, so the pattern should extend to
  rich content.

Options considered: hosted structured CMS (Sanity), self-hosted CMS on Railway (Payload/Strapi),
and git-backed visual CMS (TinaCMS). Fully custom (auth + editor + storage) was rejected as too
much work and too much security surface for one editor.

## Decision

Adopt **TinaCMS**, git-backed, on the **existing Vite/React SPA**.

- **Editing model:** on-page contextual editing via the `useTina` React hook (React-specific;
  supported on our React 18.3). Melissa edits at `/admin`, sees the page live, drags blocks to
  reorder, and uploads images inline.
- **Storage = git:** content lives as markdown/JSON in the repo. Edits commit to the repo and
  trigger a Vercel redeploy. Git history *is* the backup — nothing extra to run.
- **Auth/hosting:** **TinaCloud free tier** ($0, 2 users: Melissa + Chris) provides editor login
  and the content API for production. Local development uses Tina's local mode (no account
  needed), so we build and test entirely offline first.
- **Content ↔ design:** content blocks map onto the existing CSS primitives from [ADR 0001]
  (`.section` + `--split`/`--stack`/`--reverse`, `.panel`, `.card`, `.btn`). This preserves the
  established formatting and seasonal theming; the editor fills primitives with data.
- **Two collections:**
  - **Settings** (single global document) — owner-editable `theme` (replaces the build-time
    `SITE_THEME` constant), site title, contact email. The app reads it and sets the `<body>`
    theme class at load.
  - **Page** (one content file per page) — `title`, `navLabel`, `order`, `showInNav`, and an
    ordered `blocks[]` array (the block palette). The filename is the route slug.
- **Dynamic pages + generated nav:** routing moves from hardcoded routes in `App.jsx` to a
  dynamic `/:slug` that loads the matching Page and renders its blocks (`/` = the `home` page).
  The nav is generated from the Page collection — new pages appear automatically, ordered by
  `order`, hideable via `showInNav`. This is the mechanism that lets the owner add pages and
  reorder the nav without a developer.

## Consequences

- **Positive:** owner self-service without a custom backend; git-based backups; no new hosting or
  DB to run; stays on the familiar Vite stack; the block/primitive pattern reuses for the
  inline-image client.
- **Cost / caveats:**
  - The public pages must be **refactored from hardcoded JSX to render from Tina content** (a
    block renderer per block type). Current content gets migrated into content files (seed).
  - Contextual editing is React-only (fine here) and its smoothest DX is documented around
    Next.js; on Vite it works via `useTina` but needs manual wiring of the `/admin` build and the
    generated client.
  - ~1-minute redeploy latency after an edit — acceptable at this site's low change volume.
  - TinaCloud is a third-party dependency for production auth; self-hosting the Tina backend
    (Auth.js + Mongo/Postgres, all open-source/Apache-2.0) remains an escape hatch if needed.

## Glossary

New terms (**block**, **collection**, **content file**) to be added to [`CONTEXT.md`](../../CONTEXT.md)
as the schema is built.
