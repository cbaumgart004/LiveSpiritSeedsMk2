// Compress images under public/uploads in place (used by CI after a Tina upload,
// and runnable locally: `node scripts/optimize-uploads.mjs`).
// iPhone photos are huge; this caps dimensions and re-encodes, only replacing a
// file when the result is actually smaller.
import sharp from 'sharp'
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, extname, basename } from 'path'

const DIR = 'public/uploads'
const MAX_WIDTH = 1600
const kb = (n) => `${(n / 1024).toFixed(0)}KB`

const encoders = {
  '.jpg': (s) => s.jpeg({ quality: 80, mozjpeg: true }),
  '.jpeg': (s) => s.jpeg({ quality: 80, mozjpeg: true }),
  '.png': (s) => s.png({ compressionLevel: 9, palette: true }),
  '.webp': (s) => s.webp({ quality: 80 }),
}

if (!existsSync(DIR)) {
  console.log(`No ${DIR} directory — nothing to optimize.`)
  process.exit(0)
}

let before = 0
let after = 0
let changed = 0

async function optimize(path, encode) {
  const input = readFileSync(path)
  const out = await encode(
    sharp(input).resize({ width: MAX_WIDTH, withoutEnlargement: true })
  ).toBuffer()
  before += input.length
  if (out.length < input.length) {
    writeFileSync(path, out)
    after += out.length
    changed += 1
    console.log(`  ${basename(path).padEnd(34)} ${kb(input.length).padStart(7)} -> ${kb(out.length).padStart(7)}`)
  } else {
    after += input.length
  }
}

async function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      await walk(full)
      continue
    }
    const encode = encoders[extname(name).toLowerCase()]
    if (encode) await optimize(full, encode)
  }
}

await walk(DIR)

if (changed === 0) {
  console.log('All uploads already optimized.')
} else {
  console.log(`\nOptimized ${changed} file(s): ${kb(before)} -> ${kb(after)}`)
}
