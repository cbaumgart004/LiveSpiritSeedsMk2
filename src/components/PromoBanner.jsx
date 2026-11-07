/* eslint-disable react/prop-types */
// The announcement banner under the services strip, on every page. It turns
// through its slides (Site settings: promoSlides, promoTransition, promoFade,
// promoSeconds, with promoOn and promoUntil). It sits in the page flow, so it
// scrolls away; while it shows, <body> carries has-promo and the first section
// stops clearing the fixed bars itself, since the banner already does
// (promo.css).
//
// A slide is a picture and words, or the upcoming events: the section headings
// of the events page (and any dated event still to come), each a link to it.
// The console copies a slide from a section on the site and the owner changes
// it from there, so the banner shows what she saved, not the section live.
// Until she saves her own: Memberships, Upcoming events, Book a Massage (from
// the first service on the services page) and Connect.
//
// The slides share one grid cell, so the banner keeps the height of the
// tallest and nothing below it moves as they turn. It pauses while pointed at
// or focused, and holds the first slide under reduced motion.
//
// Hidden when switched off, after its end date, or once a visitor closes it.
// Closing is remembered per set of headings in this browser, so a new
// announcement shows again to everyone.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDocuments, useSettings, hrefForSlug, slugify } from '../cms/site'
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

const storeKey = (key) => `promo-closed:${key}`
function wasClosed(key) {
  try { return localStorage.getItem(storeKey(key)) === '1' } catch { return false }
}

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

// What an events slide lists: dated events still to come, then the section
// headings of its events page, `count` at most.
function eventLinks(slide, pages, events) {
  const slug = String(slide.eventsPage || 'upcoming').replace(/^\/+|\/+$/g, '')
  const page = pages.find((p) => p.slug === slug)
  const base = hrefForSlug(slug)
  const dated = events.filter((e) => e.data?.title && (!e.data.date || e.data.date >= today()))
    .sort((a, b) => String(a.data.date || '').localeCompare(String(b.data.date || '')))
    .map((e) => ({ key: e.id || e.slug, title: e.data.title, href: e.data.linkUrl || base }))
  const sections = (page?.data?.blocks || []).filter((b) => typeof b.title === 'string' && b.title.trim())
    .map((b) => ({ key: b._id || b.title, title: b.title.trim(), href: `${base}#${slugify(b.title)}` }))
  const seen = new Set()
  return [...dated, ...sections].filter((l) => !seen.has(l.title) && seen.add(l.title)).slice(0, Math.max(1, Number(slide.count) || 3))
}

const external = (url) => !url.startsWith('/') && !url.startsWith('#')
const newTab = (url) => (external(url) ? { target: '_blank', rel: 'noreferrer' } : {})

function Slide({ slide, links, on, out, saved }) {
  const url = slide.url || ''
  return (
    <div className={`promo__slide${on ? ' is-on' : ''}${out ? ' is-out' : ''}`} aria-hidden={!on} inert={on ? undefined : ''}
      {...(saved && slide._id ? { 'data-eotm-item': slide._id } : {})}>
      <div className="promo__inner">
        {slide.image?.src && <img className="promo__thumb" src={slide.image.src} alt={slide.image.alt || ''} loading="lazy" />}
        {slide.eyebrow && <span className="promo__eyebrow">{slide.eyebrow}</span>}
        <div className="promo__copy">
          <p className="promo__title">{slide.title}</p>
          {slide.kind === 'events' ? (
            links.length > 0 && (
              <ul className="promo__events">
                {links.map((l) => <li key={l.key}><a href={l.href} {...newTab(l.href)}>{l.title}</a></li>)}
              </ul>
            )
          ) : slide.text && <p className="promo__text">{slide.text}</p>}
        </div>
        {url && <a className="btn promo__link" href={url} {...newTab(url)}>{slide.label || 'Learn more'}</a>}
      </div>
    </div>
  )
}

export default function PromoBanner() {
  const { settings } = useSettings()
  const { docs: pages } = useDocuments('page')
  const { docs: events } = useDocuments('event')
  const saved = Array.isArray(settings.promoSlides) && settings.promoSlides.length > 0
  const slides = useMemo(() => (saved ? settings.promoSlides : defaultSlides(settings, pages)).filter((s) => s?.title),
    [saved, settings, pages])
  const transition = TRANSITIONS.includes(settings.promoTransition) ? settings.promoTransition : 'fade'
  const fade = Math.min(4, Math.max(0.3, Number(settings.promoFade) || 1.5))
  const seconds = Math.min(30, Math.max(4, Number(settings.promoSeconds) || 8))

  const closeKey = slides.map((s) => s.title).join('|')
  const [closed, setClosed] = useState(() => wasClosed(closeKey))
  useEffect(() => setClosed(wasClosed(closeKey)), [closeKey])

  const [cur, setCur] = useState(0)
  const [prev, setPrev] = useState(null)
  const [paused, setPaused] = useState(false)
  const box = useRef(null)
  const index = slides.length ? cur % slides.length : 0
  const go = (n) => {
    setPrev(index)
    setCur(((n % slides.length) + slides.length) % slides.length)
  }

  const expired = settings.promoUntil && today() > settings.promoUntil
  const show = settings.promoOn !== false && !expired && !closed && slides.length > 0

  useEffect(() => {
    if (!show) return undefined
    document.body.classList.add('has-promo')
    return () => document.body.classList.remove('has-promo')
  }, [show])

  useEffect(() => {
    if (!show || paused || slides.length < 2) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    const t = setTimeout(() => go(index + 1), seconds * 1000)
    return () => clearTimeout(t)
  }, [show, paused, index, slides.length, seconds]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!show) return null

  const close = () => {
    try { localStorage.setItem(storeKey(closeKey), '1') } catch { /* private window: closes for this visit only */ }
    setClosed(true)
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
      data-eotm-edit="settings:settings" data-eotm-label="announcement banner" data-eotm-field="promoSlides">
      <div className="promo__stage">
        {slides.map((s, i) => (
          <Slide key={s._id || i} slide={s} on={i === index} out={i === prev && i !== index} saved={saved}
            links={s.kind === 'events' ? eventLinks(s, pages, events) : []} />
        ))}
      </div>
      {slides.length > 1 && (
        <div className="promo__dots">
          {slides.map((s, i) => (
            <button key={s._id || i} type="button" className={`promo__dot${i === index ? ' is-on' : ''}`}
              aria-label={`Show ${s.title}`} aria-current={i === index ? 'true' : undefined} onClick={() => i !== index && go(i)} />
          ))}
        </div>
      )}
      <button type="button" className="promo__close" aria-label="Close announcement" onClick={close}>×</button>
    </aside>
  )
}
