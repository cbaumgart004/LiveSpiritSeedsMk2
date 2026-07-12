/* eslint-disable react/prop-types */
// Renders a page's blocks[] into the CSS primitives from ADR 0001.
// tinaField(block, 'field') marks a region as click-to-edit inside /admin.
// For it to resolve, blocks must arrive via useTina (see DynamicPage) — the
// hook is what stamps the editing metadata onto each block object.
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

function sectionClass(base, side, isFirst) {
  const reverse = side === 'right' ? ' section--reverse' : ''
  const first = isFirst ? ' first-section' : ''
  return `${base}${reverse}${first}`
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

// Editable image with an editor-controlled size (.media--sm/lg; md is default).
function Media({ block, name = 'image', alt, size }) {
  if (!block[name]) return null
  const sizeClass = size === 'sm' ? ' media--sm' : size === 'lg' ? ' media--lg' : ''
  return (
    <div className={`media${sizeClass}`} data-tina-field={tinaField(block, name)}>
      <img src={block[name]} alt={alt || ''} />
    </div>
  )
}

function Buttons({ block }) {
  const items = block.buttons
  if (!items?.length) return null
  return (
    <div className="button-row" data-tina-field={tinaField(block, 'buttons')}>
      {items.map((btn, i) =>
        // 'coming-soon' renders on-page but non-clickable, prefixed "Coming Soon - ".
        // Anything else (incl. legacy buttons with no status) is an active link.
        btn.status === 'coming-soon' ? (
          <span key={i} className="btn btn--disabled" aria-disabled="true">
            Coming Soon - {btn.label}
          </span>
        ) : (
          <a key={i} className="btn" href={btn.url}>
            {btn.label}
          </a>
        )
      )}
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

function SplitSection({ block, isFirst, side }) {
  return (
    <section className={sectionClass('section section--split', side, isFirst)}>
      <Media block={block} alt={block.title} size={block.imageSize} />
      <div className="panel">
        {block.title && <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>}
        <Body block={block} name="body" />
        <Buttons block={block} />
        <HomeButton block={block} />
      </div>
    </section>
  )
}

function StackedSection({ block, isFirst }) {
  return (
    <section className={sectionClass('section section--stack', null, isFirst)}>
      {block.title && <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>}
      <div className="panel">
        <Body block={block} name="body" />
      </div>
      <Buttons block={block} />
      <HomeButton block={block} />
    </section>
  )
}

// Stable anchor id for a service card, so add-on buttons can link to it.
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
  const ref = services?.[addOn.service?.trim().toLowerCase()]
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

function ServiceCardBlock({ block, isFirst, side, services }) {
  const options = block.bookingOptions || []
  const comingSoon = block.status === 'coming-soon'
  return (
    <section id={slugify(block.title)} className={sectionClass('section section--split', side, isFirst)}>
      <Media block={block} alt={block.title} size={block.imageSize} />
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
        <HomeButton block={block} />
      </div>
    </section>
  )
}

function CardGrid({ block, isFirst }) {
  const cards = block.cards || []
  return (
    <section className={sectionClass('section section--stack', null, isFirst)}>
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
      <HomeButton block={block} />
    </section>
  )
}

function EventSection({ block, isFirst }) {
  return (
    <section className={sectionClass('section', null, isFirst)}>
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
        <Buttons block={block} />
        <HomeButton block={block} />
      </div>
    </section>
  )
}

export default function Blocks({ blocks }) {
  const list = blocks || []
  // Map of service Heading -> { status, slug, bookUrl }, so an add-on button on
  // one service can reflect the availability of — and link to — the (other)
  // service it references.
  const services = {}
  list.forEach((b) => {
    if (b.__typename === 'PageBlocksServiceCard' && b.title) {
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
        switch (block.__typename) {
          case 'PageBlocksSplitSection':
            return (
              <SplitSection key={i} block={block} isFirst={isFirst} side={resolveSide(block, mediaIndex++)} />
            )
          case 'PageBlocksServiceCard':
            return (
              <ServiceCardBlock
                key={i}
                block={block}
                isFirst={isFirst}
                side={resolveSide(block, mediaIndex++)}
                services={services}
              />
            )
          case 'PageBlocksStackedSection':
            return <StackedSection key={i} block={block} isFirst={isFirst} />
          case 'PageBlocksCardGrid':
            return <CardGrid key={i} block={block} isFirst={isFirst} />
          case 'PageBlocksValuesSection':
            return (
              <div key={i}>
                <ValuesSection title={block.title} words={block.words || []} />
                <HomeButton block={block} />
              </div>
            )
          case 'PageBlocksEventSection':
            return <EventSection key={i} block={block} isFirst={isFirst} />
          default:
            return null
        }
      })}
    </>
  )
}
