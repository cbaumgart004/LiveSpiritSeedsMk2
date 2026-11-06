/* eslint-disable react/prop-types */
// The values as the footer of every page (Site settings "Values footer on every
// page", on unless switched off). The heading and values are Site settings'
// own (footerTitle, footerValues); while those are blank they come from the
// home page's Values section, which is then not drawn in the page as well
// (DynamicPage), so the values appear once, at the foot.
import { Link, useLocation } from 'react-router-dom'
import ValuesSection from './ValuesSection/ValuesSection'
import { SocialIcon, socialItems } from './SocialIcons'
import { useSettings } from '../cms/site'

export const valuesFooterOn = (settings) => settings.valuesFooter !== false

const rows = (words) => (words || [])
  .map((w) => (typeof w === 'string' ? { text: w } : w))
  .filter((w) => w?.text)

// One row of small buttons under the values, on every page but Connect (which
// shows its own): Connect (Site settings "Connect button in the footer") and
// each social link she has switched on (SocialIcons.jsx socialItems). Under
// it, on every page but Home, a Home button back to the start.
function FooterLinks({ settings }) {
  const { pathname } = useLocation()
  const home = pathname !== '/' && (
    <nav className="footer-home" aria-label="Back to home">
      <Link className="btn footer-links__btn" to="/">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11 12 3l9 8" /><path d="M5 10v10h14V10" />
        </svg>
        Home
      </Link>
    </nav>
  )
  const social = socialItems(settings)
  const connect = settings.footerConnect === true
  if (pathname === '/connect' || (!connect && !social.length)) return home || null
  return (
    <>
    <footer className="footer-links" data-eotm-edit="settings:settings" data-eotm-label="footer links" data-eotm-field="footerConnect">
      {connect && <Link className="btn footer-links__btn" to="/connect">{settings.connectLabel || 'Connect'}</Link>}
      {social.map((i) => (
        <a key={i.key} className="btn footer-links__btn" href={i.href} aria-label={i.label}
          target={i.key === 'mail' ? undefined : '_blank'} rel="noreferrer">
          <SocialIcon name={i.key} />
          <span className="footer-links__label">{i.label}</span>
        </a>
      ))}
    </footer>
    {home}
    </>
  )
}

export default function SiteFooter({ pages }) {
  const { settings } = useSettings()
  if (!valuesFooterOn(settings)) return <FooterLinks settings={settings} />
  const home = pages.find((p) => p.slug === 'home')
  const block = (home?.data?.blocks ?? []).find((b) => b.layout === 'values')
  const own = rows(settings.footerValues)
  // A fallback row belongs to the home page, not to Site settings, so it is
  // not offered for typing in place under Site settings' mark.
  const words = own.length ? own : rows(block?.words).map(({ text }) => ({ text }))
  return (
    <>
    <div data-eotm-edit="settings:settings" data-eotm-label="values footer" data-eotm-field="footerValues">
      <ValuesSection
        title={settings.footerTitle || block?.title || undefined}
        titleField={settings.footerTitle ? 'footerTitle' : null}
        words={words.length ? words : undefined}
      />
    </div>
    <FooterLinks settings={settings} />
    </>
  )
}
