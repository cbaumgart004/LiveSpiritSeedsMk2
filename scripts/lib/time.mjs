// Shared time formatting for the schedule adapters.
//
// The four platforms hand us times in three different shapes, and getting this
// wrong shows a class at the wrong hour on the site:
//
//   healcode      already-local strings ("6:00 PM ... MDT") — no conversion
//   tribe-events  local wall time + a timezone_abbr field   — no conversion
//   momence       a UTC instant ("2026-08-06T01:00:00.000Z") — MUST convert
//   punchpass     wall time + TZID ("20260808T140000")       — MUST resolve
//
// Everything ends up as { date, time, minutes, abbr } in the studio's own zone,
// which is what the merged JSON and the page both expect.

// Milliseconds that `tz` is offset from UTC at a given instant. Derived by
// formatting the instant in that zone and reading the wall clock back.
function offsetAt(utcMs, tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs))

  const at = (t) => Number(parts.find((p) => p.type === t).value)
  // hour can come back as 24 for midnight under hour12:false.
  const asUTC = Date.UTC(at('year'), at('month') - 1, at('day'), at('hour') % 24, at('minute'), at('second'))
  return asUTC - utcMs
}

/** Format an instant (Date or ISO string) as wall time in `tz`. */
export function formatInstant(instant, tz) {
  const d = instant instanceof Date ? instant : new Date(instant)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).formatToParts(d)

  const get = (t) => parts.find((p) => p.type === t)?.value ?? ''
  const hour = Number(get('hour'))
  const minute = Number(get('minute'))
  const dayPeriod = get('dayPeriod').toUpperCase().replace(/[^AP M]/g, '')
  const h24 = (hour % 12) + (dayPeriod.startsWith('P') ? 12 : 0)

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${hour}:${get('minute')} ${dayPeriod}`,
    minutes: h24 * 60 + minute,
    abbr: get('timeZoneName'),
  }
}

/**
 * Resolve a wall-clock time in `tz` to a real instant. Two passes because the
 * offset depends on the instant we're trying to find — the second pass fixes
 * the hour either side of a DST change.
 */
export function wallToInstant({ year, month, day, hour = 0, minute = 0 }, tz) {
  const guess = Date.UTC(year, month - 1, day, hour, minute)
  const first = offsetAt(guess, tz)
  let ms = guess - first
  const second = offsetAt(ms, tz)
  if (second !== first) ms = guess - second
  return new Date(ms)
}

/** Format a wall-clock time expressed in `tz` (no conversion, just labelling). */
export function formatWall(wall, tz) {
  return formatInstant(wallToInstant(wall, tz), tz)
}

/** Sortable key so sessions from different studios interleave correctly. */
export const sortKeyFor = (date, minutes) => `${date}T${String(minutes).padStart(4, '0')}`
