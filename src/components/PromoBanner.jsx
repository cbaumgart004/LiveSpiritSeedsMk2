/* eslint-disable react/prop-types */
// The announcement banner under the services strip, on every page. It turns
// through its slides (Site settings: promoSlides, promoTransition, promoFade,
// promoSeconds, with promoOn and promoUntil). It sits in the page flow, so it
// scrolls away; while it shows, <body> carries has-promo and the first section
// stops clearing the fixed bars itself, since the banner already does
// (promo.css).
//
// A slide is a picture and words, or the upcoming events: each Event from today
// on in turn (its picture, name and date, linked to its card on the events
// page), before the next slide. With no such event it lists the section
// headings of the events page instead, each a link to it.
// The console copies a slide from a section on the site and the owner changes
// it from there, so the banner shows what she saved, not the section live.
// Until she saves her own: Memberships, Upcoming events, Book a Massage (from
// the first service on the services page) and Connect.
//
// Each slide is a canvas of its own (Frame.jsx, like a card in Blocks.jsx
// CardGrid): its picture, tag, title, words and button are parts the console's
// Arrange moves and sizes. A saved slide keeps its arrangement in its own row
// of promoSlides (_layout); an event's slide in that Event (_layout_banner), so
// each event can be arranged differently.
//
// The slides share one grid cell, so the banner keeps the height of the
// tallest and nothing below it moves as they turn. It pauses while pointed at
// or focused, while the owner arranges, and holds the first slide under
// reduced motion.
//
// Hidden when switched off or after its end date. Visitors cannot close it;
// they swipe between slides. The slide picker at the foot shows only while
// the owner arranges, so she can reach each slide.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDocuments, useSettings, hrefForSlug, slugify } from '../cms/site'
import { upcomingEvents, formatDay, timeText, eventAnchor } from '../cms/events'
import { EventIcon } from './cms/EventList'
import { frameOf } from './cms/Frame'
import '../styles/promo.css'

const CONNECT_INTRO = 'Welcome to a journey of healing and transformation! Subscribe to our newsletter for insights on trauma-informed yoga, neuroscience-based massage practices, and holistic wellness tips. Join our community today!'
const MASSAGE_TEXT = 'Melissa uses tools from several modalities including Thai Yoga stretching, sound healing, passive Yin, reiki, and Abhyanga. We work intuitively to bring wellness to the whole person: mind, body and spirit.'
const TRANSITIONS = ['fade', 'crossfade', 'slide', 'none']

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const plain = (html) => String(html || '').replace(/<\/(p|h[1-6]|li|div)>|<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

// The banner once had a close button that hid it per browser. Forget those.
try { Object.keys(localStorage).filter((k) => k.startsWith('promo-closed:')).forEach((k) => localStorage.removeItem(k)) } catch { /* storage blocked */ }

function defaultSlides(settings, pages) {
  const services = pages.find((p) => p.slug === 'services')
  const massage = (services?.data?.blocks || []).find((b) => b._type === 'service' && b.title)
  return [
    { _id: 'memberships', kind: 'card', eyebrow: 'New', title: 'Monthly Bodywork Memberships',
      text: 'Your body thrives with consistent care. Rooted, Flourish and Thrive memberships make regular bodywork part of your self-care, with priority booking and member rates.',
      label: 'Explore Memberships', url: 'https://spiritseedswellnessmelissacarey.offeringtree.com/offering_packages' },
    { _id: 'events', kind: 'events', eyebrow: 'Upcoming', title: 'Upcoming Events', count: 3, eventsPage: 'upcoming', label: 'See all events', url: '/upcoming' },
    { _id: 'massage', kind: 'card', eyebrow: 'Massage', title: 'Book a Massage', text: plain(massage?.description) || MASSAGE_TEXT,
      image: massage?.image || null, label: 'Book a Massage', url: `/services#${slugify(massage?.title || 'Integrative Massage Sessions')}` },
    { _id: 'connect', kind: 'card', eyebrow: 'Connect', title: settings.connectTitle || 'Subscribe to our newsletter',
      text: settings.connectIntro || CONNECT_INTRO, label: settings.connectLabel || 'Connect', url: '/connect' },
  ]
}

const eventsSlug = (slide) => String(slide.eventsPage || 'upcoming').replace(/^\/+|\/+$/g, '')

// An events slide with no Event to come: the section headings of its events
// page, `count` at most.
function sectionLinks(slide, pages) {
  const slug = eventsSlug(slide)
  const page = pages.find((p) => p.slug === slug)
  const base = hrefForSlug(slug)
  return (page?.data?.blocks || []).filter((b) => typeof b.title === 'string' && b.title.trim())
    .map((b) => ({ key: b._id || b.title, title: b.title.trim(), href: `${base}#${slugify(b.title)}` }))
    .slice(0, Math.max(1, Number(slide.count) || 3))
}

// The slides as shown: an events slide becomes one slide per Event to come
// (`count` at most), keeping its tag; each links to the event's card.
function expand(slides, pages, events) {
  const coming = upcomingEvents(events)
  return slides.flatMap((s) => {
    if (s.kind !== 'events') return [s]
    if (!coming.length) return [{ ...s, links: sectionLinks(s, pages) }]
    const base = hrefForSlug(eventsSlug(s))
    return coming.slice(0, Math.max(1, Number(s.count) || 3)).map((d) => ({
      _id: s._id, _key: `${s._id || 'events'}:${d.id || d.slug}`, kind: 'event', eyebrow: s.eyebrow,
      title: d.data.title, when: [formatDay(d.next.date, { weekday: 'short', month: 'short' }), d.next.startTime].filter(Boolean).join(' · '),
      fullWhen: [formatDay(d.next.date), timeText(d.next)].filter(Boolean).join(', '),
      image: d.data.image, icon: d.data.icon, label: 'Details', url: `${base}#${eventAnchor(d)}`, doc: d,
    }))
  })
}

const external = (url) => !url.startsWith('/') && !url.startsWith('#')
const newTab = (url) => (external(url) ? { target: '_blank', rel: 'noreferrer' } : {})

// What the console edits a slide as, and where its arrangement is kept.
function canvasOf(slide, saved) {
  const doc = slide.doc
  if (slide.kind === 'event') {
    const own = doc?.id && !String(doc.id).startsWith('bundled:')
    return { frame: frameOf(doc?.data, 'banner'), marks: own ? { 'data-eotm-edit': `event:${doc.id}`, 'data-eotm-frame-key': 'banner', 'data-eotm-label': slide.title } : {}, text: own ? {} : null }
  }
  const own = saved && slide._id
  return { frame: frameOf(slide), marks: own ? { 'data-eotm-edit': 'settings:settings', 'data-eotm-item': slide._id, 'data-eotm-label': slide.title } : {}, text: own ? { 'data-eotm-in': slide._id } : null }
}

function Slide({ slide, on, out, saved }) {
  const url = slide.url || ''
  const links = slide.links || []
  const { frame, marks, text } = canvasOf(slide, saved)
  const { style: rootStyle, ...rootMarks } = frame.root
  const typed = (field) => (text ? { 'data-eotm-text': field, ...text } : {})
  return (
    <div className={`promo__slide${on ? ' is-on' : ''}${out ? ' is-out' : ''}`} aria-hidden={!on} inert={on ? undefined : ''}
      {...marks} {...rootMarks} style={rootStyle}>
      <div className="promo__inner" {...frame.wrap}>
        {slide.image?.src ? <img className="promo__thumb" src={slide.image.src} alt={slide.image.alt || ''} loading="lazy" {...frame.part('thumb')} />
          : slide.kind === 'event' && <span className="promo__thumb promo__thumb--icon" {...frame.part('thumb')}><EventIcon name={slide.icon} /></span>}
        {slide.eyebrow && <span className="promo__eyebrow" {...frame.part('eyebrow')}>{slide.eyebrow}</span>}
        <div className="promo__copy" {...frame.wrap}>
          <p className="promo__title" {...typed('title')} {...frame.part('title')}>{slide.title}</p>
          {slide.kind === 'event' ? (
            <p className="promo__text promo__when" {...frame.part('text')}><time title={slide.fullWhen}>{slide.when}</time></p>
          ) : slide.kind === 'events' ? (
            links.length > 0 && (
              <ul className="promo__events" {...frame.part('text')}>
                {links.map((l) => <li key={l.key}><a href={l.href} {...newTab(l.href)}>{l.title}</a></li>)}
              </ul>
            )
          ) : slide.text && <p className="promo__text" {...typed('text')} {...frame.part('text')}>{slide.text}</p>}
        </div>
        {url && <a className="btn promo__link" href={url} {...newTab(url)} {...frame.part('button')}>{slide.label || 'Learn more'}</a>}
      </div>
    </div>
  )
}

export default function PromoBanner() {
  const { settings } = useSettings()
  const { docs: pages } = useDocuments('page')
  const { docs: events } = useDocuments('event')
  const saved = Array.isArray(settings.promoSlides) && settings.promoSlides.length > 0
  const slides = useMemo(() => expand((saved ? settings.promoSlides : defaultSlides(settings, pages)).filter((s) => s?.title), pages, events),
    [saved, settings, pages, events])
  const transition = TRANSITIONS.includes(settings.promoTransition) ? settings.promoTransition : 'fade'
  const fade = Math.min(4, Math.max(0.3, Number(settings.promoFade) || 1.5))
  const seconds = Math.min(30, Math.max(4, Number(settings.promoSeconds) || 8))

  const [cur, setCur] = useState(0)
  const [prev, setPrev] = useState(null)
  const [paused, setPaused] = useState(false)
  // While the owner arranges (the console's Arrange mode), the slide showing stays.
  const [, setWait] = useState(0)
  const box = useRef(null)
  const index = slides.length ? cur % slides.length : 0
  const go = (n) => {
    setPrev(index)
    setCur(((n % slides.length) + slides.length) % slides.length)
  }

  const expired = settings.promoUntil && today() > settings.promoUntil
  const show = settings.promoOn !== false && !expired && slides.length > 0

  useEffect(() => {
    if (!show) return undefined
    document.body.classList.add('has-promo')
    return () => document.body.classList.remove('has-promo')
  }, [show])

  useEffect(() => {
    if (!show || paused || slides.length < 2) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    const t = setTimeout(() => (document.documentElement.classList.contains('eotm-arranging') ? setWait((w) => w + 1) : go(index + 1)), seconds * 1000)
    return () => clearTimeout(t)
  })

  if (!show) return null

  // A horizontal swipe moves a slide; arranging owns the pointer, so not then.
  const swipe = (e) => {
    const start = box.current?.swipeX
    if (box.current) box.current.swipeX = null
    if (start == null || slides.length < 2 || document.documentElement.classList.contains('eotm-arranging')) return
    const dx = e.changedTouches[0].clientX - start
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
  }
  // Pointing or focus inside pauses it; leaving resumes, unless the other still holds.
  const leave = (e) => {
    if (e.type === 'blur' && box.current?.contains(e.relatedTarget)) return
    if (e.type === 'mouseleave' && box.current?.contains(document.activeElement)) return
    setPaused(false)
  }

  return (
    <aside ref={box} className="promo" aria-label="Announcement" aria-roledescription="carousel"
      data-transition={transition} data-moved={prev != null ? '' : undefined} style={{ '--promo-fade': `${fade}s` }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={leave} onFocus={() => setPaused(true)} onBlur={leave}
      onTouchStart={(e) => { box.current.swipeX = e.touches[0].clientX }} onTouchEnd={swipe}
      data-eotm-edit="settings:settings" data-eotm-label="announcement banner" data-eotm-field="promoSlides">
      <div className="promo__stage">
        {slides.map((s, i) => (
          <Slide key={s._key || s._id || i} slide={s} on={i === index} out={i === prev && i !== index} saved={saved} />
        ))}
      </div>
      {slides.length > 1 && (
        <div className="promo__dots">
          {slides.map((s, i) => (
            <button key={s._key || s._id || i} type="button" className={`promo__dot${i === index ? ' is-on' : ''}`}
              aria-label={`Show ${s.title}`} aria-current={i === index ? 'true' : undefined} onClick={() => i !== index && go(i)} />
          ))}
        </div>
      )}
    </aside>
  )
}
