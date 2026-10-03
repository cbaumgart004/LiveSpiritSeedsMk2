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
        {(socials.length > 0 || settings.contactEmail) && (
          <ul className="modal__links">
            {socials.map((s) => (
              <li key={s._id ?? s.label}>
                <a className="btn" href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
              </li>
            ))}
            {settings.contactEmail && (
              <li>
                <a className="btn" href={`mailto:${settings.contactEmail}`}>Email me</a>
              </li>
            )}
          </ul>
        )}
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
