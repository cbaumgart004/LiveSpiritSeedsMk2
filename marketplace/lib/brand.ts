import brandSettings from '@/brand-settings.json'

// The store inherits the brochure site's current season + UX style. Precedence:
//   1. env override (NEXT_PUBLIC_SITE_THEME / NEXT_PUBLIC_UI_STYLE)
//   2. brand-settings.json — synced from ../content/settings/index.json at build
//      by scripts/sync-brand.mjs (skipped gracefully if the brochure isn't in the
//      build context; the committed file is then the fallback)
//   3. hard defaults
export const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const
export const UI_STYLES = ['watercolor', 'layered', 'refined'] as const
export type Season = (typeof SEASONS)[number]
export type UiStyle = (typeof UI_STYLES)[number]

function coerceSeason(value: unknown, fallback: Season): Season {
  return (SEASONS as readonly string[]).includes(value as string) ? (value as Season) : fallback
}
function coerceStyle(value: unknown, fallback: UiStyle): UiStyle {
  return (UI_STYLES as readonly string[]).includes(value as string) ? (value as UiStyle) : fallback
}

export function getBrandDefaults(): { season: Season; uiStyle: UiStyle } {
  const synced = brandSettings as { theme?: string; uiStyle?: string }
  return {
    season: coerceSeason(process.env.NEXT_PUBLIC_SITE_THEME || synced.theme, 'summer'),
    uiStyle: coerceStyle(process.env.NEXT_PUBLIC_UI_STYLE || synced.uiStyle, 'watercolor'),
  }
}

// The `<body>`/wrapper class string, honoring optional per-product overrides
// (null/empty = inherit the store default).
export function themeClass(overrides?: {
  season?: string | null
  uiStyle?: string | null
}): string {
  const d = getBrandDefaults()
  const season = coerceSeason(overrides?.season ?? undefined, d.season)
  const uiStyle = coerceStyle(overrides?.uiStyle ?? undefined, d.uiStyle)
  return `${season} style-${uiStyle}`
}
