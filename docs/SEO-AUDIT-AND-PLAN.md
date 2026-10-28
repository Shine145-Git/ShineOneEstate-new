# ShineOneEstate — SEO Audit & Ranking Plan (Real Estate + Construction, Gurugram)

Generated with the [claude-seo](https://github.com/AgriciDaniel/claude-seo) toolkit (`seo-audit`, `parse_html.py`) on 2026-10-28.
Target site: https://www.shineoneestate.co.in/

> No one can honestly guarantee a #1 rank. What this change does is remove the technical blockers and set
> up the on-page + structured-data foundation. Ranking #1 for "construction company in Gurugram" /
> "builder floors in Gurugram" also needs the off-page work in "Next steps" below.

## Baseline (live site, before this change)

| Check | Result |
|---|---|
| Raw HTML content | Empty React shell — **0 `<h1>`/`<h2>`, 18 words** (content only appears after JS) |
| `/sitemap.xml` | **404** |
| `robots.txt` | No sitemap reference |
| `og:image` / `twitter:image` | **Missing** (no rich WhatsApp / social previews) |
| Title | Real-estate only; no "construction" keyword |
| Schema | Organization + WebSite + RealEstateAgent; `SearchAction` pointed at a search that doesn't exist; no FAQ / services / areaServed |
| Image alt text | 4 gallery/story images with `alt=""` |
| `manifest.json` | Still "Create React App Sample" |
| Secrets | `.env` (Cloudinary + Mongo creds) was committed; `API_SECRET` printed to logs |

## After this change (same parser, local `public/index.html`)

| Check | Result |
|---|---|
| Raw HTML content | **343 words**, 1 `<h1>`, 4 `<h2>`, 7 `<h3>` (crawlable fallback replaced by React on mount) |
| Title | "Real Estate & Construction Company in Gurugram \| Plots, Flats, Builder Floors — ShineOneEstate" |
| Sitemap / robots | `sitemap.xml` added, referenced from `robots.txt` |
| Social | `og:image` (1200×630), `twitter:image`, `en_IN` locale, `max-image-preview:large` |
| Schema | Organization, WebSite, `RealEstateAgent`+`GeneralContractor`, WebPage, **FAQPage** (7 Q&As that match the on-page FAQ), service catalog, areaServed (Sectors 4/9/42/46, Reliance MET City, Dwarka Expressway, Sohna Road) |
| Local | `geo.*` meta, Gurugram PostalAddress |
| Images | Descriptive alt text on story/gallery/lightbox images |
| PWA | Real name/description/theme colour in `manifest.json` |

## Next steps that actually move rankings (need the owner)

1. **Google Business Profile** — create/verify (category: *Real estate developer* + *Construction company*), add address, hours, photos, weekly posts. This drives the map pack for "builder in Gurugram". Then add the exact address + `geo` + `sameAs` (GBP, Facebook, Instagram, YouTube, 99acres/MagicBricks) to the JSON-LD.
2. **Google Search Console + Bing Webmaster** — verify domain, submit `https://www.shineoneestate.co.in/sitemap.xml`, request indexing.
3. **Real URLs per project/sector** — the site is a single page behind a `HashRouter` (`/#/…`), and Google ignores `#` fragments, so it can only ever rank for one URL. Highest-impact change: move to path routes + prerendering (or Next.js/Astro) with one page per target keyword:
   `/plots-in-gurugram`, `/builder-floors-in-gurugram`, `/construction-company-in-gurugram`, `/sector-42-gurugram`, `/sector-46-gurugram`, `/reliance-met-city`, `/projects`, `/contact`, plus a blog/guide section (cost of construction per sq ft in Gurugram, plot buying checklist, Dwarka Expressway outlook…).
4. **Reviews + trust (E-E-A-T)** — collect Google reviews, add RERA number (currently commented out in the FAQ), named team, completed-project case studies, testimonials; then add `aggregateRating`/`Review` schema **only from real reviews**.
5. **Backlinks & citations** — consistent NAP on 99acres, MagicBricks, Housing.com, Justdial, Sulekha, IndiaMART, local news/press.
6. **Performance** — homepage ships three.js + audio + large Cloudinary images. Lazy-load the 3D scene, serve images with `f_auto,q_auto,w_…`, check Core Web Vitals in PageSpeed/CrUX after deploy.
7. **Stale copy** — FAQ/projects still say Sector 42 handover "June 2026" (date has passed). Update; outdated dates hurt trust and conversions.
8. **Security (urgent)** — `.env` credentials were in git history. **Rotate** the Cloudinary API secret and MongoDB password; this commit untracks `.env` but history keeps old values.
