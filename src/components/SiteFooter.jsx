/* eslint-disable react/prop-types */
// The values as the footer of every page (Site settings "Values footer on every
// page", on unless switched off). The heading and values are Site settings'
// own (footerTitle, footerValues); while those are blank they come from the
// home page's Values section, which is then not drawn in the page as well
// (DynamicPage), so the values appear once, at the foot.
import { Link, useLocation } from 'react-router-dom'
import ValuesSection from './ValuesSection/ValuesSection'
import SocialIcons, { ConnectIcons } from './SocialIcons'
import { useSettings } from '../cms/site'

export const valuesFooterOn = (settings) => settings.valuesFooter !== false

const rows = (words) => (words || [])
  .map((w) => (typeof w === 'string' ? { text: w } : w))
  .filter((w) => w?.text)

// Site settings "Connect button in the footer": a button to the Connect page
// under the values, on every page but the Connect page itself, showing the
// Facebook, Instagram and envelope icons of the Connect page.
function FooterConnect({ settings }) {
  const { pathname } = useLocation()
  if (settings.footerConnect !== true || pathname === '/connect') return null
  return (
    <div className="footer-connect" data-eotm-edit="settings:settings" data-eotm-label="footer button" data-eotm-field="footerConnect">
      <Link className="btn footer-connect__btn" to="/connect">
        <ConnectIcons className="footer-connect__icons" />
        {settings.connectLabel || 'Connect'}
      </Link>
    </div>
  )
}

// Her social icons (SocialIcons.jsx) as the last thing on every page but the
// Connect page, which shows them itself, while the footer Connect button
// (which carries the same icons) is off.
function FooterSocial({ settings }) {
  const { pathname } = useLocation()
  if (pathname === '/connect' || settings.footerConnect === true) return null
  return (
    <footer className="site-footer" data-eotm-edit="settings:settings" data-eotm-label="social links" data-eotm-field="instagramUrl">
      <SocialIcons settings={settings} />
    </footer>
  )
}

export default function SiteFooter({ pages }) {
  const { settings } = useSettings()
  if (!valuesFooterOn(settings)) return <><FooterConnect settings={settings} /><FooterSocial settings={settings} /></>
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
    <FooterConnect settings={settings} />
    <FooterSocial settings={settings} />
    </>
  )
}
