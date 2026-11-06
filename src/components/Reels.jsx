/* eslint-disable react/prop-types */
// "Watch on Reels": her reels as a sideways row above the Connect With Us card
// (SiteFooter.jsx), from Site settings instagramReels and facebookReels (video
// files she uploads). Each plays muted, inline and on a loop only while it is
// on screen, and pauses when it leaves; tapping one opens her reels page on
// that platform, made from instagramUrl / facebookUrl. Under reduced motion
// nothing plays by itself: each shows its first frame.
//
// The platforms' own embeds are not used: they play only when tapped and load
// each platform's scripts and trackers on every page.
import { useEffect, useRef } from 'react'
import { SocialIcon } from './SocialIcons'
import { altOf, srcOf } from './cms/photo'
import '../styles/reels.css'

const trim = (u) => String(u || '').replace(/[?#].*$/, '').replace(/\/+$/, '')
export const reelsPage = {
  instagram: (s) => (s.instagramUrl ? `${trim(s.instagramUrl)}/reels/` : null),
  facebook: (s) => (s.facebookUrl ? `${trim(s.facebookUrl)}/reels` : null),
}

export function reelItems(settings) {
  const of = (key, field) => (settings[field] || [])
    .filter((m) => m?.kind === 'video' && srcOf(m))
    .map((m, i) => ({ key: `${key}-${i}`, platform: key, src: srcOf(m), alt: altOf(m), href: reelsPage[key](settings) }))
  return [...of('instagram', 'instagramReels'), ...of('facebook', 'facebookReels')]
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function Reel({ item }) {
  const video = useRef(null)
  useEffect(() => {
    const v = video.current
    if (!v || reduced() || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    }, { threshold: 0.6 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  const label = `${item.alt ? `${item.alt}. ` : ''}Watch more on ${item.platform === 'instagram' ? 'Instagram' : 'Facebook'}`
  const Tag = item.href ? 'a' : 'div'
  return (
    <li className="reels__item">
      <Tag className="reels__link" {...(item.href ? { href: item.href, target: '_blank', rel: 'noreferrer', 'aria-label': label } : {})}>
        <video ref={video} src={item.src} muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1} />
        <span className="reels__badge" aria-hidden="true"><SocialIcon name={item.platform} /></span>
      </Tag>
    </li>
  )
}

export default function Reels({ settings }) {
  const items = reelItems(settings)
  if (!items.length) return null
  return (
    <section className="reels" aria-label={settings.reelsTitle || 'Reels'}
      data-eotm-edit="settings:settings" data-eotm-label="reels" data-eotm-field="instagramReels">
      {settings.reelsTitle && <h2 className="reels__title" data-eotm-text="reelsTitle">{settings.reelsTitle}</h2>}
      <ul className="reels__row">
        {items.map((item) => <Reel key={item.key} item={item} />)}
      </ul>
    </section>
  )
}
