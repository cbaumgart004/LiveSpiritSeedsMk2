/* eslint-disable react/prop-types */
// Renders a page's blocks[] into the CSS primitives from ADR 0001.
// There are two block types: a "Content Section" (whose `layout` picks one of
// several looks) and a "Service" (bookable). tinaField(block, 'field') marks a
// region as click-to-edit inside /admin; for it to resolve, blocks must arrive
// via useTina (see DynamicPage) — the hook stamps the editing metadata onto each
// block object.
import { useEffect, useRef, useState } from 'react'
import { tinaField } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import ValuesSection from '../ValuesSection/ValuesSection'
import TaglineArt from '../TaglineArt'

// Which side the image sits on. 'left'/'right' are explicit overrides from the
// editor; anything else ('auto' or empty) alternates by position so images
// zig-zag down the page — and re-alternate automatically when blocks are
// dragged to reorder (mediaIndex is recomputed on every render).
function resolveSide(block, mediaIndex) {
  if (block.imageSide === 'left' || block.imageSide === 'right') return block.imageSide
  return mediaIndex % 2 === 1 ? 'right' : 'left'
}

// Vertical breathing room modifier (editor "Vertical Spacing" field).
function spacingClass(block) {
  return block.spacing === 'compact'
    ? ' section--compact'
    : block.spacing === 'airy'
      ? ' section--airy'
      : ''
}

function sectionClass(base, side, isFirst, block) {
  const reverse = side === 'right' ? ' section--reverse' : ''
  const first = isFirst ? ' first-section' : ''
  return `${base}${reverse}${first}${spacingClass(block)}`
}

// Does a rich-text field actually contain anything? Clearing the text in /admin
// leaves an AST shell ({ type: 'root', children: [ an empty paragraph ] }), which
// is truthy — so a plain `block.body &&` check would still render an empty panel.
// Images count as content even though they carry no text.
function hasRichText(content) {
  if (!content) return false
  if (typeof content === 'string') return content.trim().length > 0
  const walk = (node) => {
    if (!node || typeof node !== 'object') return false
    if (typeof node.text === 'string' && node.text.trim()) return true
    if (node.type === 'img' || node.url) return true
    return Array.isArray(node.children) && node.children.some(walk)
  }
  return walk(content)
}

// Renders a rich-text (AST) field. Rich-text bodies are objects; TinaMarkdown
// renders them — including any inline images the editor embeds. The string
// guard keeps a hand-edited/plain-text value from rendering as [object Object].
function Body({ block, name }) {
  const content = block[name]
  if (!content) return null
  return (
    <div data-tina-field={tinaField(block, name)}>
      {typeof content === 'string' ? <p>{content}</p> : <TinaMarkdown content={content} />}
    </div>
  )
}

// Editable image whose width is editor-controlled: `imageWidth` (a percentage,
// 20–70) is passed to CSS as the custom property --media-basis, which sets the
// image column's flex-basis on desktop. We set the CSS var (not flex-basis
// directly) so the mobile stylesheet can still force full-width stacking.
function Media({ block, name = 'image', alt, width }) {
  if (!block[name]) return null
  const style =
    typeof width === 'number' && width > 0 ? { '--media-basis': `${width}%` } : undefined
  return (
    <div className="media" style={style} data-tina-field={tinaField(block, name)}>
      <img src={block[name]} alt={alt || ''} />
    </div>
  )
}

// A single call-to-action button. Two modes:
//  - Linked to a service (btn.service set): availability + link derive from that
//    service's status (disabled "Coming Soon" if it's coming-soon or missing).
//  - Plain button: uses its own manual status (coming-soon renders disabled).
function ButtonItem({ btn, services }) {
  const linked = btn.service?.trim()
  if (linked) {
    const ref = services?.[linked.toLowerCase()]
    const text = btn.label || btn.service
    if (!ref || ref.status === 'coming-soon') {
      return (
        <span className="btn btn--disabled" aria-disabled="true">
          Coming Soon - {text}
        </span>
      )
    }
    const href = btn.url || ref.bookUrl || (ref.slug ? `#${ref.slug}` : '#')
    return (
      <a className="btn" href={href}>
        {text}
      </a>
    )
  }
  if (btn.status === 'coming-soon') {
    return (
      <span className="btn btn--disabled" aria-disabled="true">
        Coming Soon - {btn.label}
      </span>
    )
  }
  return (
    <a className="btn" href={btn.url}>
      {btn.label}
    </a>
  )
}

function Buttons({ block, services }) {
  const items = block.buttons
  if (!items?.length) return null
  return (
    <div className="button-row" data-tina-field={tinaField(block, 'buttons')}>
      {items.map((btn, i) => (
        <ButtonItem key={i} btn={btn} services={services} />
      ))}
    </div>
  )
}

// Optional "Home" button (links to the home page). On by default: renders
// unless the editor explicitly turned it off (showHomeButton === false).
function HomeButton({ block }) {
  if (block.showHomeButton === false) return null
  return (
    <div className="button-row">
      <a className="btn" href="/">
        Home
      </a>
    </div>
  )
}

// Splash / hero: a full-width photo with the type stack laid OVER it, rather
// than a panel of text sitting above an image. This is the one block whose shape
// each UI style rewrites (height, alignment, scrim, type scale) — see the
// per-style `.section--splash` rules in ui-styles.css.
//
// Deliberately does NOT use the `.media` class: the reveal animations key off
// `.media`, and a splash should never be offset by a scroll reveal.
const OVERLAY_ALIGN = {
  bottomLeft: ' splash--bottom-left',
  bottomCenter: ' splash--bottom-center',
  center: '',
}

function SplashSection({ block, isFirst, services }) {
  const align = OVERLAY_ALIGN[block.overlayAlign] ?? ''
  // Three ways to show the tagline artwork (Tina "Tagline Artwork"):
  //   none   – ordinary splash: photo behind, the block's own type over it.
  //   beside – two-up banner, artwork next to the photo. The brushstroke bands
  //            span both columns so the pair reads as one picture.
  //   over   – photo and artwork side by side but LAPPED: the photo sits left,
  //            the artwork laps 15% back over it and stays semi-transparent
  //            where it crosses so the photograph reads through the overlap.
  // `withTagline` is the original boolean, kept so existing content still works.
  const placement = block.taglinePlacement || (block.withTagline ? 'beside' : 'none')
  const base = sectionClass('section section--splash', null, isFirst, block)

  if (placement === 'over') {
    const blend = Math.min(100, Math.max(10, block.taglineBlend || 90)) / 100
    return (
      <section className={`${base} splash--lap`} style={{ '--tagline-blend': blend }}>
        {/* Buttons lead the section here, not trail it — they are the first
            thing in the hero rather than a footnote under the artwork. */}
        <Buttons block={block} services={services} />
        <div className="splash__content">
          {block.image && (
            <img
              className="splash__photo"
              src={block.image}
              alt={block.title || ''}
              data-tina-field={tinaField(block, 'image')}
            />
          )}
          <div className="splash__artwork">
            <TaglineArt />
          </div>
        </div>
      </section>
    )
  }

  const pair = placement === 'beside'
  const cls = `${base}${pair ? ' splash--pair' : align}`

  if (pair) {
    return (
      <section className={cls}>
        <div className="splash__blend splash__blend--top" aria-hidden="true" />
        <div className="splash__blend splash__blend--bottom" aria-hidden="true" />
        <div className="splash__content">
          <TaglineArt />
          {block.image && (
            <img
              className="splash__photo"
              src={block.image}
              alt={block.title || ''}
              data-tina-field={tinaField(block, 'image')}
            />
          )}
        </div>
        {/* The artwork carries the words, but the call to action still needs to
            be a real link, so buttons stay below the pair. */}
        <Buttons block={block} services={services} />
      </section>
    )
  }

  return (
    <section className={cls}>
      {block.image && (
        <div className="splash__media" data-tina-field={tinaField(block, 'image')}>
          <img src={block.image} alt="" />
        </div>
      )}
      <div className="splash__scrim" aria-hidden="true" />
      <div className="splash__content">
        {block.eyebrow && (
          <p className="splash__eyebrow" data-tina-field={tinaField(block, 'eyebrow')}>
            {block.eyebrow}
          </p>
        )}
        {block.title && (
          <h2 className="splash__title" data-tina-field={tinaField(block, 'title')}>
            {block.title}
          </h2>
        )}
        <div className="splash__body">
          <Body block={block} name="body" />
        </div>
        <Buttons block={block} services={services} />
      </div>
    </section>
  )
}

function SplitSection({ block, isFirst, side, services }) {
  return (
    <section className={sectionClass('section section--split', side, isFirst, block)}>
      <Media block={block} alt={block.title} width={block.imageWidth} />
      <div className="panel">
        {block.title && <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>}
        <Body block={block} name="body" />
        <Buttons block={block} services={services} />
        <HomeButton block={block} />
      </div>
    </section>
  )
}

function StackedSection({ block, isFirst, services }) {
  return (
    <section className={sectionClass('section section--stack', null, isFirst, block)}>
      {block.title && <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>}
      {/* Skip the panel when there's no body — an empty one renders as a bare
          bordered strip, which is what a heading-only section used to look like. */}
      {hasRichText(block.body) && (
        <div className="panel">
          <Body block={block} name="body" />
        </div>
      )}
      <Buttons block={block} services={services} />
      <HomeButton block={block} />
    </section>
  )
}

// Stable anchor id for a service card, so add-on/linked buttons can jump to it.
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// One add-on booking button, connected to the referenced service. Disabled
// "Coming Soon" while that service is coming-soon (or missing); otherwise it
// links to — in priority order — this session's explicit add-on URL, the
// referenced service's own booking URL, or an on-page anchor to its card.
function AddOnButton({ addOn, services }) {
  if (!addOn.service?.trim()) return null
  const ref = services?.[addOn.service.trim().toLowerCase()]
  if (!ref || ref.status === 'coming-soon') {
    return (
      <span className="btn btn--disabled" aria-disabled="true">
        {addOn.service} - Coming Soon
      </span>
    )
  }
  const href = addOn.bookUrl || ref.bookUrl || (ref.slug ? `#${ref.slug}` : '#')
  return (
    <a className="btn" href={href}>
      Book w/ {addOn.service}
    </a>
  )
}

function ServiceBlock({ block, isFirst, side, services }) {
  const options = block.bookingOptions || []
  const comingSoon = block.status === 'coming-soon'
  return (
    <section
      id={slugify(block.title)}
      className={sectionClass('section section--split', side, isFirst, block)}
    >
      <Media block={block} alt={block.title} width={block.imageWidth} />
      <div className="panel">
        {block.title && (
          <h2 data-tina-field={tinaField(block, 'title')}>
            {block.title}
            {comingSoon && <span className="status-badge">Coming Soon</span>}
          </h2>
        )}
        <Body block={block} name="description" />
        {/* Each session gets its own row: the base booking button plus one
            "Book w/ <add-on>" button per add-on offered on that session. */}
        {options.map((opt, i) => (
          <div key={i}>
            <div className="button-row">
              {comingSoon ? (
                // A Coming Soon service can't be booked yet.
                <span className="btn btn--disabled" aria-disabled="true">
                  {opt.label} - Coming Soon
                </span>
              ) : (
                <>
                  <a className="btn" href={opt.bookUrl}>
                    {opt.label}
                  </a>
                  {(opt.addOns || []).map((addOn, j) => (
                    <AddOnButton key={j} addOn={addOn} services={services} />
                  ))}
                </>
              )}
            </div>
            {opt.note && <p style={{ fontSize: '0.85rem' }}>{opt.note}</p>}
          </div>
        ))}
        {/* Extra call-to-action buttons beyond the booking sessions. */}
        <Buttons block={block} services={services} />
        <HomeButton block={block} />
      </div>
    </section>
  )
}

function CardGrid({ block, isFirst, services }) {
  const cards = block.cards || []
  return (
    <section className={sectionClass('section section--stack', null, isFirst, block)}>
      {block.title && <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>}
      <div className="grid" data-tina-field={tinaField(block, 'cards')}>
        {cards.map((card, i) => (
          <div className="card" key={i}>
            {card.image &&
              (card.buttonUrl ? (
                <a className="card-thumb" href={card.buttonUrl}>
                  <img src={card.image} alt={card.title || ''} loading="lazy" />
                </a>
              ) : (
                <div className="card-thumb">
                  <img src={card.image} alt={card.title || ''} loading="lazy" />
                </div>
              ))}
            {card.title && <h3>{card.title}</h3>}
            {card.description && <p>{card.description}</p>}
            {card.buttonLabel && (
              <div className="button-row">
                <a className="btn" href={card.buttonUrl}>
                  {card.buttonLabel}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
      <Buttons block={block} services={services} />
      <HomeButton block={block} />
    </section>
  )
}

function EventSection({ block, isFirst, services }) {
  return (
    <section className={sectionClass('section', null, isFirst, block)}>
      <div className="panel">
        {block.title && <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>}
        <Body block={block} name="body" />
        <div data-tina-field={tinaField(block, 'images')}>
          {(block.images || []).map(
            (src, i) =>
              src && (
                <div className="media" key={i}>
                  <img src={src} alt="" />
                </div>
              )
          )}
        </div>
        <Buttons block={block} services={services} />
        <HomeButton block={block} />
      </div>
    </section>
  )
}

// Renders a pasted embed snippet. A <script> inserted via innerHTML does NOT
// run (HTML spec), so we clone each one into a fresh <script> the browser will
// execute — this is what makes Kit/ConvertKit (and any script-based) embeds
// actually load. Non-script HTML/iframes in the snippet render as-is.
function RawEmbed({ html }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = html || ''
    el.querySelectorAll('script').forEach((old) => {
      const s = document.createElement('script')
      for (const attr of old.attributes) s.setAttribute(attr.name, attr.value)
      s.textContent = old.textContent
      old.replaceWith(s)
    })
    return () => {
      el.innerHTML = ''
    }
  }, [html])
  return <div className="embed-raw" ref={ref} />
}

// Newsletter mode. Kit's JS embed ships Kit's own stylesheet, so it can only
// ever match ONE season — and the season is owner-switchable from /admin, so
// that form would drift out of brand the moment Melissa moves to fall. Same
// call as the teaching schedule (DESIGN.md §6): render our own markup and post
// to the vendor, rather than fight the vendor's stylesheet.
//
// This is the unauthenticated endpoint Kit's own HTML embed submits to, so
// there is NO api key here and nothing secret to leak from a static site.
// Field names (`email_address`, `fields[first_name]`) are Kit's, not ours.
const kitEndpoint = (formId) => `https://app.kit.com/forms/${formId}/subscriptions`

const GENERIC_ERROR = 'That didn’t go through. Please try again in a moment.'

// Kit answers 200 even when it refuses the signup, so the HTTP status alone
// tells us nothing — `status` in the body is the real verdict. On failure it
// returns {errors: {fields: [...], messages: [...]}}.
//
// Only a complaint about the ADDRESS is worth repeating to the visitor ("Email
// address is invalid") — that is something they can fix. A form-level error
// means the form id is wrong or the form was deleted, which reads as gibberish
// to a visitor ("Form Couldn't find a form for this request", six times over)
// and is Melissa's to fix, so it gets the generic wording instead.
function kitErrorMessage(data) {
  const fields = data?.errors?.fields
  const message = data?.errors?.messages?.[0]
  if (message && Array.isArray(fields) && fields.includes('email_address')) return message
  return GENERIC_ERROR
}

function NewsletterEmbed({ block }) {
  const formId = String(block.newsletterFormId || '').trim()
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(GENERIC_ERROR)

  async function handleSubmit(e) {
    e.preventDefault()
    if (status === 'sending') return
    // Grab the node before the first await — React nulls currentTarget out as
    // soon as the event is done being dispatched.
    const form = e.currentTarget
    const body = new FormData(form)
    setStatus('sending')
    try {
      const res = await fetch(kitEndpoint(formId), {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body,
      })
      const data = await res.json().catch(() => null)
      // A silent no-op that still looks like it worked is the one outcome worse
      // than an error: she'd never know she lost the subscriber.
      if (!res.ok || data?.status !== 'success') {
        setError(kitErrorMessage(data))
        setStatus('error')
        return
      }
      form.reset()
      setStatus('success')
    } catch {
      // Network failure — no response body to read, so nothing specific to say.
      setError(GENERIC_ERROR)
      setStatus('error')
    }
  }

  if (!formId) {
    return (
      <div className="panel embed-placeholder">
        <p>
          Add your Kit <strong>form ID</strong> in <strong>/admin</strong> to turn this into
          a signup form.
        </p>
      </div>
    )
  }

  return (
    <div className="panel newsletter">
      {block.newsletterIntro && (
        <p className="newsletter__intro" data-tina-field={tinaField(block, 'newsletterIntro')}>
          {block.newsletterIntro}
        </p>
      )}

      {status === 'success' ? (
        <p className="newsletter__note newsletter__note--ok" role="status">
          {block.newsletterSuccess || 'Thank you — check your inbox to confirm.'}
        </p>
      ) : (
        <form
          className="newsletter__form"
          onSubmit={handleSubmit}
          action={kitEndpoint(formId)}
          method="post"
        >
          {block.newsletterAskName && (
            <label className="newsletter__field">
              <span className="newsletter__label">First name</span>
              <input
                className="newsletter__input"
                type="text"
                name="fields[first_name]"
                autoComplete="given-name"
                placeholder={block.newsletterNamePlaceholder || 'First name'}
              />
            </label>
          )}
          <label className="newsletter__field">
            <span className="newsletter__label">Email address</span>
            <input
              className="newsletter__input"
              type="email"
              name="email_address"
              required
              autoComplete="email"
              placeholder={block.newsletterPlaceholder || 'your@email.com'}
            />
          </label>
          <button className="btn" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : block.newsletterButtonLabel || 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="newsletter__note newsletter__note--error" role="alert">
          {error}
        </p>
      )}

      {block.newsletterFinePrint && (
        <p className="newsletter__fine" data-tina-field={tinaField(block, 'newsletterFinePrint')}>
          {block.newsletterFinePrint}
        </p>
      )}
    </div>
  )
}

// Melissa's classes across every studio she teaches at, harvested nightly by
// scripts/harvest-schedule.mjs. Imported at build time (not fetched) so the page
// has no runtime dependency on any studio's booking widget — the Action commits
// this file, which triggers a rebuild. See DESIGN.md §6 (Teaching schedule).
import scheduleData from '../../../content/schedule/melissa.json'

// 'YYYY-MM-DD' → "Sunday, August 2". Built from parts, not new Date(string),
// which parses a bare date as UTC and lands on the previous day west of GMT.
function formatDay(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function groupByDay(sessions) {
  const days = []
  for (const s of sessions) {
    const last = days[days.length - 1]
    if (last && last.date === s.date) last.sessions.push(s)
    else days.push({ date: s.date, sessions: [s] })
  }
  return days
}

// Schedule mode. Renders the harvested classes as our own markup rather than a
// studio widget, so it themes under every UI style and can't break the page.
// An empty list is a NORMAL result (a week off), so it gets a real message and a
// way through to the studio — never a blank panel that reads as broken.
function ScheduleEmbed({ block }) {
  const all = scheduleData.sessions || []
  const limit = Number(block.scheduleLimit) || 0
  const sessions = limit > 0 ? all.slice(0, limit) : all
  const studios = scheduleData.studios || []
  const linkLabel = block.scheduleLinkLabel || 'Full schedule at {studio}'

  if (!sessions.length) {
    return (
      <div className="panel schedule-empty">
        <p>{block.scheduleEmptyText || 'No classes scheduled just now.'}</p>
        {studios.length > 0 && (
          <div className="button-row">
            {studios.map((s) => (
              <a key={s.id} className="btn" href={s.scheduleUrl} target="_blank" rel="noreferrer">
                {linkLabel.replace('{studio}', s.label)}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="schedule">
      {groupByDay(sessions).map((day) => (
        <div className="schedule__day" key={day.date}>
          <h3 className="schedule__date">{formatDay(day.date)}</h3>
          <ul className="schedule__list">
            {day.sessions.map((s) => (
              <li className="card schedule__item" key={s.id}>
                <p className="schedule__time">
                  {s.startTime}
                  {s.endTime ? ` – ${s.endTime}` : ''}
                  {s.timezone ? ` ${s.timezone}` : ''}
                </p>
                <p className="schedule__name">{s.name}</p>
                <p className="schedule__meta">
                  {/* Prefer a per-event booking page when the source has one
                      (The Events Calendar does; Mindbody's widget doesn't). */}
                  <a href={s.bookUrl || s.studioUrl} target="_blank" rel="noreferrer">
                    {s.studio}
                  </a>
                  {s.cost && <span> · {s.cost}</span>}
                  {/* The harvester keeps Mindbody's "(substitute)" suffix — it's
                      real information for someone deciding whether to come. */}
                  {/\(substitute\)/i.test(s.staff) && <span className="schedule__note"> · substitute</span>}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

// The consolidation block: one place to drop any external tool's copy-paste
// widget (OfferingTree schedule, Canva design, Kit form) so the site stays live
// off that source instead of hand-maintained links. URL mode → a themed iframe;
// Code mode → RawEmbed (runs the snippet's scripts); Schedule mode → the
// harvested teaching schedule (nothing to paste). Empty → an /admin hint.
function EmbedBlock({ block, isFirst }) {
  const isSchedule = block.mode === 'schedule'
  const isNewsletter = block.mode === 'newsletter'
  const useCode = block.mode === 'code'
  const hasUrl = !isSchedule && !isNewsletter && !useCode && block.url
  const hasCode = useCode && block.code
  // The two modes we render as our OWN markup — nothing to paste, and they
  // theme with the season + UI style rather than the vendor's stylesheet.
  if (isSchedule || isNewsletter) {
    return (
      <section className={sectionClass('section section--stack', null, isFirst, block)}>
        {block.title && <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>}
        {isSchedule ? <ScheduleEmbed block={block} /> : <NewsletterEmbed block={block} />}
        {block.caption && (
          <p className="embed-caption" data-tina-field={tinaField(block, 'caption')}>
            {block.caption}
          </p>
        )}
        <HomeButton block={block} />
      </section>
    )
  }
  return (
    <section className={sectionClass('section section--stack', null, isFirst, block)}>
      {block.title && <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>}
      <div className="embed" data-tina-field={tinaField(block, useCode ? 'code' : 'url')}>
        {hasUrl && (
          <iframe
            className="embed-frame"
            src={block.url}
            height={block.height || 640}
            title={block.title || block.source || 'Embedded content'}
            loading="lazy"
            allow="payment"
          />
        )}
        {hasCode && <RawEmbed html={block.code} />}
        {!hasUrl && !hasCode && (
          <div className="panel embed-placeholder">
            <p>
              Add your embed here in <strong>/admin</strong> — paste an OfferingTree schedule,
              a Canva design, or a Kit signup snippet.
            </p>
          </div>
        )}
      </div>
      {block.caption && (
        <p className="embed-caption" data-tina-field={tinaField(block, 'caption')}>
          {block.caption}
        </p>
      )}
      <HomeButton block={block} />
    </section>
  )
}

// Renders one Content Section by its chosen layout. imageText is the default and
// the only layout that consumes an alternating image side.
function ContentSection({ block, isFirst, side, services }) {
  switch (block.layout) {
    case 'splash':
      return <SplashSection block={block} isFirst={isFirst} services={services} />
    case 'centered':
      return <StackedSection block={block} isFirst={isFirst} services={services} />
    case 'cardGrid':
      return <CardGrid block={block} isFirst={isFirst} services={services} />
    case 'values':
      return (
        <div>
          <ValuesSection title={block.title} words={block.words || []} />
          <HomeButton block={block} />
        </div>
      )
    case 'event':
      return <EventSection block={block} isFirst={isFirst} services={services} />
    case 'imageText':
    default:
      return <SplitSection block={block} isFirst={isFirst} side={side} services={services} />
  }
}

// Layouts that consume an alternating image side (so mediaIndex only advances
// for blocks that actually show a side-by-side image).
function usesMediaSide(block) {
  if (block.__typename === 'PageBlocksService') return true
  return block.__typename === 'PageBlocksContentSection' && (block.layout || 'imageText') === 'imageText'
}

export default function Blocks({ blocks }) {
  const list = blocks || []
  // Map of service Heading -> { status, slug, bookUrl }, so a linked button or
  // add-on can reflect the availability of — and link to — a service by name.
  const services = {}
  list.forEach((b) => {
    if (b.__typename === 'PageBlocksService' && b.title) {
      const bookUrl = (b.bookingOptions || []).map((o) => o.bookUrl).find(Boolean) || ''
      services[b.title.trim().toLowerCase()] = { status: b.status, slug: slugify(b.title), bookUrl }
    }
  })

  // Counts image-bearing sections so resolveSide can alternate them independently
  // of any interleaved text-only blocks.
  let mediaIndex = 0
  return (
    <>
      {list.map((block, i) => {
        const isFirst = i === 0
        const side = usesMediaSide(block) ? resolveSide(block, mediaIndex++) : null
        switch (block.__typename) {
          case 'PageBlocksContentSection':
            return (
              <ContentSection key={i} block={block} isFirst={isFirst} side={side} services={services} />
            )
          case 'PageBlocksService':
            return (
              <ServiceBlock key={i} block={block} isFirst={isFirst} side={side} services={services} />
            )
          case 'PageBlocksEmbed':
            return <EmbedBlock key={i} block={block} isFirst={isFirst} />
          default:
            return null
        }
      })}
    </>
  )
}
