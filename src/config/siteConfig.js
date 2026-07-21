// src/config/siteConfig.js

// 🟣 GLOBAL THEME (fallback only)
// The live theme comes from the CMS Settings doc; this is applied by main.jsx
// only if that value is missing/invalid. Accepts: "fall","winter","spring","summer".
export const SITE_THEME = 'spring'

// 🎭 GLOBAL UI STYLE (fallback only)
// The overall look & feel, independent of the season. Live value comes from the
// CMS Settings doc (`uiStyle`); this is applied by main.jsx only if that value
// is missing/invalid. Accepts: "watercolor","serene","botanical".
export const SITE_UI_STYLE = 'watercolor'

// Note: service + add-on availability (e.g. Thai Herbal Compress) is now
// owner-editable via each Service card's Status in /admin — no code flag.
