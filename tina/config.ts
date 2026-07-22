import { defineConfig } from 'tinacms'
import React from 'react'

// A decorative (data-less) settings field: a button that opens the live site in
// a new tab with Preview mode on (?preview), so the owner can try styles/seasons
// side-by-side with the admin without saving. It never calls onChange, so it
// stores no value. See DESIGN.md §6 (Preview mode).
const PreviewLinkField = () =>
  React.createElement(
    'div',
    { style: { padding: '4px 0 8px' } },
    React.createElement(
      'a',
      {
        href: '/?preview',
        target: '_blank',
        rel: 'noreferrer',
        style: {
          display: 'inline-block',
          padding: '8px 14px',
          background: '#2296fe',
          color: '#fff',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
        },
      },
      'Open live preview ↗'
    ),
    React.createElement(
      'p',
      { style: { margin: '6px 0 0', fontSize: '12px', color: '#64748b' } },
      'Opens the site in a new tab where you can toggle styles & seasons live without saving.'
    )
  )

const SEASONS = ['spring', 'summer', 'fall', 'winter']

// UI styles are a second, independent axis from the season. The season owns the
// COLOR palette; the UI style owns the STRUCTURE + type feel (borders, radius,
// shadows, display font). Every style reuses the current season's colors, so
// changing the look never changes the palette. See DESIGN.md §5–§6.
const UI_STYLES = [
  { value: 'watercolor', label: 'Watercolor (original)' },
  { value: 'editorial', label: 'Editorial (serif & airy)' },
  { value: 'sanctuary', label: 'Sanctuary (whimsical & soft)' },
  { value: 'immersive', label: 'Immersive (cinematic full-bleed)' },
]

// Names of the Service cards on the current page, lower-cased. Used by the
// "link to a service" validators below so a button/add-on can't silently point
// at a service that doesn't exist. Works on both the new `service` template and
// legacy `serviceCard` files that haven't been re-saved yet.
function serviceHeadings(allValues?: {
  blocks?: Array<{ _template?: string; title?: string }>
}) {
  return (allValues?.blocks || [])
    .filter((b) => (b?._template === 'service' || b?._template === 'serviceCard') && b?.title)
    .map((b) => String(b.title).trim().toLowerCase())
}

// Reusable list of call-to-action buttons. A button is normally a plain link
// whose availability you set with Status. Optionally it can instead be tied to a
// Service on the same page: leave Status alone and fill in "Linked Service" —
// the button then shows Available/Coming Soon based on THAT service's status
// (the same mechanism the booking add-ons use). This is the single button model
// shared by every block type.
const buttonsField = {
  type: 'object' as const,
  name: 'buttons',
  label: 'Buttons',
  list: true,
  ui: {
    itemProps: (item: { label?: string; service?: string }) => ({
      label: item?.label || item?.service || 'Button',
    }),
  },
  fields: [
    { type: 'string' as const, name: 'label', label: 'Button Text' },
    { type: 'string' as const, name: 'url', label: 'Button Link' },
    {
      type: 'string' as const,
      name: 'status',
      label: 'Status',
      description: 'Ignored when a Linked Service is set (status comes from that service).',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'coming-soon', label: 'Coming Soon' },
      ],
    },
    {
      type: 'string' as const,
      name: 'service',
      label: 'Linked Service (optional)',
      description:
        'Type the exact Heading of a Service card on this page to tie this button to it. The button then shows Available or Coming Soon based on THAT service’s status.',
      ui: {
        validate: (
          value?: string,
          allValues?: { blocks?: Array<{ _template?: string; title?: string }> }
        ) => {
          if (!value) return undefined
          if (!serviceHeadings(allValues).includes(value.trim().toLowerCase())) {
            return `No Service titled "${value}" on this page — it must match a Service Heading exactly.`
          }
          return undefined
        },
      },
    },
  ],
}

// Where the image sits next to the text. "Auto" alternates left/right down the
// page automatically (recomputed when blocks are dragged to reorder); Left/Right
// pin a specific side.
const imagePlacementField = {
  type: 'string' as const,
  name: 'imageSide',
  label: 'Image Placement',
  description: 'Auto alternates sides down the page. Pick Left or Right to pin it.',
  options: [
    { value: 'auto', label: 'Auto (alternate)' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
  ],
}

// Editor-controlled image width as a percentage of the row (the image and text
// share the row). ~45 is the default balance; smaller = more room for text,
// larger = a bigger image. Replaces the old sm/md/lg buckets with a continuous
// value you can dial in. Ignored on mobile, where everything stacks full-width.
const imageWidthField = {
  type: 'number' as const,
  name: 'imageWidth',
  label: 'Image Width (%)',
  description: 'How wide the image is vs. the text, 20–70. Blank = 45 (balanced).',
}

// Vertical breathing room above/below the block. Normal is the default band
// spacing; Compact tightens it; Airy opens it up. Maps to .section--compact /
// .section--airy in layout.css.
const spacingField = {
  type: 'string' as const,
  name: 'spacing',
  label: 'Vertical Spacing',
  description: 'How much space above and below this component.',
  options: [
    { value: 'compact', label: 'Compact' },
    { value: 'normal', label: 'Normal (default)' },
    { value: 'airy', label: 'Airy' },
  ],
}

// Optional "Home" button at the bottom of a block (links to the home page).
// Defaults ON for new blocks; the renderer shows it unless explicitly turned off.
const homeButtonField = {
  type: 'boolean' as const,
  name: 'showHomeButton',
  label: 'Show "Home" button',
  description: 'Adds a Home button (links to the home page). On by default; turn off to hide.',
  ui: { defaultValue: true },
}

// Bookable add-ons for a single session. Each names another service (its button
// reflects THAT service's status) and the booking URL for this session + add-on.
// Nested under bookingOptions so every session (90/120/180 min) can offer its own.
const addOnsField = {
  type: 'object' as const,
  name: 'addOns',
  label: 'Add-ons for this session',
  list: true,
  ui: { itemProps: (item: { service?: string }) => ({ label: item?.service || 'Add-on' }) },
  fields: [
    {
      type: 'string' as const,
      name: 'service',
      label: 'Add-on Service',
      description:
        'Type the exact Heading of another Service card. Its button shows Available or Coming Soon based on THAT service’s Status.',
      ui: {
        // Block save unless the typed name matches a Service Heading on this page.
        validate: (
          value?: string,
          allValues?: { blocks?: Array<{ _template?: string; title?: string }> }
        ) => {
          if (!value) return undefined
          if (!serviceHeadings(allValues).includes(value.trim().toLowerCase())) {
            return `No Service titled "${value}" on this page — it must match a Service Heading exactly.`
          }
          return undefined
        },
      },
    },
    {
      type: 'string' as const,
      name: 'bookUrl',
      label: 'Booking URL (this session + add-on, used when the add-on is available)',
    },
  ],
}

// --- The two block types (the palette Melissa adds/reorders on a page) ---
// Every visual layout the site can show is one "Content Section" whose Layout
// picker chooses how it renders; anything bookable is a "Service". Both share
// the same buttons + spacing model. See DESIGN.md §5–§6 and ADR 0001.

// The five looks a Content Section can take. Which fields matter depends on the
// Layout you pick (noted in each field's description); unused fields stay blank.
const contentSection = {
  name: 'contentSection',
  label: 'Content Section',
  ui: {
    itemProps: (item: { title?: string; layout?: string }) => ({
      label: item?.title ? `${item.title}` : `Content (${item?.layout || 'image + text'})`,
    }),
    defaultItem: { layout: 'imageText', imageSide: 'auto', spacing: 'normal', showHomeButton: true },
  },
  fields: [
    {
      type: 'string',
      name: 'layout',
      label: 'Layout',
      description: 'How this section looks. Pick one; only the matching fields below are used.',
      options: [
        { value: 'splash', label: 'Splash / Hero (text over a full-width image)' },
        { value: 'imageText', label: 'Image + Text' },
        { value: 'centered', label: 'Centered Text' },
        { value: 'cardGrid', label: 'Card Grid' },
        { value: 'values', label: 'Values List' },
        { value: 'event', label: 'Event / Announcement' },
      ],
      ui: { defaultValue: 'imageText' },
    },
    { type: 'string', name: 'title', label: 'Heading' },
    {
      type: 'string',
      name: 'eyebrow',
      label: 'Eyebrow',
      description:
        'Splash layout. The small tracked line above the heading, e.g. "MASSAGE + SOUND HEALING".',
    },
    {
      type: 'rich-text',
      name: 'body',
      label: 'Body Text',
      description: 'Used by Splash, Image + Text, Centered Text, and Event layouts.',
    },
    {
      type: 'image',
      name: 'image',
      label: 'Image',
      description: 'Image + Text layout, and the background photo for the Splash layout.',
    },
    {
      type: 'string',
      name: 'taglinePlacement',
      label: 'Tagline Artwork',
      description:
        'Splash layout only. Where to put the "Your Integrative Healer / You are Resilient" artwork. In both Beside and Over, the artwork carries the words, so the heading, eyebrow and body are not shown — only the buttons.',
      options: [
        { value: 'none', label: 'Don’t show it' },
        { value: 'beside', label: 'Beside the photo (two-up banner)' },
        { value: 'over', label: 'Over the photo (blended)' },
      ],
      ui: { defaultValue: 'none' },
    },
    {
      type: 'number',
      name: 'taglineBlend',
      label: 'Tagline Blend %',
      description:
        'Only used by "Over the photo". How strongly the artwork sits on the photo, 10–100. Lower lets more of the photo through. Defaults to 88.',
    },
    {
      type: 'string',
      name: 'overlayAlign',
      label: 'Splash Text Position',
      description:
        'Splash layout only — where the overlaid text sits on the photo. Each UI Style also has its own default feel.',
      options: [
        { value: 'center', label: 'Centered' },
        { value: 'bottomLeft', label: 'Bottom left' },
        { value: 'bottomCenter', label: 'Bottom center' },
      ],
      ui: { defaultValue: 'center' },
    },
    imagePlacementField,
    imageWidthField,
    {
      type: 'image',
      name: 'images',
      label: 'Images',
      list: true,
      description: 'Event layout (one or more images).',
    },
    {
      type: 'object',
      name: 'cards',
      label: 'Cards',
      description: 'Card Grid layout.',
      list: true,
      ui: { itemProps: (item: { title?: string }) => ({ label: item?.title || 'Card' }) },
      fields: [
        { type: 'image', name: 'image', label: 'Thumbnail (optional)' },
        { type: 'string', name: 'title', label: 'Card Title' },
        { type: 'string', name: 'description', label: 'Card Text' },
        { type: 'string', name: 'buttonLabel', label: 'Button Text' },
        { type: 'string', name: 'buttonUrl', label: 'Button Link' },
      ],
    },
    {
      type: 'string',
      name: 'words',
      label: 'Values',
      list: true,
      description: 'Values List layout.',
    },
    spacingField,
    buttonsField,
    homeButtonField,
  ],
}

const service = {
  name: 'service',
  label: 'Service / Offering',
  ui: {
    itemProps: (item: { title?: string }) => ({ label: item?.title || 'Service' }),
    defaultItem: { imageSide: 'auto', spacing: 'normal', status: 'available', showHomeButton: true },
  },
  fields: [
    { type: 'string', name: 'title', label: 'Heading' },
    { type: 'rich-text', name: 'description', label: 'Body Text' },
    { type: 'image', name: 'image', label: 'Image' },
    imagePlacementField,
    imageWidthField,
    {
      type: 'string',
      name: 'status',
      label: 'Status',
      description: 'Coming Soon disables this service’s booking buttons and shows a badge.',
      options: [
        { value: 'available', label: 'Available' },
        { value: 'coming-soon', label: 'Coming Soon' },
      ],
      ui: { defaultValue: 'available' },
    },
    {
      type: 'object',
      name: 'bookingOptions',
      label: 'Booking Options',
      list: true,
      ui: { itemProps: (item: { label?: string }) => ({ label: item?.label || 'Booking option' }) },
      fields: [
        { type: 'string', name: 'label', label: 'Session Label (button text)' },
        { type: 'string', name: 'bookUrl', label: 'Booking URL' },
        { type: 'string', name: 'note', label: 'Note' },
        addOnsField,
      ],
    },
    spacingField,
    buttonsField,
    homeButtonField,
  ],
}

// A generic embed block — the "consolidate every source" primitive. Any external
// tool (OfferingTree schedule/offering, Canva design, Kit/ConvertKit form) hands
// you a copy-paste snippet; drop it in one of these and it renders live, so the
// owner edits the source once instead of hand-updating links on the site. Two
// modes: an iframe URL (simplest — Canva "smart embed" link, OfferingTree/Kit
// share URL) or raw embed code whose <script> tags are re-executed at render
// (needed for Kit forms; see the EmbedBlock renderer in Blocks.jsx).
const embed = {
  name: 'embed',
  label: 'Embed (OfferingTree / Canva / Kit)',
  ui: {
    itemProps: (item: { title?: string; source?: string }) => ({
      label: item?.title || (item?.source ? `Embed – ${item.source}` : 'Embed'),
    }),
    defaultItem: { source: 'offeringtree', mode: 'url', height: 640, showHomeButton: true },
  },
  fields: [
    { type: 'string', name: 'title', label: 'Heading (optional)' },
    {
      type: 'string',
      name: 'source',
      label: 'Source',
      description: 'Which tool this embed comes from (just a label for your reference).',
      options: [
        { value: 'offeringtree', label: 'OfferingTree (schedule / offering)' },
        { value: 'canva', label: 'Canva (design / poster)' },
        { value: 'kit', label: 'Kit / ConvertKit (signup form)' },
        { value: 'other', label: 'Other' },
      ],
      ui: { defaultValue: 'offeringtree' },
    },
    {
      type: 'string',
      name: 'mode',
      label: 'Embed Type',
      description:
        'URL = paste the iframe/share link (simplest; best for Canva & OfferingTree). Code = paste the full snippet (needed for Kit forms that use a <script>).',
      options: [
        { value: 'url', label: 'URL (iframe link)' },
        { value: 'code', label: 'Embed code (HTML / script)' },
      ],
      ui: { defaultValue: 'url' },
    },
    {
      type: 'string',
      name: 'url',
      label: 'Embed URL',
      description: 'URL mode. e.g. a Canva “smart embed” link or an OfferingTree schedule/offering URL.',
    },
    {
      type: 'string',
      name: 'code',
      label: 'Embed Code',
      description: 'Code mode. Paste the exact snippet the tool gives you — its <script> tags will run.',
      ui: { component: 'textarea' },
    },
    {
      type: 'number',
      name: 'height',
      label: 'Height (px)',
      description: 'Height of the embed frame in URL mode. Blank = 640.',
    },
    { type: 'string', name: 'caption', label: 'Caption (optional)' },
    spacingField,
    homeButtonField,
  ],
}

export default defineConfig({
  branch: process.env.TINA_BRANCH || 'main',
  // Local dev works without these; TinaCloud fills them in for production (Phase 4).
  clientId: process.env.TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: {
    outputFolder: 'admin', // served at /admin
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads', // uploaded images land in public/uploads (repo-based, free)
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'settings',
        label: 'Site Settings',
        path: 'content/settings',
        format: 'json',
        ui: {
          global: true,
          allowedActions: { create: false, delete: false },
        },
        fields: [
          { type: 'string', name: 'siteTitle', label: 'Site Title' },
          { type: 'string', name: 'tagline', label: 'Tagline' },
          { type: 'image', name: 'logo', label: 'Logo' },
          { type: 'string', name: 'theme', label: 'Seasonal Theme', options: SEASONS },
          {
            type: 'string',
            name: 'uiStyle',
            label: 'UI Style',
            description:
              'The overall look & feel. Independent of the season — the seasonal colors carry over into every style.',
            options: UI_STYLES,
            ui: { defaultValue: 'watercolor' },
          },
          // The navbar action button (Wild Owl's "BOOK", Seven Senses' "Sign In").
          // Only the alternate UI styles render a nav CTA; watercolor's navbar is
          // the untouched original. Leave the label blank to hide it everywhere.
          { type: 'string', name: 'navCtaLabel', label: 'Nav Button Text' },
          {
            type: 'string',
            name: 'navCtaUrl',
            label: 'Nav Button Link',
            description: 'Shown in the navbar on the Editorial / Sanctuary / Immersive styles.',
          },
          {
            type: 'string',
            name: 'previewLink',
            label: 'Preview',
            // Data-less: the custom component renders a link and never saves.
            ui: { component: PreviewLinkField },
          },
          { type: 'string', name: 'contactEmail', label: 'Contact Email' },
        ],
      },
      {
        name: 'page',
        label: 'Pages',
        path: 'content/pages',
        format: 'json',
        ui: {
          // Sensible starting point for a brand-new page: it shows in the nav and
          // opens with one Content Section so the editor isn't a blank slate.
          defaultItem: () => ({
            showInNav: true,
            order: 99,
            blocks: [
              { _template: 'contentSection', layout: 'centered', title: 'New Section', showHomeButton: true },
            ],
          }),
          // Route used for on-page ("contextual") editing.
          router: ({ document }: { document: { _sys: { filename: string } } }) => {
            const slug = document._sys.filename
            return slug === 'home' ? '/' : `/${slug}`
          },
        },
        fields: [
          { type: 'string', name: 'title', label: 'Page Title', isTitle: true, required: true },
          { type: 'string', name: 'navLabel', label: 'Nav Label' },
          { type: 'number', name: 'order', label: 'Nav Order' },
          { type: 'boolean', name: 'showInNav', label: 'Show in Nav' },
          {
            type: 'object',
            name: 'blocks',
            label: 'Blocks',
            list: true,
            templates: [contentSection, service, embed],
          },
        ],
      },
    ],
  },
})
