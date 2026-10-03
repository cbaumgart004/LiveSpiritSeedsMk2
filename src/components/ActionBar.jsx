/* eslint-disable react/prop-types */
// The row of buttons just under the menu bar, on every page: the owner's list
// (Site settings, "Buttons under the menu bar") and a Connect button that opens
// a window with her social links and the newsletter signup.
//
// The nav is position: fixed, so this is too, pinned at --navbar-height; while
// it is on the page <body> carries has-action-bar and the first section clears
// both (layout.css).
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from './Modal'
import NewsletterForm from './NewsletterForm'
import { useSettings } from '../cms/site'

const isInternal = (url) => url.startsWith('/') && !url.startsWith('//')

const ICONS = {
  facebook: (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="currentColor">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
}

// Facebook, Instagram and email as round icons, each only when set.
function SocialIcons({ settings }) {
  const items = [
    settings.facebookUrl && { key: 'facebook', label: 'Facebook', href: settings.facebookUrl },
    settings.instagramUrl && { key: 'instagram', label: 'Instagram', href: settings.instagramUrl },
    settings.contactEmail && { key: 'mail', label: 'Email', href: `mailto:${settings.contactEmail}` },
  ].filter(Boolean)
  if (!items.length) return null
  return (
    <ul className="social-icons">
      {items.map((i) => (
        <li key={i.key}>
          <a className="social-icons__link" href={i.href} aria-label={i.label} title={i.label}
            target={i.key === 'mail' ? undefined : '_blank'} rel="noreferrer">
            {ICONS[i.key]}
            <span>{i.label}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function ActionBar() {
  const { settings } = useSettings()
  const [connecting, setConnecting] = useState(false)
  const buttons = (settings.actionButtons || []).filter((b) => b?.label && b?.url)
  const socials = (settings.socials || []).filter((s) => s?.label && s?.url)

  useEffect(() => {
    document.body.classList.add('has-action-bar')
    return () => document.body.classList.remove('has-action-bar')
  }, [])

  return (
    <>
      <div className="action-bar" data-eotm-edit="settings:settings" data-eotm-label="buttons">
        {buttons.map((b) =>
          isInternal(b.url) ? (
            <Link key={b._id ?? b.label} className="btn action-bar__btn" to={b.url}>{b.label}</Link>
          ) : (
            <a key={b._id ?? b.label} className="btn action-bar__btn" href={b.url} target="_blank" rel="noreferrer">{b.label}</a>
          ),
        )}
        <button type="button" className="btn action-bar__btn action-bar__connect" onClick={() => setConnecting(true)}>
          {settings.connectLabel || 'Connect'}
        </button>
      </div>

      <Modal open={connecting} onClose={() => setConnecting(false)} title={settings.connectLabel || 'Connect'}>
        {settings.connectIntro && <p className="modal__intro">{settings.connectIntro}</p>}
        <SocialIcons settings={settings} />
        {socials.length > 0 && (
          <ul className="modal__links">
            {socials.map((s) => (
              <li key={s._id ?? s.label}>
                <a className="btn" href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
        )}
        {/* The signup last, under the ways to follow along. */}
        {settings.newsletterFormId && (
          <>
            <h3 className="modal__subtitle">Newsletter</h3>
            <NewsletterForm formId={settings.newsletterFormId} finePrint="No spam, and you can unsubscribe any time." />
          </>
        )}
      </Modal>
    </>
  )
}
