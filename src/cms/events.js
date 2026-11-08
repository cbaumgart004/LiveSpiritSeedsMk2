// Event documents (the console's Events) as the site shows them: on the events
// page as cards (components/cms/EventList.jsx) and in the banner, one slide
// each (components/PromoBanner.jsx).
import { slugify } from './site'

// Today as YYYY-MM-DD in the visitor's own time zone.
export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 'YYYY-MM-DD' → "Saturday, November 14". Built from parts, not new Date(string),
// which parses a bare date as UTC and lands on the previous day west of GMT.
export function formatDay(iso, { weekday = 'long', month = 'long' } = {}) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday, month, day: 'numeric' })
}

// "2:00 PM to 3:30 PM", or the start alone.
export function timeText(e) {
  return [e.startTime, e.endTime].filter(Boolean).join(' to ')
}

// The id of an event's card on the events page, for /upcoming#<anchor>.
export const eventAnchor = (doc) => `event-${doc.slug || slugify(doc.data?.title)}`

// Events dated today or later, soonest first; undated ones are left out.
export function upcomingEvents(docs) {
  const now = today()
  return (docs || []).filter((d) => d.data?.title && d.data.date && d.data.date >= now)
    .sort((a, b) => a.data.date.localeCompare(b.data.date) || String(a.data.startTime || '').localeCompare(String(b.data.startTime || '')))
}
