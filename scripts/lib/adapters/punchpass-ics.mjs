// Adapter for studios on Punchpass (CURA Yoga Center).
//
// CURA embeds Punchpass in a cross-origin iframe, which a browser can't read
// into — but Punchpass also publishes a public iCal feed of every class, and
// server-side there's no iframe to fight:
//
//   <studio>.punchpass.com/org/<orgId>/calendars/all_classes.ics
//
// One request returns months of classes, already structured. We prefer it over
// scraping the schedule HTML, which is paginated by day and pollutes textContent
// with inline SVG <style> rules.
//
// Punchpass has no teacher id anywhere public. The instructor is in the event's
// ORGANIZER common-name (`ORGANIZER;CN=Melissa Carey:mailto:…`), so we match
// that — which also catches co-taught classes billed as
// "Adriana Wignall & Melissa Carey".
import { formatWall, sortKeyFor } from '../time.mjs'

// iCal folds long lines with CRLF + a leading space/tab. Unfold before parsing
// or LOCATION/SUMMARY silently truncate mid-value.
const unfold = (text) => text.replace(/\r?\n[ \t]/g, '')

// iCal escapes commas, semicolons and newlines inside values.
const unescape = (v = '') =>
  v
    .replace(/\\n/gi, ' ')
    .replace(/\\([,;\\])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

const prop = (block, name) => {
  const m = block.match(new RegExp(`\\n${name}(?:;[^:\\n]*)?:([^\\n]*)`))
  return m ? unescape(m[1]) : ''
}

// "DTSTART;TZID=America/Denver:20260808T140000" → parts + the zone it's in.
function stamp(block, name, fallbackTz) {
  const m = block.match(new RegExp(`\\n${name}(;[^:\\n]*)?:([^\\n]*)`))
  if (!m) return null
  const params = m[1] || ''
  const value = m[2].trim()
  const tz = (params.match(/TZID=([^;:]+)/) || [])[1] || fallbackTz

  const d = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/)
  if (!d) return null

  return {
    wall: {
      year: Number(d[1]),
      month: Number(d[2]),
      day: Number(d[3]),
      hour: Number(d[4] || 0),
      minute: Number(d[5] || 0),
    },
    // A trailing Z means it's already UTC, not studio wall time.
    tz: /Z$/.test(value) ? 'UTC' : tz,
  }
}

export async function harvest(source, { weeks = 4, from = new Date() } = {}) {
  const fallbackTz = source.timeZone || 'America/Denver'
  const until = new Date(from)
  until.setDate(until.getDate() + weeks * 7)

  const res = await fetch(source.icsUrl, {
    headers: { 'User-Agent': 'livespiritseeds-schedule-harvester (+https://livespiritseeds.com)' },
  })
  if (!res.ok) throw new Error(`iCal feed returned HTTP ${res.status}`)

  const text = unfold(await res.text())
  if (!text.includes('BEGIN:VEVENT')) {
    throw new Error('iCal feed contained no events (feed URL or org id changed?)')
  }

  const blocks = text.split('BEGIN:VEVENT').slice(1)
  const matcher = new RegExp(source.instructorPattern, 'i')
  const sessions = []

  for (const block of blocks) {
    const organizer = (block.match(/\nORGANIZER[^:\n]*CN=([^:;\n]*)/) || [])[1] || ''
    if (!matcher.test(unescape(organizer))) continue

    const summary = prop(block, 'SUMMARY')
    // Punchpass marks cancellations in the title rather than a status field.
    if (/^cancell?ed\b/i.test(summary)) continue

    const start = stamp(block, 'DTSTART', fallbackTz)
    if (!start) continue

    const a = formatWall(start.wall, start.tz)
    // The feed carries the studio's whole history, so unlike the other three
    // sources (which take a from-date parameter) this one needs both bounds —
    // otherwise past classes inflate the harvest report before being dropped.
    const day = new Date(`${a.date}T00:00:00Z`)
    if (day < new Date(`${from.toISOString().slice(0, 10)}T00:00:00Z`)) continue
    if (day > until) continue

    const endStamp = stamp(block, 'DTEND', fallbackTz)
    const b = endStamp ? formatWall(endStamp.wall, endStamp.tz) : null

    sessions.push({
      id: `${source.id}:${prop(block, 'UID') || `${a.date}-${sessions.length}`}`,
      date: a.date,
      startTime: a.time,
      endTime: b && b.date === a.date ? b.time : '',
      timezone: a.abbr,
      name: summary,
      type: '',
      level: '',
      staff: unescape(organizer),
      studio: source.label,
      studioUrl: source.scheduleUrl,
      bookUrl: prop(block, 'URL') || source.scheduleUrl,
      cost: '',
      sortKey: sortKeyFor(a.date, a.minutes),
    })
  }

  return {
    sessions,
    totalSessions: blocks.length,
    // No roster in an iCal feed — same reasoning as the momence adapter.
    trainerOnRoster: true,
    rosterSize: 0,
  }
}
