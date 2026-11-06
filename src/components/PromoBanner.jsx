// The announcement strip under the services strip, on every page (Site
// settings: promoOn, promoEyebrow, promoTitle, promoText, promoLabel, promoUrl,
// promoUntil). It sits in the page flow, so it scrolls away; while it shows,
// <body> carries has-promo and the first section stops clearing the fixed bars
// itself, since the banner already does (promo.css).
//
// Hidden when switched off, after its end date, or once a visitor closes it.
// Closing is remembered per title in this browser, so a new announcement shows
// again to everyone.
import { useEffect, useState } from 'react'
import { useSettings } from '../cms/site'
import '../styles/promo.css'

const DEFAULTS = {
  promoEyebrow: 'New',
  promoTitle: 'Monthly Bodywork Memberships',
  promoText: 'Your body thrives with consistent care. Rooted, Flourish and Thrive memberships make regular bodywork part of your self-care, with priority booking and member rates.',
  promoLabel: 'Explore Memberships',
  promoUrl: 'https://spiritseedswellnessmelissacarey.offeringtree.com/offering_packages',
}

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const storeKey = (title) => `promo-closed:${title}`
function wasClosed(title) {
  try { return localStorage.getItem(storeKey(title)) === '1' } catch { return false }
}

export default function PromoBanner() {
  const { settings } = useSettings()
  const get = (k) => settings[k] ?? DEFAULTS[k]
  const title = get('promoTitle')
  const url = get('promoUrl')
  const [closed, setClosed] = useState(() => wasClosed(title))
  useEffect(() => setClosed(wasClosed(title)), [title])

  const expired = settings.promoUntil && today() > settings.promoUntil
  const show = settings.promoOn !== false && !expired && !closed && Boolean(title)

  useEffect(() => {
    if (!show) return undefined
    document.body.classList.add('has-promo')
    return () => document.body.classList.remove('has-promo')
  }, [show])

  if (!show) return null

  const close = () => {
    try { localStorage.setItem(storeKey(title), '1') } catch { /* private window: closes for this visit only */ }
    setClosed(true)
  }

  return (
    <aside className="promo" aria-label="Announcement"
      data-eotm-edit="settings:settings" data-eotm-label="announcement banner" data-eotm-field="promoTitle">
      <div className="promo__inner">
        {get('promoEyebrow') && <span className="promo__eyebrow" data-eotm-text="promoEyebrow">{get('promoEyebrow')}</span>}
        <div className="promo__copy">
          <p className="promo__title" data-eotm-text="promoTitle">{title}</p>
          {get('promoText') && <p className="promo__text" data-eotm-text="promoText">{get('promoText')}</p>}
        </div>
        {url && (
          <a className="promo__link" href={url} target={url.startsWith('/') ? undefined : '_blank'} rel="noreferrer"
            data-eotm-text="promoLabel">
            {get('promoLabel') || 'Learn more'}
          </a>
        )}
      </div>
      <button type="button" className="promo__close" aria-label="Close announcement" onClick={close}>×</button>
    </aside>
  )
}
