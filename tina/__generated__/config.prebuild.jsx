// tina/config.ts
import { defineConfig } from "tinacms";
var SEASONS = ["spring", "summer", "fall", "winter"];
var buttonsField = {
  type: "object",
  name: "buttons",
  label: "Buttons",
  list: true,
  ui: {
    itemProps: (item) => ({ label: item?.label || "Button" })
  },
  fields: [
    { type: "string", name: "label", label: "Button Text" },
    { type: "string", name: "url", label: "Button Link" },
    {
      type: "string",
      name: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "coming-soon", label: "Coming Soon" }
      ]
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
var imageSizeField = {
  type: "string",
  name: "imageSize",
  label: "Image Size",
  options: [
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium (default)" },
    { value: "lg", label: "Large" }
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
        // Block save unless the typed name matches a Service card Heading on
        // this page (case/space-insensitive), so add-ons can't silently miss.
        validate: (value, allValues) => {
          if (!value) return void 0;
          const headings = (allValues?.blocks || []).filter((b) => b?._template === "serviceCard" && b?.title).map((b) => String(b.title).trim().toLowerCase());
          if (!headings.includes(value.trim().toLowerCase())) {
            return `No Service card titled "${value}" on this page \u2014 it must match a Service Heading exactly.`;
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
var splitSection = {
  name: "splitSection",
  label: "Image + Text",
  ui: { itemProps: (item) => ({ label: item?.title || "Image + Text" }) },
  fields: [
    { type: "string", name: "title", label: "Heading" },
    { type: "rich-text", name: "body", label: "Body Text" },
    { type: "image", name: "image", label: "Image" },
    imagePlacementField,
    imageSizeField,
    buttonsField,
    homeButtonField
  ]
};
var stackedSection = {
  name: "stackedSection",
  label: "Text Block (centered)",
  ui: { itemProps: (item) => ({ label: item?.title || "Text Block" }) },
  fields: [
    { type: "string", name: "title", label: "Heading" },
    { type: "rich-text", name: "body", label: "Body Text" },
    buttonsField,
    homeButtonField
  ]
};
var serviceCard = {
  name: "serviceCard",
  label: "Service / Offering Card",
  ui: { itemProps: (item) => ({ label: item?.title || "Service Card" }) },
  fields: [
    { type: "string", name: "title", label: "Heading" },
    { type: "rich-text", name: "description", label: "Body Text" },
    { type: "image", name: "image", label: "Image" },
    imagePlacementField,
    imageSizeField,
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
    homeButtonField
  ]
};
var valuesSection = {
  name: "valuesSection",
  label: "Values List",
  ui: { itemProps: (item) => ({ label: item?.title || "Values List" }) },
  fields: [
    { type: "string", name: "title", label: "Heading" },
    { type: "string", name: "words", label: "Values", list: true },
    homeButtonField
  ]
};
var cardGrid = {
  name: "cardGrid",
  label: "Card Grid",
  ui: { itemProps: (item) => ({ label: item?.title || "Card Grid" }) },
  fields: [
    { type: "string", name: "title", label: "Heading" },
    {
      type: "object",
      name: "cards",
      label: "Cards",
      list: true,
      ui: { itemProps: (item) => ({ label: item?.title || "Card" }) },
      fields: [
        { type: "string", name: "title", label: "Card Title" },
        { type: "string", name: "description", label: "Card Text" },
        { type: "string", name: "buttonLabel", label: "Button Text" },
        { type: "string", name: "buttonUrl", label: "Button Link" }
      ]
    },
    homeButtonField
  ]
};
var eventSection = {
  name: "eventSection",
  label: "Event / Announcement",
  ui: { itemProps: (item) => ({ label: item?.title || "Event" }) },
  fields: [
    { type: "string", name: "title", label: "Heading" },
    { type: "rich-text", name: "body", label: "Body Text" },
    { type: "image", name: "images", label: "Images", list: true },
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
          { type: "string", name: "contactEmail", label: "Contact Email" }
        ]
      },
      {
        name: "page",
        label: "Pages",
        path: "content/pages",
        format: "json",
        ui: {
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
            templates: [
              splitSection,
              stackedSection,
              serviceCard,
              cardGrid,
              valuesSection,
              eventSection
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
