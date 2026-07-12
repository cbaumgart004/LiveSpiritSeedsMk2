// One-time image optimization (run: node scripts/optimize-images.mjs).
// Downsizes source assets to roughly their on-screen display size and re-encodes,
// overwriting the originals in place. Assets are tracked in git, so this is revertible.
import sharp from 'sharp'
import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs'
import { join, extname, basename } from 'path'

const ASSETS = 'src/assets'
const kb = (n) => `${(n / 1024).toFixed(0)}KB`

let before = 0
let after = 0

async function process(path, width, encode) {
  const input = readFileSync(path)
  const out = await encode(
    sharp(input).resize({ width, withoutEnlargement: true })
  ).toBuffer()
  // Only replace if we actually made it smaller.
  const smaller = out.length < input.length ? out : input
  writeFileSync(path, smaller)
  before += input.length
  after += smaller.length
  const flag = out.length < input.length ? '' : '  (kept original — already smaller)'
  console.log(`  ${basename(path).padEnd(34)} ${kb(input.length).padStart(7)} -> ${kb(smaller.length).padStart(7)}${flag}`)
}

const jpeg = (q) => (s) => s.jpeg({ quality: q, mozjpeg: true })
const png = () => (s) => s.png({ compressionLevel: 9, palette: true })

// dir, extension, target display width (2x for retina), encoder
const jobs = [
  { dir: join(ASSETS, 'services'), ext: '.jpg', width: 760, enc: jpeg(80) },
  { dir: join(ASSETS, 'backgrounds'), ext: '.jpg', width: 1600, enc: jpeg(78) },
  { dir: join(ASSETS, 'icons'), ext: '.png', width: 220, enc: png() },
  { dir: ASSETS, ext: '.jpg', width: 1400, enc: jpeg(80), topOnly: true },
]

for (const job of jobs) {
  console.log(`\n${job.dir}  (max ${job.width}px):`)
  const entries = readdirSync(job.dir)
  for (const name of entries) {
    const full = join(job.dir, name)
    if (job.topOnly && statSync(full).isDirectory()) continue
    if (statSync(full).isDirectory()) continue
    if (extname(name).toLowerCase() !== job.ext) continue
    await process(full, job.width, job.enc)
  }
}

// Bali flyers: 5MB+ SVGs with embedded raster -> rasterize to JPG and rewrite imports.
console.log(`\n${ASSETS}/upcomingEvents/bali  (rasterize SVG -> JPG):`)
const baliDir = join(ASSETS, 'upcomingEvents', 'bali')
for (const name of readdirSync(baliDir)) {
  if (extname(name).toLowerCase() !== '.svg') continue
  const src = join(baliDir, name)
  const dst = join(baliDir, basename(name, '.svg') + '.jpg')
  const input = readFileSync(src)
  const out = await sharp(input, { density: 200 })
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer()
  writeFileSync(dst, out)
  unlinkSync(src)
  before += input.length
  after += out.length
  console.log(`  ${name.padEnd(34)} ${kb(input.length).padStart(7)} -> ${kb(out.length).padStart(7)}  (${basename(dst)})`)
}

console.log(`\nTotal: ${kb(before)} -> ${kb(after)}  (${(100 * (1 - after / before)).toFixed(0)}% smaller)`)
