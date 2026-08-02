// Adapter for Mindbody studios that publish their schedule through a Healcode
// "branded web" widget (<healcode-widget data-type="schedules">).
//
// The widget is a shell; the sessions come from a plain, unauthenticated JSON
// endpoint it calls:
//
//   widgets.mindbodyonline.com/widgets/schedules/<widgetId>/load_markup
//     ?options[start_date]=YYYY-MM-DD
//
// It answers { class_sessions, calendar, filters }. `class_sessions` is a chunk
// of server-rendered HTML covering 7 days from start_date, and `filters` is a
// JSON *string* whose `trainer` array is the studio's instructor roster. That
// roster is what lets us tell "Melissa taught nothing this week" (fine) apart
// from "this widget is broken" (alert) — see harvest-schedule.mjs.
//
// We match on the data attribute `data-bw-widget-trainer`, never on the staff
// name, so a spelling change at the studio can't silently drop her classes.
import { parse } from 'node-html-parser'

const ENDPOINT = 'https://widgets.mindbodyonline.com/widgets/schedules'

// "6:00 PM – 7:15 PM MDT View details Hide details" → the three parts we want.
// The trailing noise is the details toggle, which lives inside the same node.
const TIME_RE = /(\d{1,2}:\d{2}\s*[AP]M)\s*[–—-]\s*(\d{1,2}:\d{2}\s*[AP]M)\s*([A-Z]{2,4})?/i

const text = (node, sel) => node.querySelector(sel)?.text.replace(/\s+/g, ' ').trim() ?? ''

// 24h minutes-since-midnight, for sorting sessions within a day.
function minutesInto(day) {
  const m = day.match(/(\d{1,2}):(\d{2})\s*([AP])M/i)
  if (!m) return 0
  const h = Number(m[1]) % 12
  return (h + (m[3].toUpperCase() === 'P' ? 12 : 0)) * 60 + Number(m[2])
}

async function loadWeek(widgetId, startDate) {
  const url = `${ENDPOINT}/${widgetId}/load_markup?options%5Bstart_date%5D=${startDate}`
  // Send no Accept header: this endpoint answers 500 to `Accept: application/json`
  // even though it returns JSON. Only the User-Agent is ours, for the studio's logs.
  const res = await fetch(url, {
    headers: { 'User-Agent': 'livespiritseeds-schedule-harvester (+https://livespiritseeds.com)' },
  })
  if (!res.ok) throw new Error(`load_markup ${startDate} returned HTTP ${res.status}`)
  const json = await res.json()
  if (typeof json.class_sessions !== 'string') {
    throw new Error(`load_markup ${startDate} had no class_sessions (widget shape changed?)`)
  }
  return json
}

// The instructor roster the studio itself publishes for this widget.
function rosterOf(json) {
  try {
    return JSON.parse(json.filters)?.trainer ?? []
  } catch {
    return []
  }
}

/**
 * @returns {{sessions: object[], totalSessions: number, trainerOnRoster: boolean, rosterSize: number}}
 *   `totalSessions` counts EVERY instructor's classes — it is the health signal.
 *   `sessions` is only this source's teacher, already normalised.
 */
export async function harvest(source, { weeks = 2, from = new Date() } = {}) {
  const sessions = []
  let totalSessions = 0
  let trainerOnRoster = false
  let rosterSize = 0

  for (let w = 0; w < weeks; w++) {
    const start = new Date(from)
    start.setDate(start.getDate() + w * 7)
    const startDate = start.toISOString().slice(0, 10)

    const json = await loadWeek(source.widgetId, startDate)

    if (w === 0) {
      const roster = rosterOf(json)
      rosterSize = roster.filter((t) => t.id).length
      trainerOnRoster = roster.some((t) => String(t.id) === String(source.trainerId))
    }

    const root = parse(json.class_sessions)

    for (const day of root.querySelectorAll('.bw-widget__day')) {
      // The date lives in a class: "bw-widget__date date-2026-08-02".
      const date = day.querySelector('.bw-widget__date')?.getAttribute('class')?.match(/date-(\d{4}-\d{2}-\d{2})/)?.[1]
      if (!date) continue

      const all = day.querySelectorAll('.bw-session')
      totalSessions += all.length

      for (const el of all) {
        if (String(el.getAttribute('data-bw-widget-trainer')) !== String(source.trainerId)) continue

        const rawTime = text(el, '.bw-session__time')
        const m = rawTime.match(TIME_RE)
        // The type ("Classes -") is rendered as a prefix inside the name node.
        const type = text(el, '.bw-session__type').replace(/[-–—]\s*$/, '').trim()
        const name = text(el, '.bw-session__name').replace(text(el, '.bw-session__type'), '').replace(/^[-–—]\s*/, '').trim()

        sessions.push({
          id: `${source.id}:${el.getAttribute('data-bw-widget-id') || `${date}-${sessions.length}`}`,
          date,
          startTime: m?.[1]?.replace(/\s+/g, ' ') ?? '',
          endTime: m?.[2]?.replace(/\s+/g, ' ') ?? '',
          timezone: m?.[3] ?? '',
          name,
          type,
          level: text(el, '.bw-session__level'),
          staff: text(el, '.bw-session__staff'),
          studio: source.label,
          studioUrl: source.scheduleUrl,
          sortKey: `${date}T${String(minutesInto(m?.[1] ?? '')).padStart(4, '0')}`,
        })
      }
    }
  }

  return { sessions, totalSessions, trainerOnRoster, rosterSize }
}
