/* eslint-disable react/prop-types */
// "Next class and event banner": the next live class, then the next upcoming
// event under it.
//
// The class is what the owner typed; with no class name it is the next class
// on her teaching schedule (content/schedule/melissa.json, harvested nightly).
// The event is the earliest Event document dated today or later. With none, the
// event half is hidden on the site; while the editor is open it stays, marked
// hidden, so she can see where it will appear.
import { useEffect, useState } from 'react'
import scheduleData from '../../../content/schedule/melissa.json'
import { useDocuments } from '../../cms/site'
import { srcOf, altOf } from './photo'

// Today as YYYY-MM-DD in the visitor's own time zone.
function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 'YYYY-MM-DD' → "Sunday, October 4". Built from parts, not new Date(string),
// which parses a bare date as UTC and lands on the previous day west of GMT.
function formatDay(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

// Whether the console's editor is open on this page. The bridge has no event
// for it, so this looks once a second; it only matters to the owner.
function useEditing() {
  const [editing, setEditing] = useState(() => Boolean(window.EOTM?.editing))
  useEffect(() => {
    const t = setInterval(() => setEditing(Boolean(window.EOTM?.editing)), 1000)
    return () => clearInterval(t)
  }, [])
  return editing
}

function nextScheduledClass() {
  const now = today()
  const studios = scheduleData.studios || []
  const s = (scheduleData.sessions || []).filter((x) => x.date >= now).sort((a, b) => a.sortKey.localeCompare(b.sortKey))[0]
  if (!s) return null
  const studio = studios.find((x) => x.label === s.studio)
  return { name: s.name, date: s.date, time: s.startTime, studio: s.studio, url: studio?.scheduleUrl || s.studioUrl }
}

function ClassPart({ block }) {
  const typed = block.className?.trim()
  const c = typed
    ? { name: typed, date: block.classDate, time: block.classTime, studio: block.studio, url: block.signUpUrl }
    : nextScheduledClass()
  if (!c) return null
  const url = typed ? block.signUpUrl : block.signUpUrl || c.url
  return (
    <div className="next-up__part">
      <p className="next-up__eyebrow" data-eotm-text="classHeading">{block.classHeading || 'Next Live Class'}</p>
      <h3 className="next-up__title" {...(typed ? { 'data-eotm-text': 'className' } : {})}>{c.name}</h3>
      <p className="next-up__meta">
        {[formatDay(c.date), c.time, c.studio].filter(Boolean).join(' · ')}
      </p>
      {block.showSignUp !== false && url && (
        <a className="btn" href={url} target={url.startsWith('/') ? undefined : '_blank'} rel="noreferrer">
          {block.signUpLabel || 'Sign Up Now'}
        </a>
      )}
    </div>
  )
}

function EventPart({ block }) {
  const { ready, docs } = useDocuments('event')
  const editing = useEditing()
  if (block.showEvent === false || !ready) return null
  const now = today()
  const next = docs
    .map((d) => d.data || {})
    .filter((e) => e.title && e.date && e.date >= now)
    .sort((a, b) => a.date.localeCompare(b.date))[0]
  if (!next && !editing) return null
  const heading = <p className="next-up__eyebrow" data-eotm-text="eventHeading">{block.eventHeading || 'Next Upcoming Event'}</p>
  if (!next) {
    return (
      <div className="next-up__part next-up__part--hidden">
        {heading}
        <p className="next-up__status">Hidden on the site: no event from today on. Add one under Events.</p>
      </div>
    )
  }
  return (
    <div className="next-up__part">
      {heading}
      {srcOf(next.image) && <img className="next-up__image" src={srcOf(next.image)} alt={altOf(next.image)} />}
      <h3 className="next-up__title">{next.title}</h3>
      <p className="next-up__meta">
        {[formatDay(next.date), [next.startTime, next.endTime].filter(Boolean).join(' to '), next.location].filter(Boolean).join(' · ')}
      </p>
      {next.description && <div className="next-up__body" dangerouslySetInnerHTML={{ __html: next.description }} />}
      {next.linkUrl && (
        <a className="btn" href={next.linkUrl} target={next.linkUrl.startsWith('/') ? undefined : '_blank'} rel="noreferrer">
          {next.linkLabel || 'Learn More'}
        </a>
      )}
    </div>
  )
}

// Layout, alignment and text size are the owner's (the section's own fields).
export default function NextUp({ block, className, marks }) {
  const mods = [
    block.layout === 'side' && 'next-up--side',
    block.align === 'left' && 'next-up--left',
    ['small', 'large'].includes(block.textSize) && `next-up--${block.textSize}`,
  ].filter(Boolean).join(' ')
  return (
    <section className={className} {...marks}>
      <div className={`panel next-up ${mods}`}>
        <ClassPart block={block} />
        <EventPart block={block} />
      </div>
    </section>
  )
}
