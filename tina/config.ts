import { defineConfig } from 'tinacms'

const SEASONS = ['spring', 'summer', 'fall', 'winter']
const SIDES = ['left', 'right']

// Reusable list of call-to-action buttons.
const buttonsField = {
  type: 'object' as const,
  name: 'buttons',
  label: 'Buttons',
  list: true,
  ui: {
    itemProps: (item: { label?: string }) => ({ label: item?.label || 'Button' }),
  },
  fields: [
    { type: 'string' as const, name: 'label', label: 'Label' },
    { type: 'string' as const, name: 'url', label: 'URL' },
  ],
}

// --- Block templates (the palette Melissa adds/reorders on a page) ---
// Each maps to a CSS primitive from ADR 0001.

const splitSection = {
  name: 'splitSection',
  label: 'Split Section (image + text)',
  ui: { itemProps: (item: { title?: string }) => ({ label: item?.title || 'Split Section' }) },
  fields: [
    { type: 'string', name: 'title', label: 'Title' },
    { type: 'rich-text', name: 'body', label: 'Body' },
    { type: 'image', name: 'image', label: 'Image' },
    { type: 'string', name: 'imageSide', label: 'Image Side', options: SIDES },
    buttonsField,
  ],
}

const stackedSection = {
  name: 'stackedSection',
  label: 'Stacked Section (centered)',
  ui: { itemProps: (item: { title?: string }) => ({ label: item?.title || 'Stacked Section' }) },
  fields: [
    { type: 'string', name: 'title', label: 'Title' },
    { type: 'rich-text', name: 'body', label: 'Body' },
    buttonsField,
  ],
}

const serviceCard = {
  name: 'serviceCard',
  label: 'Service Card',
  ui: { itemProps: (item: { title?: string }) => ({ label: item?.title || 'Service Card' }) },
  fields: [
    { type: 'string', name: 'title', label: 'Title' },
    { type: 'rich-text', name: 'description', label: 'Description' },
    { type: 'image', name: 'image', label: 'Image' },
    { type: 'string', name: 'imageSide', label: 'Image Side', options: SIDES },
    {
      type: 'object',
      name: 'bookingOptions',
      label: 'Booking Options',
      list: true,
      ui: { itemProps: (item: { label?: string }) => ({ label: item?.label || 'Booking option' }) },
      fields: [
        { type: 'string', name: 'label', label: 'Label' },
        { type: 'string', name: 'bookUrl', label: 'Booking URL' },
        { type: 'string', name: 'note', label: 'Note' },
      ],
    },
  ],
}

const valuesSection = {
  name: 'valuesSection',
  label: 'Values',
  fields: [
    { type: 'string', name: 'title', label: 'Title' },
    { type: 'string', name: 'words', label: 'Values', list: true },
  ],
}

const eventSection = {
  name: 'eventSection',
  label: 'Event / Upcoming',
  ui: { itemProps: (item: { title?: string }) => ({ label: item?.title || 'Event' }) },
  fields: [
    { type: 'string', name: 'title', label: 'Title' },
    { type: 'rich-text', name: 'body', label: 'Body' },
    { type: 'image', name: 'images', label: 'Images', list: true },
    buttonsField,
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
          { type: 'string', name: 'contactEmail', label: 'Contact Email' },
        ],
      },
      {
        name: 'page',
        label: 'Pages',
        path: 'content/pages',
        format: 'json',
        ui: {
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
            templates: [
              splitSection,
              stackedSection,
              serviceCard,
              valuesSection,
              eventSection,
            ],
          },
        ],
      },
    ],
  },
})
