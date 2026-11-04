// node --test scripts/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { markdownToHtml } from '../src/cms/markdown.js'
import { pageFromTina, settingsFromTina } from '../src/cms/fromTina.js'

test('Markdown becomes the HTML the console keeps, with nothing unescaped', () => {
  assert.equal(markdownToHtml('Hello **world**, *gently*.\n\nSecond'), '<p>Hello <strong>world</strong>, <em>gently</em>.</p><p>Second</p>')
  assert.equal(markdownToHtml('[Cura](https://cura.example/a_b)'), '<p><a href="https://cura.example/a_b">Cura</a></p>')
  assert.equal(markdownToHtml('see https://x.example/'), '<p>see <a href="https://x.example/">https://x.example/</a></p>')
  assert.equal(markdownToHtml('- one\n- two'), '<ul><li>one</li><li>two</li></ul>')
  assert.equal(markdownToHtml('# Title'), '<h2>Title</h2>')
  assert.equal(markdownToHtml('<script>x</script>'), '<p>&lt;script&gt;x&lt;/script&gt;</p>')
  assert.equal(markdownToHtml('[bad](javascript:alert(1))'), '<p><a href="#">bad</a>)</p>')
  assert.equal(markdownToHtml(''), '')
})

test('a Tina page converts to console sections with ids, image objects and HTML', () => {
  const { slug, data } = pageFromTina('services', {
    title: 'Services', order: 2, showInNav: true,
    blocks: [
      { _template: 'service', title: 'Thai', description: '**Deep**', image: '/uploads/thai.jpg', status: '',
        bookingOptions: [{ label: '90 min', bookUrl: 'https://b.example', addOns: [{ service: 'Compress' }] }] },
      { _template: 'contentSection', layout: 'values', words: ['Grace', ''], images: ['/a.jpg'], buttons: [{ label: 'Go', url: '/' }] },
      { _template: 'retired' },
    ],
  })
  assert.equal(slug, 'services')
  assert.equal(data.blocks.length, 2)
  const [svc, sec] = data.blocks
  assert.deepEqual([svc._id, svc._type], ['services-0', 'service'])
  assert.equal(svc.description, '<p><strong>Deep</strong></p>')
  assert.deepEqual(svc.image, { src: '/uploads/thai.jpg', alt: '' })
  assert.equal('status' in svc, false, 'a blank Tina value leaves the console default')
  assert.equal(svc.bookingOptions[0].addOns[0]._id, 'services-0-opt-0-add-0')
  assert.deepEqual(sec.words, [{ _id: 'services-1-w-0', text: 'Grace' }])
  assert.deepEqual(sec.images, [{ _id: 'services-1-img-0', image: { src: '/a.jpg', alt: '' } }])
  assert.equal(sec.buttons[0]._id, 'services-1-btn-0')
})

test('every content file converts without losing a section', () => {
  const dir = new URL('../content/pages/', import.meta.url)
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    const file = JSON.parse(readFileSync(new URL(f, dir), 'utf8'))
    const { data } = pageFromTina(f.replace('.json', ''), file)
    assert.equal(data.blocks.length, file.blocks.length, f)
    for (const b of data.blocks) assert.ok(b._id && b._type, f)
  }
  const settings = settingsFromTina(JSON.parse(readFileSync(new URL('../content/settings/index.json', import.meta.url), 'utf8')))
  assert.ok(settings.siteTitle)
})
