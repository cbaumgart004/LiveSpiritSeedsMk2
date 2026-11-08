// src/components/ScrollToTop.jsx
// A new page opens at the top; a link with #anchor (the banner's events and
// Book a Massage, a service's add-on) opens at that section instead, once the
// page has drawn it. The anchor is an element's id (a service card's), else a
// section heading whose words slugify to it (cms/site.js slugify, as the
// console links a section). The fixed bars are cleared, so the heading is not
// left under them.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { slugify } from '../cms/site'

function findAnchor(hash) {
  let id = hash.slice(1)
  try { id = decodeURIComponent(id) } catch { /* a malformed hash is matched as it is */ }
  if (!id) return null
  const byId = document.getElementById(id)
  if (byId) return byId
  const heading = [...document.querySelectorAll('h1, h2, h3')].find((h) => !h.closest('.promo, .eotm-root') && slugify(h.textContent) === id)
  return heading ? heading.closest('.section, section, [data-eotm-item]') || heading : null
}

// The height of the fixed bars, as the first section clears them (layout.css).
function barsHeight() {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;visibility:hidden;height:calc(var(--navbar-height, 0px) + var(--action-bar-height, 0px) + var(--services-strip-height, 0px))'
  document.body.append(probe)
  const h = probe.offsetHeight
  probe.remove()
  return h
}

const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return undefined
    }
    // The page's sections arrive from the console after the route changes;
    // look for the anchor for a few seconds, else stay at the top.
    let tries = 0
    let timer = null
    const look = () => {
      const el = findAnchor(hash)
      if (el) {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - barsHeight() - 12, behavior: 'smooth' })
        return
      }
      if (tries++ === 0) window.scrollTo(0, 0)
      if (tries < 40) timer = setTimeout(look, 100)
    }
    look()
    return () => clearTimeout(timer)
  }, [pathname, hash])

  return null
}

export default ScrollToTop
