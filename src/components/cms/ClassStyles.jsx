// The owner's Classes (the console's `classes` document, schema/classes.js):
// each class's Style becomes one CSS rule on the selector the schema gives it
// (".btn" for every button), or .c-<name> for a class of the owner's own. The
// rules go last in <head> and lead with `html body`, so they win over the
// site's own rule for the same thing; a blank Style leaves the site's look.
import { useMemo } from 'react'
import { useDocuments, useSchema } from '../../cms/site'
import { lookToCss } from '../../cms/look'

const kebab = (k) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

export function classRules(schema, data) {
  const list = [...(schema?.classes ?? []), ...(schema?.custom?.classes ?? []).map((c) => ({ ...c, selector: `.c-${c.name}` }))]
  return list.map((c) => {
    const css = lookToCss(schema, data?.[c.name])
    if (!css) return ''
    const body = Object.entries(css).map(([k, v]) => `${kebab(k)}: ${v};`).join(' ')
    const selector = c.selector.split(',').map((s) => `html body ${s.trim()}`).join(', ')
    return `${selector} { ${body} }`
  }).filter(Boolean).join('\n')
}

export default function ClassStyles() {
  const schema = useSchema()
  const { docs } = useDocuments('classes')
  const css = useMemo(() => classRules(schema, docs[0]?.data), [schema, docs])
  return css ? <style data-eotm-classes="">{css}</style> : null
}
