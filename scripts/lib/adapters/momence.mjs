// Adapter for studios on Momence (All Purpose Yoga). Momence's embeddable
// schedule plugin reads from a public, unauthenticated JSON API, so we call the
// same endpoint the widget does:
//
//   readonly-api.momence.com/host-plugins/host/<hostId>/host-schedule/sessions
//     ?sessionTypes[]=…&fromDate=<ISO>&pageSize=…&page=…&timeZone=…
//
// This is the richest of the four sources: a real numeric `teacherId`, an
// `isCancelled` flag, and a per-session booking `link`. Match on teacherId — at
// this studio Melissa is listed as "Melissa Christine Carey", which no name
// match tuned to the other studios' "Melissa Carey" would have caught.
//
// `startsAt` is a UTC instant, so it MUST be converted to the studio's zone or
// evening classes land on the wrong day.
import { formatInstant, sortKeyFor } from '../time.mjs'

const API = 'https://readonly-api.momence.com/host-plugins/host'

const SESSION_TYPES = ['course-class', 'fitness', 'retreat', 'special-event', 'special-event-new']

const PAGE_SIZE = 200

async function fetchPage(hostId, fromDate, page, tz) {
  const params = new URLSearchParams({
    fromDate,
    pageSize: String(PAGE_SIZE),
    page: String(page),
    timeZone: tz,
  })
  const qs = `${SESSION_TYPES.map((t) => `sessionTypes[]=${encodeURIComponent(t)}`).join('&')}&${params}`

  const res = await fetch(`${API}/${hostId}/host-schedule/sessions?${qs}`, {
    headers: { 'User-Agent': 'livespiritseeds-schedule-harvester (+https://livespiritseeds.com)' },
  })
  if (!res.ok) throw new Error(`sessions API returned HTTP ${res.status}`)

  const json = await res.json()
  if (!Array.isArray(json.payload)) {
    throw new Error('sessions API response had no payload array (endpoint shape changed?)')
  }
  return json.payload
}

// She may be the listed teacher, the original teacher of a covered class, or a
// co-teacher on a shared session.
function teaches(session, teacherId) {
  const id = Number(teacherId)
  if (Number(session.teacherId) === id) return true
  if (Number(session.originalTeacherId) === id) return true
  return (session.additionalTeachers || []).some((t) => Number(t?.id ?? t?.teacherId) === id)
}

export async function harvest(source, { weeks = 4, from = new Date() } = {}) {
  const tz = source.timeZone || 'America/Denver'
  const until = new Date(from)
  until.setDate(until.getDate() + weeks * 7)

  const all = []
  for (let page = 0; page < 10; page++) {
    const batch = await fetchPage(source.hostId, from.toISOString(), page, tz)
    all.push(...batch)
    if (batch.length < PAGE_SIZE) break
  }

  const sessions = []
  for (const s of all) {
    if (!teaches(s, source.teacherId)) continue
    if (s.isCancelled) continue

    const start = new Date(s.startsAt)
    if (start > until) continue

    const a = formatInstant(start, tz)
    const b = s.endsAt ? formatInstant(s.endsAt, tz) : null

    sessions.push({
      id: `${source.id}:${s.id}`,
      date: a.date,
      startTime: a.time,
      endTime: b && b.date === a.date ? b.time : '',
      timezone: a.abbr,
      name: s.sessionName || '',
      type: '',
      level: '',
      staff: s.teacher || '',
      studio: source.label,
      studioUrl: source.scheduleUrl,
      bookUrl: s.link || source.scheduleUrl,
      // `price` is null on drop-ins here; only surface a real number.
      cost: typeof s.price === 'number' && s.price > 0 ? `$${s.price}` : '',
      sortKey: sortKeyFor(a.date, a.minutes),
    })
  }

  return {
    sessions,
    totalSessions: all.length,
    // Momence publishes no roster endpoint — only the sessions actually on the
    // calendar — so "she has no classes" and "she's no longer a teacher here"
    // are indistinguishable. Never alert on it; a false alert trains everyone to
    // ignore the real ones. The healthy signal is the well-formed response above.
    trainerOnRoster: true,
    rosterSize: new Set(all.map((s) => s.teacherId)).size,
  }
}
