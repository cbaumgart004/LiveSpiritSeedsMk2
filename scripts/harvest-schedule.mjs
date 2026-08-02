// Builds content/schedule/melissa.json — one merged, chronological list of the
// classes Melissa teaches across every studio in scripts/lib/schedule-sources.mjs.
//
// Run daily by .github/workflows/harvest-schedule.yml. The site imports the
// result at build time, so the page has NO runtime dependency on any studio's
// booking widget (see DESIGN.md §6 — the site already depends on TinaCloud at
// runtime and we don't want to compound that).
//
// FAILURE SEMANTICS — the point is to page a human only when something is
// actually broken, never for a quiet week:
//
//   ok      the source answered and the roster still lists her.
//           Zero classes is a legitimate result (holiday, time off) and is NOT
//           an alert. Do not "fix" this by failing on an empty session list.
//   stale   the source failed. We keep whatever we harvested last time so the
//           studio doesn't silently vanish from the site, and exit non-zero.
//   error   the source answered but is not usable:
//             - it returned zero sessions for EVERY instructor → widget broke
//             - Melissa is no longer on the studio's instructor roster
//               → she was removed, or the trainerId changed
//
// A non-zero exit fails the workflow, and GitHub emails the repo owner. That is
// the whole notification mechanism — no extra service to run or pay for.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ENABLED_SOURCES, TEACHER } from './lib/schedule-sources.mjs'
import { harvest as healcode } from './lib/adapters/healcode.mjs'
import { harvest as tribeEvents } from './lib/adapters/tribe-events.mjs'
import { harvest as momence } from './lib/adapters/momence.mjs'
import { harvest as punchpassIcs } from './lib/adapters/punchpass-ics.mjs'

const ADAPTERS = {
  healcode,
  'tribe-events': tribeEvents,
  momence,
  'punchpass-ics': punchpassIcs,
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'content/schedule/melissa.json')

// How far ahead to look. Harvest generously and let the page decide how much to
// show (the embed block's "most classes to show" field) — a studio with a weekly
// class looks empty on a 2-week window, and the extra requests are trivial.
const WEEKS = Number(process.env.SCHEDULE_WEEKS || 4)

async function readPrevious() {
  try {
    return JSON.parse(await readFile(OUT, 'utf8'))
  } catch {
    return { sessions: [] }
  }
}

async function run() {
  const previous = await readPrevious()
  const today = new Date().toISOString().slice(0, 10)

  const sessions = []
  const report = []
  let failed = false

  for (const source of ENABLED_SOURCES) {
    const adapter = ADAPTERS[source.adapter]
    if (!adapter) {
      report.push({ id: source.id, label: source.label, status: 'error', detail: `no adapter "${source.adapter}"` })
      failed = true
      continue
    }

    try {
      const {
        sessions: found,
        totalSessions,
        trainerOnRoster,
        rosterSize,
        emptyWindowIsError = true,
      } = await adapter(source, { weeks: WEEKS })

      if (emptyWindowIsError && totalSessions === 0) {
        throw new Error('source returned 0 sessions for every instructor — endpoint or widget id has changed')
      }
      if (!trainerOnRoster) {
        throw new Error(
          `trainerId ${source.trainerId} is not on the studio roster (${rosterSize} instructors) — removed, or the id changed`,
        )
      }

      sessions.push(...found)
      report.push({
        id: source.id,
        label: source.label,
        status: 'ok',
        classes: found.length,
        scanned: totalSessions,
      })
      console.log(`✓ ${source.label}: ${found.length} class(es) for ${TEACHER} (scanned ${totalSessions})`)
    } catch (err) {
      // Keep the last good data for this studio rather than dropping it.
      const kept = (previous.sessions || []).filter((s) => s.id.startsWith(`${source.id}:`) && s.date >= today)
      sessions.push(...kept)
      report.push({ id: source.id, label: source.label, status: 'stale', detail: err.message, classes: kept.length })
      failed = true
      console.error(`✗ ${source.label}: ${err.message} (kept ${kept.length} previously harvested class(es))`)
    }
  }

  const upcoming = sessions
    .filter((s) => s.date >= today)
    .sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0))

  const payload = {
    _generated: 'DO NOT EDIT BY HAND. Rebuilt daily by scripts/harvest-schedule.mjs.',
    teacher: TEACHER,
    generatedAt: new Date().toISOString(),
    rangeStart: today,
    weeks: WEEKS,
    sources: report,
    // Carried so the site can still link people to each studio on a week with
    // no classes — that's precisely when the sessions list can't supply a URL.
    studios: ENABLED_SOURCES.map((s) => ({ id: s.id, label: s.label, scheduleUrl: s.scheduleUrl })),
    sessions: upcoming,
  }

  await mkdir(dirname(OUT), { recursive: true })
  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`\nWrote ${upcoming.length} upcoming class(es) to content/schedule/melissa.json`)

  if (failed) {
    console.error('\nOne or more sources need review — see the ✗ lines above.')
    process.exit(1)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
