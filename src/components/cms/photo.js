// A photo from the console is { src, alt, rotate?, flip?, opacity? }; older
// content is a bare path. The owner's turn, mirror and fade are CSS, so the
// file itself is never re-encoded.

import versions from 'virtual:upload-versions'

// A file in public/uploads keeps its name when the owner replaces it, so the
// host lets a phone keep it a year (customHttp.yml) and the address carries the
// file's fingerprint (vite.config.js uploadVersions): a replaced photo gets a
// new address and is fetched once; an unchanged one is never fetched again.
export const versioned = (url) => {
  const v = url && !url.includes('?') && versions[url]
  return v ? `${url}?v=${v}` : url
}
export const srcOf = (v) => versioned(typeof v === 'string' ? v : v?.src || '')
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
