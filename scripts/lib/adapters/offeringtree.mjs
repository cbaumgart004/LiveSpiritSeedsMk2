// Adapter for Melissa's own classes on OfferingTree (Prenatal Yoga with
// Community Roots Midwife Collective). Her storefront's schedule widget reads a
// public, unauthenticated JSON API, so we call the same endpoint it does:
//
//   api.offeringtree.com/events/by_count
//     ?num_events=N&start_date_time="<ISO>"&offering_id=<uuid>
//
// One source per offering: everything on it is hers, so there is no teacher
// match. Each item is an event instance; a canceled one keeps its slot with
// attributes.event.status === 'canceled' and must not be shown.
//
// start_date_time carries the studio offset ("2026-11-15T11:00:00-07:00"), an
// instant, so it is converted to the studio's zone like Momence's.
import { formatInstant, sortKeyFor } from '../time.mjs'

const API = 'https://api.offeringtree.com/events/by_count'

async function fetchInstances(offeringId, from, count) {
  const qs = `num_events=${count}&start_date_time=${encodeURIComponent(JSON.stringify(from.toISOString()))}&offering_id=${encodeURIComponent(offeringId)}`
  const res = await fetch(`${API}?${qs}`, {
    headers: { 'User-Agent': 'livespiritseeds-schedule-harvester (+https://livespiritseeds.com)' },
  })
  if (!res.ok) throw new Error(`events API returned HTTP ${res.status}`)
  const json = await res.json()
  if (!Array.isArray(json.data)) {
    throw new Error('events API response had no data array (endpoint shape changed?)')
  }
  return json.data
}

export async function harvest(source, { weeks = 4, from = new Date() } = {}) {
  const tz = source.timeZone || 'America/Denver'
  const until = new Date(from)
  until.setDate(until.getDate() + weeks * 7)

  // Weekly at most, so twice the weeks covers the window with room for extras.
  const all = await fetchInstances(source.offeringId, from, Math.max(10, weeks * 2))

  const sessions = []
  for (const item of all) {
    const at = item.attributes || {}
    const ev = at.event || {}
    if (ev.status === 'canceled' || ev.private) continue

    const start = new Date(at.start_date_time)
    if (Number.isNaN(start.getTime()) || start > until) continue

    const a = formatInstant(start, tz)
    const b = at.end_date_time ? formatInstant(at.end_date_time, tz) : null
    const price = Number(ev.price_cents) || 0

    sessions.push({
      id: `${source.id}:${item.id}`,
      date: a.date,
      startTime: a.time,
      endTime: b && b.date === a.date ? b.time : '',
      timezone: a.abbr,
      name: ev.title || at.offering?.title || '',
      type: '',
      level: '',
      staff: source.teacherName || '',
      studio: source.label,
      studioUrl: source.scheduleUrl,
      bookUrl: source.bookUrl || source.scheduleUrl,
      cost: price > 0 ? `$${(price / 100).toFixed(price % 100 ? 2 : 0)}` : '',
      sortKey: sortKeyFor(a.date, a.minutes),
    })
  }

  return {
    sessions,
    totalSessions: all.length,
    // The offering is hers; there is no roster to fall off.
    trainerOnRoster: true,
    rosterSize: 1,
  }
}
