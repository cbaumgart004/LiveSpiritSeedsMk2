/* eslint-disable react/prop-types */
// The owner's own elements in a section (the console's schema/elements.js,
// `_elements`): text, formatted text, a photo, a button or a box, each a part
// named by its id (cms/Frame.jsx), so Arrange places it in a Free section; in a
// Flow section they follow the section's own content. Each takes its class (the
// site's own, or the owner's .c-<name>) and its own Style. Text and button
// labels can be typed where they stand in the editor. Formatted text is
// sanitized by the console API on save.
import { useSchema } from '../../cms/site'
import { buttonClass, lookToCss } from '../../cms/look'
import { imageStyle } from './photo'

const NO_FRAME = { part: (name, style) => ({ 'data-eotm-part': name, ...(style ? { style } : {}) }) }

function classNameOf(schema, name) {
  if (!name) return ''
  const site = (schema?.classes ?? []).find((c) => c.name === name)
  if (site) return /^\.[\w-]+$/.test(site.selector.trim()) ? site.selector.trim().slice(1) : ''
  return (schema?.custom?.classes ?? []).some((c) => c.name === name) ? `c-${name}` : ''
}

function Element({ el, frame, schema }) {
  const cls = `eotm-el eotm-el--${el.kind} ${classNameOf(schema, el.class)}`.trim()
  const marks = { 'data-eotm-element': el.kind, 'data-eotm-in': el._id, ...frame.part(el._id, lookToCss(schema, el.style)) }
  switch (el.kind) {
    case 'text': {
      const Tag = ['h2', 'h3'].includes(el.tag) ? el.tag : 'p'
      return <Tag className={cls} data-eotm-text="text" {...marks}>{el.text}</Tag>
    }
    case 'richtext':
      return <div className={`rich-text ${cls}`} data-eotm-richtext="html" dangerouslySetInnerHTML={{ __html: el.html ?? '' }} {...marks} />
    case 'image':
      return el.image?.src ? <img className={cls} src={el.image.src} alt={el.image.alt ?? ''} {...marks} style={{ ...marks.style, ...imageStyle(el.image) }} /> : null
    case 'button':
      return el.url ? (
        <a className={`${buttonClass(schema, el.look)} ${cls}`} href={el.url} {...marks}>
          {el.icon?.src && <img className="btn-icon" src={el.icon.src} alt="" />}
          <span data-eotm-text="label" data-eotm-in={el._id}>{el.label}</span>
        </a>
      ) : null
    default:
      return <div className={cls} {...marks} />
  }
}

export default function Elements({ data, frame = NO_FRAME }) {
  const schema = useSchema()
  const list = Array.isArray(data?._elements) ? data._elements.filter((e) => e?._id) : []
  return list.map((el) => <Element key={el._id} el={el} frame={frame} schema={schema} />)
}
