/* eslint-disable react/prop-types */
// The row of buttons just under the menu bar, on every page: the owner's list
// (Site settings, "Buttons under the menu bar") and a Connect button that opens
// a window with her social links and the newsletter signup.
//
// The nav is position: fixed, so this is too, pinned at --navbar-height; while
// it is on the page <body> carries has-action-bar and the first section clears
// both (layout.css).
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from './Modal'
import NewsletterForm from './NewsletterForm'
import { useSettings, useSchema } from '../cms/site'
import { buttonClass, lookToCss } from '../cms/look'
import { frameOf } from './cms/Frame'

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

// Facebook, Instagram and email as round icons. Facebook and Instagram each
// need their switch on and an address (Site settings), so the owner can fill
// one in before showing it; email shows whenever there is one.
function SocialIcons({ settings }) {
  const items = [
    settings.showFacebook === true && settings.facebookUrl && { key: 'facebook', label: 'Facebook', href: settings.facebookUrl },
    settings.showInstagram === true && settings.instagramUrl && { key: 'instagram', label: 'Instagram', href: settings.instagramUrl },
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

// The panel's look: a narrower one stays centred under the menu bar, and an
// alignment places its buttons within it.
function barStyle(schema, look) {
  const css = lookToCss(schema, look)
  if (!css) return undefined
  const { textAlign, ...rest } = css
  return {
    ...rest,
    ...(rest.width ? { left: '50%', translate: '-50% 0' } : {}),
    ...(textAlign ? { justifyContent: { left: 'flex-start', center: 'center', right: 'flex-end' }[textAlign] } : {}),
  }
}

export default function ActionBar() {
  const { settings } = useSettings()
  const schema = useSchema()
  const frame = frameOf(settings, 'actionBar')
  const { style: frameStyle, ...frameMarks } = frame.root
  const [connecting, setConnecting] = useState(false)
  const buttons = (settings.actionButtons || []).filter((b) => b?.label && b?.url)
  const socials = (settings.socials || []).filter((s) => s?.label && s?.url)

  // The bar wraps to two rows on a phone, so the page clears whatever height
  // it really has (--action-bar-height, read by layout.css) rather than a guess.
  const bar = useRef(null)
  useEffect(() => {
    document.body.classList.add('has-action-bar')
    const el = bar.current
    const measure = () => el && document.body.style.setProperty('--action-bar-height', `${el.offsetHeight}px`)
    measure()
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null
    ro?.observe(el)
    return () => {
      ro?.disconnect()
      document.body.classList.remove('has-action-bar')
      document.body.style.removeProperty('--action-bar-height')
    }
  }, [])

  return (
    <>
      {/* Site settings "Buttons per row on a phone": two (a 2 by 2 square for
          four), one, or all in one row. */}
      {/* The owner's "Look of the buttons under the menu bar" (a style field):
          a width narrows the panel itself, centred under the menu; alignment,
          colours and size dress it. Blank is the full width, as before. */}
      {/* One arranged region of Site settings (_layout_actionBar): each button
          is a part the console's Arrange can place (cms/Frame.jsx). */}
      <div ref={bar} className={`action-bar action-bar--per-row-${['1', 'all'].includes(settings.actionButtonsPerRow) ? settings.actionButtonsPerRow : '2'}`}
        {...frameMarks} style={{ ...barStyle(schema, settings.actionBarLook), ...frameStyle }}
        data-eotm-edit="settings:settings" data-eotm-label="buttons" data-eotm-field="actionButtons" data-eotm-frame-key="actionBar">
        {buttons.map((b) => {
          const face = (
            <>
              {b.icon?.src && <img className="btn-icon" src={b.icon.src} alt="" />}
              <span data-eotm-text="label" data-eotm-in={b._id}>{b.label}</span>
            </>
          )
          const cls = `${buttonClass(schema, b.look)} action-bar__btn`
          return isInternal(b.url) ? (
            <Link key={b._id ?? b.label} className={cls} to={b.url} data-eotm-in={b._id} {...frame.part(`button:${b._id}`)}>{face}</Link>
          ) : (
            <a key={b._id ?? b.label} className={cls} href={b.url} target="_blank" rel="noreferrer" data-eotm-in={b._id} {...frame.part(`button:${b._id}`)}>{face}</a>
          )
        })}
        <button type="button" className={`${buttonClass(schema)} action-bar__btn action-bar__connect`} onClick={() => setConnecting(true)}
          data-eotm-field="connectLabel" {...frame.part('connect')}>
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
