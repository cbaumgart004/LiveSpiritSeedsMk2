// Adapter for WordPress sites running "The Events Calendar" (Tribe), which
// exposes a public REST API — no scraping needed:
//
//   <site>/wp-json/tribe/events/v1/events?per_page=50&start_date=…&end_date=…
//
// Unlike Mindbody there is no instructor field and no staff id: a Tribe event
// only has a title, a description and an organizer (which is the *venue's* org,
// not the teacher). So we identify Melissa's classes by matching a pattern
// against the description — MESA writes an explicit "Instructor: Melissa Carey"
// line, which is precise enough to exclude the org's other programming.
//
// That is a weaker hook than Mindbody's trainer id, and it fails in a specific
// direction worth knowing: if the site stops naming the instructor, or renames
// her, her classes silently disappear from the site rather than showing wrong
// ones. See the residual-risk note in DESIGN.md §6.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

// WP returns titles/venues with HTML entities ("Clinica Family Health &#038; Wellness").
// There's no DOM in Node, so decode the numeric and the handful of named ones.
function decode(s = '') {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .trim()
}

const stripTags = (html = '') => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ')

// "2026-08-10 16:00:00" → { date: '2026-08-10', time: '4:00 PM', minutes: 960 }
function splitStamp(stamp = '') {
  const [date, clock = ''] = stamp.split(' ')
  const [h, m] = clock.split(':').map(Number)
  if (Number.isNaN(h)) return { date, time: '', minutes: 0 }
  const suffix = h < 12 ? 'AM' : 'PM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return { date, time: `${hour12}:${String(m).padStart(2, '0')} ${suffix}`, minutes: h * 60 + m }
}

/**
 * @returns {{sessions: object[], totalSessions: number, trainerOnRoster: boolean, rosterSize: number}}
 *   Shaped like the healcode adapter so harvest-schedule.mjs treats both the same.
 *   `trainerOnRoster` is always true here — Tribe publishes no roster to check
 *   against, so this source can't detect "she was removed" the way Mindbody can.
 */
export async function harvest(source, { weeks = 2, from = new Date() } = {}) {
  const end = new Date(from)
  end.setDate(end.getDate() + weeks * 7)

  const params = new URLSearchParams({
    per_page: '50',
    start_date: from.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
  })
  const url = `${source.apiBase.replace(/\/$/, '')}/wp-json/tribe/events/v1/events?${params}`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'livespiritseeds-schedule-harvester (+https://livespiritseeds.com)' },
  })
  if (!res.ok) throw new Error(`events API returned HTTP ${res.status}`)

  const json = await res.json()
  if (!Array.isArray(json.events)) {
    throw new Error('events API response had no events array (plugin removed or route changed?)')
  }

  const matcher = new RegExp(source.instructorPattern, 'i')
  const sessions = []

  for (const e of json.events) {
    const haystack = `${stripTags(e.description)} ${decode(e.title)}`
    if (!matcher.test(haystack)) continue

    const start = splitStamp(e.start_date)
    const finish = splitStamp(e.end_date)

    sessions.push({
      id: `${source.id}:${e.id}`,
      date: start.date,
      startTime: start.time,
      endTime: finish.date === start.date ? finish.time : '',
      timezone: e.timezone_abbr || '',
      name: decode(e.title),
      type: '',
      level: '',
      staff: source.teacherName || '',
      studio: source.label,
      studioUrl: source.scheduleUrl,
      // Tribe gives a real per-event page — much better than the calendar index.
      bookUrl: e.url || source.scheduleUrl,
      cost: typeof e.cost === 'string' ? decode(e.cost) : '',
      sortKey: `${start.date}T${String(start.minutes).padStart(4, '0')}`,
    })
  }

  return {
    sessions,
    totalSessions: json.events.length,
    trainerOnRoster: true,
    rosterSize: 0,
    // A yoga studio always has *something* on in a fortnight, so an empty window
    // there means the widget broke. A small non-profit's calendar can legitimately
    // be empty between programme cycles, so an empty window here is not an alert —
    // the well-formed 200 above is this source's health signal.
    emptyWindowIsError: false,
  }
}
