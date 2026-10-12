// The console's schema-driven looks, as the site draws them.
//
//   buttonClass: a button's classes from the schema's buttonStyles (the
//                owner's "Button style"), else the site's usual .btn.
//   lookToCss:   a `style` field ({ size, font, weight, align, color,
//                background, width }) as CSS. A named colour is one of the
//                schema's styleColors, pointing at a theme variable, so it
//                follows the season.
// The schema comes from useSchema (cms/site.js).

const SIZES = { small: '0.875em', large: '1.25em', xlarge: '1.6em' }
const FONTS = { heading: 'var(--font-heading)', body: 'var(--font-body)' }

export function buttonClass(schema, look) {
  const styles = schema?.buttonStyles ?? []
  return (styles.find((s) => s.value === look) ?? styles[0])?.className ?? 'btn'
}

// A font by name (a Style's `family`, the console's FAMILY): one this site
// already loads (index.css, index.html), or one Google Fonts serves, loaded the
// first time something asks for it, so a font chosen in the editor shows at once.
const LOADED = ['Euphoria Script', 'Farsan', 'Merriweather Sans', 'Fraunces', 'Playfair Display', 'Caveat', 'Cormorant Garamond', 'Assistant']
const asked = new Set(LOADED)
export function loadWebFont(family) {
  if (!family || asked.has(family) || typeof document === 'undefined') return
  asked.add(family)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}&display=swap`
  document.head.append(link)
}

export function lookToCss(schema, look) {
  if (!look || typeof look !== 'object') return undefined
  if (look.family) loadWebFont(look.family)
  const colour = (v) => (!v ? undefined : schema?.styleColors?.find((c) => c.value === v)?.css ?? (/^#[0-9a-f]{6}$/i.test(v) ? v : undefined))
  const css = {
    fontSize: SIZES[look.size],
    fontFamily: look.family ? `'${look.family}', ${FONTS[look.font] ?? 'var(--font-body)'}` : FONTS[look.font],
    fontWeight: look.weight === 'bold' ? 700 : look.weight === 'normal' ? 400 : undefined,
    textAlign: look.align,
    color: colour(look.color),
    background: colour(look.background),
    ...(look.width ? { width: `${look.width}%`, maxWidth: '100%' } : {}),
  }
  const out = Object.fromEntries(Object.entries(css).filter(([, v]) => v != null))
  return Object.keys(out).length ? out : undefined
}
