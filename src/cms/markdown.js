// Markdown to HTML, for the rich text TinaCMS stored in content/*.json.
//
// Tina keeps rich text as Markdown strings in the files. The Edge of the Map
// console keeps it as sanitized HTML. This converts the one to the other, both
// when the import script moves the content into the console and when the site
// falls back to the bundled files (src/cms/site.js).
//
// Deliberately small: it covers what Tina's editor produces (paragraphs,
// headings, bold, italic, links, bare links, lists, images, line breaks). All
// input is escaped first, so the only HTML out is what this file writes, and
// links are limited to the schemes the console allows.

const SAFE_URL = /^(https?:|mailto:|tel:|\/(?!\/)|#)/i

const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const safe = (url) => (SAFE_URL.test(url.trim()) ? url.trim() : '#')

function inline(text) {
  let s = escape(text)
  // Images, then links, then bare addresses not already inside a link.
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${safe(src)}" alt="${alt}">`)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${safe(href)}">${label}</a>`)
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (_, pre, url) => `${pre}<a href="${url}">${url}</a>`)
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/__([^_]+)__/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>').replace(/(^|[^\w_])_([^_\s][^_]*)_(?!\w)/g, '$1<em>$2</em>')
  s = s.replace(/~~([^~]+)~~/g, '<s>$1</s>')
  // Markdown's hard break: two spaces or a backslash at the end of a line.
  return s.replace(/( {2,}|\\)\n/g, '<br>').replace(/\n/g, ' ')
}

export function markdownToHtml(md) {
  if (typeof md !== 'string' || !md.trim()) return ''
  const out = []
  for (const block of md.replace(/\r\n/g, '\n').split(/\n{2,}/)) {
    const text = block.replace(/^\n+|\n+$/g, '')
    if (!text.trim()) continue
    const heading = /^(#{1,6})\s+(.*)$/.exec(text)
    if (heading && !text.includes('\n')) {
      // The console's rich text allows h2 to h4.
      const level = Math.min(4, Math.max(2, heading[1].length))
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      continue
    }
    const lines = text.split('\n')
    if (lines.every((l) => /^\s*[-*+]\s+/.test(l))) {
      out.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*+]\s+/, ''))}</li>`).join('')}</ul>`)
      continue
    }
    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      out.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`)
      continue
    }
    if (lines.every((l) => /^>\s?/.test(l))) {
      out.push(`<blockquote><p>${inline(lines.map((l) => l.replace(/^>\s?/, '')).join('\n'))}</p></blockquote>`)
      continue
    }
    if (/^(-{3,}|\*{3,})$/.test(text.trim())) { out.push('<hr>'); continue }
    out.push(`<p>${inline(text)}</p>`)
  }
  return out.join('')
}
