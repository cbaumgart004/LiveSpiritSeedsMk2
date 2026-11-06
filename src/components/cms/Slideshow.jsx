/* eslint-disable react/prop-types */
// "Slideshow (photos and videos)": the owner's photos and short videos, one at
// a time, crossfading slowly (2.5s) every `seconds`. A video plays muted and inline and the
// show moves on when it ends. Hovering, focusing or tapping the show pauses it;
// a swipe on a phone or a dot moves it. Under reduced motion it never moves on
// its own and a video waits for its play button.
//
// Only the slide showing and the next one load; the rest wait, so a long show
// costs the page nothing until it gets there.
//
// With "When the page scrolls" on "over" (the default) the page slides up over
// the show: once its middle reaches the middle of the screen it stays there,
// at 80% opacity, while the blocks after it (raised above it in slideshow.css)
// scroll over it. The opening card (the block just before the show) scrolls
// up as usual until the show is held, then stops where it is, one gap above the
// show, while the next card slides up over the show; once that card is one gap
// under it the two scroll on together, so the cards close up rather than
// leaving the show's height of empty page. That joining is the page layout's
// "Cards around a slideshow" (data-cards on <main>); 'apart' leaves the cards
// where they are. Reduced motion keeps it all in the page flow.
import { useCallback, useEffect, useRef, useState } from 'react'
import Elements from './Elements'
import { PLACEHOLDER_MEDIA } from './placeholderMedia'
import { altOf, imageStyle, srcOf } from './photo'
import '../../styles/slideshow.css'

const SHAPES = { wide: '16 / 9', photo: '4 / 3', square: '1 / 1', tall: '4 / 5' }

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function Slideshow({ block, className, marks, frame }) {
  const own = (block.media || []).filter((m) => srcOf(m))
  const slides = own.length ? own : PLACEHOLDER_MEDIA
  const count = slides.length
  const seconds = Math.min(20, Math.max(3, Number(block.seconds) || 6))
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [still] = useState(reducedMotion)
  const [seen, setSeen] = useState(() => new Set([0, 1]))
  // The first slide's width / height, learned as it loads: the frame keeps that
  // one shape for the whole show (unless the owner chose a shape), so changing
  // slides never changes its height and the blocks over it never jump.
  const [ratios, setRatios] = useState({})
  const learn = (i, w, h) => w && h && setRatios((r) => (r[i] ? r : { ...r, [i]: `${w} / ${h}` }))
  const videos = useRef({})
  const touch = useRef(null)
  const stage = useRef(null)
  const over = block.scroll !== 'normal' && !still

  const go = useCallback((i) => {
    const next = ((i % count) + count) % count
    setIndex(next)
    setSeen((s) => (s.has(next) && s.has((next + 1) % count) ? s : new Set([...s, next, (next + 1) % count])))
  }, [count])

  const current = slides[index]
  const isVideo = current?.kind === 'video'

  // A photo holds for `seconds`; a video holds until it ends.
  useEffect(() => {
    if (count < 2 || paused || still || isVideo) return undefined
    const t = setTimeout(() => go(index + 1), seconds * 1000)
    return () => clearTimeout(t)
  }, [count, paused, still, isVideo, index, seconds, go])

  // Only the slide showing plays; every other video rewinds and stops.
  useEffect(() => {
    Object.entries(videos.current).forEach(([i, v]) => {
      if (!v) return
      if (Number(i) === index && !paused && !still) v.play?.().catch(() => {})
      else {
        v.pause?.()
        if (Number(i) !== index) v.currentTime = 0
      }
    })
  }, [index, paused, still])

  // Written straight to the element each frame rather than through React
  // state, so scrolling never re-renders the show. Inside the frame the picture
  // moves slower than the page (--shift, -3 to 3, read by slideshow.css); with
  // "over" the frame holds still at the middle of the screen, and so does the
  // picture in it.
  useEffect(() => {
    const el = stage.current
    if (still || !el) return undefined
    let frame = 0
    const block = el.closest('.page-block')
    const main = el.closest('main')
    const prev = over ? block?.previousElementSibling : null
    const next = prev ? block.nextElementSibling : null
    // The height the show centers in: the small viewport (100svh), which does
    // not change as Safari's toolbar shows and hides, so the held show never
    // jumps when it does.
    const probe = document.createElement('div')
    probe.style.cssText = 'position:fixed;top:0;left:0;width:0;visibility:hidden;pointer-events:none;height:100vh;height:100svh'
    document.body.append(probe)
    let screen = probe.offsetHeight || innerHeight
    // Something held still is position: fixed, so the browser holds it while
    // it scrolls the page (a transform written each frame lands a frame late
    // on a phone, and shakes); a placeholder keeps its place in the page.
    const where = (node) => (node.$hold ?? node).getBoundingClientRect()
    // A new placeholder can move what was measured before it; place it all again.
    let again = false
    const fix = (node, top) => {
      if (!node.$hold) {
        const r = node.getBoundingClientRect()
        const cs = getComputedStyle(node)
        // What follows it, to check the placeholder left it where it was (a
        // child's margin can reach outside the card, and the card's box).
        const after = node.nextElementSibling ?? node.parentElement
        const was = after.getBoundingClientRect()[node.nextElementSibling ? 'top' : 'bottom']
        const ph = document.createElement('div')
        ph.setAttribute('aria-hidden', 'true')
        ph.style.cssText = `height:${r.height}px;margin-top:${cs.marginTop};margin-bottom:${cs.marginBottom};grid-column:${cs.gridColumn};grid-row:${cs.gridRow}`
        node.before(ph)
        node.$hold = ph
        Object.assign(node.style, { position: 'fixed', left: `${r.left}px`, width: `${r.width}px`, margin: '0', transform: '' })
        const moved = was - after.getBoundingClientRect()[node.nextElementSibling ? 'top' : 'bottom']
        if (moved) ph.style.height = `${r.height + moved}px`
        again = true
      }
      node.style.top = `${top}px`
    }
    const unfix = (node) => {
      if (!node?.$hold) return
      node.$hold.remove()
      node.$hold = null
      Object.assign(node.style, { position: '', left: '', width: '', margin: '', top: '' })
    }
    const update = () => {
      frame = 0
      if (!el.$hold) el.style.transform = ''
      if (prev && !prev.$hold) prev.style.transform = ''
      const r = where(el)
      // How far the frame's middle has passed the middle of the screen, kept
      // so its bottom never passes the end of the page's content.
      const d = over ? Math.max(0, screen / 2 - (r.top + r.height / 2)) : 0
      const room = main ? Math.max(0, main.getBoundingClientRect().bottom - r.bottom) : Infinity
      const t = Math.min(d, room)
      if (t > 0 && t === d) fix(el, r.top + t)
      else {
        unfix(el)
        el.style.transform = t ? `translate3d(0, ${t}px, 0)` : ''
      }
      const middle = r.top + t + r.height / 2
      const p = Math.max(-1, Math.min(1, (middle - screen / 2) / (screen / 2 + r.height / 2)))
      el.style.setProperty('--shift', (p * 3).toFixed(2))
      el.style.opacity = t ? '0.8' : ''
      // The opening card: held with the show (by the same distance) until the
      // next card is one gap under it, then kept that gap above the next card.
      if (next && t && el.closest('[data-cards]')?.dataset.cards !== 'apart') {
        // The page's own gap, as laid out between the show and the next card
        // (16px on a desktop, 12px on a phone).
        const n = next.getBoundingClientRect().top
        const gap = Math.max(0, n - block.getBoundingClientRect().bottom) || 16
        const a = where(prev)
        const hold = Math.min(t, n - gap - a.bottom)
        if (hold > 0 && hold === t && el.$hold) fix(prev, a.top + hold)
        else {
          unfix(prev)
          prev.style.transform = hold > 0 ? `translate3d(0, ${hold}px, 0)` : ''
        }
      } else if (prev) {
        unfix(prev)
        prev.style.transform = ''
      }
      // Mark the sections after the show (and in the opening card) that
      // overlap it where it is held; slideshow.css makes only those see-through.
      const top = r.top + t
      const bottom = top + r.height
      document.querySelectorAll('.section').forEach((s) => {
        if (!(prev?.contains(s) || el.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING) || el.contains(s)) return
        const b = s.getBoundingClientRect()
        s.classList.toggle('is-over-show', t > 0 && b.top < bottom && b.bottom > top)
      })
      if (again) {
        again = false
        update()
      }
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    // A new screen size, or the frame's own size changing (its first photo
    // loading), lets go of what is held and places it all again.
    const onResize = () => {
      unfix(el)
      unfix(prev)
      screen = probe.offsetHeight || innerHeight
      onScroll()
    }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onResize)
    const sized = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => { if (!el.$hold) onResize() })
    sized?.observe(el)
    return () => {
      sized?.disconnect()
      cancelAnimationFrame(frame)
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onResize)
      unfix(el)
      unfix(prev)
      probe.remove()
      el.style.transform = ''
      el.style.opacity = ''
      el.style.removeProperty('--shift')
      if (prev) prev.style.transform = ''
      document.querySelectorAll('.is-over-show').forEach((s) => s.classList.remove('is-over-show'))
    }
  }, [over, still, count])

  if (!count) return null

  const onTouchStart = (e) => { touch.current = e.target.closest('button') ? null : e.touches[0].clientX }
  const onTouchEnd = (e) => {
    const start = touch.current
    touch.current = null
    if (start == null) return
    const dx = e.changedTouches[0].clientX - start
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
    else setPaused((p) => !p)
  }

  return (
    <section className={`${className} slideshow-stage${over ? ' slideshow-stage--over' : ''}`} {...marks}>
      {block.title && <h2 data-eotm-text="title">{block.title}</h2>}
      <div ref={stage} className="slideshow" {...frame?.wrap}
        style={{ aspectRatio: SHAPES[block.shape] || ratios[0] || SHAPES.photo }}
        role="region" aria-roledescription="carousel" aria-label={block.title || 'Featured photos and videos'}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)} onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
        onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        data-eotm-field="media">
        {slides.map((m, i) => {
          const on = i === index
          const load = seen.has(i)
          return (
            <div key={m._id ?? i} className={`slideshow__slide${on ? ' is-on' : ''}`}
              aria-hidden={!on} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`}>
              <div className="slideshow__media">
              {!load ? null : m.kind === 'video' ? (
                <video ref={(el) => { videos.current[i] = el }} src={srcOf(m)} muted playsInline loop={count === 1}
                  preload={on ? 'auto' : 'metadata'} controls={still} aria-label={altOf(m) || undefined}
                  style={imageStyle(m)} onEnded={() => !paused && go(i + 1)}
                  onLoadedMetadata={(e) => learn(i, e.currentTarget.videoWidth, e.currentTarget.videoHeight)} />
              ) : (
                <img src={srcOf(m)} alt={altOf(m)} style={imageStyle(m)} loading={i === 0 ? 'eager' : 'lazy'} decoding="async"
                  onLoad={(e) => learn(i, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)} />
              )}
              </div>
            </div>
          )
        })}
        {count > 1 && (
          <>
            <button type="button" className="slideshow__arrow slideshow__arrow--prev" aria-label="Previous" onClick={() => go(index - 1)}>‹</button>
            <button type="button" className="slideshow__arrow slideshow__arrow--next" aria-label="Next" onClick={() => go(index + 1)}>›</button>
            <div className="slideshow__dots">
              {slides.map((m, i) => (
                <button key={m._id ?? i} type="button" className={`slideshow__dot${i === index ? ' is-on' : ''}`}
                  aria-label={`Show ${i + 1} of ${count}`} aria-current={i === index} onClick={() => go(i)} />
              ))}
            </div>
          </>
        )}
      </div>
      <Elements data={block} frame={frame} />
    </section>
  )
}
