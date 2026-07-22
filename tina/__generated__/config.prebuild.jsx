// tina/config.ts
import { defineConfig } from "tinacms";
import React from "react";
var PreviewLinkField = () => React.createElement(
  "div",
  { style: { padding: "4px 0 8px" } },
  React.createElement(
    "a",
    {
      href: "/?preview",
      target: "_blank",
      rel: "noreferrer",
      style: {
        display: "inline-block",
        padding: "8px 14px",
        background: "#2296fe",
        color: "#fff",
        borderRadius: "6px",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 600
      }
    },
    "Open live preview \u2197"
  ),
  React.createElement(
    "p",
    { style: { margin: "6px 0 0", fontSize: "12px", color: "#64748b" } },
    "Opens the site in a new tab where you can toggle styles & seasons live without saving."
  )
);
var SEASONS = ["spring", "summer", "fall", "winter"];
var UI_STYLES = [
  { value: "watercolor", label: "Watercolor (original)" },
  { value: "editorial", label: "Editorial (serif & airy)" },
  { value: "sanctuary", label: "Sanctuary (whimsical & soft)" },
  { value: "immersive", label: "Immersive (cinematic full-bleed)" }
];
function serviceHeadings(allValues) {
  return (allValues?.blocks || []).filter((b) => (b?._template === "service" || b?._template === "serviceCard") && b?.title).map((b) => String(b.title).trim().toLowerCase());
}
var buttonsField = {
  type: "object",
  name: "buttons",
  label: "Buttons",
  list: true,
  ui: {
    itemProps: (item) => ({
      label: item?.label || item?.service || "Button"
    })
  },
  fields: [
    { type: "string", name: "label", label: "Button Text" },
    { type: "string", name: "url", label: "Button Link" },
    {
      type: "string",
      name: "status",
      label: "Status",
      description: "Ignored when a Linked Service is set (status comes from that service).",
      options: [
        { value: "active", label: "Active" },
        { value: "coming-soon", label: "Coming Soon" }
      ]
    },
    {
      type: "string",
      name: "service",
      label: "Linked Service (optional)",
      description: "Type the exact Heading of a Service card on this page to tie this button to it. The button then shows Available or Coming Soon based on THAT service\u2019s status.",
      ui: {
        validate: (value, allValues) => {
          if (!value) return void 0;
          if (!serviceHeadings(allValues).includes(value.trim().toLowerCase())) {
            return `No Service titled "${value}" on this page \u2014 it must match a Service Heading exactly.`;
          }
          return void 0;
        }
      }
    }
  ]
};
var imagePlacementField = {
  type: "string",
  name: "imageSide",
  label: "Image Placement",
  description: "Auto alternates sides down the page. Pick Left or Right to pin it.",
  options: [
    { value: "auto", label: "Auto (alternate)" },
    { value: "left", label: "Left" },
    { value: "right", label: "Right" }
  ]
};
var imageWidthField = {
  type: "number",
  name: "imageWidth",
  label: "Image Width (%)",
  description: "How wide the image is vs. the text, 20\u201370. Blank = 45 (balanced)."
};
var spacingField = {
  type: "string",
  name: "spacing",
  label: "Vertical Spacing",
  description: "How much space above and below this component.",
  options: [
    { value: "compact", label: "Compact" },
    { value: "normal", label: "Normal (default)" },
    { value: "airy", label: "Airy" }
  ]
};
var homeButtonField = {
  type: "boolean",
  name: "showHomeButton",
  label: 'Show "Home" button',
  description: "Adds a Home button (links to the home page). On by default; turn off to hide.",
  ui: { defaultValue: true }
};
var addOnsField = {
  type: "object",
  name: "addOns",
  label: "Add-ons for this session",
  list: true,
  ui: { itemProps: (item) => ({ label: item?.service || "Add-on" }) },
  fields: [
    {
      type: "string",
      name: "service",
      label: "Add-on Service",
      description: "Type the exact Heading of another Service card. Its button shows Available or Coming Soon based on THAT service\u2019s Status.",
      ui: {
        // Block save unless the typed name matches a Service Heading on this page.
        validate: (value, allValues) => {
          if (!value) return void 0;
          if (!serviceHeadings(allValues).includes(value.trim().toLowerCase())) {
            return `No Service titled "${value}" on this page \u2014 it must match a Service Heading exactly.`;
          }
          return void 0;
        }
      }
    },
    {
      type: "string",
      name: "bookUrl",
      label: "Booking URL (this session + add-on, used when the add-on is available)"
    }
  ]
};
var contentSection = {
  name: "contentSection",
  label: "Content Section",
  ui: {
    itemProps: (item) => ({
      label: item?.title ? `${item.title}` : `Content (${item?.layout || "image + text"})`
    }),
    defaultItem: { layout: "imageText", imageSide: "auto", spacing: "normal", showHomeButton: true }
  },
  fields: [
    {
      type: "string",
      name: "layout",
      label: "Layout",
      description: "How this section looks. Pick one; only the matching fields below are used.",
      options: [
        { value: "imageText", label: "Image + Text" },
        { value: "centered", label: "Centered Text" },
        { value: "cardGrid", label: "Card Grid" },
        { value: "values", label: "Values List" },
        { value: "event", label: "Event / Announcement" }
      ],
      ui: { defaultValue: "imageText" }
    },
    { type: "string", name: "title", label: "Heading" },
    {
      type: "rich-text",
      name: "body",
      label: "Body Text",
      description: "Used by Image + Text, Centered Text, and Event layouts."
    },
    {
      type: "image",
      name: "image",
      label: "Image",
      description: "Image + Text layout."
    },
    imagePlacementField,
    imageWidthField,
    {
      type: "image",
      name: "images",
      label: "Images",
      list: true,
      description: "Event layout (one or more images)."
    },
    {
      type: "object",
      name: "cards",
      label: "Cards",
      description: "Card Grid layout.",
      list: true,
      ui: { itemProps: (item) => ({ label: item?.title || "Card" }) },
      fields: [
        { type: "string", name: "title", label: "Card Title" },
        { type: "string", name: "description", label: "Card Text" },
        { type: "string", name: "buttonLabel", label: "Button Text" },
        { type: "string", name: "buttonUrl", label: "Button Link" }
      ]
    },
    {
      type: "string",
      name: "words",
      label: "Values",
      list: true,
      description: "Values List layout."
    },
    spacingField,
    buttonsField,
    homeButtonField
  ]
};
var service = {
  name: "service",
  label: "Service / Offering",
  ui: {
    itemProps: (item) => ({ label: item?.title || "Service" }),
    defaultItem: { imageSide: "auto", spacing: "normal", status: "available", showHomeButton: true }
  },
  fields: [
    { type: "string", name: "title", label: "Heading" },
    { type: "rich-text", name: "description", label: "Body Text" },
    { type: "image", name: "image", label: "Image" },
    imagePlacementField,
    imageWidthField,
    {
      type: "string",
      name: "status",
      label: "Status",
      description: "Coming Soon disables this service\u2019s booking buttons and shows a badge.",
      options: [
        { value: "available", label: "Available" },
        { value: "coming-soon", label: "Coming Soon" }
      ],
      ui: { defaultValue: "available" }
    },
    {
      type: "object",
      name: "bookingOptions",
      label: "Booking Options",
      list: true,
      ui: { itemProps: (item) => ({ label: item?.label || "Booking option" }) },
      fields: [
        { type: "string", name: "label", label: "Session Label (button text)" },
        { type: "string", name: "bookUrl", label: "Booking URL" },
        { type: "string", name: "note", label: "Note" },
        addOnsField
      ]
    },
    spacingField,
    buttonsField,
    homeButtonField
  ]
};
var config_default = defineConfig({
  branch: process.env.TINA_BRANCH || "main",
  // Local dev works without these; TinaCloud fills them in for production (Phase 4).
  clientId: process.env.TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: {
    outputFolder: "admin",
    // served at /admin
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      // uploaded images land in public/uploads (repo-based, free)
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "settings",
        label: "Site Settings",
        path: "content/settings",
        format: "json",
        ui: {
          global: true,
          allowedActions: { create: false, delete: false }
        },
        fields: [
          { type: "string", name: "siteTitle", label: "Site Title" },
          { type: "string", name: "tagline", label: "Tagline" },
          { type: "image", name: "logo", label: "Logo" },
          { type: "string", name: "theme", label: "Seasonal Theme", options: SEASONS },
          {
            type: "string",
            name: "uiStyle",
            label: "UI Style",
            description: "The overall look & feel. Independent of the season \u2014 the seasonal colors carry over into every style.",
            options: UI_STYLES,
            ui: { defaultValue: "watercolor" }
          },
          {
            type: "string",
            name: "previewLink",
            label: "Preview",
            // Data-less: the custom component renders a link and never saves.
            ui: { component: PreviewLinkField }
          },
          { type: "string", name: "contactEmail", label: "Contact Email" }
        ]
      },
      {
        name: "page",
        label: "Pages",
        path: "content/pages",
        format: "json",
        ui: {
          // Sensible starting point for a brand-new page: it shows in the nav and
          // opens with one Content Section so the editor isn't a blank slate.
          defaultItem: () => ({
            showInNav: true,
            order: 99,
            blocks: [
              { _template: "contentSection", layout: "centered", title: "New Section", showHomeButton: true }
            ]
          }),
          // Route used for on-page ("contextual") editing.
          router: ({ document }) => {
            const slug = document._sys.filename;
            return slug === "home" ? "/" : `/${slug}`;
          }
        },
        fields: [
          { type: "string", name: "title", label: "Page Title", isTitle: true, required: true },
          { type: "string", name: "navLabel", label: "Nav Label" },
          { type: "number", name: "order", label: "Nav Order" },
          { type: "boolean", name: "showInNav", label: "Show in Nav" },
          {
            type: "object",
            name: "blocks",
            label: "Blocks",
            list: true,
            templates: [contentSection, service]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
