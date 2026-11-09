// An event's Repeats setting (the console's Event) turned into dates. No imports,
// so scripts/recurrence.test.mjs runs it under node.
//
//   repeat        none | custom | weekly | biweekly | monthlyDate | monthlyWeekday
//   moreDates     the chosen dates, read only when repeat is custom
//   repeatUntil   the last day a regular pattern runs; blank is ongoing
//   skipDates     days a regular pattern leaves out

export const REGULAR = ['weekly', 'biweekly', 'monthlyDate', 'monthlyWeekday']
// A regular pattern has no last date of its own, so a list of it stops here.
export const MAX_DATES = 12

// Built from parts, not new Date(string), which parses a bare date as UTC and
// lands on the previous day west of GMT.
const parse = (iso) => { const [y, m, d] = String(iso).split('-').map(Number); return new Date(y, m - 1, d) }
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const daysIn = (y, m) => new Date(y, m + 1, 0).getDate()

// The nth of a weekday in a month; the fifth means the last, as in Outlook.
function nthWeekday(y, m, weekday, n) {
  const first = 1 + ((weekday - new Date(y, m, 1).getDay() + 7) % 7)
  const day = first + (n - 1) * 7
  return n >= 5 || day > daysIn(y, m) ? first + Math.floor((daysIn(y, m) - first) / 7) * 7 : day
}

// The kth date of a pattern that starts on `start` (k = 0 is the start itself).
function step(repeat, start, k) {
  const y = start.getFullYear(), m = start.getMonth(), d = start.getDate()
  if (repeat === 'weekly') return new Date(y, m, d + 7 * k)
  if (repeat === 'biweekly') return new Date(y, m, d + 14 * k)
  const at = new Date(y, m + k, 1)
  if (repeat === 'monthlyDate') return new Date(at.getFullYear(), at.getMonth(), Math.min(d, daysIn(at.getFullYear(), at.getMonth())))
  return new Date(at.getFullYear(), at.getMonth(), nthWeekday(at.getFullYear(), at.getMonth(), start.getDay(), Math.ceil(d / 7)))
}

// The dates of a regular pattern from `now` on, soonest first, `max` at most.
export function regularDates(e, now, max = MAX_DATES) {
  if (!e?.date || !REGULAR.includes(e.repeat)) return []
  const start = parse(e.date)
  const skip = new Set((e.skipDates || []).map((s) => s.date))
  const out = []
  for (let k = 0; k < 800 && out.length < max; k += 1) {
    const day = iso(step(e.repeat, start, k))
    if (e.repeatUntil && day > e.repeatUntil) break
    if (day >= now && !skip.has(day)) out.push(day)
  }
  return out
}

const ORDINAL = ['first', 'second', 'third', 'fourth', 'last']
const nth = (n) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'}`

// A regular pattern in words: "Every Saturday", "Every other Saturday",
// "Monthly on the 12th", "Monthly on the second Saturday". '' for none and custom.
export function repeatText(e) {
  if (!e?.date || !REGULAR.includes(e.repeat)) return ''
  const start = parse(e.date)
  const weekday = start.toLocaleDateString(undefined, { weekday: 'long' })
  if (e.repeat === 'weekly') return `Every ${weekday}`
  if (e.repeat === 'biweekly') return `Every other ${weekday}`
  if (e.repeat === 'monthlyDate') return `Monthly on the ${nth(start.getDate())}`
  return `Monthly on the ${ORDINAL[Math.min(5, Math.ceil(start.getDate() / 7)) - 1]} ${weekday}`
}
