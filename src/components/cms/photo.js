// A photo from the console is { src, alt, rotate?, flip?, opacity? }; older
// content is a bare path. The owner's turn, mirror and fade are CSS, so the
// file itself is never re-encoded.

export const srcOf = (v) => (typeof v === 'string' ? v : v?.src || '')
export const altOf = (v, fallback = '') => (typeof v === 'object' && v?.alt) || fallback

export function imageStyle(v) {
  if (!v || typeof v !== 'object') return undefined
  const turns = []
  if (v.rotate) turns.push(`rotate(${v.rotate}deg)`)
  if (v.flip) turns.push('scaleX(-1)')
  const style = {}
  if (turns.length) style.transform = turns.join(' ')
  if (v.opacity != null && v.opacity < 100) style.opacity = v.opacity / 100
  return Object.keys(style).length ? style : undefined
}
