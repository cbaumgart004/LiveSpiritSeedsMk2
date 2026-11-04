/* eslint-disable react/prop-types */
// The values as the footer of every page (Site settings "Values footer on every
// page", on unless switched off). The heading and values are Site settings'
// own (footerTitle, footerValues); while those are blank they come from the
// home page's Values section, which is then not drawn in the page as well
// (DynamicPage), so the values appear once, at the foot.
import ValuesSection from './ValuesSection/ValuesSection'
import { useSettings } from '../cms/site'

export const valuesFooterOn = (settings) => settings.valuesFooter !== false

const rows = (words) => (words || [])
  .map((w) => (typeof w === 'string' ? { text: w } : w))
  .filter((w) => w?.text)

export default function SiteFooter({ pages }) {
  const { settings } = useSettings()
  if (!valuesFooterOn(settings)) return null
  const home = pages.find((p) => p.slug === 'home')
  const block = (home?.data?.blocks ?? []).find((b) => b.layout === 'values')
  const own = rows(settings.footerValues)
  // A fallback row belongs to the home page, not to Site settings, so it is
  // not offered for typing in place under Site settings' mark.
  const words = own.length ? own : rows(block?.words).map(({ text }) => ({ text }))
  return (
    <div data-eotm-edit="settings:settings" data-eotm-label="values footer" data-eotm-field="footerValues">
      <ValuesSection
        title={settings.footerTitle || block?.title || undefined}
        titleField={settings.footerTitle ? 'footerTitle' : null}
        words={words.length ? words : undefined}
      />
    </div>
  )
}
