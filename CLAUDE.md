# CLAUDE.md

## Orientation

Read [`DESIGN.md`](./DESIGN.md) first — it's the high-level map of this repo (stack, layout,
routes, theming/config, subsystems, conventions). Open source files only for what you're editing.

Keep `DESIGN.md` current after structural changes (new route/component/subsystem, domain/config
changes, new decisions).

## Commands

- `npm run dev` — dev server (port 5173, LAN-accessible)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run preview` — preview built site

## Editor rules (Spirit Seeds, StoryShapedStudios, Edge of the Map)

These hold across all three repos. The Edge of the Map console is the editor for every site.

- **Every object on a site is in the schema.** If a visitor can see it, the editor pane can read and
  edit it. An element the editor cannot reach serves no purpose: add its field to the site schema
  (`console/schema/sites/<site>.json` in Edge of the Map) and mark it on the page, or remove it.
  Content shown on one document but owned by another (an event on a banner slide) carries
  `data-eotm-from` so Edit opens the owner.
- **Desktop edits reach every resolution.** A layout set on desktop applies to tablet and phone
  unless those modes have their own layout. Review a layout change at all three widths.
- **Layout across modes.** When a layout change is saved and the user has not set all three modes
  (desktop, tablet, phone), the editor asks how the others behave: **Scale smoothly** (default, on)
  or **Custom** (the user sets the layout in all three).
- **Save scope on layout elements.** Every save on a layout element offers: **this element only**,
  **all elements with this class**, or **save as a new custom template**.
