// One source of truth for company details and project metadata shared by the home experience,
// the content pages, the prerender script and the tests. Nothing here is invented: every value
// was already on the site (public/index.html, idea1.jsx) before this file existed. Data lives in content.json.

import content from "./content.json";

export const SITE_URL = content.siteUrl;
export const SITE_NAME = content.siteName;
export const CONTACT = content.contact;
export const WA_URL = `https://wa.me/${CONTACT.whatsapp}`;
export const waLink = (text) => `${WA_URL}?text=${encodeURIComponent(text)}`;

// Projects as they existed on the site. `key` is the Cloudinary / Stashr folder, `slug` the public URL.
// Status, area, progress and ETA are only defaults: the live values come from the Stashr server.
export const PROJECTS = content.projects;

export const projectBySlug = (slug) => PROJECTS.find((p) => p.slug === slug) || null;
export const projectByKey = (key) => PROJECTS.find((p) => p.key === String(key || "").toLowerCase().trim()) || null;

/** "Sector 12" / "sec 12" -> "sector-12". Used for projects added later in Stashr. */
export const slugify = (s) => String(s || "").toLowerCase().replace(/\bsec\b/g, "sector").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const SERVICES = [
  { id: "plots", title: "Residential plots", text: "Plots in established and emerging Gurugram sectors, with a team that can also build on them for you." },
  { id: "floors", title: "Independent builder floors", text: "Builder floors designed and constructed by our own team, with daily progress you can follow." },
  { id: "flats", title: "Flats & apartments", text: "Flats across Gurugram's sought-after sectors, with help on site visits and paperwork." },
  { id: "construction", title: "Residential & turnkey construction", text: "Full house construction from foundation to handover, with milestone-linked payments." },
];

// Existing FAQ copy (idea1.jsx / index.html), kept word for word where it is reused.
export const MATERIALS = [
  "UltraTech Cement (ISO 9001:2015)",
  "Tata Tiscon Steel (BIS Certified)",
  "Kajaria Premium Tiles",
  "Polycab wiring (ISI Mark)",
  "Astral pipes",
  "Dr. Fixit waterproofing",
];

export const STAGES = ["Foundation", "Structure", "Finishing", "Interior Works", "Final Inspection", "Handover"];

export const isVideo = (src) => /\.(mp4|webm|ogg|mov)$/i.test(String(src)) || /\/video\/upload\//.test(String(src));

/** Responsive Cloudinary URL: inserts f_auto,q_auto,w_<w> into an /upload/ URL; other URLs pass through. */
export const cld = (url, w) => {
  const s = String(url || "");
  if (!s.includes("res.cloudinary.com") || !s.includes("/upload/") || isVideo(s)) return s;
  return s.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${w}/`);
};
export const cldSrcSet = (url, widths = [480, 800, 1200, 1800]) => widths.map((w) => `${cld(url, w)} ${w}w`).join(", ");
/** Poster frame for a Cloudinary video URL. */
export const videoPoster = (url) => String(url).replace("/upload/", "/upload/so_0,f_auto,q_auto,w_800/").replace(/\.(mp4|webm|mov|ogg)$/i, ".jpg");

// FAQ copy as published in public/index.html (prices and dated handovers left out on purpose).
export const FAQS = [
  ["What types of properties are available?", "We offer Plots, Flats, Independent Floors, and full Construction services across Gurugram's sectors 4, 9, 42, and 46."],
  ["What materials and brands are used in construction?", "We use premium certified materials — UltraTech Cement (ISO 9001:2015), Tata Tiscon Steel (BIS Certified), Kajaria Premium Tiles, Polycab wiring (ISI Mark), Astral pipes, and Dr. Fixit waterproofing. All materials come with quality certificates."],
  ["How can I track construction progress?", "You get daily construction logs with photos, weekly stories per sector, and real-time progress percentage updates on our website."],
  ["Can I book a site visit?", "Yes. WhatsApp us at +91 93109 94032 or call directly. We arrange guided site visits on working days with our site manager."],
  ["What is the payment structure?", "Payment is milestone-linked — tied to actual construction stages (Foundation, Structure, Finishing, etc.), so you pay as real work gets completed."],
  ["Are the completed projects available for reference visits?", "Yes. Our completed projects in Sector 4, 9, and 46 can be visited to see the quality of finish, materials, and workmanship firsthand."],
];

// What each construction stage covers (general construction terms, not project-specific claims).
export const STAGE_NOTES = {
  Foundation: "Excavation, footings and plinth — the base everything stands on.",
  Structure: "Columns, beams, slabs and brickwork go up floor by floor.",
  Finishing: "Plaster, flooring, tiling, doors and windows.",
  "Interior Works": "Electrical, plumbing fixtures, kitchen, paint and fittings.",
  "Final Inspection": "Every room checked against the plan before handover.",
  Handover: "Keys, documents and a walkthrough of your finished home.",
};

/** Total built-up area across projects, from their "5700 Sq. Feet" style areas. */
export const totalArea = (projects) => projects.reduce((n, p) => n + (Number(String(p.area || "").replace(/[^\d.]/g, "")) || 0), 0);
