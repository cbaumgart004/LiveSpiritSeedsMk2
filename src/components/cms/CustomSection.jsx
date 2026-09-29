/* eslint-disable react/prop-types */
// A section type the owner designed in the console ("Your own types"), drawn
// from its field list in the site's plain section style until it is given a
// design of its own. Field kinds follow the console's schema/custom.js:
// the first short text is the heading, formatted text is HTML, a photo is an
// image, a link is a button (labelled by the text field just before it when
// there is one), a list repeats its own fields.
import { imageStyle, srcOf, altOf } from './photo'

function Value({ field, value }) {
  if (value == null || value === '' || (Array.isArray(value) && !value.length)) return null
  switch (field.kind) {
    case 'text':
    case 'textarea':
      return <p className={`custom__${field.name}`}>{value}</p>
    case 'richtext':
      return <div className={`rich-text custom__${field.name}`} data-eotm-richtext={field.name} dangerouslySetInnerHTML={{ __html: value }} />
    case 'image':
      return srcOf(value) ? <div className="media"><img src={srcOf(value)} alt={altOf(value)} style={imageStyle(value)} /></div> : null
    case 'url':
      return <div className="button-row"><a className="btn" href={value}>{field.label}</a></div>
    case 'number':
    case 'date':
      return <p className={`custom__${field.name}`}>{String(value)}</p>
    case 'datetime':
      return <p className={`custom__${field.name}`}>{new Date(value).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
    case 'money':
      return value.amount != null ? <p className={`custom__${field.name}`}>{new Intl.NumberFormat(undefined, { style: 'currency', currency: value.currency || 'USD' }).format(value.amount / 100)}</p> : null
    case 'select':
      return <p className={`custom__${field.name}`}>{field.options?.find((o) => o.value === value)?.label ?? value}</p>
    case 'list':
      return (
        <ul className={`custom__${field.name}`}>
          {value.map((item, i) => (
            <li key={item._id ?? i}><Fields fields={field.fields ?? []} data={item} /></li>
          ))}
        </ul>
      )
    default: // boolean and colour are settings, not content
      return null
  }
}

// A text field just before a link is that link's label, so it is not repeated.
function Fields({ fields, data, headingIndex = -1 }) {
  return fields.map((f, i) => {
    if (i === headingIndex) return null
    const next = fields[i + 1]
    if (f.kind === 'text' && next?.kind === 'url' && data?.[next.name]) {
      return <div key={f.name} className="button-row"><a className="btn" href={data[next.name]}>{data[f.name] || next.label}</a></div>
    }
    // Already drawn as the label's button above (not after the heading, which is its own).
    if (f.kind === 'url' && fields[i - 1]?.kind === 'text' && i - 1 !== headingIndex && data?.[f.name]) return null
    return <Value key={f.name} field={f} value={data?.[f.name]} />
  })
}

export default function CustomSection({ block, def, className, marks }) {
  const fields = def?.fields ?? []
  const headingIndex = fields.findIndex((f) => f.kind === 'text')
  const heading = headingIndex >= 0 ? block[fields[headingIndex].name] : null
  // Colour fields become custom properties the site's CSS (or a later design) can use.
  const colours = Object.fromEntries(fields.filter((f) => f.kind === 'color' && block[f.name]).map((f) => [`--${f.name}`, block[f.name]]))
  return (
    <section className={`${className} custom-section`} {...marks} style={{ ...marks?.style, ...colours }}>
      <div className="panel">
        {heading && <h2>{heading}</h2>}
        <Fields fields={fields} data={block} headingIndex={headingIndex} />
      </div>
    </section>
  )
}
