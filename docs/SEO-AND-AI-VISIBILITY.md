# SEO, AI search and Google Business: Spirit Seeds Wellness

Goal: when someone near Lafayette searches for massage, Thai Yoga, sound healing or trauma-informed
yoga, in Google, Google Maps or an AI assistant, Spirit Seeds Wellness is the answer.

Verified means read from this repo, the console, the live site, or the Google Business Profile as
it appeared 2026-11-02. Everything else is marked **unverified**.

## The business as Google states it (the one spelling to use everywhere)

| Field | Value |
|---|---|
| Name | Spirit Seeds Wellness |
| Category | Massage therapist |
| Address | 1280 Centaur Village Dr #7, Lafayette, CO 80026 |
| Phone | (303) 250-0494 |
| Booking | spiritseedswellnessmelissacarey.offeringtree.com |
| Reviews | 21, 5.0 |

Local ranking leans on **name, address and phone matching exactly** across Google, the website,
Facebook, Yelp, Apple Maps and directories. Today the name is spelled three ways: "Spirit Seeds
Wellness" (Google, the site's text), "SpiritSeeds Wellness" (the console's site name, which every
page title ends with) and "Live Spirit Seeds" (older material). Use **Spirit Seeds Wellness**.

## Website: done (in this repo)

- Home title "Spirit Seeds Wellness | Massage Therapy in Lafayette, CO" and a description naming the
  services and the town.
- `HealthAndBeautyBusiness` structured data with the name, address, phone, founder and a booking
  action, matching the Google profile (`index.html`).
- Already in place through the console: pages pre-rendered for crawlers, a sitemap of every
  published page, per-page titles, and the AI-training opt-out (see `DESIGN.md` §7).

**Unverified:** hours are not in the structured data; the profile showed only "Closes 7 PM".

## Website: next steps

1. **Rename the site to "Spirit Seeds Wellness" on the console's Manage page.** That name is the
   suffix on every page title and the `og:site_name` on shared links.
2. **Fill in "Search and sharing" on each page in the console**, each description naming the
   service and "Lafayette, CO" (for example Services: "Integrative, Thai Yoga and Abhyanga massage
   in Lafayette, CO. 75, 90 and 120 minute sessions."). Without one, the description is the first
   words under the page heading.
3. **Say where she is, in words, on the site.** A short "Find us" block on Home or About: the
   address, the nearby towns served (Louisville, Erie, Superior, Boulder; **unverified** which she
   wants named), parking, and a link to the Google Maps listing.
4. **An FAQ section in plain text**, short answer first: "What is Thai Yoga massage?", "What should
   I wear?", "Is this trauma-informed?", "How do I book?". This is the format Google and AI
   assistants quote.
5. **Register with Google Search Console and Bing Webmaster Tools** and submit
   `https://spiritseedswellness.com/sitemap.xml`. Bing's index feeds ChatGPT search and Copilot.

## Google Business Profile: steps for Melissa

Done from the "Your business on Google" panel that appears when she searches her business name
while signed in.

1. **Book button.** Panel → **Bookings** (or Edit profile → Business information → Contact →
   Appointment links) → paste `https://spiritseedswellnessmelissacarey.offeringtree.com/` → Save.
   Google then shows **Book online** on the card. Today the booking site appears only as "Products
   and Services".
2. **Profile strength.** Click **Complete info** and fill everything it lists.
3. **Hours**, including special hours for holidays. After-hours searches then see "Closed".
4. **Categories.** Keep "Massage therapist" primary; add the secondary categories that fit, such as
   "Yoga instructor" and "Reiki therapist". **Unverified:** which secondary categories Google offers
   for sound healing.
5. **Services** (Edit services): one per offering, with the description and price from the website.
6. **Description** (750 characters): what she does, for whom, and "Lafayette, Colorado", in her words.
7. **Photos**: the room, the entrance and sign (the exterior shot is a strip mall; a door photo helps
   first visits), Melissa, and a session in progress. Add a few each month.
8. **Posts** (Panel → Posts): one a month or more, for classes, workshops and openings.
9. **Reviews**: Panel → **Ask for reviews** gives a link and QR code; send it after each session.
   Reply to every review.

## Other listings (citations)

Same name, address, phone and website on each:

- **Apple Business Connect** (Apple Maps and Siri).
- **Bing Places** (Bing, Copilot, and the maps data ChatGPT uses; **unverified** how ChatGPT sources
  local results).
- **Yelp**, **Facebook** page.
- Massage directories she qualifies for (ABMP or AMTA "find a therapist").
- **Soul Tree Colorado** already lists "Spirit Seeds Wellness with Melissa Carey"; ask that it link
  to spiritseedswellness.com.

## AI search

AI assistants answer "best massage near Lafayette" from map listings, reviews and pages that state
plainly what a business does and where. Everything above feeds that: consistent listings, more
reviews that name the service ("my Thai Yoga massage with Melissa"), and site text that answers
questions directly. Search crawlers are allowed; only AI **training** crawlers are blocked.

## The phone: listed without being on call

- **List a Google Voice number** (free) on the profile and site instead of her own cell; it rings
  through to her phone. Do Not Disturb sends calls to voicemail, and call screening asks callers to
  say who they are. Her phone's scheduled Do Not Disturb or Focus can silence the Voice app after
  hours. **Unverified:** whether personal Google Voice can schedule Do Not Disturb on its own.
- **Knowing where a text came from:** everything to the Voice number came from a public listing.
  Telling website from Google apart needs a number per source (call tracking, such as CallRail).
  Google's guidance is to make the tracking number the profile's **primary** number and keep the
  main one as an **additional** number, so listings stay consistent.
- **Changing the number** means changing it everywhere at once (profile, site structured data,
  Facebook, Yelp, directories), or the mismatch costs ranking.
