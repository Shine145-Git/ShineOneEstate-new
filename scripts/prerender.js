#!/usr/bin/env node
/*
 * Runs after `react-scripts build` (npm "postbuild").
 * Writes one real HTML file per public URL (build/projects/sector-4/index.html, …) so that:
 *   - every page has its own title, description, canonical URL, social tags and JSON-LD in the raw HTML;
 *   - crawlers and no-JS visitors get readable content (React replaces it on mount);
 *   - refreshing or opening a deep link works on the static host without any rewrite rule.
 * Also writes build/404.html (the full app, noindex) so paths that aren't prerendered — e.g. a project
 * added later in Stashr — still boot the app, and regenerates build/sitemap.xml.
 */
const fs = require("fs");
const path = require("path");
const { ROUTES, content } = require("./routes.cjs");

const BUILD = path.join(__dirname, "..", "build");
const SITE = content.siteUrl;
const C = content.contact;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const replaceTag = (html, re, replacement, label) => {
  if (!re.test(html)) throw new Error(`prerender: could not find ${label} in build/index.html`);
  return html.replace(re, replacement);
};

const crumbsFor = (route) => {
  if (route.path === "/") return [];
  const items = [["/", "Home"]];
  if (route.project) items.push(["/projects", "Projects"]);
  items.push([route.path, route.h1.replace(/, Gurugram$/, "")]);
  return items;
};

const jsonLd = (route) => {
  const url = SITE + (route.path === "/" ? "/" : route.path);
  const crumbs = crumbsFor(route);
  const graph = [
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: route.title, description: route.description, isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#business` }, inLanguage: "en-IN" },
    { "@type": "BreadcrumbList", itemListElement: crumbs.map(([p, name], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE + (p === "/" ? "/" : p) })) },
  ];
  if (route.project) {
    const p = content.projects.find((x) => x.slug === route.project);
    graph.push({ "@type": "Place", name: `${p.name}, Gurugram`, address: { "@type": "PostalAddress", addressLocality: "Gurugram", addressRegion: "Haryana", addressCountry: "IN" } });
  }
  if (route.path === "/services") {
    graph.push(...["Residential plots in Gurugram", "Independent builder floors in Gurugram", "Flats & apartments in Gurugram", "Residential & turnkey construction in Gurugram"].map((name) => ({ "@type": "Service", name, provider: { "@id": `${SITE}/#business` }, areaServed: { "@type": "City", name: "Gurugram" } })));
  }
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>`;
};

const projectList = () => `<ul>${content.projects.map((p) => `<li><a href="/projects/${p.slug}">${esc(p.name)}</a> — ${esc(p.status.toLowerCase())}${p.area ? `, ${esc(p.area)}` : ""}</li>`).join("")}</ul>`;
const contactLine = `<p>${esc(C.person)} — <a href="tel:${C.phone}">${esc(C.phoneDisplay)}</a> · <a href="https://wa.me/${C.whatsapp}">WhatsApp</a> · <a href="mailto:${C.email}">${esc(C.email)}</a> · Gurugram, Haryana, India.</p>`;
const nav = `<nav aria-label="Main"><a href="/">Home</a> · <a href="/about">About</a> · <a href="/projects">Projects</a> · <a href="/services">Services</a> · <a href="/gallery">Gallery</a> · <a href="/locations">Locations</a> · <a href="/contact">Contact</a></nav>`;

const bodyFor = (route) => {
  const crumbs = crumbsFor(route);
  const bc = crumbs.length ? `<p>${crumbs.map(([p, n], i) => (i === crumbs.length - 1 ? esc(n) : `<a href="${p}">${esc(n)}</a>`)).join(" / ")}</p>` : "";
  let main = "";
  if (route.project) {
    const p = content.projects.find((x) => x.slug === route.project);
    main = `<p>${esc(p.description)}</p><ul><li>Location: ${esc(p.location)}</li><li>Status: ${esc(p.status)}</li>${p.area ? `<li>Area: ${esc(p.area)}</li>` : ""}${p.status !== "Completed" && p.eta ? `<li>Estimated completion: ${esc(p.eta)}</li>` : ""}</ul>${p.highlights.length ? `<h2>Highlights</h2><ul>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}<h2>Other projects</h2>${projectList()}`;
  } else if (route.path === "/projects" || route.path === "/gallery") {
    main = `<p>${esc(route.description)}</p>${projectList()}`;
  } else if (route.path === "/locations") {
    main = content.projects.map((p) => `<h2>${esc(p.location)}</h2><p>${esc(p.description)}</p>${p.highlights.length ? `<ul>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}<p><a href="/projects/${p.slug}">Our ${esc(p.name)} project</a></p>`).join("");
  } else if (route.path === "/services") {
    main = `<p>${esc(route.description)}</p><ul><li>Residential plots in Gurugram</li><li>Independent builder floors in Gurugram</li><li>Flats &amp; apartments in Gurugram</li><li>Residential &amp; turnkey house construction in Gurugram</li></ul>`;
  } else {
    main = `<p>${esc(route.description)}</p>`;
  }
  return `<main id="seo-fallback" style="max-width:860px;margin:0 auto;padding:48px 20px;color:#171917;font-family:Inter,Arial,sans-serif;line-height:1.7">${nav}${bc}<h1>${esc(route.h1)}</h1>${main}<h2>Contact ShineOne Estate</h2>${contactLine}</main>`;
};

const render = (base, route) => {
  const url = SITE + (route.path === "/" ? "/" : route.path);
  let html = base;
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`, "<title>");
  html = replaceTag(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(route.description)}"/>`, "meta description");
  html = replaceTag(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}"/>`, "canonical");
  html = replaceTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}"/>`, "og:url");
  html = replaceTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(route.title)}"/>`, "og:title");
  html = replaceTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(route.description)}"/>`, "og:description");
  html = replaceTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(route.title)}"/>`, "twitter:title");
  html = replaceTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(route.description)}"/>`, "twitter:description");
  if (route.path === "/") return html; // home keeps the hand-written fallback + full Organization/FAQ JSON-LD
  // Inner pages: page-specific JSON-LD (the FAQPage only describes the home page's visible FAQ).
  html = replaceTag(html, /<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonLd(route), "JSON-LD");
  html = replaceTag(html, /<main id="seo-fallback"[\s\S]*?<\/main>/, bodyFor(route), "#seo-fallback");
  html = html.replace(/<body style="background:#0C0F1A">/i, '<body style="background:#F7F5F0">');
  return html;
};

const write = (rel, html) => {
  const file = path.join(BUILD, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};

function main() {
  const base = fs.readFileSync(path.join(BUILD, "index.html"), "utf8");
  for (const route of ROUTES) {
    const html = render(base, route);
    write(route.path === "/" ? "index.html" : path.join(route.path, "index.html"), html);
  }
  const noindex = (html, title) => html
    .replace(/<meta name="robots" content="[^"]*"\s*\/?>/, '<meta name="robots" content="noindex, nofollow"/>')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<main id="seo-fallback"[\s\S]*?<\/main>/, "");
  write(path.join("admin", "index.html"), noindex(base, "Admin | ShineOne Estate"));
  write("404.html", noindex(base, "Page not found | ShineOne Estate"));

  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${ROUTES.map((r) => `  <url><loc>${SITE}${r.path === "/" ? "/" : r.path}</loc><lastmod>${today}</lastmod><priority>${r.path === "/" ? "1.0" : r.project ? "0.8" : "0.7"}</priority></url>`).join("\n")}\n</urlset>\n`;
  write("sitemap.xml", sitemap);
  console.log(`prerender: wrote ${ROUTES.length} pages, admin, 404.html and sitemap.xml`);
}

if (require.main === module) main();
module.exports = { render, bodyFor, jsonLd, crumbsFor };
