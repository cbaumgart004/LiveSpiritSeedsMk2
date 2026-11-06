/* eslint-disable react/prop-types */
// "Reviews and testimonials": small cards of other people's words, with their
// name and where the words came from (a Sound Bath at CURA, a Google review).
// A card whose words are longer than it holds scrolls slowly through them and
// back, fading at the top and bottom edges, and stops while it is pointed at
// or focused; under reduced motion it stays still and scrolls by hand. Under
// the cards, Add a Review opens her Google review link (Site settings
// reviewUrl), so a new review is written on her Google Business Profile.
import { useEffect, useRef, useState } from 'react'
import { useSettings } from '../../cms/site'
import '../../styles/testimonials.css'

const SPEED = 18 // pixels a second: slow enough to read along

function Quote({ text }) {
  const box = useRef(null)
  const inner = useRef(null)
  const [travel, setTravel] = useState(0)
  useEffect(() => {
    const measure = () => {
      const b = box.current, i = inner.current
      if (b && i) setTravel(Math.max(0, Math.ceil(i.scrollHeight - b.clientHeight)))
    }
    measure()
    if (!('ResizeObserver' in window)) return
    const ro = new ResizeObserver(measure)
    ro.observe(box.current); ro.observe(inner.current)
    return () => ro.disconnect()
  }, [text])
  const long = travel > 4
  // The trip down and the pauses at each end, so a longer quote moves no faster.
  const seconds = Math.round((travel / SPEED) * 2 + 6)
  return (
    <div ref={box} className={`testimonial__quote ${long ? 'is-long' : ''}`} tabIndex={long ? 0 : undefined}
      style={long ? { '--travel': `-${travel}px`, '--duration': `${seconds}s` } : undefined}>
      <blockquote ref={inner} className="testimonial__words">
        {String(text).split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
      </blockquote>
    </div>
  )
}

export default function Testimonials({ block, className, marks, frame }) {
  const { settings } = useSettings()
  const items = (block.items || []).filter((t) => t?.quote?.trim())
  const review = block.showReviewButton !== false && settings.reviewUrl
  if (!items.length && !review) return null
  return (
    <section className={className} {...marks}>
      <div className="testimonials" {...frame?.wrap}>
        {block.title && <h2 className="testimonials__title">{block.title}</h2>}
        <ul className="testimonials__list">
          {items.map((t, i) => (
            <li key={t._id ?? i} className="card testimonial">
              {t.stars && <p className="testimonial__stars" aria-label={`${t.stars} out of 5 stars`}>{'★'.repeat(Number(t.stars))}</p>}
              <Quote text={t.quote} />
              {(t.name || t.source) && (
                <p className="testimonial__by">
                  {t.name && <strong>{t.name}</strong>}
                  {t.name && t.source && ', '}
                  {t.source && <span>{t.source}</span>}
                </p>
              )}
            </li>
          ))}
        </ul>
        {review && (
          <a className="btn testimonials__review" href={review} target="_blank" rel="noreferrer">
            {settings.reviewLabel || 'Add a Review'}
          </a>
        )}
      </div>
    </section>
  )
}
