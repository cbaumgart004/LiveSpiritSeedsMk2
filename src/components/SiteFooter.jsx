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
import Reels from './Reels'

export const valuesFooterOn = (settings) => settings.valuesFooter !== false

const rows = (words) => (words || [])
  .map((w) => (typeof w === 'string' ? { text: w } : w))
  .filter((w) => w?.text)

const REVIEW_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
  </svg>
)

// The Connect With Us card, above the values on every page but Connect (which
// shows its own): one row with the heading at the left, then Newsletter (Site
// settings "Newsletter button in the footer", to /connect), each social link
// she has switched on (SocialIcons.jsx socialItems) and Add a Review, which
// opens her Google review link (reviewUrl) so the review lands on her Google
// Business Profile. The card is a .section band, as Values is. Above it,
// her reels (Reels.jsx), when she has added any.
function ConnectCard({ settings }) {
  const { pathname } = useLocation()
  if (pathname === '/connect') return null
  return <><Reels settings={settings} /><Card settings={settings} /></>
}

function Card({ settings }) {
  const social = socialItems(settings)
  const newsletter = settings.footerConnect === true
  const review = settings.reviewUrl
  if (!newsletter && !social.length && !review) return null
  return (
    <footer className="section connect-card" data-eotm-edit="settings:settings" data-eotm-label="Connect With Us card" data-eotm-field="footerCardTitle">
      <h2 className="connect-card__title" data-eotm-text="footerCardTitle">{settings.footerCardTitle || 'Connect With Us'}</h2>
      <div className="connect-card__buttons">
        {newsletter && (
          <Link className="btn footer-links__btn footer-links__news" to="/connect">
            {/* A phone shows the short word (connect.css). */}
            <span className="footer-links__long">{settings.newsletterLabel || 'Newsletter'}</span>
            <span className="footer-links__short">Connect</span>
          </Link>
        )}
        {social.map((i) => (
          <a key={i.key} className="btn footer-links__btn" href={i.href} aria-label={i.label}
            target={i.key === 'mail' ? undefined : '_blank'} rel="noreferrer">
            <SocialIcon name={i.key} />
            <span className="footer-links__label">{i.label}</span>
          </a>
        ))}
        {review && (
          <a className="btn footer-links__btn" href={review} target="_blank" rel="noreferrer" aria-label={settings.reviewLabel || 'Add a Review'}>
            {REVIEW_ICON}
            <span className="footer-links__label">{settings.reviewLabel || 'Add a Review'}</span>
          </a>
        )}
      </div>
    </footer>
  )
}

// On every page but Home, a Home button back to the start, under the values.
function HomeButton() {
  const { pathname } = useLocation()
  if (pathname === '/') return null
  return (
    <nav className="footer-home" aria-label="Back to home">
      <Link className="btn footer-links__btn" to="/">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11 12 3l9 8" /><path d="M5 10v10h14V10" />
        </svg>
        Home
      </Link>
    </nav>
  )
}

export default function SiteFooter({ pages }) {
  const { settings } = useSettings()
  if (!valuesFooterOn(settings)) return <><ConnectCard settings={settings} /><HomeButton /></>
  const home = pages.find((p) => p.slug === 'home')
  const block = (home?.data?.blocks ?? []).find((b) => b.layout === 'values')
  const own = rows(settings.footerValues)
  // A fallback row belongs to the home page, not to Site settings, so it is
  // not offered for typing in place under Site settings' mark.
  const words = own.length ? own : rows(block?.words).map(({ text }) => ({ text }))
  return (
    <>
    <ConnectCard settings={settings} />
    <div data-eotm-edit="settings:settings" data-eotm-label="values footer" data-eotm-field="footerValues">
      <ValuesSection
        title={settings.footerTitle || block?.title || undefined}
        titleField={settings.footerTitle ? 'footerTitle' : null}
        words={words.length ? words : undefined}
      />
    </div>
    <HomeButton />
    </>
  )
}
