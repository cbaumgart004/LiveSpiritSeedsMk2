# TinaCMS on a Vite + React SPA — Portable Playbook

A copy-me guide for adding owner-editable content to a Vite/React SPA with **TinaCMS**
(git-backed, no separate backend). Written to be **read once** instead of re-deriving the setup
per repo. If you're an AI assistant onboarding a repo, read **§7 first** — it tells you how to
diagnose editing problems without burning tokens on a browser.

> This repo (Live Spirit Seeds) is the reference implementation. See `tina/config.ts`,
> `src/pages/DynamicPage.jsx`, `src/components/cms/Blocks.jsx`, and [ADR 0002](./adr/0002-tinacms-content-management.md).

---

## 1. Mental model (read this before touching anything)

- **Content is data in git.** Each page is a JSON/MD file in `content/`. Editing in the CMS
  commits to the repo; a push triggers redeploy. Git history *is* the backup.
- **Two layers, don't confuse them:**
  - **Sidebar/form editing** — the `/admin` app. Driven entirely by `tina/config.ts` (the
    schema). Works with zero app wiring. *If the sidebar can edit a field, your schema is fine.*
  - **On-page ("contextual") editing** — click text/images *on the live page* to edit them.
    Requires app wiring: `useTina` + `tinaField(...)`. **This is the part that breaks.**
- **Local mode vs TinaCloud.** Local dev (`tinacms dev`) needs no account — a local GraphQL
  server on `:4001` indexes `content/`. Production auth/content API uses **TinaCloud** (free tier),
  wired via `clientId`/`token`. You can build the entire site in local mode first.
- **Collections** = content types. Here: `settings` (one global doc) + `page` (one file per route).
- **Blocks** = a `list` of `object` with `templates` — the palette the owner adds/reorders on a
  page. Each block template maps to one of your existing CSS components.

---

## 2. Minimal setup on an existing Vite/React SPA

```bash
npm install tinacms @tinacms/cli
```

**`package.json` scripts:**
```json
"dev":   "tinacms dev -c \"vite\"",      // starts Tina GraphQL (:4001) + your vite dev
"build": "tinacms build -c \"vite build\"" // PROD: builds /admin, then the site (see §6 caveat)
```
> ⚠️ A bare `"build": "vite build"` **skips the admin build** — `/admin` will 404 in production and
> the generated client won't be TinaCloud-connected. Only wire `tinacms build` once TinaCloud
> creds exist (§6), or the CI build fails for lack of `clientId`/`token`.

**`.gitignore`:**
```
/public/admin        # generated admin SPA — regenerated on every dev/build; committing it causes
                     # a STALE admin to shadow the dev one (§7)
.env                 # TinaCloud creds live here
```
Keep `tina/__generated__/` **committed** — the app imports the generated client from it.

**`tina/config.ts`** — schema skeleton (full example: this repo's `tina/config.ts`):
```ts
export default defineConfig({
  branch: process.env.TINA_BRANCH || 'main',
  clientId: process.env.TINA_CLIENT_ID || null,   // null = local mode
  token: process.env.TINA_TOKEN || null,
  build: { outputFolder: 'admin', publicFolder: 'public' },   // served at /admin
  media: { tina: { mediaRoot: 'uploads', publicFolder: 'public' } }, // -> public/uploads
  schema: { collections: [ /* settings + page, each field maps to a component prop */ ] },
})
```

---

## 3. The on-page editing wiring (the part everyone gets wrong)

Three things must all be true, or contextual editing silently does nothing:

**A. Fetch through the generated client and keep the whole response.**
`useTina` needs `query` + `variables` + `data`, not just `data`.
```jsx
const res = await client.queries.page({ relativePath })   // { data, query, variables }
```

**B. Feed the whole response to `useTina`, in a child so the hook is unconditional.**
`useTina` *rehydrates the objects with editing metadata* and live-updates them while editing.
```jsx
function PageView({ payload }) {
  const { data } = useTina(payload)          // payload === res
  return <Blocks blocks={data?.page?.blocks} />
}
```
> **If you render `res.data` directly (skipping `useTina`), `tinaField()` returns `''` and nothing
> on the page is editable** — even though the sidebar still works. This is the #1 "editing doesn't
> work" cause. (It's exactly the regression that broke this repo.)

**C. Mark every editable element with `tinaField(object, 'fieldName')`.**
```jsx
<h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>
```
No marker → not clickable on the page. The `object` you pass must be the one that came through
`useTina` (it carries the metadata); a plain object from `client.queries` won't resolve.

---

## 4. Rich-text: storage format vs render (the `[object Object]` trap)

**Two different representations — do not confuse them:**
- **On disk (JSON collection): a markdown STRING.** `"description": "Melissa uses tools…\n"`.
- **In GraphQL / at render time: an AST object** `{type:'root', children:[…]}`, which you render
  with `TinaMarkdown` — never as `{block.body}` (that throws "Objects are not valid as a React
  child").
```jsx
import { TinaMarkdown } from 'tinacms/dist/rich-text'
<TinaMarkdown content={block.body} />
```

> **⚠️ The expensive bug (hit in this repo):** if a migration/seed writes rich-text to the JSON file
> as the **AST object** instead of a markdown string, Tina can't read it — it does `String(obj)` →
> `"[object Object]"`, then parses *that* as markdown. Every body renders the literal text
> **`[object Object]`**, and the first CMS save overwrites the real text with it. **Tell-tale:** the
> GraphQL API returns `{...,"text":"[object Object]"}` even though the file on disk looks fine.
> **Fix:** store rich-text as markdown strings. To see the correct on-disk shape, edit any
> rich-text field once in `/admin` and read how Tina re-serialized the file — that's ground truth.
> Migration snippet (AST → markdown for plain `root/p/text`): walk the tree, join `p` text with
> `\n\n`. Guard the renderer too: `typeof c === 'string' ? <p>{c}</p> : <TinaMarkdown content={c} />`.

---

## 5. Images

- **Fixed image field** (`{type:'image'}`): render `<img src={block.image}>` and make it
  click-to-edit by marking its wrapper: `data-tina-field={tinaField(block, 'image')}`. Clicking
  opens the media picker.
- **Image list** (`{type:'image', list:true}`): mark the container with
  `tinaField(block, 'images')`.
- **Inline images inside rich-text**: work out of the box — the rich-text toolbar has an image
  button once `media` is configured (§2), and `TinaMarkdown` renders embedded `img` nodes by
  default. Pass `components={{ img: … }}` only if you need custom styling.
- Media is **repo-based** here (`public/uploads`) — free, no external bucket. Optionally compress
  on push with a CI action.

---

## 6. Production / TinaCloud (do last)

1. Create a free TinaCloud project, point it at the GitHub repo.
2. Put `TINA_CLIENT_ID` / `TINA_TOKEN` in the host's env (Vercel) and local `.env`.
3. Switch `build` to `tinacms build -c "vite build"` so `/admin` ships and the client talks to
   TinaCloud. Editors log in at `/admin`; edits commit to the branch → redeploy (~1 min).
4. **Allowlist every origin in TinaCloud → Site URLs.** TinaCloud gates which origins may call it —
   both `/admin` login *and* browser content reads. Add the custom domain **and** the Vercel
   deploys (`https://*.vercel.app` covers all previews) **and** `http://localhost:5173`. An origin
   that's missing has its content reads blocked, so that deploy shows the app's "Page not found" on
   every page even though the build succeeded (classic tell: custom domain works, `*.vercel.app`
   preview doesn't).

Until then, everything works locally in local mode — build and demo offline first.

> ⚠️ **Resolve the branch from the deploy — don't pin `TINA_BRANCH`.** TinaCloud serves content
> **per git branch** (the client URL ends in `/github/<branch>`), so a preview deploy must query its
> *own* branch or it builds this branch's code against another branch's content and pages come up
> empty or 404. Derive it from the host's built-in branch variable instead of hardcoding:
>
> ```js
> branch:
>   process.env.TINA_BRANCH ||          // manual override; normally UNSET
>   process.env.VERCEL_GIT_COMMIT_REF || // Vercel
>   process.env.CF_PAGES_BRANCH ||       // Cloudflare Pages
>   'main',
> ```
>
> **`TINA_BRANCH` set in the host dashboard beats all of them**, which makes it a trap: a value left
> over from a branch that no longer exists silently breaks every later deploy, and the error names a
> branch you can't find in `git branch -a`. Leave it unset. A host that sets neither built-in (or a
> local `npm run build`) falls through to `main`, so verify the fallback is what you want before
> relying on it. (Also: setting env vars alone changes nothing until `build` runs `tinacms build`;
> a bare `vite build` ignores them and leaves the client on `localhost:4001` — see §2.)

---

## 7. Diagnosing editing issues cheaply (AI onboarding checklist)

**Do NOT** install a headless browser or spin up screenshots first — the failures below are
diagnosable from files + two shell commands. Spend tokens here, not on browser automation.

1. **Is the backend healthy?** `npm run dev`, then:
   ```bash
   curl -s -X POST http://localhost:4001/graphql -H "Content-Type: application/json" \
     -d '{"query":"{ page(relativePath:\"home.json\"){ title blocks{ __typename } } }"}'
   ```
   Returns data → schema + content + generated client are fine; the bug is in the app wiring, not
   Tina. (Startup log should show "TinaCMS Dev Server is active" with no schema errors.)

2. **Symptom → cause map:**

   | Symptom | Cause | Fix |
   |---|---|---|
   | Sidebar edits work, but page elements aren't clickable | `useTina` not feeding the render, or no `tinaField` markers | §3 B + C |
   | `[object Object]` on the page (GraphQL `text` field literally returns it) | rich-text stored on disk as an AST object, not a markdown string | §4 |
   | "Objects are not valid as a React child" crash | rich-text AST rendered as a raw child (missing `TinaMarkdown`) | §4 |
   | `/admin` 404s in production (fine locally) | `build` skips `tinacms build` | §2 / §6 |
   | Deploy shows the app's "Page not found" on **every** page (creds set, `/admin` may also 404) | `build` is a bare `vite build`, so the committed client still points at `localhost:4001` and every content query fails in prod | §6 (switch `build` to `tinacms build -c "vite build"`) |
   | Preview deploy pages empty/404 but Production is fine (or vice-versa) | the deploy queried the wrong branch's content | §6 (resolve the branch from the host, don't pin it) |
   | Build fails naming a branch that **doesn't exist** (`git branch -a` doesn't list it) | a stale `TINA_BRANCH` pinned in the host dashboard — it overrides the per-deploy branch resolution | §6 (delete the dashboard var; don't repoint it) |
   | Build succeeds but that branch's pages 404 (branch is real and current) | branch never **indexed** in TinaCloud — picking a branch doesn't create it | open the branch once in the TinaCloud dashboard |
   | One origin shows "Page not found" everywhere while the custom domain works (build succeeded, creds fine) | that origin (e.g. `*.vercel.app` preview) isn't in TinaCloud's **Site URLs** allowlist, so content reads are blocked | §6 (add the origin in TinaCloud → Site URLs) |
   | Console: CORS preflight fails, `Access-Control-Allow-Origin` header **`contains the invalid value 'not-allowed'`** | same as above — `not-allowed` is TinaCloud's literal "origin not in the allowlist" reply, not a broken server. The refused origin is in the error text | §6. Allowlist `https://*.vercel.app`, **not** the individual deploy URL — the `<project>-<hash>` part is regenerated on every push |
   | Stale/blank admin, wrong data | committed `public/admin` shadowing the dev build | gitignore it (§2) |
   | Field can't be edited even in sidebar | schema issue in `tina/config.ts` | fix the collection/field |
   | **Fields (esp. new/nested ones) vanish from content after an editor saves** | the admin tab was loaded **before** a schema change; Tina saves rewrite the *whole* document from the in-browser form, dropping fields that form doesn't know about | **hard-refresh `/admin` after every schema change, before editing.** Restart `tinacms dev` too so the generated client/admin match `config.ts` |

   > ⚠️ **The save-clobber trap (cost us real time):** Tina writes the entire document on save, not a
   > patch. Editing schema and content in parallel — or leaving an old `/admin` tab open across a
   > `config.ts` change — means the next save serializes a stale shape and silently strips the newer
   > fields (and can add junk empty list items). Sequence: change schema → restart dev → hard-refresh
   > `/admin` → *then* edit. Deep nesting (list-of-objects inside list-of-objects) is the most fragile.

3. **Files that matter (read only these):** `tina/config.ts` (schema), the page loader
   (`useTina` wiring), the block renderer (`tinaField` + `TinaMarkdown`). Content shape:
   `node -e "console.log(require('./content/pages/home.json').blocks[0].body)"`.

4. **Reasoning shortcut:** "sidebar works but on-page doesn't" is *always* an app-wiring problem
   (§3), never a Tina/schema problem. Don't reindex, reinstall, or rebuild to chase it.

---

## 8. Keeping the block palette owner-friendly (design patterns)

The palette is the owner's whole mental model. A pile of near-identical templates ("Image + Text",
"Text Block", "Card Grid", "Event"…) makes "add a component" a guessing game. Patterns that fixed
that here, all achievable with **plain schema fields** — no custom UI:

- **Few types + a Layout selector, not many types.** Collapse the visual variants into **one**
  template with a `layout` string field whose options are the looks (`Image + Text`, `Centered`,
  `Card Grid`, …). The renderer switches on `block.layout`. One "Content Section" the owner
  reaches for, plus a purpose-built "Service" for anything bookable — two choices, not six.
  Trade-off: all fields for every layout show in the sidebar (Tina has no built-in
  show-field-when); guide with each field's `description` ("Used by the Event layout").

- **One button model, optionally tied to a service.** Give every block the same reusable
  `buttons` list. Each button is a plain link with a manual `status` (`active`/`coming-soon`) —
  **or** it names a `service` on the page and inherits *that* service's status. Derive the
  disabled/href state in the renderer from a `Heading → {status, slug, bookUrl}` map you build once
  from the Service blocks. Validate the typed service name in the field's `ui.validate` against the
  page's Service headings so a typo can't silently ship a dead button. This is strictly more
  flexible than per-type bespoke buttons and it's the *same* mechanism booking add-ons already use.

- **"Resize" with a value, not a drag handle.** TinaCMS has **no native drag-to-resize**; building
  handles means custom field components you maintain against upgrades. A numeric/select field gets
  ~all the value for ~none of the cost: e.g. image width as a **percent** (`imageWidth`, 20–70) and
  block spacing as a **compact/normal/airy** select. Apply width via a **CSS custom property**
  (`style={{ '--media-basis': pct }}`, CSS `flex-basis: var(--media-basis, 45%)`) rather than an
  inline `flex-basis`, so the mobile stylesheet can still force full-width stacking.

- **Make "add a page/block" land on something, not a blank slate.** Collection `ui.defaultItem`
  pre-fills a new document (nav on, an opening block); template `ui.defaultItem` sets sane block
  defaults (`spacing: 'normal'`, `imageSide: 'auto'`, `showHomeButton: true`). The editor starts
  from a working example instead of decoding an empty form.

- **"Preview the type" is mostly already built.** `/admin` on-page contextual editing renders each
  block live as you edit — that *is* the preview. A thumbnail in the add-block menu is custom UI and
  usually not worth it; documenting the layouts (like this section) covers the gap.

> After any of these schema changes: **restart `tinacms dev` and hard-refresh `/admin`** before
> editing, or the save-clobber trap (§7) strips your new fields on the next save. Consolidating
> templates also means **migrating existing content files** (rename `_template`, map old size
> buckets to the new field) — do it in one script, then re-index.
