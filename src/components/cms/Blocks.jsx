/* eslint-disable react/prop-types */
// Renders a page's blocks[] into the CSS primitives from ADR 0001.
// There are two block types: a "Content Section" (whose `layout` picks one of
// several looks) and a "Service" (bookable). tinaField(block, 'field') marks a
// region as click-to-edit inside /admin; for it to resolve, blocks must arrive
// via useTina (see DynamicPage) — the hook stamps the editing metadata onto each
// block object.
import { tinaField } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import ValuesSection from '../ValuesSection/ValuesSection'

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
      <div className="panel">
        <Body block={block} name="body" />
      </div>
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

// Renders one Content Section by its chosen layout. imageText is the default and
// the only layout that consumes an alternating image side.
function ContentSection({ block, isFirst, side, services }) {
  switch (block.layout) {
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
          default:
            return null
        }
      })}
    </>
  )
}
