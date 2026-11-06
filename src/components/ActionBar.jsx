// The row of buttons just under the menu bar, on every page: the owner's list
// (Site settings, "Buttons under the menu bar") and a Connect button to the
// Connect page (/connect: the newsletter signup and her social links).
//
// The nav is position: fixed, so this is too, pinned at --navbar-height; while
// it is on the page <body> carries has-action-bar and the first section clears
// both (layout.css).
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSettings, useSchema } from '../cms/site'
import { buttonClass, lookToCss } from '../cms/look'
import { frameOf } from './cms/Frame'
import { srcOf } from './cms/photo'
import PromoBanner from './PromoBanner'

const isInternal = (url) => url.startsWith('/') && !url.startsWith('//')

// The services offered, as plain text on every page so search engines (and
// Google Business matching) see "massage" on the home page. Site settings
// "Services under the buttons" (servicesStrip); these while it is blank. Fixed
// under this bar, as the bar is under the menu.
const SERVICES = ['Massage', 'Sound Healing', 'Yoga', 'Music']

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
  const buttons = (settings.actionButtons || []).filter((b) => b?.label && b?.url)
  const ownServices = (settings.servicesStrip || []).filter((s) => s?.text)
  const services = ownServices.length ? ownServices : SERVICES.map((text) => ({ text }))

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
              {b.icon?.src && <img className="btn-icon" src={srcOf(b.icon)} alt="" />}
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
        <Link className={`${buttonClass(schema)} action-bar__btn action-bar__connect`} to="/connect"
          data-eotm-field="connectLabel" {...frame.part('connect')}>
          {settings.connectLabel || 'Connect'}
        </Link>
      </div>

      <ul className="services-strip" aria-label="Services"
        data-eotm-edit="settings:settings" data-eotm-label="services" data-eotm-field="servicesStrip">
        {services.map((s) => (
          <li key={s._id ?? s.text} data-eotm-text={s._id ? 'text' : undefined} data-eotm-in={s._id}>{s.text}</li>
        ))}
      </ul>

      <PromoBanner />
    </>
  )
}
