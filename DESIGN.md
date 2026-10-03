# Live Spirit Seeds Mk2 — Design & Orientation

A token-efficient map of this repo. Read this first; open source only for the file(s) you're about to edit.

## 1. What it is

A static marketing/brochure website for the **Live Spirit Seeds** wellness & massage-therapy
practice. It's a client-side React SPA — no backend, no database, no auth. Page content is
**data, not code**: documents in the Edge of the Map console, which the owner edits on the live
page with `?edit` (ADR 0003), rendered by a single dynamic route (§4). The TinaCMS files under
`content/` are the import source and the offline fallback. Adding a page means adding a content file,
not writing a component.

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
- `npm run build` — production build (plain Vite; no TinaCloud).
- `npm test` — the Tina-to-console conversion tests.
- `npm run import:console` — copy `content/` into the console (`--dry-run`, `--replace`; ADR 0003).
- `npm run lint` — ESLint.
- `npm run preview` — preview the built site.
- `npm run schedule:harvest` — rebuild `content/schedule/melissa.json` from every studio (§6).
  Runs nightly in CI; run it by hand after editing `scripts/lib/schedule-sources.mjs`.

## 3. Layout

```
content/               The TinaCMS content: import source and offline fallback (ADR 0003)
  settings/index.json  Site Settings (theme, siteTitle, tagline, logo, contact)
  pages/*.json         One file per page; filename = route slug; holds blocks[]
  schedule/melissa.json  GENERATED, not owner-edited — the harvested teaching
                       schedule (§6 Teaching schedule). Not a Tina collection.
scripts/
  harvest-schedule.mjs Builds content/schedule/melissa.json from every studio
  import-to-console.mjs Copies content/ into the Edge of the Map console (ADR 0003)
  fromTina.test.mjs    Tests of the conversion (npm test)
  lib/schedule-sources.mjs  Which studios to harvest (add a studio here)
  lib/time.mjs         Timezone helpers shared by the adapters
  lib/adapters/        One per booking platform: healcode (Mindbody),
                       tribe-events (WordPress), momence, punchpass-ics
src/
  main.jsx              App bootstrap: CSS imports + default theme class + render
  App.jsx              Router (dynamic /:slug) + theme load + button-flash effect
  config/siteConfig.js Fallback default theme (SITE_THEME) applied before CMS loads
  cms/site.js          Pages and settings from the console, drafts overlaid; theme helpers
  cms/fromTina.js      Tina files in the console's shape (import and fallback)
  cms/markdown.js      Markdown to HTML for Tina's rich text
  pages/DynamicPage.jsx Finds a Page by slug and renders its blocks
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
| `/:slug`  | `DynamicPage` → the console Page with that slug (404 panel if missing) |

Adding a page = a new Page in the console (`?edit`); it appears in the nav automatically.
`<ScrollToTop>` resets scroll on every route change.

## 5. Domain model

Content is **data**, kept in the Edge of the Map console (ADR 0003). Two types, with the same fields
the Tina collections had; the file paths below are the Tina copies:

- **Settings** (`content/settings/index.json`) — `theme` (`spring`/`summer`/`fall`/`winter`),
  `uiStyle` (`watercolor`/`editorial`/`sanctuary`/`immersive` — see §6 UX styles), `siteTitle`, `tagline`,
  `logo`, `contactEmail`, and `navCtaLabel`/`navCtaUrl` (the navbar action button — rendered only by
  the alternate styles; blank hides it).
- **Page** (`content/pages/*.json`) — `title`, `navLabel`, `order`, `showInNav`, and an ordered
  `blocks[]`. The palette is **three** block types:
  - **`contentSection`** — a general section with a `layout` picker choosing the look:
    `splash` (hero photo with the type stack laid **over** it), `imageText` (image beside text),
    `centered` (centered text), `cardGrid` (heading + grid of mini-cards, e.g. home "Our Services"),
    `values` (labelled **Footer** in the editor: the values in one small line, rendered as
    `<footer class="section footer">`), `event` (announcement + images). `splash` additionally uses `eyebrow`
    (the small tracked line above the heading) and `overlayAlign`
    (`center`/`bottomLeft`/`bottomCenter` — where the text sits on the photo).
  - **`service`** — a bookable offering: `status` (`available`/`coming-soon`), `bookingOptions[]`
    (each with `addOns[]`), plus the shared fields below.
  - **`embed`** — a generic third-party widget: `source` (offeringtree/canva/kit/teaching-schedule/
    other, a label), `mode` (`url` iframe link, `code` raw snippet, **or `schedule`** — the harvested
    teaching schedule, which needs nothing pasted), `url`/`code`, `height`, `caption`, plus
    `scheduleLimit`/`scheduleEmptyText`/`scheduleLinkLabel` for schedule mode. The consolidation
    point for OfferingTree schedules, Canva designs, Kit forms, and class schedules — see §6.

  Both types share: `imageSide`, `imageWidth` (% of the row, 20–70), `spacing`
  (`compact`/`normal`/`airy`), a unified `buttons[]` list, and `showHomeButton`. Each renders
  through a §6 CSS primitive. (Legacy note: files created before this consolidation used six
  templates — `splitSection`/`stackedSection`/`serviceCard`/`cardGrid`/`valuesSection`/
  `eventSection` — migrated 1:1 into the two above.)

(`siteConfig.js` now only holds the fallback default season (`SITE_THEME`) and UI style
(`SITE_UI_STYLE`) applied before the CMS loads.)

## 6. Subsystems

**Content / CMS.** Pages and Site Settings are documents in the Edge of the Map console
(`admin.theedgeofthemap.com`, schema `console/schema/sites/spiritseeds.json` on the console branch),
governed by [ADR 0003](./docs/adr/0003-edge-of-the-map-console-replaces-tinacms.md). `index.html`
loads the console's loader; `src/cms/site.js` reads published documents from the console's public
API and overlays the owner's drafts while the editor is open (`useDocuments`, `useSettings`), which
is the live preview. `DynamicPage` finds the page by slug (`home` is `/`) and passes `blocks[]` to
`Blocks.jsx`, which maps each block type to a CSS primitive.

- **Fallback.** Until the console holds pages, or when it cannot be reached, the bundled Tina files
  under `content/` render instead, converted by `src/cms/fromTina.js` (Markdown to HTML by
  `src/cms/markdown.js`). Settings fall back field by field.
- **On-page editing.** Every section carries `data-eotm-edit`, `data-eotm-item` and
  `data-eotm-size="width"`; side images carry `data-eotm-size="imageWidth"`; rich text carries
  `data-eotm-richtext`; headings and the footer's values carry `data-eotm-text` (a value names its
  row with `data-eotm-in`). The header names `headerImage` and the action bar `actionButtons` with
  `data-eotm-field`. The console turns these into an Edit button and drag handles; from console
  1.2.3 one click on marked text types it in place and opens that field in the pane, and a click
  anywhere else in a marked part opens it at its `data-eotm-field`.
- **The owner's own section types** (console "Your own types") render through
  `components/cms/CustomSection.jsx` from their fields (`useSchema`), in the plain section style
  until given a design. Photos carry the owner's turn, mirror and fade (`components/cms/photo.js`).
- **Photos.** New ones upload to the site's photo bucket through the console; existing ones stay in
  `public/uploads` and are reused by path.

Block-renderer behaviors (`Blocks.jsx`): a `contentSection` dispatches on its `layout`; a `service`
renders the bookable card; an `embed` renders a third-party widget (see **Live embeds** below).
Image sides **auto-alternate** left/right by position (`imageSide:
'auto'`, recomputed on drag-reorder; `left`/`right` pin a side) for the image-bearing looks
(`imageText` + `service`); **image width** is a percent (`imageWidth`, 20–70) applied via the
`--media-basis` CSS custom property so mobile can still force full-width; **vertical spacing**
(`spacing`) maps to `.section--compact`/`.section--airy`. Rich-text bodies are sanitized HTML from the
console, rendered as-is; the Tina files hold Markdown, converted by `src/cms/markdown.js`.

**Unified buttons.** Every block shares one `buttons[]` list. A button is a plain link with a manual
`status` (`active`/`coming-soon` — coming-soon renders non-clickable, prefixed "Coming Soon - "),
**or** it names a `service` on the page and inherits *that* service's availability/link (the same
`Heading → {status, slug, bookUrl}` map used by booking add-ons; typed name validated on save).
`service` blocks additionally carry their own `status` (coming-soon shows a badge and disables
booking) and `bookingOptions[]`; each **booking option** (session) can list `addOns[]`, so every
session gets its own "Book w/ &lt;add-on&gt;" button derived from the referenced service's status
(owner-editable in the editor (`?edit`); no code flag). Every block has a `showHomeButton` toggle (default on).
New pages/blocks start from `ui.defaultItem` presets rather than a blank form. Reusable setup +
gotchas, including the block-model design patterns: [TinaCMS Vite playbook](./docs/tinacms-vite-playbook.md) (§8).

**Live embeds (source consolidation).** The `embed` block (`EmbedBlock` in `Blocks.jsx`) is the one
place to drop any external tool's copy-paste widget so the site stays live off that source instead of
hand-maintained links — OfferingTree schedules/offerings, Canva designs, Kit/ConvertKit forms all
hand you a snippet. Two modes: **`url`** renders a themed `<iframe>` (radius/shadow tokens, so it
reads as part of the site under every UI style) — simplest, best for Canva "smart embed" links and
OfferingTree share URLs; **`code`** renders `RawEmbed`, which sets the snippet as innerHTML **and
re-executes its `<script>` tags** (a script inserted via innerHTML does not run per spec — this is
required for Kit's JS form embeds). Empty blocks show an the editor (`?edit`) hint instead of breaking. The
"Practice With Me" page (`content/pages/practice-with-me.json`) is built from these. OfferingTree has
no public REST API; embed widgets, Zapier, and Google-Calendar sync are the integration surfaces.

**Newsletter signup (Kit).** The `newsletter` mode (`NewsletterEmbed` in `Blocks.jsx`, a thin wrapper
over the shared `NewsletterForm.jsx`, also used by the Connect window) renders **our
own form**, straight on the section's card rather than in a second panel inside it, and POSTs it to `https://app.kit.com/forms/<formId>/subscriptions` — the same
unauthenticated endpoint Kit's HTML embed submits to, so there is **no API key** in the client and
nothing secret in a static build. Kit's field names (`email_address`, `fields[first_name]`) are the
wire contract; everything else (heading, intro, button label, thank-you, fine print) is CMS copy.
Success swaps the form for the thank-you; a non-200, a `status` other than `success`, or a network
failure surfaces a visible error — a silent failure would cost a subscriber with nobody noticing.
Only the **form ID** lives in content (`newsletterFormId`), so pointing at a different Kit form is an
the editor (`?edit`) change.

> **Why not Kit's own embed?** Same reason as the schedule: Kit's JS embed brings Kit's stylesheet
> and can only match **one** season, but the season is owner-switchable at runtime (§6), so a
> Kit-styled form goes out of brand the moment Melissa moves to fall. Our markup reads from the
> season's color tokens and the UI style's type/radius tokens, so it re-skins on both axes for free.
> The `code` mode is still there if a raw Kit snippet is ever needed as a fallback.

**Teaching schedule (multi-studio).** Melissa teaches at several studios; the site shows one merged
list of her upcoming classes without her re-entering anything. A nightly GitHub Action
(`.github/workflows/harvest-schedule.yml`) runs `scripts/harvest-schedule.mjs`, which walks
`scripts/lib/schedule-sources.mjs`, calls one adapter per studio, merges and sorts every class, and
commits `content/schedule/melissa.json`. The commit triggers the host's rebuild; `Blocks.jsx`
**imports that JSON at build time**, so the page has *no* runtime dependency on any studio's booking
widget (the page should not depend on a studio widget at runtime). Rendered by the
`embed` block in `schedule` mode as our own markup, so it inherits the season's colors and each UI
style's type/radius tokens instead of fighting the vendor's stylesheet.

> **Adding a studio is a config change**, not a code change — add an entry to `schedule-sources.mjs`
> — *unless* the studio runs a platform with no adapter yet, which needs a new `lib/adapters/*.mjs`.
>
> **Mindbody/Healcode adapter.** Studios using a `<healcode-widget data-type="schedules">` are served
> by an unauthenticated JSON endpoint the widget itself calls:
> `widgets.mindbodyonline.com/widgets/schedules/<widgetId>/load_markup?options[start_date]=YYYY-MM-DD`.
> It answers `{ class_sessions, calendar, filters }` — `class_sessions` is 7 days of server-rendered
> HTML from `start_date` (loop the date to go further out), and `filters` is a JSON *string* whose
> `trainer` array is the studio's instructor roster. Two traps: the endpoint returns **HTTP 500 if you
> send `Accept: application/json`** even though it answers JSON, and `widgetId` is the **numeric** id
> in that URL, *not* the long hex `data-widget-id` on the element. Match instructors on the
> `data-bw-widget-trainer` attribute, never the displayed name — that's what catches rows Mindbody
> labels "Melissa Carey (substitute)".
>
> **The Events Calendar adapter (`tribe-events.mjs`).** WordPress sites running the Tribe plugin —
> MESA does — expose a public REST API, so no scraping: `<site>/wp-json/tribe/events/v1/events`
> with `start_date`/`end_date`. It hands back structured events including a real per-event page URL
> (used as the session's booking link; Mindbody's widget has none). The catch is that **Tribe has no
> instructor field** — an event's `organizer` is the host org, not the teacher — so this adapter
> matches `instructorPattern` against the event description. MESA writes an explicit
> "Instructor: Melissa Carey" line, which is precise enough to exclude their other programming.
>
> That hook is weaker than Mindbody's trainer id, and it's deliberately biased: matching her **name**
> rather than the class title means that if the class is handed to someone else it silently drops off
> this site, rather than crediting her for a class she isn't teaching. The residual risk is the other
> direction — if MESA stops naming the instructor, her classes vanish with no alert, because we can't
> tell that apart from her not being scheduled.
>
> **Momence adapter (`momence.mjs`)** — All Purpose Yoga. Momence's schedule plugin reads a public
> JSON API, so we call the same endpoint:
> `readonly-api.momence.com/host-plugins/host/<hostId>/host-schedule/sessions`. The richest of the
> four: a numeric `teacherId`, an `isCancelled` flag, and a per-session booking `link`. Match on the
> id — this studio lists her as **"Melissa Christine Carey"**, which a name match tuned to the other
> studios' "Melissa Carey" would miss. `startsAt` is a **UTC instant** and must be converted, or her
> 7pm classes land on the wrong day.
>
> **Punchpass adapter (`punchpass-ics.mjs`)** — CURA. The studio embeds Punchpass in a *cross-origin
> iframe*, which no browser-side filter could read into — but Punchpass also publishes a public iCal
> feed (`<studio>.punchpass.com/org/<orgId>/calendars/all_classes.ics`, org id from the studio's
> `/calendar_feed_info`), and server-side there's no iframe to fight. One request returns months of
> structured classes; we prefer it to the schedule HTML, which paginates by day and pollutes
> `textContent` with inline SVG `<style>` rules. Punchpass exposes no teacher id, so the instructor
> comes from the event's `ORGANIZER;CN=` — which also catches co-taught classes billed as
> "Adriana Wignall & Melissa Carey". Two traps: **unfold** iCal's folded lines (CRLF + space) before
> parsing or long values truncate, and cancellations are marked by a `CANCELED - ` **summary prefix**
> rather than a status field. It's also the only feed with no from-date parameter, so the adapter
> bounds both ends itself.
>
> **Time handling lives in `lib/time.mjs`**, not in the adapters: the four sources express time three
> different ways (already-local strings, local wall time + abbreviation, a UTC instant, and wall time
> + `TZID`). Everything is normalised to the studio's own zone before merging.
>
> **Alerting is deliberately asymmetric.** Zero classes is a *legitimate* result (a week off) and must
> never alert, or the notification gets ignored. The harvester exits non-zero — failing the workflow,
> which emails the repo owner — only when a source is genuinely broken: the fetch failed, the widget
> returned zero sessions for *every* instructor, or Melissa is no longer on the studio's roster (she
> was removed, or the trainer id changed). A failing source keeps its previously harvested classes
> rather than vanishing from the site while someone looks at it.
>
> An outage on the studio's side (HTTP 5xx or 429, or no answer at all) only warns until the same
> source has failed that way on three runs in a row; `sources[].streak` in `melissa.json` counts them.
> A studio's server having a bad night is not worth an email; one down for three days is.
>
> Only the healcode adapter can verify she's *still* a teacher (Mindbody publishes a roster in
> `filters.trainer`). Tribe, Momence and Punchpass expose only the classes actually scheduled, so
> "no classes" and "no longer teaches here" are indistinguishable there — those adapters return
> `trainerOnRoster: true` unconditionally rather than guess.
>
> An adapter opts out of the empty-window check with `emptyWindowIsError: false` (tribe-events does):
> a yoga studio always has *something* on in a fortnight, but a small non-profit's calendar can
> legitimately be empty between programme cycles, and a false alert teaches everyone to ignore it.

**Fonts and text size.** Every rule names its face through `--font-heading`, `--font-subheading` and
`--font-body`, which each UI style sets on `<body>`. Site settings' heading, subheading and body
fonts set the same variables inline on `<body>` (`applyFonts` in `site.js`), which wins over the
style; "The UI style's own" removes them. Text size scales the root font size, and every size is in
rem, so all text moves together. Only faces the site already loads are offered.

**Seasonal theming.** The season lives in the **Settings** doc (console: Site settings, Seasonal
theme). To avoid a theme flash, `main.jsx` applies a season as a `<body>` class **before first
paint**: the one this browser last read from the console (`rememberLook` in `site.js`, localStorage
`ss:look`), else the build-time `content/settings/index.json`, which goes stale as soon as the owner
switches season. The page stays `visibility: hidden` until then (`index.html`);
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

Owner-selectable in the editor (`?edit`) (Settings → **UI Style**). Applied like the season: `main.jsx` bakes
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
on-page in the editor (`?edit`)). Opened by URL (`?preview`, or `?style=immersive&season=winter`),
so ordinary visitors never see it. `utils/preview.js` seeds the choice from those params, holds it in
`sessionStorage` (survives navigation between pages), and **never writes to the CMS**; `App.jsx`
applies any override *after* the saved defaults so it wins, and renders `components/PreviewBar.jsx` —
a tap-friendly bottom toolbar (Style + Season chips) sized for mobile. Exiting restores the saved
defaults and strips the params. The owner then sets the winner as the real default in the editor (`?edit`).

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

**Navigation.** `components/Nav.jsx` (+ `Hamburger.jsx` for mobile) provide site nav. The bar is
`--navbar-height` tall (`variables.css`: 150px, 76px at 768px and under, 64px at 480px and under).
The account button sits left of the title and the menu button right of it, the same inset from
each edge and centred on the bar.

**Under the menu bar, and the account button.** Three pieces added 2026-10-03:

- **Buttons under the menu bar** (`ActionBar.jsx`): fixed at `--navbar-height` on every page, from
  Site settings `actionButtons` (on a phone, `actionButtonsPerRow`: two per row by default, one, or
  all in one row) (bundled default: Book a Session, Practice With Me, Services), plus a
  **Connect** button opening a themed window (`Modal.jsx`, a native `<dialog>` in the panel look)
  with Facebook, Instagram and email as icons (`facebookUrl`, `instagramUrl`, each shown only with its
  `showFacebook` / `showInstagram` switch on, off by default; `contactEmail`), any
  other `socials`, and the newsletter form (`newsletterFormId`) last. `<body>` carries
  `has-action-bar` while it is shown, and `.first-section` clears `--action-bar-height` as well.
- **Account button** (`AccountButton.jsx`, `src/cms/account.js`): the person icon left of the
  title, mirroring the hamburger (end of the inline row on desktop alternate styles). It opens the one account window,
  `AccountModal.jsx`, mounted once in `App` and opened by `openAccount()` from anywhere (the
  newsletter offers an account after a signup when nobody is signed in). Passwords have a show
  button (`PasswordField.jsx`); creating an account asks for it twice; **Can't log in?** asks Neon
  Auth for a link back to `/reset-password` (`pages/ResetPassword.jsx`). Sign in or create an account
  through Neon Auth at `/_edit/auth` on the site's own address; then `POST <console>/handoff` asks
  whether that login edits the site. A member gets an editor token (kept where the loader reads it)
  and **Edit site**; anyone else is a signed-in visitor. **Unverified:** Neon Auth answered
  `INVALID_ORIGIN` for the preview address on 2026-10-03, so sign-in fails until the address is a
  trusted domain in Neon Auth.
- **Next class and event banner** (`nextUp` block, `cms/NextUp.jsx`): the class the owner typed, or
  with no class name the next class on the teaching schedule; below it the earliest `event`
  document dated today or later. With no such event that half is hidden on the site and shown
  dashed, marked hidden, while the editor is open.

## 7. Conventions & gotchas

- **Content, not code, drives availability:** season, UI style (both Settings doc) and
  service/add-on/button status (per `service` block, referenced by name) are owner-editable in
  the editor (`?edit`). `siteConfig.js` now holds only the `SITE_THEME` + `SITE_UI_STYLE` fallbacks.
- **Season and UI style are two independent axes:** season = color, UI style = structure/type.
  A UI style must never set a color token, so any season works under any look (see §6).
- **`content/schedule/*.json` is generated** — edit `scripts/lib/schedule-sources.mjs` instead. It is
  deliberately *not* a Tina collection, so nothing in the editor (`?edit`) can be overwritten by the nightly run.
- **Two styling systems coexist:** global CSS + CSS Modules. Match the component you're editing.
- **CSS load order is load-bearing** — see §6 before reorganizing style imports.
- No tests, no TypeScript, no state management library. Keep it simple.
- `assetsInlineLimit: 0` in the build — assets are always emitted as files, never inlined.

## 8. Decisions

ADRs live in `docs/adr/`; domain vocabulary in [`CONTEXT.md`](./CONTEXT.md).

- [ADR 0001 — Hybrid CSS architecture with a single-primitive design system](./docs/adr/0001-hybrid-css-architecture.md)
- [ADR 0002 — TinaCMS (git-backed) for owner-editable content](./docs/adr/0002-tinacms-content-management.md) (superseded by 0003 at cutover)
- [ADR 0003: The Edge of the Map console replaces TinaCMS](./docs/adr/0003-edge-of-the-map-console-replaces-tinacms.md)

Reusable how-to (portable across repos): [TinaCMS on a Vite + React SPA — Playbook](./docs/tinacms-vite-playbook.md)
— setup recipe, the on-page editing wiring, and a cheap-diagnosis checklist (§7) for editing bugs.
