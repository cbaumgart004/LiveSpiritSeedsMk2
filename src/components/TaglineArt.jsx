// The "Your Integrative Healer / You are Resilient" tagline artwork.
//
// The source (Downloads/Tagline.svg) is a 26MB Canva export whose lettering had
// been converted to outlines and whose washes are embedded base64 rasters, far
// too heavy to ship and impossible to theme as a single <img>. It is split into
// layers so the type and the flower can follow the season (DESIGN.md §6):
//
//   tagline-art.webp        the painted washes (75KB)
//   tagline-bowls.webp      the singing-bowl photo, placed by CSS
//   tagline-flower.webp     the flower, separated so it can be tinted
//   the heading and line    real text, inheriting the site's heading and
//                           subheading fonts (the artwork's own, Euphoria
//                           Script and Farsan), placed where the Canva PDF export
//                           puts them; the owner can change the words, fonts,
//                           size and ink in the editor (contentSection's
//                           tagline fields)
//   tagline-resilient.svg   "You are resilient" as vector paths: its font, BD
//                           Script, is not a web font the site can load. It is
//                           inlined so it takes the ink colour (fill=currentColor);
//                           our own build artifact, so dangerouslySetInnerHTML is
//                           safe here.
//
// Positions and sizes are the artwork's own, in units of its 1230-wide canvas
// turned into container units (cqw), so the lettering scales with the artwork
// at every width. `size` (%) scales all three together from where each starts.
//
// NB: "lasting health" is deliberate: the owner corrected it from the earlier
// "lasting healing" artwork. Don't change it back.
import PropTypes from 'prop-types'
import artUrl from '../assets/tagline-art.webp'
import flowerUrl from '../assets/tagline-flower.webp'
import bowlsUrl from '../assets/tagline-bowls.webp'
import resilient from '../assets/tagline-resilient.svg?raw'

export const TAGLINE_HEADING = 'Your Integrative Healer;'
export const TAGLINE_LINE =
  'Guiding you to Release mental, emotional and physical pain so you can find Ease, Peace, and Lasting Health'

// A font choice from the editor: one of the site's type tokens by role
// ("heading", "subheading", "body"), so it follows whatever the site assigns
// that role, or a font by name.
const ROLES = ['heading', 'subheading', 'body']
const fontOf = (v, fallback) => (ROLES.includes(v) ? `var(--font-${v})` : `'${v}', ${fallback}`)

// The owner's choices from the editor, as the CSS variables tagline styles read.
// Blank inherits: the heading takes the site's heading font, the line its
// subheading font (layout.css), which are the artwork's own unless reassigned.
function inkVars({ size, headingFont, lineFont, ink }) {
  const v = {}
  if (size) v['--tagline-scale'] = size / 100
  if (headingFont) v['--tagline-heading-font'] = fontOf(headingFont, 'cursive')
  if (lineFont) v['--tagline-line-font'] = fontOf(lineFont, 'sans-serif')
  if (ink) v['--tagline-ink'] = ink
  return v
}

export default function TaglineArt({ heading, line, size, headingFont, lineFont, ink }) {
  return (
    <div className="tagline" style={inkVars({ size, headingFont, lineFont, ink })}>
      {/* decoding="sync" is deliberate. With the default async decode these can
          land after first paint, and inside the `over` layout (where the
          wrapper carries opacity<1) the late decode did not always trigger a
          repaint, so the hero rendered as a bare photo with no artwork. */}
      <img className="tagline__wash" src={artUrl} alt="" decoding="sync" fetchPriority="high" />
      {/* The singing-bowl photo is a separate layer rather than being baked into
          the wash, so it can be placed independently: offset to the lower right
          instead of sitting dead centre over the lettering. */}
      <img className="tagline__bowls" src={bowlsUrl} alt="" decoding="sync" />
      <img className="tagline__flower" src={flowerUrl} alt="" decoding="sync" />
      <div className="tagline__ink">
        <p className="tagline__heading" data-eotm-text="taglineHeading">{heading || TAGLINE_HEADING}</p>
        <p className="tagline__line" data-eotm-text="taglineLine">{line || TAGLINE_LINE}</p>
        <span className="tagline__resilient" aria-hidden="true" dangerouslySetInnerHTML={{ __html: resilient }} />
        <span className="visually-hidden">You are resilient.</span>
      </div>
    </div>
  )
}

TaglineArt.propTypes = {
  heading: PropTypes.string,
  line: PropTypes.string,
  size: PropTypes.number,
  headingFont: PropTypes.string,
  lineFont: PropTypes.string,
  ink: PropTypes.string,
}
