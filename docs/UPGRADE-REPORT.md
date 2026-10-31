# ShineOne Estate — website upgrade (Oct 2026)

Backup of the code before this work: branch `backup/pre-upgrade-2026-10-31`, plus `src/idea1.jsx`, `src/admin.jsx`
(unchanged, no longer routed) and `legacy/` (original `App.js`, `index.html`, `server.js`, `schema.js`).

## What stayed exactly as it was
- **Home page `/`** — the full 3D "scroll to build" experience (three.js scene, Lenis, audio, draw-a-circle entry,
  stories, gallery, before/after, Gurugram, FAQ, contact). It now lives in `src/HomeExperience.jsx`, a copy of
  `idea1.jsx` with only these changes: data/server code moved to `src/services/stashr.js` + `src/lib/site.js`,
  and the menu links to the new pages. It is lazy-loaded, so three.js only downloads on `/`.
- The 3D scene already pauses when hidden/off-screen, caps pixel ratio, respects reduced motion and disposes on unmount.
- All photos, videos and project status still come only from the **Stashr server** (`/public/shine/media`, `/public/shine/site`).
- The old ShineOne server (`server.js`, shineoneestate-new-server) is **not touched** — it is inactive.

## New pages (real URLs, prerendered)
| URL | Content |
|---|---|
| `/projects` | Filters (status / location), live progress, stats, process, photo strip, FAQ |
| `/projects/sector-4`, `-9`, `-42`, `-46`, `/projects/reliance-met-city` | Facts, stages, gallery + lightbox, videos, materials, related projects |
| `/about` | Story, numbers, philosophy, process, materials, before/after slider, founder |
| `/services` | Plots, builder floors, flats, construction — each with WhatsApp CTA |
| `/gallery` | All server media by project, lightbox (swipe, keys, Esc), before/after |
| `/locations` | Sector cards (existing neighbourhood notes), stats, FAQ |
| `/contact` | Call / WhatsApp / email; enquiry topics open WhatsApp with the message filled (no form) |
| `/admin` | Live dashboard of what the site receives from Stashr; edits link to Stashr's ShineOne Estate Manager |

Old hash links (`/#/admin`) redirect to the real path.

## SEO
- `scripts/prerender.js` (runs on `postbuild`) writes `build/<route>/index.html` for every page with its own title,
  description, canonical, Open Graph/Twitter tags, `WebPage` + `BreadcrumbList` JSON-LD (+ `Service`, `Place`), and
  crawlable text. The home page keeps its Organization / RealEstateAgent / FAQPage JSON-LD.
- `build/404.html` = the app with `noindex`, so paths not prerendered (e.g. a sector added later in Stashr) still open.
- `sitemap.xml` regenerated with all 12 URLs; `robots.txt` disallows `/admin`.
- Nothing invented: no prices, RERA numbers, reviews, ratings, distances or dates beyond what the site already had.

## Design
Warm palette (cream, terracotta, marigold, deep green), Newsreader serif + Inter, Caveat accents; shared tokens in
`src/styles/brand.css`. Mobile bottom bar (Call / WhatsApp), skip link, focus styles, reduced-motion support.

## Tests / checks run
- `npm run build` (CI=true, warnings as errors) — passes; prerender writes 12 pages + admin + 404 + sitemap.
- `npm test -- --watchAll=false` — 8 tests pass (routes ↔ prerender sync, data merge, filters, Cloudinary helpers, hash redirect).
- Playwright on the built site at 390px and 1440px: all pages render, no console errors, no failed requests,
  no horizontal overflow; home 3D canvas renders.
- Not measured: Lighthouse / Core Web Vitals on the live host (do this after deploy in PageSpeed Insights).

## Deploy notes
- Render static site: build command `npm run build` (runs the prerender automatically), publish dir `build`.
  No rewrite rule is needed. If Render does not serve `404.html` for unknown paths, add a rewrite `/* → /404.html`.
- Optional env: `REACT_APP_STASHR_MANAGER_URL` (default `https://stashr.ggnhome.com/media`) for the admin link.

## Not done / follow-ups
- Website content editing (hero text, project descriptions) still lives in `src/lib/content.json`; Stashr only edits
  status, area, progress, stage, ETA and visibility.
- Sector 42's ETA "June 2026" has passed — update it in Stashr.
- Credentials committed in this repo's history earlier (see SEO-AUDIT doc) should be rotated.
