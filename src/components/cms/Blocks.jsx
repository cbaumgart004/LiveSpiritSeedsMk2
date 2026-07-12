/* eslint-disable react/prop-types */
// Renders a page's blocks[] into the CSS primitives from ADR 0001.
// tinaField(...) marks a region as click-to-edit inside the Tina admin.
import { tinaField } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import ValuesSection from '../ValuesSection/ValuesSection'

function sectionClass(base, block, isFirst) {
  const reverse = block.imageSide === 'right' ? ' section--reverse' : ''
  const first = isFirst ? ' first-section' : ''
  return `${base}${reverse}${first}`
}

function Buttons({ items }) {
  if (!items?.length) return null
  return (
    <div className="button-row">
      {items.map((btn, i) => (
        <a key={i} className="btn" href={btn.url}>
          {btn.label}
        </a>
      ))}
    </div>
  )
}

function SplitSection({ block, isFirst }) {
  return (
    <section className={sectionClass('section section--split', block, isFirst)}>
      {block.image && (
        <div className="media">
          <img src={block.image} alt={block.title || ''} />
        </div>
      )}
      <div className="panel">
        {block.title && (
          <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>
        )}
        <div data-tina-field={tinaField(block, 'body')}>
          <TinaMarkdown content={block.body} />
        </div>
        <Buttons items={block.buttons} />
      </div>
    </section>
  )
}

function StackedSection({ block, isFirst }) {
  return (
    <section className={sectionClass('section section--stack', block, isFirst)}>
      {block.title && (
        <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>
      )}
      <div className="panel" data-tina-field={tinaField(block, 'body')}>
        <TinaMarkdown content={block.body} />
      </div>
      <Buttons items={block.buttons} />
    </section>
  )
}

function ServiceCardBlock({ block, isFirst }) {
  const options = block.bookingOptions || []
  return (
    <section className={sectionClass('section section--split', block, isFirst)}>
      {block.image && (
        <div className="media">
          <img src={block.image} alt={block.title || ''} />
        </div>
      )}
      <div className="panel">
        {block.title && (
          <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>
        )}
        <div data-tina-field={tinaField(block, 'description')}>
          <TinaMarkdown content={block.description} />
        </div>
        {options.length > 0 && (
          <>
            <div className="button-row">
              {options.map((opt, i) => (
                <a key={i} className="btn" href={opt.bookUrl}>
                  {opt.label}
                </a>
              ))}
            </div>
            {options
              .filter((opt) => opt.note)
              .map((opt, i) => (
                <p key={i} style={{ fontSize: '0.85rem' }}>
                  {opt.note}
                </p>
              ))}
          </>
        )}
      </div>
    </section>
  )
}

function EventSection({ block, isFirst }) {
  return (
    <section className={sectionClass('section', block, isFirst)}>
      <div className="panel">
        {block.title && (
          <h2 data-tina-field={tinaField(block, 'title')}>{block.title}</h2>
        )}
        <div data-tina-field={tinaField(block, 'body')}>
          <TinaMarkdown content={block.body} />
        </div>
        {(block.images || []).map(
          (src, i) =>
            src && (
              <div className="media" key={i}>
                <img src={src} alt="" />
              </div>
            )
        )}
        <Buttons items={block.buttons} />
      </div>
    </section>
  )
}

export default function Blocks({ blocks }) {
  return (
    <>
      {(blocks || []).map((block, i) => {
        const props = { block, isFirst: i === 0, key: i }
        switch (block.__typename) {
          case 'PageBlocksSplitSection':
            return <SplitSection {...props} />
          case 'PageBlocksStackedSection':
            return <StackedSection {...props} />
          case 'PageBlocksServiceCard':
            return <ServiceCardBlock {...props} />
          case 'PageBlocksValuesSection':
            return (
              <ValuesSection key={i} title={block.title} words={block.words || []} />
            )
          case 'PageBlocksEventSection':
            return <EventSection {...props} />
          default:
            return null
        }
      })}
    </>
  )
}
