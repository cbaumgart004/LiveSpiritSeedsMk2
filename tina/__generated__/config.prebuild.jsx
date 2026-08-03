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
        { value: "splash", label: "Splash / Hero (text over a full-width image)" },
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
      type: "string",
      name: "eyebrow",
      label: "Eyebrow",
      description: 'Splash layout. The small tracked line above the heading, e.g. "MASSAGE + SOUND HEALING".'
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body Text",
      description: "Used by Splash, Image + Text, Centered Text, and Event layouts."
    },
    {
      type: "image",
      name: "image",
      label: "Image",
      description: "Image + Text layout, and the background photo for the Splash layout."
    },
    {
      type: "string",
      name: "taglinePlacement",
      label: "Tagline Artwork",
      description: 'Splash layout only. Where to put the "Your Integrative Healer / You are Resilient" artwork. In both Beside and Over, the artwork carries the words, so the heading, eyebrow and body are not shown \u2014 only the buttons.',
      options: [
        { value: "none", label: "Don\u2019t show it" },
        { value: "beside", label: "Beside the photo (two-up banner)" },
        { value: "over", label: "Overlapping the photo (lapped side by side)" }
      ],
      ui: { defaultValue: "none" }
    },
    {
      type: "number",
      name: "taglineBlend",
      label: "Tagline Blend %",
      description: 'Only used by "Overlapping the photo". Opacity of the artwork, 10\u2013100 \u2014 it laps 15% onto the photo, so lower lets more of the photograph read through the overlap. Defaults to 90.'
    },
    {
      type: "string",
      name: "overlayAlign",
      label: "Splash Text Position",
      description: "Splash layout only \u2014 where the overlaid text sits on the photo. Each UI Style also has its own default feel.",
      options: [
        { value: "center", label: "Centered" },
        { value: "bottomLeft", label: "Bottom left" },
        { value: "bottomCenter", label: "Bottom center" }
      ],
      ui: { defaultValue: "center" }
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
        { type: "image", name: "image", label: "Thumbnail (optional)" },
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
var embed = {
  name: "embed",
  label: "Embed (OfferingTree / Canva / Kit)",
  ui: {
    itemProps: (item) => ({
      label: item?.title || (item?.source ? `Embed \u2013 ${item.source}` : "Embed")
    }),
    defaultItem: { source: "offeringtree", mode: "url", height: 640, showHomeButton: true }
  },
  fields: [
    { type: "string", name: "title", label: "Heading (optional)" },
    {
      type: "string",
      name: "source",
      label: "Source",
      description: "Which tool this embed comes from (just a label for your reference).",
      options: [
        { value: "offeringtree", label: "OfferingTree (schedule / offering)" },
        { value: "canva", label: "Canva (design / poster)" },
        { value: "kit", label: "Kit / ConvertKit (signup form)" },
        { value: "teaching-schedule", label: "My teaching schedule (all studios)" },
        { value: "other", label: "Other" }
      ],
      ui: { defaultValue: "offeringtree" }
    },
    {
      type: "string",
      name: "mode",
      label: "Embed Type",
      description: "URL = paste the iframe/share link (simplest; best for Canva & OfferingTree). Code = paste the full snippet (needed for Kit forms that use a <script>).",
      options: [
        { value: "url", label: "URL (iframe link)" },
        { value: "code", label: "Embed code (HTML / script)" },
        { value: "schedule", label: "Teaching schedule (nothing to paste \u2014 updates itself)" },
        { value: "newsletter", label: "Newsletter signup (Kit \u2014 matches the site\u2019s look)" }
      ],
      ui: { defaultValue: "url" }
    },
    {
      type: "string",
      name: "url",
      label: "Embed URL",
      description: "URL mode. e.g. a Canva \u201Csmart embed\u201D link or an OfferingTree schedule/offering URL."
    },
    {
      type: "string",
      name: "code",
      label: "Embed Code",
      description: "Code mode. Paste the exact snippet the tool gives you \u2014 its <script> tags will run.",
      ui: { component: "textarea" }
    },
    {
      type: "number",
      name: "height",
      label: "Height (px)",
      description: "Height of the embed frame in URL mode. Blank = 640."
    },
    // --- Newsletter mode -----------------------------------------------------
    // Nothing to paste either: we render our own form and post it to Kit, so the
    // signup inherits the season's colours and the UI style's type/radius tokens
    // instead of arriving pre-styled by Kit. Only the form ID and the wording
    // live here. See the NewsletterEmbed renderer in Blocks.jsx.
    {
      type: "string",
      name: "newsletterFormId",
      label: "Newsletter: Kit form ID",
      description: "Newsletter mode. The number in your Kit form URL \u2014 app.kit.com/forms/designers/THIS-NUMBER. Not an API key; nothing secret."
    },
    {
      type: "string",
      name: "newsletterIntro",
      label: "Newsletter: intro line",
      description: "A sentence above the box \u2014 what people get, and how often."
    },
    {
      type: "boolean",
      name: "newsletterAskName",
      label: "Newsletter: also ask for a first name",
      description: "Lets you greet people by name in Kit. Every extra field costs you signups, so leave it off unless you will use it."
    },
    {
      type: "string",
      name: "newsletterPlaceholder",
      label: "Newsletter: email box placeholder",
      description: "Blank = \u201Cyour@email.com\u201D."
    },
    {
      type: "string",
      name: "newsletterNamePlaceholder",
      label: "Newsletter: name box placeholder",
      description: "Only used when the name field is on. Blank = \u201CFirst name\u201D."
    },
    {
      type: "string",
      name: "newsletterButtonLabel",
      label: "Newsletter: button label",
      description: "Blank = \u201CSubscribe\u201D."
    },
    {
      type: "string",
      name: "newsletterSuccess",
      label: "Newsletter: thank-you message",
      description: "Shown in place of the form after signing up. Blank = \u201CThank you \u2014 check your inbox to confirm.\u201D Keep the confirm hint if your Kit form uses double opt-in."
    },
    {
      type: "string",
      name: "newsletterFinePrint",
      label: "Newsletter: fine print",
      description: "Small line under the button, e.g. \u201CNo spam. Unsubscribe any time.\u201D"
    },
    // --- Schedule mode -------------------------------------------------------
    // Nothing to paste: the classes are harvested nightly from every studio in
    // scripts/lib/schedule-sources.mjs. These fields only control the wording.
    {
      type: "number",
      name: "scheduleLimit",
      label: "Schedule: most classes to show",
      description: "Schedule mode. Blank = show everything found (about two weeks ahead)."
    },
    {
      type: "string",
      name: "scheduleEmptyText",
      label: "Schedule: message when there are no classes",
      description: 'Schedule mode. Shown on a week with nothing scheduled, so the section never looks broken. Blank = "No classes scheduled just now."'
    },
    {
      type: "string",
      name: "scheduleLinkLabel",
      label: "Schedule: studio link wording",
      description: 'Schedule mode. Blank = "Full schedule at {studio}".'
    },
    { type: "string", name: "caption", label: "Caption (optional)" },
    spacingField,
    homeButtonField
  ]
};
var config_default = defineConfig({
  // Which git branch TinaCloud serves content from. Preview deploys build from
  // a feature branch, so fall back to the branch the HOST is building before
  // defaulting to main — otherwise a preview builds this branch's CODE against
  // main's CONTENT, and every query fails on fields main's indexed schema
  // doesn't have yet. VERCEL_GIT_COMMIT_REF is Vercel's; CF_PAGES_BRANCH is
  // Cloudflare Pages' (only one is ever set, so the order between them is
  // arbitrary). A host with neither lands on main.
  //
  // DON'T pin TINA_BRANCH in the host dashboard. It wins over everything below,
  // so a value left over from an old branch silently breaks every future deploy
  // (cost us a debugging session on 2026-07-23 — a stale `feature/admin-cms`).
  // Leave it unset and let the per-deploy branch resolve itself; set it only to
  // deliberately override a single build.
  //
  // NOTE: this only picks the branch. TinaCloud must also have INDEXED it —
  // open the branch once in the TinaCloud dashboard, or the build errors with
  // the branch unknown. See DESIGN.md §6 (Content / CMS).
  branch: process.env.TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.CF_PAGES_BRANCH || "main",
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
          // The navbar action button (Wild Owl's "BOOK", Seven Senses' "Sign In").
          // Only the alternate UI styles render a nav CTA; watercolor's navbar is
          // the untouched original. Leave the label blank to hide it everywhere.
          { type: "string", name: "navCtaLabel", label: "Nav Button Text" },
          {
            type: "string",
            name: "navCtaUrl",
            label: "Nav Button Link",
            description: "Shown in the navbar on the Editorial / Sanctuary / Immersive styles."
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
            templates: [contentSection, service, embed]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
