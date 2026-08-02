// Where Melissa teaches. One entry per studio; the harvester walks this list and
// merges every result into a single chronological schedule (content/schedule/melissa.json).
//
// Adding a studio is a config change, not a code change — unless the studio runs
// a platform we have no adapter for yet, in which case add one under ./adapters.
//
// HOW TO FILL IN A HEALCODE (Mindbody) STUDIO
//   1. Open the studio's schedule page, View Source, find <healcode-widget data-type="schedules">.
//   2. In DevTools > Network, reload and look for a request to
//      widgets.mindbodyonline.com/widgets/schedules/<NUMBER>/load_markup
//      That <NUMBER> is `widgetId` below (it is NOT the long hex data-widget-id).
//   3. Melissa's `trainerId` is in that response: JSON.parse(res.filters).trainer
//      — find her name, take the id. Mindbody trainer ids are stable.

export const TEACHER = 'Melissa Carey'

export const SOURCES = [
  {
    id: 'soultree',
    label: 'Soul Tree Yoga',
    adapter: 'healcode',
    // Shown as the "see the full schedule" link, and in each session's studio tag.
    scheduleUrl: 'https://soultreecolorado.com/classes/yogaschedules/',
    // From widgets.mindbodyonline.com/widgets/schedules/15277/load_markup
    widgetId: '15277',
    // filters.trainer → { id: '100000109', name: 'Melissa Carey' }
    trainerId: '100000109',
    enabled: true,
  },

  {
    id: 'mesa',
    label: 'MESA',
    adapter: 'tribe-events',
    scheduleUrl: 'https://movingtoendsexualassault.org/calendar/',
    apiBase: 'https://movingtoendsexualassault.org',
    // Tribe has no instructor field, so we match the description. MESA writes an
    // explicit "Instructor: Melissa Carey" line on each class; this deliberately
    // requires her NAME rather than the class title, so if they hand the class to
    // someone else it drops off the site instead of crediting her for it.
    instructorPattern: 'Melissa\\s+Carey',
    teacherName: TEACHER,
    enabled: true,
  },

  {
    id: 'allpurpose',
    label: 'All Purpose Yoga',
    adapter: 'momence',
    scheduleUrl: 'https://allpurposeyoga.com/schedule/',
    // From readonly-api.momence.com/host-plugins/host/87939/host-schedule/…
    hostId: '87939',
    // NOTE: Momence lists her as "Melissa Christine Carey" — the middle name is
    // why this source matches on the numeric id rather than her name.
    teacherId: 263311,
    timeZone: 'America/Denver',
    enabled: true,
  },

  {
    id: 'cura',
    label: 'CURA Yoga Center',
    adapter: 'punchpass-ics',
    scheduleUrl: 'https://curayogacenter.com/schedule/',
    // Public iCal feed; org id is in the studio's /calendar_feed_info page.
    icsUrl: 'https://curayogacenter.punchpass.com/org/5744/calendars/all_classes.ics',
    // Punchpass exposes no teacher id — the instructor is the event ORGANIZER's
    // CN. Matches co-taught classes ("Adriana Wignall & Melissa Carey") too.
    instructorPattern: 'Melissa\\s+Carey',
    timeZone: 'America/Denver',
    enabled: true,
  },

  // --- Add further studios here. -------------------------------------------
  // Healcode/Mindbody template (see the how-to at the top of this file):
  //
  // {
  //   id: 'studio-c',
  //   label: 'Studio C',
  //   adapter: 'healcode',
  //   scheduleUrl: 'https://studio-c.example/schedule',
  //   widgetId: '00000',
  //   trainerId: '000000000',
  //   enabled: false,
  // },
]

export const ENABLED_SOURCES = SOURCES.filter((s) => s.enabled)
