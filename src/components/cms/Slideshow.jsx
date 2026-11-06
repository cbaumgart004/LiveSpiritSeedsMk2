/* eslint-disable react/prop-types */
// "Slideshow (photos and videos)": the owner's photos and short videos, one at
// a time, crossfading every `seconds`. A video plays muted and inline and the
// show moves on when it ends. Hovering, focusing or tapping the show pauses it;
// a swipe on a phone or a dot moves it. Under reduced motion it never moves on
// its own and a video waits for its play button.
//
// Only the slide showing and the next one load; the rest wait, so a long show
// costs the page nothing until it gets there.
//
// With "When the page scrolls" on "over" (the default) the page slides up over
// the show: once it passes under the fixed bars it drifts down at half the
// scroll speed and fades to 15%, so the blocks after it (raised above it in
// slideshow.css) carry on over a faint picture. Reduced motion keeps it still.
import { useCallback, useEffect, useRef, useState } from 'react'
import Elements from './Elements'
import { altOf, imageStyle, srcOf } from './photo'
import '../../styles/slideshow.css'

const SHAPES = { wide: '16 / 9', photo: '4 / 3', square: '1 / 1', tall: '4 / 5' }

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function Slideshow({ block, className, marks, frame }) {
  const slides = (block.media || []).filter((m) => srcOf(m))
  const count = slides.length
  const seconds = Math.min(20, Math.max(3, Number(block.seconds) || 6))
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [still] = useState(reducedMotion)
  const [seen, setSeen] = useState(() => new Set([0, 1]))
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

  // The drift and fade, written straight to the element each frame rather than
  // through React state, so scrolling never re-renders the show.
  useEffect(() => {
    const el = stage.current
    if (!over || !el) return undefined
    let frame = 0
    const update = () => {
      frame = 0
      el.style.transform = ''
      const r = el.getBoundingClientRect()
      const top = document.querySelector('.services-strip')?.getBoundingClientRect().bottom ?? 0
      const d = Math.max(0, top - r.top)
      el.style.transform = d ? `translate3d(0, ${d * 0.5}px, 0)` : ''
      el.style.opacity = d ? String(Math.max(0.15, 1 - (d / r.height) * 0.85)) : ''
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      el.style.transform = ''
      el.style.opacity = ''
    }
  }, [over, count])

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
    <section className={`${className}${over ? ' slideshow-stage--over' : ''}`} {...marks}>
      {block.title && <h2 data-eotm-text="title">{block.title}</h2>}
      <div ref={stage} className="slideshow" {...frame?.wrap}
        style={{ aspectRatio: SHAPES[block.shape] || SHAPES.wide }}
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
              {!load ? null : m.kind === 'video' ? (
                <video ref={(el) => { videos.current[i] = el }} src={srcOf(m)} muted playsInline loop={count === 1}
                  preload={on ? 'auto' : 'metadata'} controls={still} aria-label={altOf(m) || undefined}
                  style={imageStyle(m)} onEnded={() => !paused && go(i + 1)} />
              ) : (
                <img src={srcOf(m)} alt={altOf(m)} style={imageStyle(m)} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
              )}
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
