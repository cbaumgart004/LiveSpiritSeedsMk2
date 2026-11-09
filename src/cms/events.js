// Event documents (the console's Events) as the site shows them: on the events
// page as cards (components/cms/EventList.jsx) and in the banner, one slide
// each (components/PromoBanner.jsx).
import { slugify } from './site'
import { REGULAR, regularDates, repeatText } from './recurrence'

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

// An event's dates from today on, soonest first, by its Repeats setting: a
// regular pattern from its Date (cms/recurrence.js); or its Date, then, on dates
// she chooses, each of More dates, whose blank times are the event's own.
export function eventDates(e, now = today()) {
  const main = { date: e.date, startTime: e.startTime, endTime: e.endTime }
  if (REGULAR.includes(e.repeat)) return regularDates(e, now).map((date) => ({ ...main, date }))
  const more = (e.repeat === 'custom' ? e.moreDates || [] : []).map((m) => ({ date: m.date, startTime: m.startTime || e.startTime, endTime: m.endTime || e.endTime }))
  return [main, ...more].filter((o) => o.date && o.date >= now)
    .sort((a, b) => a.date.localeCompare(b.date) || String(a.startTime || '').localeCompare(String(b.startTime || '')))
}

// "Every Saturday until December 12"; '' unless the event repeats regularly.
export function repeatLine(e) {
  const text = repeatText(e)
  return text && e.repeatUntil ? `${text} until ${formatDay(e.repeatUntil, { weekday: undefined })}` : text
}

// Events with a date today or later, by their next one; undated ones are left
// out. Each carries `dates` (every one still to come; the next few of a regular
// pattern), `next`, the first, and `repeats`, a regular pattern in words.
export function upcomingEvents(docs) {
  const now = today()
  return (docs || []).filter((d) => d.data?.title)
    .map((d) => { const dates = eventDates(d.data, now); return { ...d, dates, next: dates[0], repeats: repeatLine(d.data) } })
    .filter((d) => d.next)
    .sort((a, b) => a.next.date.localeCompare(b.next.date) || String(a.next.startTime || '').localeCompare(String(b.next.startTime || '')))
}
