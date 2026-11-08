/* eslint-disable react/prop-types */
// "Upcoming events" section: each Event document dated today or later as a
// card (class .event-card, styleable in the console as "Event cards"): its
// photo or icon, name, When (date and times), Where, cost and description,
// then Book a Spot (the event's link) and Home. Each card carries the id
// /upcoming#event-<slug>, which the banner's event slides link to.
//
// The events page shows one of these first until the owner adds her own
// (DynamicPage).
import { useDocuments } from '../../cms/site'
import { upcomingEvents, formatDay, timeText, eventAnchor } from '../../cms/events'
import { srcOf, altOf, imageStyle } from './photo'
import Elements from './Elements'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
const ICONS = {
  sound: <><path d="M4 13h16a8 8 0 0 1-16 0Z" /><path d="M9 21h6" /><path d="M8 8c1-1.5 1-3 0-4.5M12 8c1-1.5 1-3 0-4.5M16 8c1-1.5 1-3 0-4.5" /></>,
  lotus: <><path d="M12 20c-4 0-8-2.5-9-6 3 0 5.5 1 7 3" /><path d="M12 20c4 0 8-2.5 9-6-3 0-5.5 1-7 3" /><path d="M12 20c-2.5-2-3.5-5-3.5-8S10 6 12 4c2 2 3.5 5 3.5 8s-1 6-3.5 8Z" /></>,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  music: <><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
}

export function EventIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}>{ICONS[name] || ICONS.sound}</svg>
  )
}

const external = (url) => !url.startsWith('/') && !url.startsWith('#')

function EventCard({ doc, showHome }) {
  const e = doc.data
  const dates = doc.dates?.length ? doc.dates : [e]
  const url = e.linkUrl || ''
  return (
    <article className="card event-card" id={eventAnchor(doc)}
      {...(doc.id && !doc.id.startsWith('bundled:') ? { 'data-eotm-edit': `event:${doc.id}`, 'data-eotm-label': e.title } : {})}>
      <div className="event-card__icon">
        {srcOf(e.image) ? <img src={srcOf(e.image)} alt={altOf(e.image)} style={imageStyle(e.image)} loading="lazy" /> : <EventIcon name={e.icon} />}
      </div>
      <div className="event-card__body">
        <h3>{e.title}</h3>
        <dl className="event-card__facts">
          <div><dt>When</dt><dd>{dates.map((o, i) => (
            <span key={o.date + i} className="event-card__date">{formatDay(o.date)}{timeText(o) && <><br />{timeText(o)}</>}</span>))}</dd></div>
          {e.location && <div><dt>Where</dt><dd>{e.location}</dd></div>}
          {e.cost && <div><dt>Cost</dt><dd>{e.cost}</dd></div>}
        </dl>
        {e.description && <div className="rich-text" dangerouslySetInnerHTML={{ __html: e.description }} />}
        <div className="button-row event-card__buttons">
          {url && <a className="btn" href={url} {...(external(url) ? { target: '_blank', rel: 'noreferrer' } : {})}>{e.linkLabel || 'Book a Spot'}</a>}
          {showHome && <a className="btn" href="/">Home</a>}
        </div>
      </div>
    </article>
  )
}

export default function EventList({ block, className, marks, frame }) {
  const { ready, docs } = useDocuments('event')
  const events = upcomingEvents(docs)
  const count = Number(block.count)
  const shown = count > 0 ? events.slice(0, count) : events
  const title = block.title ?? 'Upcoming Events'
  return (
    <section className={`${className} events`} {...marks}>
      {(title || block.intro) && (
        <div className="events__head" {...frame?.part('title')}>
          {title && <h2 data-eotm-text="title">{title}</h2>}
          {block.intro && <p data-eotm-text="intro">{block.intro}</p>}
        </div>
      )}
      {ready && (shown.length ? (
        <div className="events__list" {...frame?.part('cards')}>
          {shown.map((d) => <EventCard key={d.id || d.slug} doc={d} showHome={block.showHomeButton !== false} />)}
        </div>
      ) : (
        <p className="events__empty panel">{block.emptyText || 'New events are on their way. Check back soon.'}</p>
      ))}
      <Elements data={block} frame={frame} />
    </section>
  )
}
