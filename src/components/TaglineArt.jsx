// The "Your Integrative Healer / You are Resilient" tagline artwork.
//
// The source (Downloads/Tagline.svg) is a 26MB export whose lettering had been
// converted to outlines and whose washes are embedded base64 rasters — far too
// heavy to ship, and impossible to theme as a single <img>. It is split into
// three layers so the type and the flower can follow the season (DESIGN.md §6):
//
//   tagline-art.webp     the painted washes + the singing-bowl photo (75KB)
//   tagline-flower.webp  the flower, separated so it can be tinted (15KB)
//   tagline-text.svg     the lettering as vector paths, fill="currentColor"
//
// The text layer is inlined (not <img>) because only inline SVG inherits `color`
// from the page — that is what makes the ink themeable. It is our own build
// artifact, not user input, so dangerouslySetInnerHTML is safe here.
//
// The lettering is outlines, so it carries no machine-readable text: the
// visually-hidden paragraph below is the accessible copy. Keep the two in sync.
//
// NB: "lasting health" is deliberate — the owner corrected it from the earlier
// "lasting healing" artwork. Don't change it back.
import artUrl from '../assets/tagline-art.webp'
import flowerUrl from '../assets/tagline-flower.webp'
import bowlsUrl from '../assets/tagline-bowls.webp'
import taglineText from '../assets/tagline-text.svg?raw'

export const TAGLINE_COPY =
  'Your Integrative Healer: guiding you to release mental, emotional and physical pain so you can find ease, peace, and lasting health. You are resilient.'

export default function TaglineArt() {
  return (
    <div className="tagline">
      {/* decoding="sync" is deliberate. With the default async decode these can
          land after first paint, and inside the `over` layout — where the
          wrapper carries opacity<1 — the late decode did not always trigger a
          repaint, so the hero rendered as a bare photo with no artwork. */}
      <img className="tagline__wash" src={artUrl} alt="" decoding="sync" fetchPriority="high" />
      {/* The singing-bowl photo is a separate layer rather than being baked into
          the wash, so it can be placed independently — currently offset to the
          lower right instead of sitting dead centre over the lettering. */}
      <img className="tagline__bowls" src={bowlsUrl} alt="" decoding="sync" />
      <img className="tagline__flower" src={flowerUrl} alt="" decoding="sync" />
      <div className="tagline__ink" dangerouslySetInnerHTML={{ __html: taglineText }} />
      <p className="visually-hidden">{TAGLINE_COPY}</p>
    </div>
  )
}
