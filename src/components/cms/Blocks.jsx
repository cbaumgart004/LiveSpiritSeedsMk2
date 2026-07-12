/* eslint-disable react/prop-types */
// Renders a page's blocks[] into the CSS primitives from ADR 0001.
// tinaField(block, 'field') marks a region as click-to-edit inside /admin.
// For it to resolve, blocks must arrive via useTina (see DynamicPage) — the
// hook is what stamps the editing metadata onto each block object.
import { tinaField } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import ValuesSection from '../ValuesSection/ValuesSection'
import { THAI_COMPRESS_AVAILABLE } from '../../config/siteConfig'

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

function SplitSection({ block, isFirst, side }) {
  return (
    <section className={sectionClass('section section--split', side, isFirst)}>
      <Media block={block} alt={block.title} size={block.imageSize} />
      <div className="panel">
        {block.title && <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>}
        <Body block={block} name="body" />
        <Buttons block={block} />
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
    </section>
  )
}

function ServiceCardBlock({ block, isFirst, side }) {
  const options = block.bookingOptions || []
  return (
    <section className={sectionClass('section section--split', side, isFirst)}>
      <Media block={block} alt={block.title} size={block.imageSize} />
      <div className="panel">
        {block.title && <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>}
        <Body block={block} name="description" />
        {options.length > 0 && (
          <>
            {options.map((opt, i) => (
              <div key={i}>
                <div className="button-row">
                  <a className="btn" href={opt.bookUrl}>
                    {opt.label}
                  </a>
                  {/* Thai Compress add-on button, only on services that offer it.
                      Active when THAI_COMPRESS_AVAILABLE (siteConfig) and a URL is
                      set; otherwise a disabled "Coming Soon" button. */}
                  {block.offersThaiCompress &&
                    (THAI_COMPRESS_AVAILABLE && opt.compressUrl ? (
                      <a className="btn" href={opt.compressUrl}>
                        Book w/ Thai Compress
                      </a>
                    ) : (
                      <span className="btn btn--disabled" aria-disabled="true">
                        Thai Compress - Coming Soon
                      </span>
                    ))}
                </div>
                {opt.note && <p style={{ fontSize: '0.85rem' }}>{opt.note}</p>}
              </div>
            ))}
            {block.offersThaiCompress && (
              <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                Thai Herbal Compress can be added to this service
                {THAI_COMPRESS_AVAILABLE ? '.' : ' (coming soon).'}
              </p>
            )}
          </>
        )}
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
      </div>
    </section>
  )
}

export default function Blocks({ blocks }) {
  // Counts image-bearing sections so resolveSide can alternate them independently
  // of any interleaved text-only blocks.
  let mediaIndex = 0
  return (
    <>
      {(blocks || []).map((block, i) => {
        const isFirst = i === 0
        switch (block.__typename) {
          case 'PageBlocksSplitSection':
            return (
              <SplitSection key={i} block={block} isFirst={isFirst} side={resolveSide(block, mediaIndex++)} />
            )
          case 'PageBlocksServiceCard':
            return (
              <ServiceCardBlock key={i} block={block} isFirst={isFirst} side={resolveSide(block, mediaIndex++)} />
            )
          case 'PageBlocksStackedSection':
            return <StackedSection key={i} block={block} isFirst={isFirst} />
          case 'PageBlocksCardGrid':
            return <CardGrid key={i} block={block} isFirst={isFirst} />
          case 'PageBlocksValuesSection':
            return <ValuesSection key={i} title={block.title} words={block.words || []} />
          case 'PageBlocksEventSection':
            return <EventSection key={i} block={block} isFirst={isFirst} />
          default:
            return null
        }
      })}
    </>
  )
}
