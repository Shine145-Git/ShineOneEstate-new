import React, { useState, useEffect, useRef } from "react";
import { Phone, MessageCircle, MapPin, X, ChevronLeft, ChevronRight, ArrowUpRight, Plus, Check, Clock } from "lucide-react";
import audio from "./experience/audioEngine";
import SiteScene from "./experience/SiteScene";

/* ─────────────────────────── UTILITIES ─────────────────────────── */
const useWindowWidth = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    window.addEventListener("orientationchange", fn);
    return () => { window.removeEventListener("resize", fn); window.removeEventListener("orientationchange", fn); };
  }, []);
  return w;
};
const useIsMobile = () => useWindowWidth() <= 768;
const useIsCompact = () => useWindowWidth() < 1024;

const useFinePointer = () => {
  const q = "(hover: hover) and (pointer: fine)";
  const [v, setV] = useState(typeof window !== "undefined" && window.matchMedia?.(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setV(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return v;
};

const useReducedMotion = () => {
  const [r, setR] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setR(mq.matches); on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return r;
};

const useLockBodyScroll = (locked) => {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
};

// Horizontal swipe + optional swipe-down for touch surfaces.
const useSwipe = ({ onLeft, onRight, onDown, threshold = 45 } = {}) => {
  const start = useRef(null);
  const onTouchStart = (e) => { const t = e.touches[0]; start.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e) => {
    if (!start.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.2) { if (dx < 0) onLeft?.(); else onRight?.(); }
    else if (onDown && dy > threshold * 2 && Math.abs(dy) > Math.abs(dx) * 1.2) onDown();
  };
  return { onTouchStart, onTouchEnd };
};

const vibrate = (ms = 8) => { try { navigator.vibrate?.(ms); } catch (e) {} };

const useReveal = (threshold = 0.15) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
};

// Mouse drag-to-scroll for horizontal strips (touch already scrolls natively)
const useDragScroll = () => {
  const ref = useRef(null);
  const moved = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let down = false, sx = 0, sl = 0;
    const onDown = (e) => { if (e.pointerType !== "mouse" || e.button !== 0) return; down = true; moved.current = false; sx = e.clientX; sl = el.scrollLeft; };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 5 && !moved.current) { moved.current = true; el.classList.add("is-dragging"); }
      if (moved.current) el.scrollLeft = sl - dx;
    };
    const onUp = () => { if (!down) return; down = false; el.classList.remove("is-dragging"); };
    const onClick = (e) => { if (moved.current) { e.preventDefault(); e.stopPropagation(); moved.current = false; } };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);
  return ref;
};

/* ─────────────────────────── DATA ─────────────────────────── */
const PHONE = "+919310994032";
const WA_URL = "https://wa.me/919310994032";
const EMAIL = "parveen@shineoneestate.co.in";

const FOLDER_LABELS = {
  "sec 4": "Sector 4",
  "sec 9": "Sector 9",
  "sec 46": "Sector 46",
  "sec 42": "Sector 42",
  "reliance met city": "Reliance MET City",
};
const folderLabel = (f) => FOLDER_LABELS[String(f || "").toLowerCase().trim()] || f;
const isVideo = (src) => /\.(mp4|webm|ogg|mov)$/i.test(String(src));

const projectData = {
  name: "ShineOne Estate",
  tagline: "Plots · Flats · Floors · Construction — We Build Your Vision",
  location: "Gurugram — Sector 4 · Sector 9 · Sector 46 · Sector 42",
  images: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
  ],
  projects: [
    { name: "Sector 4", status: "Completed", area: "5700 Sq. Feet" },
    { name: "Sector 9", status: "Completed", area: "4200 Sq. Feet" },
    { name: "Sector 46", status: "Completed", area: "4500 Sq. Feet" },
    { name: "Sector 42", status: "Ongoing", area: "3200 Sq. Feet", progress: 78, eta: "June 2026" },
    { name: "Reliance MET City", status: "Ongoing", area: "1620 Sq. Feet", progress: 8, stage: "Foundation", eta: "June 2027" },
  ],
  neighbourhood: {
    nearby: [
      { name: "Sector 4, Gurugram", type: "Family-friendly residential sector", description: "Calm, well-established neighbourhood with top schools, local markets and easy access to inner-Gurugram.", highlights: ["Top schools within 5–10 mins", "Local groceries & weekly markets", "Peaceful residential streets"] },
      { name: "Sector 9, Gurugram", type: "Transit-oriented sector", description: "Rapidly improving connectivity with planned metro links and good road access — ideal for commuters.", highlights: ["Planned metro connectivity", "Quick road links to business hubs", "Growing service infrastructure"] },
      { name: "Sector 46, Gurugram", type: "Community-focused sector", description: "An established locale with busy community markets, healthcare centres and family amenities nearby.", highlights: ["Active community markets", "Nearby clinics & pharmacies", "Strong rental demand"] },
      { name: "Sector 42, Gurugram", type: "Emerging residential & investment zone", description: "Located near the Dwarka Expressway corridor with new launches and strong appreciation potential.", highlights: ["Close to Dwarka Expressway", "New residential launches", "High appreciation potential"] },
    ],
  },
  folderImages: {},
  stories: [],
};

// Cloudinary-hosted images (uploaded to the ShineOne/<folder> folders)
const CLOUDINARY_FOLDER_IMAGES = {
  "sec 4": [
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774204104/ShineOne/sec%204/x3bmlplxrvgqfmzeyb1t.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774204104/ShineOne/sec%204/kv0phkvvwe90qtd7m8nd.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774204104/ShineOne/sec%204/nwzrm8aft02hug8ffgwx.jpg",
  ],
  "sec 9": [
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774204113/ShineOne/sec%209/iawrapcbhsjbloakmgqc.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774203251/ShineOne/sec%209/hlc3warkzcfqnpaejojl.jpg",
  ],
  "sec 46": [
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774204131/ShineOne/sec%2046/gp5eotfutmg6ugmntxvo.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774203262/ShineOne/sec%2046/g7hkr5nbn44t0nphxqra.jpg",
  ],
  "sec 42": [
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1790271088/WhatsApp_Image_2026-09-05_at_22.53.10.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774204068/ShineOne/sec%2042/rfgis7xkmsuf8ai62jfq.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774204068/ShineOne/sec%2042/drj9tr1kd2d6bu5q7tpg.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774204068/ShineOne/sec%2042/debtpchbfask0rwxkqmn.jpg",
  ],
  "reliance met city": [
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1790271100/WhatsApp_Image_2026-08-20_at_18.08.54.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1790271098/WhatsApp_Image_2026-09-18_at_11.32.44.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1790271098/WhatsApp_Image_2026-09-22_at_11.59.05.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774204121/ShineOne/reliance%20met%20city/rkncgrn81zaljla6mdv7.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774204121/ShineOne/reliance%20met%20city/my4n3qhd4saf8fl9otsx.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774203272/ShineOne/reliance%20met%20city/xhwtd3enspryinl8ejkk.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774203272/ShineOne/reliance%20met%20city/zlo6m7kzyna2yzgl6oop.jpg",
    "https://res.cloudinary.com/dz4k2icvs/image/upload/v1774118189/ShineOne/reliance%20met%20city/v5zuhij4z0uor7a2synf.jpg",
  ],
};

// Photos and videos come from the We Three server, which lists the ShineOne/<folder> folders in
// Cloudinary. Upload or delete them from the mobile app's Media tab and they show here within a
// minute or two. If the server can't be reached the last-known list above is shown instead.
const MEDIA_API_URL = "https://we-three-api.onrender.com/api/public/shine/media";

// Fetched once and shared by every chapter that shows photos.
let mediaRequest = null;
const loadMedia = () => {
  if (!mediaRequest) {
    mediaRequest = fetch(MEDIA_API_URL)
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(({ folders }) => {
        const names = Object.keys(folders || {});
        // Every folder empty means the server isn't reading the right account: keep the fallback.
        if (!names.some((f) => folders[f].length > 0)) throw new Error("empty");
        const merged = { ...CLOUDINARY_FOLDER_IMAGES };
        names.forEach((folder) => { merged[folder] = folders[folder]; });
        return merged;
      })
      .catch(() => null);
  }
  return mediaRequest;
};

const useBackendMedia = () => {
  const [folderImages, setFolderImages] = useState(CLOUDINARY_FOLDER_IMAGES);
  useEffect(() => {
    let cancelled = false;
    loadMedia().then((m) => { if (m && !cancelled) setFolderImages(m); });
    return () => { cancelled = true; };
  }, []);
  return folderImages;
};

/* ─────────────────────────── CHAPTERS & SCROLL STORE ─────────────────────────── */
const CHAPTERS = [
  { id: "ground", label: "Ground", mood: 0, bg: "dawn", scene: "intro", night: 0.1 },
  { id: "overview", label: "Projects", mood: 2, bg: "dusk", scene: "overview", night: 0.65 },
  { id: "progress", label: "Progress", mood: 1, bg: "blueprint", scene: "progress", night: 0.3 },
  { id: "stories", label: "Live", mood: 1, bg: "night" },
  { id: "gallery", label: "Gallery", mood: 2, bg: "night" },
  { id: "transform", label: "Before/After", mood: 2, bg: "ember" },
  { id: "locations", label: "Gurugram", mood: 3, bg: "night" },
  { id: "why", label: "Why", mood: 3, bg: "ember" },
  { id: "faq", label: "FAQ", mood: 3, bg: "night" },
  { id: "contact", label: "Contact", mood: 0, bg: "close" },
];
const SCENE_CHAPTERS = 3; // the first three chapters sit on the live 3D site

const STAGES = ["Foundation", "Structure", "Finishing", "Interior Works", "Final Inspection", "Handover"];
// Where each stage sits on the 3D build timeline (see SiteScene)
const STAGE_RANGES = [[0, 0.08], [0.08, 0.53], [0.53, 0.72], [0.72, 0.84], [0.84, 0.92], [0.92, 1.0001]];
const stageIndexFromP = (p) => Math.max(0, STAGE_RANGES.findIndex(([a, b]) => p >= a && p < b));

const projectStages = (project) => STAGES.map((s, idx) => {
  const status = project.status.toLowerCase();
  if (status.includes("completed")) return "completed";
  if (status.includes("ongoing")) {
    if (project.stage) {
      const ci = STAGES.findIndex((st) => st.toLowerCase() === String(project.stage).toLowerCase());
      if (ci === -1) return "pending";
      if (idx < ci) return "completed";
      if (idx === ci) return "ongoing";
      return "pending";
    }
    const fi = STAGES.indexOf("Finishing");
    if (idx < fi) return "completed";
    if (idx === fi) return "ongoing";
    return "pending";
  }
  return "pending";
});
// 3D build position for a project: complete if delivered, otherwise well into its current stage
const projectSceneP = (project) => {
  const st = projectStages(project);
  if (st.every((x) => x === "completed")) return 1;
  const cur = st.indexOf("ongoing");
  if (cur === -1) return 0;
  const [a, b] = STAGE_RANGES[cur];
  return a + (Math.min(b, 1) - a) * 0.75;
};
const projectPercent = (p) => (p.progress !== undefined ? p.progress : p.status.toLowerCase().includes("completed") ? 100 : 0);

const store = {
  pos: 0, active: 0, ground: 0, subs: new Set(),
  set(v) { Object.assign(this, v); this.subs.forEach((f) => f(this)); },
};
const useStore = (selector) => {
  const sel = useRef(selector); sel.current = selector;
  const [v, setV] = useState(() => selector(store));
  useEffect(() => {
    const f = (s) => setV(sel.current(s));
    store.subs.add(f);
    f(store);
    return () => store.subs.delete(f);
  }, []);
  return v;
};
const goToChapter = (i) => document.getElementById(`ch-${CHAPTERS[i].id}`)?.scrollIntoView({ behavior: "smooth" });

/* ─────────────────────────── STYLES ─────────────────────────── */
const Styles = () => (
  <style>{`
  :root {
    --ink: #090c12; --fg: #fff; --fg2: rgba(255,255,255,.74); --fg3: rgba(255,255,255,.52); --line: rgba(255,255,255,.12);
    --gold: #dcbd6c; --sand: #ecd9b4; --wa: #25D366;
    --serif: 'Newsreader', Georgia, serif; --mono: 'Google Sans Code', ui-monospace, 'SFMono-Regular', Menlo, monospace;
    --sans: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif; --hand: 'Caveat', cursive;
    --ease: cubic-bezier(.22,1,.36,1);
    --gutter: clamp(16px, 4vw, 40px);
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; scroll-behavior: smooth; }
  body { background: var(--ink); color: var(--fg); font-family: var(--sans); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  img, video { max-width: 100%; display: block; }
  button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }
  a { color: inherit; }
  button, a { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
  :focus { outline: none; }
  :focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; border-radius: 12px; }
  ::selection { background: rgba(220,189,108,.4); }

  .xp { position: relative; min-height: 100vh; overflow-x: clip; }
  .wrap { width: min(1240px, 100% - var(--gutter) * 2); margin-inline: auto; }

  /* ── Backdrops (cross-faded per chapter) ── */
  .bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: var(--ink); }
  .bg > div { position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s ease; }
  .bg > div.on { opacity: 1; }
  .bg-dawn { background: radial-gradient(ellipse 130vw 120vh at 50% 128%, #f4e3c3 10%, #e2bf8f 22%, #b98763 34%, #7a6070 48%, #3a3c58 64%, #151b2b 82%, #0b0f18 100%); }
  .bg-dusk { background: radial-gradient(ellipse 120vw 110vh at 78% 120%, #e9b97a 6%, #b0705a 20%, #5b4766 38%, #262b45 58%, #0e1220 80%, #090c12 100%); }
  .bg-blueprint { background: radial-gradient(ellipse 120vw 120vh at 22% 125%, #b9d0f0 6%, #6e93c9 20%, #33558f 38%, #1a2d55 58%, #0c1428 80%, #080c16 100%); }
  .bg-night { background: radial-gradient(ellipse 90vw 70vh at 50% -10%, rgba(43,91,168,.28), transparent 70%), radial-gradient(ellipse 80vw 60vh at 100% 110%, rgba(220,189,108,.12), transparent 70%), #090c12; }
  .bg-close { background: radial-gradient(ellipse 120vw 75vh at 50% 135%, #d9b183 0%, #9a6a55 22%, #4a3c55 45%, #1c2134 68%, #0b0f18 90%); }
  .bg-ember { background: radial-gradient(ellipse 110vw 90vh at 50% 120%, rgba(214,148,92,.42), rgba(120,70,60,.18) 45%, transparent 75%), radial-gradient(ellipse 70vw 50vh at 0% 0%, rgba(43,91,168,.18), transparent 70%), #0b0c12; }
  .grain { position: fixed; inset: -50%; z-index: 1; pointer-events: none; opacity: .06; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }

  .scene-host { position: fixed; inset: 0; z-index: 1; transition: opacity 1s ease, filter 1s ease; }
  .scene-host.off { opacity: 0; filter: blur(8px); }
  .scene-fallback { position: absolute; inset: 0; background-size: cover; background-position: center; filter: brightness(.45) saturate(.9); }

  main { position: relative; z-index: 2; }

  /* ── Type ── */
  .mono { font-family: var(--mono); text-transform: uppercase; letter-spacing: .08em; }
  .serif { font-family: var(--serif); }
  .eyebrow { font-family: var(--mono); font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--fg2); display: inline-flex; align-items: center; gap: 12px; }
  .eyebrow b { color: var(--fg); font-weight: 700; }
  .eyebrow i { display: block; width: 28px; height: 1px; background: currentColor; opacity: .6; }
  .display { font-family: var(--serif); font-weight: 400; letter-spacing: -.02em; line-height: .98; }
  .display em { font-style: italic; color: var(--sand); }
  .h2 { font-family: var(--serif); font-weight: 400; letter-spacing: -.02em; line-height: 1.02; font-size: clamp(2.4rem, 5.6vw, 4.6rem); }
  .h2 em { font-style: italic; color: var(--sand); }
  .lede { color: var(--fg2); font-size: clamp(15px, 1.25vw, 17px); line-height: 1.7; max-width: 520px; }
  .hand { font-family: var(--hand); font-weight: 700; }

  /* Line-mask reveal */
  .rise { display: block; overflow: hidden; padding-bottom: .06em; }
  .rise > span { display: block; transform: translateY(105%); transition: transform 1.1s var(--ease); transition-delay: var(--d, 0s); }
  .in .rise > span, .rise.in > span { transform: none; }
  .fade-up { opacity: 0; transform: translateY(24px); transition: opacity .9s var(--ease), transform .9s var(--ease); transition-delay: var(--d, 0s); }
  .in .fade-up, .fade-up.in { opacity: 1; transform: none; }

  /* ── Glass system (after the reference HUD) ── */
  .glass { position: relative; background: rgba(0,0,0,.4); -webkit-backdrop-filter: saturate(120%) blur(14px); backdrop-filter: saturate(120%) blur(14px); border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.92); }
  .glass::after { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none;
    background: linear-gradient(135deg, rgba(255,255,255,.4), rgba(255,255,255,0) 35% 65%, rgba(255,255,255,.4));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
  .panel { position: relative; background: rgba(9,12,20,.46); -webkit-backdrop-filter: blur(18px) saturate(130%); backdrop-filter: blur(18px) saturate(130%); border: 1px solid rgba(255,255,255,.1); border-radius: 24px; }
  .panel::after { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none;
    background: linear-gradient(140deg, rgba(255,255,255,.28), rgba(255,255,255,0) 30% 70%, rgba(255,255,255,.18));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }

  .pill { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; padding: 0 22px; border-radius: 999px; font-family: var(--sans); font-weight: 600; font-size: 15px; text-decoration: none; white-space: nowrap; transition: transform .25s var(--ease), background .3s, color .3s, box-shadow .3s; }
  .pill-solid { background: #fff; color: #0b0d12; box-shadow: 0 10px 30px rgba(0,0,0,.25); }
  .pill-solid:hover { box-shadow: 0 14px 40px rgba(255,255,255,.18); }
  .pill.glass:hover { background: rgba(0,0,0,.55); }
  .pill:active { transform: scale(.96); }
  .wa-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--wa); box-shadow: 0 0 0 4px rgba(37,211,102,.18); }

  .rule { height: 1px; background: var(--line); border: none; }

  /* Rolling digits */
  .sr-only { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .roll { display: inline-flex; line-height: 1; font-variant-numeric: tabular-nums; }
  .roll-digit { display: inline-block; height: 1em; overflow: hidden; }
  .roll-inner { display: flex; flex-direction: column; transition: transform 1.2s var(--ease); transition-delay: var(--d, 0s); }
  .roll-inner > span { display: block; height: 1em; line-height: 1; }

  /* ── HUD ── */
  .hud { position: fixed; top: 0; left: 0; right: 0; z-index: 60; display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: calc(14px + env(safe-area-inset-top)) var(--gutter) 0; pointer-events: none; transition: opacity .8s ease, transform .8s var(--ease); }
  .hud.hidden { opacity: 0; transform: translateY(-12px); }
  .hud > * { pointer-events: auto; }
  .hud-brand { display: inline-flex; align-items: center; gap: 10px; height: 44px; padding: 0 16px 0 6px; border-radius: 999px; font-family: var(--serif); font-size: 18px; }
  .hud-mark { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: #fff; color: #0b0d12; font-family: var(--mono); font-weight: 700; font-size: 12px; letter-spacing: 0; }
  .hud-right { display: flex; align-items: center; gap: 8px; }
  .hud-icon { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; transition: background .3s; }
  .hud-icon:hover { background: rgba(0,0,0,.55); }
  .hud-cta { height: 44px; padding: 0 18px; border-radius: 999px; display: inline-flex; align-items: center; gap: 10px; font-size: 14.5px; font-weight: 500; text-decoration: none; }
  .wave rect { transform-box: fill-box; transform-origin: center; transform: scaleY(.15); transition: transform .38s var(--ease); }
  .wave.on rect { animation: wave 1.1s ease-in-out infinite; }
  .wave.on rect:nth-child(2) { animation-delay: .15s; } .wave.on rect:nth-child(3) { animation-delay: .3s; } .wave.on rect:nth-child(4) { animation-delay: .45s; } .wave.on rect:nth-child(5) { animation-delay: .6s; }
  @keyframes wave { 0%,100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }

  .menu-drop { position: absolute; top: calc(100% + 10px); right: 0; min-width: 220px; padding: 8px; border-radius: 18px; display: flex; flex-direction: column;
    opacity: 0; transform: translateY(-6px); pointer-events: none; transition: opacity .25s, transform .25s var(--ease); max-height: calc(100svh - 90px); overflow-y: auto; }
  .menu-drop.open { opacity: 1; transform: none; pointer-events: auto; }
  .menu-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 12px; font-size: 15px; text-decoration: none; text-align: left; width: 100%; transition: background .2s; }
  .menu-item:hover, .menu-item.on { background: rgba(255,255,255,.1); }
  .menu-item .mono { font-size: 11px; color: var(--fg3); width: 22px; }

  /* Desktop scroll ruler */
  .ruler { position: absolute; top: calc(14px + env(safe-area-inset-top)); left: 50%; transform: translateX(-50%); width: 320px; height: 52px;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 10% 90%, transparent); mask-image: linear-gradient(90deg, transparent, #000 10% 90%, transparent); }
  .ruler.nav { -webkit-mask-image: none; mask-image: none; width: auto; }
  .ruler-track { position: absolute; top: 0; left: 0; height: 100%; will-change: transform; transition: opacity .25s; }
  .ruler.nav .ruler-track, .ruler.nav .ruler-ind { opacity: 0; pointer-events: none; }
  .tick { position: absolute; top: 0; width: 12px; margin-left: -6px; display: flex; flex-direction: column; align-items: center; }
  .tick i { display: block; width: 1px; height: 8px; background: rgba(255,255,255,.35); }
  .tick.major i { height: 16px; background: rgba(255,255,255,.65); }
  .tick span { margin-top: 4px; font-family: var(--mono); font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.62); white-space: nowrap; }
  .ruler-ind { position: absolute; top: 0; left: 50%; width: 2px; height: 18px; background: #fff; transform: translateX(-50%); transition: opacity .25s; }
  .ruler-nav { display: flex; gap: 22px; opacity: 0; pointer-events: none; transition: opacity .25s; padding-top: 2px; }
  .ruler.nav .ruler-nav { opacity: 1; pointer-events: auto; }
  .ruler-nav button { display: flex; flex-direction: column; align-items: center; gap: 8px; font-family: var(--mono); font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.66); white-space: nowrap; }
  .ruler-nav button i { display: block; width: 26px; height: 1px; background: rgba(255,255,255,.5); transition: width .2s, background .2s; }
  .ruler-nav button:hover, .ruler-nav button.on { color: #fff; }
  .ruler-nav button:hover i, .ruler-nav button.on i { width: 38px; background: #fff; }
  .ruler-nav button.on i { height: 2px; }

  /* Mobile timeline */
  .mtl { display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 14px; border-radius: 999px; }
  .mtl-bars { display: flex; gap: 3px; }
  .mtl-bar { width: 10px; height: 2px; border-radius: 1px; background: rgba(255,255,255,.28); overflow: hidden; }
  .mtl-bar i { display: block; height: 100%; background: #fff; transform-origin: left; }
  .mtl-count { font-family: var(--mono); font-size: 11px; letter-spacing: .06em; color: rgba(255,255,255,.88); font-variant-numeric: tabular-nums; }

  /* ── Entry gate ── */
  .gate { position: fixed; inset: 0; z-index: 100; color: #fff; transition: opacity .9s ease, transform 1.2s var(--ease), filter .9s ease; }
  .gate::before { content: ""; position: absolute; inset: 0; background: radial-gradient(ellipse 130vw 120vh at 50% 128%, rgba(244,227,195,.9) 8%, rgba(185,135,99,.8) 26%, rgba(58,60,88,.88) 54%, rgba(11,15,24,.96) 82%); }
  .gate.leaving { opacity: 0; transform: scale(1.08); filter: blur(10px); pointer-events: none; }
  .gate > * { position: absolute; }
  .gate-top { top: calc(18px + env(safe-area-inset-top)); left: var(--gutter); right: var(--gutter); display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .gate-counter { left: var(--gutter); bottom: calc(clamp(24px, 4vh, 40px) + env(safe-area-inset-bottom)); display: flex; align-items: flex-end; gap: 12px; }
  .gate-count { font-family: var(--mono); font-weight: 700; font-size: clamp(5.5rem, 16.7vh, 11rem); line-height: 1;
    -webkit-mask-image: linear-gradient(transparent 0%, #000 22% 78%, transparent 100%); mask-image: linear-gradient(transparent 0%, #000 22% 78%, transparent 100%); }
  .gate-unit { font-size: 12px; color: rgba(255,255,255,.7); padding-bottom: 1.2rem; line-height: 1.6; }
  .gate-center { inset: 0; display: grid; place-items: center; pointer-events: none; }
  .gate-center > div { pointer-events: auto; display: flex; flex-direction: column; align-items: center; gap: 34px; opacity: 0; transform: translateY(14px); transition: opacity .8s ease, transform .8s var(--ease); }
  .gate.ready .gate-center > div { opacity: 1; transform: none; }
  .gate-note { right: var(--gutter); bottom: calc(clamp(28px, 5vh, 48px) + env(safe-area-inset-bottom)); font-size: 11px; color: rgba(255,255,255,.72); text-align: right; line-height: 1.7; }
  .hold { position: relative; width: 92px; height: 92px; }
  .hold-btn { position: absolute; inset: 0; border-radius: 50%; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
    background: radial-gradient(circle, rgba(255,255,255,0) 0 24%, #fff 48%, rgba(255,255,255,.92) 62%, rgba(255,255,255,.32) 82%, rgba(255,255,255,0) 100%);
    box-shadow: 0 0 34px 4px rgba(255,255,255,.28); transition: transform .2s var(--ease); }
  .hold-btn:hover { transform: scale(1.06); }
  .hold-btn.pressing { transform: scale(.94); }
  .hold-btn::before, .hold-btn::after { content: ""; position: absolute; top: 50%; left: 50%; width: 130%; height: 130%; border-radius: 50%; pointer-events: none;
    background: radial-gradient(circle, rgba(255,255,255,0) 40%, rgba(255,255,255,.15) 64%, rgba(255,255,255,.85) 86%, #fff 94%, rgba(255,255,255,0) 96%);
    animation: ripple 2.8s var(--ease) infinite; opacity: 0; }
  .hold-btn::after { animation-delay: 1.4s; }
  @keyframes ripple { 0% { opacity: 0; transform: translate(-50%,-50%) scale(.7); } 15% { opacity: .75; } 100% { opacity: 0; transform: translate(-50%,-50%) scale(1.65); } }
  .hold-ring { position: absolute; top: 50%; left: 50%; width: 128%; height: 128%; transform: translate(-50%,-50%) rotate(-90deg); overflow: visible; pointer-events: none; }
  .hold-ring circle { fill: none; stroke: #fff; stroke-width: 3; stroke-linecap: round; filter: drop-shadow(0 0 6px rgba(255,255,255,.6)); }
  .hold-label { position: absolute; top: 50%; left: calc(100% + 26px); transform: translateY(-50%); font-family: var(--mono); font-weight: 700; font-size: clamp(1rem, 2.2vw, 1.35rem); line-height: 1.08; text-transform: uppercase; white-space: pre; }
  .gate-skip { font-family: var(--mono); font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.75); padding: 12px 16px; border-radius: 999px; transition: background .25s, color .25s; }
  .gate-skip:hover { background: rgba(255,255,255,.1); color: #fff; }

  /* ── Chapter: Ground (hero, scroll-scrubbed build) ── */
  .ground { position: relative; height: 270svh; }
  .ground-pin { position: sticky; top: 0; height: 100svh; overflow: hidden; }
  .ground-copy { position: absolute; left: var(--gutter); bottom: clamp(36px, 9vh, 96px); width: min(620px, 50vw); }
  .ground-copy .display { font-size: clamp(3.2rem, min(7vw, 12.5vh), 7.6rem); margin: 18px 0 22px; white-space: nowrap; }
  .ground-copy .cycle { display: inline-block; font-style: italic; color: var(--sand); }
  .ground-actions { display: flex; gap: 10px; margin-top: 28px; flex-wrap: wrap; }
  .readout { position: absolute; right: var(--gutter); bottom: clamp(36px, 9vh, 96px); width: 250px; text-align: right; }
  .readout-num { font-family: var(--mono); font-weight: 700; font-size: clamp(3.6rem, 9vh, 5.6rem); line-height: 1; display: inline-flex; align-items: flex-start; }
  .readout-num small { font-size: .32em; margin-top: .25em; margin-left: 4px; color: var(--fg2); }
  .stage-list { list-style: none; margin-top: 18px; display: flex; flex-direction: column; gap: 9px; }
  .stage-list li { display: flex; justify-content: flex-end; align-items: center; gap: 10px; font-family: var(--mono); font-size: 11.5px; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.42); transition: color .4s; }
  .stage-list li i { width: 7px; height: 7px; border-radius: 50%; border: 1px solid currentColor; transition: background .4s, box-shadow .4s; }
  .stage-list li.done { color: rgba(255,255,255,.78); } .stage-list li.done i { background: currentColor; }
  .stage-list li.now { color: #fff; } .stage-list li.now i { background: var(--gold); border-color: var(--gold); box-shadow: 0 0 0 4px rgba(220,189,108,.25); }
  .shimmer { -webkit-text-fill-color: transparent; background-image: linear-gradient(100deg, rgba(255,255,255,.65) 0 35%, #fff 50%, rgba(255,255,255,.65) 65% 100%); background-size: 200%; -webkit-background-clip: text; background-clip: text; animation: shimmer 6s linear infinite; }
  @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
  .scroll-pill { position: absolute; left: 50%; bottom: clamp(28px, 5vh, 48px); transform: translateX(-50%); display: inline-flex; align-items: center; gap: 12px; padding: 12px 24px; border-radius: 999px;
    font-family: var(--mono); font-size: 13px; letter-spacing: .06em; text-transform: uppercase; transition: opacity .6s, transform .6s var(--ease); }
  .scroll-pill.hide { opacity: 0; transform: translate(-50%, 12px); pointer-events: none; }
  .scroll-pill i { width: 8px; height: 8px; border-radius: 50%; background: #fff; animation: bob 2s ease-in-out infinite; }
  @keyframes bob { 0%,100% { transform: translateY(-3px); } 50% { transform: translateY(3px); } }
  .drag-hint { position: absolute; top: 24vh; right: 18vw; font-size: 26px; color: rgba(255,255,255,.75); transform: rotate(-6deg); transition: opacity .6s; pointer-events: none; }
  .drag-hint svg { display: block; margin: 4px 0 0 30px; }

  /* ── Generic chapters ── */
  .chapter { position: relative; padding: clamp(110px, 16vh, 170px) 0 clamp(80px, 12vh, 140px); }
  .ch-head { display: flex; flex-direction: column; gap: 20px; margin-bottom: clamp(36px, 6vh, 64px); }
  .ch-head.center { align-items: center; text-align: center; }
  .ch-head.center .lede { margin-inline: auto; }

  .half-left { width: min(600px, 48%); }
  .half-right { width: min(560px, 46%); margin-left: auto; }

  .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--line); border-radius: 22px; overflow: hidden; }
  .stat { background: rgba(9,12,20,.5); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); padding: 22px 22px 20px; }
  .stat-num { font-family: var(--mono); font-weight: 700; font-size: clamp(2.2rem, 4vw, 3.2rem); line-height: 1; display: flex; align-items: flex-start; }
  .stat-num small { font-size: .45em; margin-left: 2px; color: var(--sand); }
  .stat-label { margin-top: 10px; font-family: var(--mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--fg3); }

  .register { margin-top: 18px; padding: 8px; }
  .reg-row { display: grid; grid-template-columns: 34px 1fr auto; align-items: center; gap: 4px 14px; width: 100%; text-align: left; padding: 16px 14px; border-radius: 16px; transition: background .25s; }
  .reg-row:hover { background: rgba(255,255,255,.06); }
  .reg-row + .reg-row { border-top: 1px solid rgba(255,255,255,.07); }
  .reg-idx { font-family: var(--mono); font-size: 11px; color: var(--fg3); }
  .reg-name { font-family: var(--serif); font-size: 21px; line-height: 1.15; }
  .reg-meta { grid-column: 2; display: flex; align-items: center; gap: 12px; font-family: var(--mono); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--fg3); }
  .reg-bar { flex: 1; height: 2px; background: rgba(255,255,255,.14); border-radius: 2px; overflow: hidden; max-width: 160px; }
  .reg-bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--gold), #fff); transform-origin: left; transition: transform 1.4s var(--ease); }
  .tag { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; font-family: var(--mono); font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; white-space: nowrap; }
  .tag-done { background: rgba(74,222,128,.14); color: #86efac; }
  .tag-live { background: rgba(220,189,108,.16); color: var(--sand); }
  .tag-live::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: pulse 1.8s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: .4; } 50% { opacity: 1; } }

  /* Progress chapter */
  .chips { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; scroll-snap-type: x proximity; padding: 2px 2px 6px; }
  .chips::-webkit-scrollbar { display: none; }
  .chip { flex-shrink: 0; height: 42px; padding: 0 16px; border-radius: 999px; font-size: 14px; font-weight: 500; scroll-snap-align: center; display: inline-flex; align-items: center; gap: 8px; transition: background .3s, color .3s; }
  .chip.on { background: #fff; color: #0b0d12; }
  .chip.on::after { display: none; }
  .prog-card { margin-top: 16px; padding: clamp(22px, 3vw, 32px); }
  .prog-top { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
  .prog-pct { font-family: var(--mono); font-weight: 700; font-size: clamp(3.4rem, 7vw, 5.4rem); line-height: 1; display: inline-flex; }
  .prog-pct small { font-size: .32em; margin-top: .3em; color: var(--fg2); }
  .prog-bar { margin: 22px 0 8px; height: 4px; border-radius: 4px; background: rgba(255,255,255,.12); overflow: hidden; }
  .prog-bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--gold), #fff); transition: width 1.2s var(--ease); }
  .stage-rows { list-style: none; margin-top: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .stage-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06); transition: background .4s, border-color .4s; }
  .stage-row .dot { width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.25); color: rgba(255,255,255,.4); transition: all .4s; }
  .stage-row.completed .dot { background: rgba(134,239,172,.18); border-color: transparent; color: #86efac; }
  .stage-row.ongoing { background: rgba(220,189,108,.1); border-color: rgba(220,189,108,.35); }
  .stage-row.ongoing .dot { background: var(--gold); border-color: var(--gold); color: #0b0d12; }
  .stage-row b { display: block; font-weight: 500; font-size: 14px; }
  .stage-row small { display: block; margin-top: 3px; font-family: var(--mono); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--fg3); }

  /* Stories */
  .story-row { display: flex; gap: clamp(14px, 3vw, 36px); overflow-x: auto; scrollbar-width: none; padding: 6px var(--gutter) 10px; scroll-padding-inline: var(--gutter); scroll-snap-type: x proximity; }
  .story-row::-webkit-scrollbar { display: none; }
  .story-row > :first-child { margin-left: auto; } .story-row > :last-child { margin-right: auto; }
  .story { flex-shrink: 0; width: clamp(108px, 14vw, 150px); text-align: center; scroll-snap-align: start; }
  .story-ring { width: clamp(92px, 12vw, 130px); aspect-ratio: 1; margin: 0 auto 14px; border-radius: 50%; padding: 3px; background: conic-gradient(from 210deg, #fff, var(--gold), rgba(255,255,255,.2), #fff); transition: transform .5s var(--ease); position: relative; }
  .story:hover .story-ring { transform: scale(1.06) rotate(-4deg); }
  .story-ring > div { width: 100%; height: 100%; border-radius: 50%; padding: 3px; background: var(--ink); }
  .story-ring img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
  .story-new { position: absolute; top: 2px; right: 2px; }
  .story-name { font-family: var(--serif); font-size: 18px; line-height: 1.15; }
  .story-sub { margin-top: 6px; font-family: var(--mono); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--fg3); }

  .viewer { position: fixed; inset: 0; z-index: 120; background: #000; touch-action: none; user-select: none; -webkit-user-select: none; animation: fadeIn .25s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .viewer-bars { position: absolute; top: calc(10px + env(safe-area-inset-top)); left: 12px; right: 12px; display: flex; gap: 4px; z-index: 5; max-width: 640px; margin: 0 auto; }
  .viewer-bars div { flex: 1; height: 2px; border-radius: 2px; background: rgba(255,255,255,.3); overflow: hidden; }
  .viewer-bars i { display: block; height: 100%; background: #fff; }
  .viewer-head { position: absolute; top: calc(22px + env(safe-area-inset-top)); left: 12px; right: 12px; max-width: 640px; margin: 0 auto; display: flex; align-items: center; gap: 12px; z-index: 6; }
  .viewer-hint { position: absolute; bottom: calc(16px + env(safe-area-inset-bottom)); left: 0; right: 0; text-align: center; font-family: var(--mono); font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.6); pointer-events: none; }

  /* Gallery strip */
  .strip { display: flex; gap: clamp(12px, 2vw, 22px); overflow-x: auto; scrollbar-width: none; scroll-snap-type: x mandatory; padding: 4px var(--gutter) 8px; scroll-padding-inline: var(--gutter); cursor: grab; overscroll-behavior-x: contain; }
  .strip::-webkit-scrollbar { display: none; }
  .strip.is-dragging { cursor: grabbing; scroll-snap-type: none; }
  .strip.is-dragging * { pointer-events: none; }
  .gcard { position: relative; flex-shrink: 0; width: clamp(270px, 38vw, 560px); aspect-ratio: 4 / 5; border-radius: 24px; overflow: hidden; scroll-snap-align: start; text-align: left; background: #111; }
  .gcard img { width: 100%; height: 100%; object-fit: cover; transition: transform 1.2s var(--ease); }
  .gcard:hover img { transform: scale(1.05); }
  .gcard::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.85), rgba(0,0,0,.05) 55%, rgba(0,0,0,.45)); }
  .gcard-top { position: absolute; top: 18px; left: 18px; right: 18px; z-index: 2; display: flex; justify-content: space-between; align-items: center; }
  .gcard-body { position: absolute; left: 22px; right: 22px; bottom: 22px; z-index: 2; }
  .gcard-body h3 { font-family: var(--serif); font-weight: 400; font-size: clamp(1.8rem, 3vw, 2.6rem); line-height: 1; }
  .gcard-body p { margin-top: 10px; color: var(--fg2); font-size: 14px; line-height: 1.6; max-width: 400px; }
  .gcard-open { margin-top: 16px; display: inline-flex; align-items: center; gap: 8px; font-family: var(--mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
  .strip-ctrl { display: flex; align-items: center; gap: 16px; margin-top: 22px; }
  .strip-track { flex: 1; height: 2px; background: rgba(255,255,255,.14); border-radius: 2px; overflow: hidden; }
  .strip-track i { display: block; height: 100%; background: #fff; transform-origin: left; }

  .lightbox { position: fixed; inset: 0; z-index: 120; display: flex; flex-direction: column; background: rgba(5,7,12,.96); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); animation: fadeIn .25s ease; padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom); }
  .lb-stage { flex: 1; min-height: 0; position: relative; display: flex; align-items: center; justify-content: center; padding: 0 clamp(8px, 7vw, 96px); }
  .lb-stage img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 14px; animation: fadeIn .3s ease; }
  .lb-nav { position: absolute; top: 50%; transform: translateY(-50%); }
  .thumbs { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding: 12px 14px 4px; justify-content: safe center; }
  .thumbs::-webkit-scrollbar { display: none; }
  .thumbs button { flex-shrink: 0; width: 64px; height: 46px; border-radius: 10px; overflow: hidden; opacity: .45; border: 2px solid transparent; transition: opacity .2s, border-color .2s; }
  .thumbs button.on { opacity: 1; border-color: #fff; }
  .thumbs img { width: 100%; height: 100%; object-fit: cover; }

  /* Before / after */
  .ba { position: relative; width: 100%; aspect-ratio: 16 / 8; max-height: 74vh; border-radius: 28px; overflow: hidden; touch-action: pan-y; user-select: none; -webkit-user-select: none; cursor: ew-resize; box-shadow: 0 40px 100px rgba(0,0,0,.5); }
  .ba img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
  .ba-line { position: absolute; top: 0; bottom: 0; width: 1px; background: #fff; box-shadow: 0 0 18px rgba(255,255,255,.8); transform: translateX(-50%); pointer-events: none; }
  .ba-handle { position: absolute; top: 50%; width: 64px; height: 64px; transform: translate(-50%,-50%); border-radius: 50%; display: grid; place-items: center; pointer-events: none; }
  .ba-label { position: absolute; top: 18px; padding: 8px 14px; border-radius: 999px; font-family: var(--mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; }

  /* Locations */
  .zones { display: grid; grid-template-columns: minmax(260px, 360px) 1fr; gap: clamp(16px, 3vw, 40px); align-items: start; }
  .zones > * { min-width: 0; }
  .zone-list { display: flex; flex-direction: column; }
  .zone-btn { display: grid; grid-template-columns: 34px 1fr auto; align-items: center; gap: 12px; padding: 16px 6px; text-align: left; border-bottom: 1px solid rgba(255,255,255,.08); color: var(--fg3); transition: color .3s, padding .3s var(--ease); }
  .zone-btn:hover { color: var(--fg2); }
  .zone-btn.on { color: #fff; padding-left: 14px; }
  .zone-btn .mono { font-size: 11px; }
  .zone-btn b { font-family: var(--serif); font-weight: 400; font-size: 20px; }
  .zone-btn .zdot { width: 8px; height: 8px; border-radius: 50%; opacity: 0; transition: opacity .3s; }
  .zone-btn.on .zdot { opacity: 1; }
  .zone-card { padding: clamp(24px, 3.4vw, 44px); animation: fadeIn .45s ease; }
  .hl-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 8px; margin-top: 26px; }
  .hl { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 14px; background: rgba(255,255,255,.05); font-size: 14px; }
  .hl i { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .sector-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .sector-pills span, .cloud span { padding: 8px 14px; border-radius: 999px; font-size: 13px; border: 1px solid rgba(255,255,255,.14); color: var(--fg2); transition: background .25s, color .25s; }
  .cloud { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 18px; }
  .cloud span:hover { background: #fff; color: #0b0d12; }

  /* Why */
  .why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border-radius: 26px; overflow: hidden; }
  .why { background: rgba(10,12,18,.72); padding: clamp(24px, 3vw, 36px); display: flex; flex-direction: column; gap: 14px; min-height: 280px; transition: background .4s; }
  .why:hover { background: rgba(22,24,32,.8); }
  .why-stat { font-family: var(--mono); font-weight: 700; font-size: clamp(1.9rem, 3vw, 2.5rem); line-height: 1; color: var(--sand); white-space: nowrap; }
  .why h3 { font-family: var(--serif); font-weight: 400; font-size: 24px; margin-top: auto; }
  .why p { color: var(--fg2); font-size: 14.5px; line-height: 1.7; }

  /* FAQ */
  .faq { border-top: 1px solid var(--line); }
  .faq-item { border-bottom: 1px solid var(--line); }
  .faq-q { width: 100%; display: grid; grid-template-columns: 44px 1fr 40px; align-items: center; gap: 12px; padding: 24px 0; text-align: left; }
  .faq-q .mono { font-size: 11px; color: var(--fg3); }
  .faq-q b { font-family: var(--serif); font-weight: 400; font-size: clamp(19px, 2vw, 25px); line-height: 1.25; }
  .faq-plus { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; transition: transform .45s var(--ease), background .3s; }
  .faq-item.open .faq-plus { transform: rotate(45deg); background: #fff; color: #0b0d12; }
  .faq-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .5s var(--ease); }
  .faq-item.open .faq-a { grid-template-rows: 1fr; }
  .faq-a > div { overflow: hidden; }
  .faq-a p { padding: 0 52px 26px 56px; color: var(--fg2); line-height: 1.8; font-size: 15.5px; }

  /* Contact */
  .contact-card { display: grid; grid-template-columns: auto 1fr; gap: clamp(20px, 4vw, 48px); align-items: center; padding: clamp(24px, 4vw, 48px); }
  .avatar { width: clamp(110px, 14vw, 170px); aspect-ratio: 1; border-radius: 50%; overflow: hidden; padding: 3px; background: conic-gradient(from 200deg, #fff, var(--gold), rgba(255,255,255,.2), #fff); }
  .avatar img, .avatar div { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
  .contact-actions { display: grid; grid-template-columns: repeat(3, auto); gap: 10px; margin-top: 24px; justify-content: start; }
  .foot { margin-top: clamp(64px, 10vh, 120px); padding-top: 36px; border-top: 1px solid var(--line); display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 32px; }
  .foot h4 { font-family: var(--mono); font-weight: 400; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--fg3); margin-bottom: 14px; }
  .foot-row { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,.06); font-size: 14px; color: var(--fg2); }
  .foot a { text-decoration: none; }
  .foot-base { margin-top: 36px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-family: var(--mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--fg3); }

  /* Mobile action bar */
  .actionbar { position: fixed; left: max(12px, calc(50% - 280px)); right: max(12px, calc(50% - 280px)); bottom: calc(12px + env(safe-area-inset-bottom)); z-index: 55; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 6px; border-radius: 999px; transition: transform .5s var(--ease), opacity .5s; }
  .actionbar.hide { transform: translateY(140%); opacity: 0; pointer-events: none; }
  .actionbar .pill { min-height: 46px; }

  .icon-circle { width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; flex-shrink: 0; transition: background .3s, transform .25s var(--ease); }
  .icon-circle:active { transform: scale(.92); }

  /* Hover only for real pointers */
  @media (hover: none) {
    .gcard:hover img, .story:hover .story-ring, .hold-btn:hover { transform: none; }
  }

  /* ── Responsive ── */
  @media (max-width: 1023px) {
    .half-left, .half-right { width: 100%; margin-left: 0; }
    .zones { grid-template-columns: 1fr; }
    .zone-list { display: none; }
    .why-grid { grid-template-columns: 1fr 1fr; }
    .foot { grid-template-columns: 1fr 1fr; }
    .foot > :first-child { grid-column: 1 / -1; }
    .ruler { display: none; }
    .scene-chapter { padding-top: 58svh; }
  }
  @media (min-width: 1024px) { .zone-chips, .mtl-wrap { display: none !important; } }
  @media (max-width: 767px) {
    .ground-copy { left: var(--gutter); right: var(--gutter); width: auto; bottom: calc(26px + env(safe-area-inset-bottom)); }
    .ground-copy .display { font-size: clamp(3rem, 15vw, 4.4rem); margin: 14px 0 14px; }
    .ground-copy .lede { font-size: 14.5px; }
    .ground-actions { display: grid; grid-template-columns: 1fr 1fr; margin-top: 20px; }
    .readout { top: auto; bottom: calc(100% - 100svh + 26px); left: auto; right: var(--gutter); width: auto; display: none; }
    .ground-copy .readout-m { display: flex !important; width: fit-content; }
    .readout-num { font-size: 2.6rem; }
    .stage-list { display: none; }
    .readout .now-stage { display: block !important; }
    .scroll-pill { display: none; }
    .drag-hint { display: none; }
    .ground-pin::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 62%; background: linear-gradient(to top, rgba(9,12,18,.92), rgba(9,12,18,.55) 55%, transparent); pointer-events: none; z-index: -1; }
    .why-grid { grid-template-columns: 1fr; }
    .why { min-height: 0; }
    .stage-rows { grid-template-columns: 1fr; }
    .contact-card { grid-template-columns: 1fr; text-align: center; justify-items: center; }
    .contact-actions { grid-template-columns: 1fr; width: 100%; }
    .faq-q { grid-template-columns: 30px 1fr 40px; padding: 20px 0; }
    .faq-a p { padding: 0 8px 22px 42px; font-size: 15px; }
    .foot { grid-template-columns: 1fr; }
    .ba { aspect-ratio: 4 / 4.4; border-radius: 22px; }
    .hud-cta { display: none !important; }
    .hud .hud-brand > span:last-child { display: none; }
    .hud .hud-brand { padding: 0 5px; }
    .gcard { width: 82vw; }
    .hold-label { top: calc(100% + 30px); left: 50%; transform: translateX(-50%); text-align: center; font-size: 1.05rem; }
    .gate-center > div { gap: 96px; }
    .gate-note { left: var(--gutter); right: auto; text-align: left; bottom: auto; top: calc(70px + env(safe-area-inset-top)); }
    .chapter { padding-bottom: 110px; }
  }
  @media (min-width: 1024px) and (max-height: 760px) {
    .ground-copy .display { margin: 12px 0 14px; }
    .ground-actions { margin-top: 18px; }
    .stage-list { gap: 6px; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; scroll-behavior: auto !important; }
    .rise > span, .fade-up { transform: none !important; opacity: 1 !important; }
  }
  `}</style>
);

/* ─────────────────────────── SMALL PIECES ─────────────────────────── */
const DIGITS = Array.from({ length: 10 }, (_, d) => <span key={d}>{d}</span>);
const RollingNumber = ({ value, className = "", stagger = 0.06 }) => {
  const str = String(value);
  return (
    <span className={`roll ${className}`}>
      <span className="sr-only">{str}</span>
      {str.split("").map((ch, i) => {
        const key = str.length - i;
        return /\d/.test(ch) ? (
          <span key={key} className="roll-digit" aria-hidden="true">
            <span className="roll-inner" style={{ transform: `translateY(${-Number(ch)}em)`, "--d": `${(str.length - i) * stagger}s` }}>{DIGITS}</span>
          </span>
        ) : <span key={key} aria-hidden="true">{ch}</span>;
      })}
    </span>
  );
};

const Rise = ({ children, d = 0 }) => <span className="rise"><span style={{ "--d": `${d}s` }}>{children}</span></span>;

const ChapterHead = ({ n, label, title, lede, center = false, visible }) => (
  <div className={`ch-head ${center ? "center" : ""} ${visible ? "in" : ""}`}>
    <span className="eyebrow fade-up"><b>{String(n).padStart(2, "0")}</b><i />{label}</span>
    <h2 className="h2">{title}</h2>
    {lede && <p className="lede fade-up" style={{ "--d": ".25s" }}>{lede}</p>}
  </div>
);

const WhatsAppIcon = ({ size = 18 }) => <MessageCircle size={size} />;

const Brand = ({ onClick }) => (
  <button className="hud-brand glass" onClick={onClick} aria-label="ShineOne Estate — back to top">
    <span className="hud-mark">S1</span>
    <span>ShineOne Estate</span>
  </button>
);

const SoundButton = () => {
  const [on, setOn] = useState(audio.enabled);
  useEffect(() => audio.subscribe(setOn), []);
  return (
    <button className="hud-icon glass" onClick={() => audio.toggle()} aria-pressed={on} aria-label={on ? "Mute background sound" : "Play background sound"} title={on ? "Sound on" : "Sound off"}>
      <svg className={`wave ${on ? "on" : ""}`} width="20" height="16" viewBox="0 0 20 16" fill="#fff" aria-hidden="true">
        {[1, 5, 9, 13, 17].map((x, i) => <rect key={i} x={x - 1} y={[5, 2, 0, 3, 6][i]} width="2" height={[6, 12, 16, 10, 4][i]} rx="1" />)}
      </svg>
    </button>
  );
};

/* ─────────────────────────── ENTRY GATE ─────────────────────────── */
const HOLD_MS = 1150;
const EntryGate = ({ onEnter }) => {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [hold, setHold] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const h = useRef({ raf: 0, value: 0, active: false, last: 0, done: false });

  // Loader: counts up while fonts and the 3D site get ready
  useEffect(() => {
    let raf, fontsReady = false;
    const t0 = performance.now();
    (document.fonts?.ready || Promise.resolve()).then(() => { fontsReady = true; });
    const tick = (now) => {
      const linear = Math.min(1, (now - t0) / 1700);
      const eased = 1 - Math.pow(1 - linear, 2.2);
      const cap = fontsReady || now - t0 > 4000 ? 100 : 92;
      const v = Math.min(cap, Math.round(eased * 100));
      setCount(v);
      if (v >= 100) { setReady(true); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const finish = (withSound) => {
    if (h.current.done) return;
    h.current.done = true;
    cancelAnimationFrame(h.current.raf);
    if (withSound) { audio.enable(); audio.holdEnd(); audio.breakGround(); vibrate([12, 40, 24]); }
    else audio.holdEnd();
    setLeaving(true);
    setTimeout(onEnter, 950);
  };

  const step = (now) => {
    const s = h.current;
    const dt = now - (s.last || now); s.last = now;
    s.value = s.active ? Math.min(1, s.value + dt / HOLD_MS) : Math.max(0, s.value - dt / (HOLD_MS * 0.45));
    setHold(s.value);
    audio.holdUpdate(s.value);
    if (s.value >= 1) { finish(true); return; }
    if (s.active || s.value > 0) s.raf = requestAnimationFrame(step);
  };
  const begin = (e) => {
    if (!ready || h.current.done) return;
    if (e?.pointerType) { try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {} }
    const s = h.current;
    if (s.active) return;
    s.active = true; s.last = 0;
    setPressing(true);
    audio.holdStart();
    vibrate(10);
    cancelAnimationFrame(s.raf);
    s.raf = requestAnimationFrame(step);
  };
  const release = () => {
    const s = h.current;
    if (!s.active || s.done) return;
    s.active = false; s.last = 0;
    setPressing(false);
    audio.holdEnd();
    cancelAnimationFrame(s.raf);
    s.raf = requestAnimationFrame(step);
  };

  const C = 2 * Math.PI * 48;
  return (
    <div className={`gate ${ready ? "ready" : ""} ${leaving ? "leaving" : ""}`} role="dialog" aria-modal="true" aria-label="Enter ShineOne Estate">
      <div className="gate-top">
        <span className="hud-brand glass" style={{ pointerEvents: "none" }}><span className="hud-mark">S1</span><span>ShineOne Estate</span></span>
        <span className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,.75)" }}>Gurugram</span>
      </div>

      <div className="gate-center">
        <div>
          <div className="hold">
            <button className={`hold-btn ${pressing ? "pressing" : ""}`} aria-label="Press and hold to enter with sound"
              onPointerDown={begin} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
              onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); begin(); } }}
              onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") release(); }}
              onContextMenu={(e) => e.preventDefault()} />
            <svg className="hold-ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="48" strokeDasharray={C} strokeDashoffset={C * (1 - hold)} style={{ opacity: hold > 0 ? 1 : 0 }} />
            </svg>
            <div className="hold-label" aria-hidden="true">{"Hold to\nbreak ground"}</div>
          </div>
          <button className="gate-skip" onClick={() => finish(false)}>Enter without sound</button>
        </div>
      </div>

      <div className="gate-note mono">Sound on<br />for the full site experience</div>

      <div className="gate-counter" aria-live="polite">
        <span className="gate-count"><RollingNumber value={String(count).padStart(2, "0")} stagger={0} /></span>
        <span className="gate-unit mono">Loading<br />the site</span>
      </div>
    </div>
  );
};

/* ─────────────────────────── HUD ─────────────────────────── */
const Ruler = () => {
  const pos = useStore((s) => Math.round(s.pos * 100) / 100);
  const active = useStore((s) => s.active);
  const [nav, setNav] = useState(false);
  const GAP = 120;
  const ticks = [];
  CHAPTERS.forEach((c, i) => {
    ticks.push(<div key={`M${i}`} className="tick major" style={{ left: i * GAP }}><i /><span>{c.label}</span></div>);
    if (i < CHAPTERS.length - 1) for (let k = 1; k < 6; k++) ticks.push(<div key={`m${i}-${k}`} className="tick" style={{ left: i * GAP + (k * GAP) / 6 }}><i /></div>);
  });
  return (
    <nav className={`ruler ${nav ? "nav" : ""}`} aria-label="Chapters" onMouseEnter={() => setNav(true)} onMouseLeave={() => setNav(false)} onFocus={() => setNav(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setNav(false); }}>
      <div className="ruler-track" style={{ transform: `translateX(${160 - pos * GAP}px)` }} aria-hidden="true">{ticks}</div>
      <div className="ruler-ind" aria-hidden="true" />
      <div className="ruler-nav">
        {CHAPTERS.map((c, i) => (
          <button key={c.id} className={i === active ? "on" : ""} onClick={() => goToChapter(i)} aria-current={i === active ? "true" : undefined}><i />{c.label}</button>
        ))}
      </div>
    </nav>
  );
};

const MobileTimeline = ({ onOpen }) => {
  const pos = useStore((s) => Math.round(s.pos * 50) / 50);
  const active = useStore((s) => s.active);
  return (
    <button className="mtl glass mtl-wrap" onClick={onOpen} aria-label={`Chapter ${active + 1} of ${CHAPTERS.length}: ${CHAPTERS[active].label}. Open chapter list`}>
      <span className="mtl-bars" aria-hidden="true">
        {CHAPTERS.map((c, i) => (
          <span key={c.id} className="mtl-bar"><i style={{ transform: `scaleX(${Math.max(0, Math.min(1, pos - i))})` }} /></span>
        ))}
      </span>
      <span className="mtl-count">{String(active + 1).padStart(2, "0")}/{CHAPTERS.length}</span>
    </button>
  );
};

const Hud = ({ hidden }) => {
  const [open, setOpen] = useState(false);
  const active = useStore((s) => s.active);
  const boxRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); window.removeEventListener("keydown", onKey); };
  }, [open]);
  const go = (i) => { setOpen(false); goToChapter(i); };

  return (
    <header className={`hud ${hidden ? "hidden" : ""}`}>
      <Brand onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      <Ruler />
      <div className="hud-right" ref={boxRef} style={{ position: "relative" }}>
        <MobileTimeline onOpen={() => setOpen((o) => !o)} />
        <SoundButton />
        <a className="hud-cta glass" href={`${WA_URL}?text=${encodeURIComponent("Hi, I'd like to book a site visit.")}`} target="_blank" rel="noreferrer">
          <span className="wa-dot" /> Book a site visit
        </a>
        <button className="hud-icon glass" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={18} /> : (
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><rect y="0" width="18" height="1.6" rx=".8" fill="#fff" /><rect y="5.2" width="12" height="1.6" rx=".8" fill="#fff" /><rect y="10.4" width="18" height="1.6" rx=".8" fill="#fff" /></svg>
          )}
        </button>
        <div className={`menu-drop glass ${open ? "open" : ""}`} role="menu">
          {CHAPTERS.map((c, i) => (
            <button key={c.id} role="menuitem" className={`menu-item ${i === active ? "on" : ""}`} onClick={() => go(i)}>
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>{c.label}
            </button>
          ))}
          <hr className="rule" style={{ margin: "6px 8px" }} />
          <a role="menuitem" className="menu-item" href={`tel:${PHONE}`}><Phone size={16} /> +91 93109 94032</a>
          <a role="menuitem" className="menu-item" href={WA_URL} target="_blank" rel="noreferrer"><span className="wa-dot" /> WhatsApp</a>
        </div>
      </div>
    </header>
  );
};

const ActionBar = () => {
  const active = useStore((s) => s.active);
  const ground = useStore((s) => s.ground > 0.96);
  const show = active > 0 || ground;
  return (
    <div className={`actionbar glass ${show ? "" : "hide"}`} role="region" aria-label="Quick contact">
      <a className="pill pill-solid" href={`tel:${PHONE}`}><Phone size={17} /> Call</a>
      <a className="pill" href={`${WA_URL}?text=${encodeURIComponent("Hi, I'm interested in a ShineOne Estate project.")}`} target="_blank" rel="noreferrer" style={{ color: "#fff" }}><span className="wa-dot" /> WhatsApp</a>
    </div>
  );
};

/* ─────────────────────────── 01 GROUND ─────────────────────────── */
const headlines = ["Vision", "Dream", "Future", "Legacy"];
const GroundChapter = ({ entered, dragHandlers }) => {
  const stage = useStore((s) => stageIndexFromP(s.ground));
  const pct = useStore((s) => Math.round(s.ground * 100));
  const started = useStore((s) => s.ground > 0.015);
  const finePointer = useFinePointer();
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % headlines.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="ch-ground" className="ground" aria-label="ShineOne Estate — introduction" {...dragHandlers}>
      <div className={`ground-pin ${entered ? "in" : ""}`}>
        <div className="ground-copy">
          <span className="readout-m glass fade-up" style={{ "--d": ".1s", display: "none", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 999, marginBottom: 16 }}>
            <span className="mono" style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", minWidth: "4ch" }}>{pct}%</span>
            <span style={{ width: 54, height: 2, borderRadius: 2, background: "rgba(255,255,255,.2)", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${pct}%`, background: "var(--gold)" }} /></span>
            <span className="mono shimmer" style={{ fontSize: 11 }}>{pct >= 100 ? "Handover" : STAGES[stage]}</span>
          </span>
          <span className="eyebrow fade-up" style={{ "--d": ".2s" }}><b>01</b><i />Premium Real Estate · Gurugram</span>
          <h1 className="display">
            <Rise d={0.3}>We build</Rise>
            <Rise d={0.42}>your <span key={phase} className="cycle" style={{ animation: "fadeIn .6s ease" }}>{headlines[phase]}</span></Rise>
          </h1>
          <p className="lede fade-up" style={{ "--d": ".6s" }}>Plots · Flats · Floors · Construction — Sector 4, 9, 42, 46 & Reliance MET City.</p>
          <div className="ground-actions fade-up" style={{ "--d": ".75s" }}>
            <a className="pill pill-solid" href={`tel:${PHONE}`}><Phone size={17} /> Call now</a>
            <a className="pill glass" href={WA_URL} target="_blank" rel="noreferrer"><span className="wa-dot" /> WhatsApp</a>
          </div>
        </div>

        <div className="readout fade-up" style={{ "--d": ".9s" }} aria-live="off">
          <div className="mono" style={{ fontSize: 11, color: "var(--fg3)" }}>Build progress</div>
          <div className="readout-num"><RollingNumber value={String(pct).padStart(2, "0")} stagger={0} /><small>%</small></div>
          <div className="now-stage mono shimmer" style={{ display: "none", fontSize: 12 }}>{STAGES[stage]}</div>
          <ol className="stage-list">
            {STAGES.map((s, i) => (
              <li key={s} className={pct >= 100 || i < stage ? "done" : i === stage ? "now" : ""}>
                <span className={i === stage && pct < 100 ? "shimmer" : ""}>{s}</span><i />
              </li>
            ))}
          </ol>
        </div>

        {finePointer && (
          <div className="drag-hint hand" style={{ opacity: entered && !started ? 1 : 0 }} aria-hidden="true">
            drag to look around
            <svg width="60" height="30" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6c14 18 34 20 50 10" /><path d="M46 10l8 6-9 4" /></svg>
          </div>
        )}
        <div className={`scroll-pill glass ${started || !entered ? "hide" : ""}`}><i />Scroll to build</div>
      </div>
    </section>
  );
};

/* ─────────────────────────── 02 PROJECTS ─────────────────────────── */
const OverviewChapter = ({ onSelectProject }) => {
  const { ref, visible } = useReveal(0.12);
  const stats = [
    { value: "3", suffix: "+", label: "Completed projects" },
    { value: "14,400", suffix: "", label: "Sq. ft. delivered" },
    { value: "5", suffix: "", label: "Active sectors" },
    { value: "78", suffix: "%", label: "Sector 42 progress" },
  ];
  return (
    <section id="ch-overview" ref={ref} className="chapter scene-chapter">
      <div className="wrap">
        <div className="half-left">
          <ChapterHead n={2} label="Projects overview" visible={visible}
            title={<><Rise>Built with</Rise><Rise d={0.12}><em>precision & pride</em></Rise></>}
            lede="A snapshot of every development — from foundation to handover — across Gurugram's most sought-after sectors." />
          <div className={`stats ${visible ? "in" : ""}`}>
            {stats.map((s, i) => (
              <div key={s.label} className="stat fade-up" style={{ "--d": `${0.1 * i}s` }}>
                <div className="stat-num"><RollingNumber value={visible ? s.value : s.value.replace(/\d/g, "0")} /><small>{s.suffix}</small></div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className={`panel register ${visible ? "in" : ""}`}>
            {projectData.projects.map((p, i) => {
              const done = p.status.toLowerCase().includes("completed");
              const pct = projectPercent(p);
              return (
                <button key={p.name} className="reg-row fade-up" style={{ "--d": `${0.3 + i * 0.07}s` }} onClick={() => onSelectProject(p.name)} aria-label={`${p.name}: ${done ? "delivered" : `${pct}% complete`}. Show progress`}>
                  <span className="reg-idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="reg-name">{p.name}</span>
                  <span className={`tag ${done ? "tag-done" : "tag-live"}`}>{done ? "Delivered" : p.stage || "Ongoing"}</span>
                  <span className="reg-meta">
                    <span>{p.area}</span>
                    <span className="reg-bar"><i style={{ transform: `scaleX(${visible ? pct / 100 : 0})` }} /></span>
                    <span>{done ? "100%" : `${pct}%`}{p.eta ? ` · ${p.eta}` : ""}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────── 03 PROGRESS ─────────────────────────── */
const ProgressChapter = ({ selected, onSelect, dragHandlers }) => {
  const { ref, visible } = useReveal(0.12);
  const chips = useRef(null);
  const idx = Math.max(0, projectData.projects.findIndex((p) => p.name === selected));
  const project = projectData.projects[idx];
  const pct = projectPercent(project);
  const stages = projectStages(project);
  const pick = (i) => {
    const p = projectData.projects[i]; if (!p) return;
    onSelect(p.name); vibrate();
    chips.current?.children[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };
  const swipe = useSwipe({ onLeft: () => pick(idx + 1), onRight: () => pick(idx - 1) });
  const labels = { completed: "Completed", ongoing: "In progress", pending: "Pending" };

  return (
    <section id="ch-progress" ref={ref} className="chapter scene-chapter" {...dragHandlers}>
      <div className="wrap">
        <div className="half-right">
          <ChapterHead n={3} label="Construction progress" visible={visible}
            title={<><Rise>Track every</Rise><Rise d={0.12}><em>milestone</em></Rise></>}
            lede="Pick a project — the site model shows where it stands today." />
          <div className={`fade-up ${visible ? "in" : ""}`} style={{ "--d": ".2s" }}>
            <div className="chips" ref={chips} role="tablist" aria-label="Projects">
              {projectData.projects.map((p, i) => (
                <button key={p.name} role="tab" aria-selected={i === idx} className={`chip glass ${i === idx ? "on" : ""}`} onClick={() => pick(i)}>
                  {p.name}{p.status === "Ongoing" && <span className="wa-dot" style={{ background: "var(--gold)", boxShadow: "0 0 0 3px rgba(220,189,108,.2)", width: 6, height: 6 }} />}
                </button>
              ))}
            </div>
            <div className="panel prog-card" {...swipe}>
              <div className="prog-top">
                <div>
                  <div className="serif" style={{ fontSize: "clamp(26px, 3vw, 34px)", lineHeight: 1.05 }}>{project.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--fg3)", marginTop: 10 }}>{project.status}{project.eta ? ` · ETA ${project.eta}` : ""} · {project.area}</div>
                </div>
                <div className="prog-pct"><RollingNumber value={String(pct)} stagger={0.04} /><small>%</small></div>
              </div>
              <div className="prog-bar"><i style={{ width: `${pct}%` }} /></div>
              <ol className="stage-rows">
                {STAGES.map((s, i) => (
                  <li key={s} className={`stage-row ${stages[i]}`}>
                    <span className="dot">{stages[i] === "completed" ? <Check size={14} /> : stages[i] === "ongoing" ? <Clock size={13} /> : <span style={{ fontSize: 10 }} className="mono">{i + 1}</span>}</span>
                    <span><b>{s}</b><small>{labels[stages[i]]}</small></span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────── 04 STORIES ─────────────────────────── */
const StoriesChapter = ({ folderImages }) => {
  const isMobile = useIsMobile();
  const finePointer = useFinePointer();
  const { ref, visible } = useReveal(0.15);
  const [story, setStory] = useState({ open: false, folder: "", images: [], idx: 0 });
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(4000);
  const [dragY, setDragY] = useState(0);
  const touch = useRef(null);
  const raf = useRef(0);
  const elapsed = useRef(0);
  useLockBodyScroll(story.open);

  const sectorSubtitles = {
    "sec 4": "Residential Project",
    "sec 9": "Residential Development",
    "sec 46": "Premium Floors",
    "sec 42": "Under Construction",
    "reliance met city": "New Launch",
  };

  const folders = ["sec 4", "sec 9", "sec 46", "sec 42", "reliance met city"]
    .map((d) => Object.keys(folderImages).find((k) => k.toLowerCase() === d)).filter(Boolean);

  const open = (folder) => {
    const imgs = folderImages[folder] || []; if (!imgs.length) return;
    elapsed.current = 0; setProgress(0); setPaused(false); setDuration(4000); setDragY(0);
    setStory({ open: true, folder, images: imgs, idx: 0 });
    audio.whoosh(0.6);
  };
  const close = () => { setStory({ open: false, folder: "", images: [], idx: 0 }); setDragY(0); setPaused(false); };
  const show = (i) => {
    if (i < 0) { elapsed.current = 0; setProgress(0); return; }
    if (i >= story.images.length) { close(); return; }
    elapsed.current = 0; setProgress(0); setDuration(4000);
    setStory((s) => ({ ...s, idx: i }));
  };
  const next = () => show(story.idx + 1);
  const prev = () => show(story.idx - 1);

  useEffect(() => {
    if (!story.open || paused) return;
    const start = performance.now() - elapsed.current;
    const run = (now) => {
      elapsed.current = now - start;
      const p = Math.min(1, elapsed.current / duration);
      setProgress(p);
      if (p >= 1) { show(story.idx + 1); return; }
      raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf.current);
  }, [story.open, story.idx, paused, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!story.open) return;
    const h = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") { e.preventDefault(); setPaused((p) => !p); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [story.open, story.idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const onTouchStart = (e) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY, time: Date.now() }; setPaused(true); };
  const onTouchMove = (e) => {
    if (!touch.current) return;
    const t = e.touches[0]; const dy = t.clientY - touch.current.y; const dx = t.clientX - touch.current.x;
    if (dy > 0 && Math.abs(dy) > Math.abs(dx)) setDragY(dy);
  };
  const onTouchEnd = (e) => {
    const st = touch.current; touch.current = null; if (!st) return;
    e.preventDefault();
    const t = e.changedTouches[0]; const dx = t.clientX - st.x; const dy = t.clientY - st.y; const held = Date.now() - st.time;
    setPaused(false);
    if (dy > 110 && Math.abs(dy) > Math.abs(dx)) { close(); return; }
    setDragY(0);
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { if (dx > 0) prev(); else next(); return; }
    if (held < 250 && Math.abs(dx) < 10 && Math.abs(dy) < 10) { if (t.clientX < window.innerWidth * 0.33) prev(); else next(); }
  };

  const cur = story.images[story.idx];
  return (
    <section id="ch-stories" ref={ref} className="chapter">
      <div className="wrap">
        <ChapterHead n={4} label="Live site stories" center visible={visible}
          title={<><Rise>See the work</Rise><Rise d={0.12}><em>in progress</em></Rise></>}
          lede="Real on-site updates from every sector — tap a circle to watch." />
      </div>
      <div className={`story-row ${visible ? "in" : ""}`}>
        {folders.map((f, i) => {
          const key = f.toLowerCase();
          return (
            <button key={f} className="story fade-up" style={{ "--d": `${0.1 * i}s` }} onClick={() => open(f)} aria-label={`Watch ${folderLabel(f)} stories`}>
              <div className="story-ring">
                {key === "reliance met city" && <span className="tag tag-live story-new" style={{ background: "#0b0d12" }}>New</span>}
                <div><img src={(folderImages[f] || [])[0] || projectData.images[0]} alt="" loading="lazy" /></div>
              </div>
              <div className="story-name">{folderLabel(f)}</div>
              <div className="story-sub">{sectorSubtitles[key] || ""}</div>
              <div className="story-sub" style={{ marginTop: 3, color: "var(--fg2)" }}>{(folderImages[f] || []).length} updates</div>
            </button>
          );
        })}
      </div>

      {story.open && (
        <div className="viewer" role="dialog" aria-modal="true" aria-label={`${folderLabel(story.folder)} stories`}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          onMouseDown={() => finePointer && setPaused(true)} onMouseUp={() => finePointer && setPaused(false)}
          style={{ background: `rgba(0,0,0,${1 - Math.min(dragY / 400, 0.6)})` }}>
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${dragY}px) scale(${1 - Math.min(dragY / 2000, 0.1)})`, transition: dragY ? "none" : "transform .25s ease" }}>
            <div className="viewer-bars">
              {story.images.map((_, i) => <div key={i}><i style={{ width: i < story.idx ? "100%" : i === story.idx ? `${progress * 100}%` : "0%" }} /></div>)}
            </div>
            <div className="viewer-head">
              <div style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,.85)", flexShrink: 0 }}>
                <img src={story.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="serif" style={{ fontSize: 18 }}>{folderLabel(story.folder)}</div>
                <div className="mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{story.idx + 1} / {story.images.length}{paused && !dragY ? " · Paused" : ""}</div>
              </div>
              <button className="hud-icon glass" aria-label="Close stories" onClick={close} onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); close(); }}><X size={18} /></button>
            </div>
            <div style={{ position: "absolute", inset: 0, padding: "calc(74px + env(safe-area-inset-top)) 0 calc(44px + env(safe-area-inset-bottom))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: isMobile ? "100%" : 620, height: "100%", borderRadius: isMobile ? 0 : 18, overflow: "hidden" }}>
                {isVideo(cur) ? (
                  <video key={cur} src={cur} playsInline autoPlay muted preload="metadata" style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    onLoadedMetadata={(e) => { const d = e.target.duration; elapsed.current = 0; setDuration(d > 0 && isFinite(d) ? d * 1000 : 4000); }} onEnded={next} />
                ) : (
                  <img key={cur} src={cur} alt={`${folderLabel(story.folder)} — update ${story.idx + 1}`} draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain", animation: "fadeIn .3s ease" }} />
                )}
              </div>
            </div>
            {!isMobile && (
              <>
                <div style={{ position: "absolute", left: 0, top: 90, bottom: 40, width: "35%", cursor: "w-resize" }} onClick={prev} />
                <div style={{ position: "absolute", right: 0, top: 90, bottom: 40, width: "35%", cursor: "e-resize" }} onClick={next} />
                <button className="hud-icon glass lb-nav" style={{ left: "max(16px, calc(50% - 380px))" }} onClick={prev} aria-label="Previous"><ChevronLeft size={20} /></button>
                <button className="hud-icon glass lb-nav" style={{ right: "max(16px, calc(50% - 380px))" }} onClick={next} aria-label="Next"><ChevronRight size={20} /></button>
              </>
            )}
            <div className="viewer-hint">{isMobile ? "Tap to skip · Hold to pause · Swipe down to close" : "← → navigate · Space pause · Esc close"}</div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ─────────────────────────── 05 GALLERY ─────────────────────────── */
const GalleryChapter = ({ folderImages }) => {
  const isMobile = useIsMobile();
  const { ref, visible } = useReveal(0.12);
  const strip = useDragScroll();
  const thumbs = useRef(null);
  const [scrollP, setScrollP] = useState(0);
  const [lb, setLb] = useState({ open: false, folder: "", items: [], index: 0 });
  useLockBodyScroll(lb.open);

  const projectDesc = {
    "sec 4": "Delivered residential project with premium quality finishing and handed over to all owners.",
    "sec 9": "Completed development with modern planning and family-friendly design approach.",
    "sec 46": "Premium housing cluster — ready-to-move homes with landscaped surroundings.",
    "sec 42": "Active development site — structural and finishing work ongoing at pace.",
    "reliance met city": "Newly launched project in a rapidly growing urban infrastructure zone.",
  };
  const projectSubtitle = {
    "sec 4": "Completed Residential Floors",
    "sec 9": "Delivered Housing Project",
    "sec 46": "Premium Residential Development",
    "sec 42": "Ongoing Construction",
    "reliance met city": "New Development · Just Launched",
  };

  const keys = Object.keys(folderImages);
  const resolve = (name) => keys.find((k) => k.toLowerCase().trim() === name);
  const cards = [
    ...["sec 4", "sec 9", "sec 46"].map((f) => ({ f: resolve(f), done: true })),
    ...["sec 42", "reliance met city"].map((f) => ({ f: resolve(f), done: false })),
  ].filter((c) => c.f && (folderImages[c.f] || []).some((s) => !isVideo(s)));

  const openLb = (f) => { const items = (folderImages[f] || []).filter((s) => !isVideo(s)); setLb({ open: true, folder: f, items, index: 0 }); audio.whoosh(0.5); };
  const closeLb = () => setLb((s) => ({ ...s, open: false }));
  const go = (d) => setLb((s) => ({ ...s, index: (s.index + d + s.items.length) % s.items.length }));
  const swipe = useSwipe({ onLeft: () => go(1), onRight: () => go(-1), onDown: closeLb });

  useEffect(() => {
    if (!lb.open) return;
    thumbs.current?.children[lb.index]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    const h = (e) => { if (e.key === "Escape") closeLb(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lb.open, lb.index]);

  const onScroll = (e) => { const el = e.currentTarget; const max = el.scrollWidth - el.clientWidth; setScrollP(max > 0 ? el.scrollLeft / max : 0); };
  const nudge = (d) => { const el = strip.current; if (!el) return; el.scrollBy({ left: d * el.clientWidth * 0.7, behavior: "smooth" }); };

  return (
    <section id="ch-gallery" ref={ref} className="chapter">
      <div className="wrap">
        <ChapterHead n={5} label="Photo gallery" visible={visible}
          title={<><Rise>Every project,</Rise><Rise d={0.12}><em>documented</em></Rise></>}
          lede={isMobile ? "Swipe through each site — tap to open its photos." : "Drag or scroll through each site — click to open its photos."} />
      </div>
      <div className={`strip ${visible ? "in" : ""}`} ref={strip} onScroll={onScroll}>
        {cards.map(({ f, done }, i) => {
          const items = (folderImages[f] || []).filter((s) => !isVideo(s));
          const key = f.toLowerCase();
          return (
            <button key={f} className="gcard fade-up" style={{ "--d": `${0.08 * i}s` }} onClick={() => openLb(f)} aria-label={`Open ${folderLabel(f)} gallery, ${items.length} photos`}>
              <img src={items[0]} alt="" loading="lazy" draggable={false} />
              <div className="gcard-top">
                <span className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,.85)" }}>{String(i + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</span>
                <span className={`tag ${done ? "tag-done" : "tag-live"}`} style={{ background: "rgba(0,0,0,.45)" }}>{done ? "Completed" : key === "reliance met city" ? "New launch" : "Ongoing"}</span>
              </div>
              <div className="gcard-body">
                <div className="mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,.7)", marginBottom: 10 }}>{projectSubtitle[key] || ""}</div>
                <h3>{folderLabel(f)}</h3>
                <p>{projectDesc[key] || ""}</p>
                <span className="gcard-open">{items.length} photos <ArrowUpRight size={14} /></span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="wrap strip-ctrl">
        <div className="strip-track" aria-hidden="true"><i style={{ transform: `scaleX(${0.15 + scrollP * 0.85})` }} /></div>
        <button className="icon-circle glass" onClick={() => nudge(-1)} aria-label="Scroll gallery left"><ChevronLeft size={18} /></button>
        <button className="icon-circle glass" onClick={() => nudge(1)} aria-label="Scroll gallery right"><ChevronRight size={18} /></button>
      </div>

      {lb.open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${folderLabel(lb.folder)} photos`} {...swipe} onClick={closeLb}>
          <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px var(--gutter)" }}>
            <div>
              <div className="serif" style={{ fontSize: "clamp(22px, 3vw, 30px)", lineHeight: 1 }}>{folderLabel(lb.folder)}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--fg3)", marginTop: 6 }}>{String(lb.index + 1).padStart(2, "0")} / {String(lb.items.length).padStart(2, "0")}</div>
            </div>
            <button className="hud-icon glass" onClick={closeLb} aria-label="Close gallery"><X size={18} /></button>
          </div>
          <div className="lb-stage">
            <img key={lb.index} src={lb.items[lb.index]} alt={`${folderLabel(lb.folder)} — ${lb.index + 1} of ${lb.items.length}`} draggable={false} onClick={(e) => e.stopPropagation()} />
            {lb.items.length > 1 && (
              <>
                <button className="hud-icon glass lb-nav" style={{ left: "clamp(10px, 2vw, 28px)" }} onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo"><ChevronLeft size={20} /></button>
                <button className="hud-icon glass lb-nav" style={{ right: "clamp(10px, 2vw, 28px)" }} onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo"><ChevronRight size={20} /></button>
              </>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <div className="thumbs" ref={thumbs}>
              {lb.items.map((src, i) => (
                <button key={i} className={i === lb.index ? "on" : ""} onClick={() => setLb((s) => ({ ...s, index: i }))} aria-label={`Photo ${i + 1}`}><img src={src} alt="" loading="lazy" /></button>
              ))}
            </div>
            <div className="viewer-hint" style={{ position: "static", padding: "8px 0 12px" }}>{isMobile ? "Swipe to browse · Swipe down to close" : "← → browse · Esc close"}</div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ─────────────────────────── 06 BEFORE / AFTER ─────────────────────────── */
const TransformChapter = () => {
  const isMobile = useIsMobile();
  const { ref, visible } = useReveal(0.15);
  const [x, setX] = useState(50);
  const [drag, setDrag] = useState(false);
  const box = useRef(null);

  let beforeImg, afterImg;
  try { beforeImg = require("./data/beforeafter/before.jpeg"); } catch (e) {}
  try { afterImg = require("./data/beforeafter/After.jpeg"); } catch (e) {}

  // Fallback to stock images
  if (!beforeImg) beforeImg = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900";
  if (!afterImg) afterImg = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900";

  const update = (clientX) => { const r = box.current?.getBoundingClientRect(); if (!r) return; setX(Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100))); };
  return (
    <section id="ch-transform" ref={ref} className="chapter">
      <div className="wrap">
        <ChapterHead n={6} label="Before & after" center visible={visible}
          title={<><Rise>The transformation</Rise><Rise d={0.12}><em>speaks for itself</em></Rise></>}
          lede={isMobile ? "Slide across the photo to compare." : "Drag across the photo — or use the ← → keys — to compare."} />
        <div className={`fade-up ${visible ? "in" : ""}`} style={{ "--d": ".2s" }}>
          <div ref={box} className="ba" role="slider" tabIndex={0} aria-label="Before and after comparison" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(x)}
            onPointerDown={(e) => { setDrag(true); update(e.clientX); try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {} }}
            onPointerMove={(e) => drag && update(e.clientX)} onPointerUp={() => setDrag(false)} onPointerCancel={() => setDrag(false)}
            onKeyDown={(e) => { if (e.key === "ArrowLeft") { e.preventDefault(); setX((v) => Math.max(4, v - 5)); } if (e.key === "ArrowRight") { e.preventDefault(); setX((v) => Math.min(96, v + 5)); } }}>
            <img src={afterImg} alt="After" draggable={false} loading="lazy" />
            <img src={beforeImg} alt="Before" draggable={false} loading="lazy" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }} />
            <span className="ba-label glass" style={{ left: 18 }}>Before</span>
            <span className="ba-label glass" style={{ right: 18 }}>After</span>
            <span className="ba-line" style={{ left: `${x}%` }} />
            <span className="ba-handle glass" style={{ left: `${x}%`, transition: drag ? "none" : "left .3s var(--ease)" }}>
              <span style={{ display: "flex" }}><ChevronLeft size={16} /><ChevronRight size={16} /></span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────── 07 GURUGRAM ─────────────────────────── */
const LocationsChapter = () => {
  const { ref, visible } = useReveal(0.12);
  const [active, setActive] = useState(0);
  const chipRow = useRef(null);

  const zones = [
    {
      name: "Central Gurugram",
      icon: "🏘️",
      color: "#2B5BA8",
      sectors: ["Sector 4", "Sector 7", "Sector 9", "Sector 10", "Sector 10A", "Sector 14", "Sector 15"],
      description: "Established residential zones with top schools, local markets, and strong community infrastructure. Ideal for families seeking a well-connected, mature neighbourhood.",
      highlights: ["Excellent school belt", "Mature infrastructure", "Strong resale value", "Active community life"],
      tag: "Established",
      tagColor: "#16a34a",
    },
    {
      name: "Golf Course Road & DLF Phases",
      icon: "🏌️",
      color: "#C9A84C",
      sectors: ["DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "DLF Phase 4", "DLF Phase 5", "Sector 42", "Sector 43"],
      description: "Premium residential and commercial corridor with luxury apartments, high-end developments, and a cosmopolitan lifestyle. The most prestigious address in Gurugram.",
      highlights: ["Luxury living zone", "Top-tier connectivity", "Premium amenities", "High rental demand"],
      tag: "Premium",
      tagColor: "#92400e",
    },
    {
      name: "Golf Course Extension Road",
      icon: "🛣️",
      color: "#7c3aed",
      sectors: ["Sector 55", "Sector 56", "Sector 57", "Sector 58", "Sector 59", "Sector 65", "Sector 66"],
      description: "Rapidly growing residential belt with modern apartments, superior connectivity, and a blend of affordable and mid-segment housing options close to key business hubs.",
      highlights: ["High growth corridor", "Modern developments", "Good connectivity", "Investment potential"],
      tag: "Growing",
      tagColor: "#6d28d9",
    },
    {
      name: "Sohna Road & South Gurugram",
      icon: "🌆",
      color: "#059669",
      sectors: ["Sector 46", "Sector 47", "Sector 48", "Sector 49", "Sector 50", "Sector 51", "Sector 67"],
      description: "Popular residential areas with malls, offices and strong social infrastructure. A balanced mix of residential comfort and commercial convenience.",
      highlights: ["Great social infrastructure", "Mall proximity", "IT office belt", "Balanced living"],
      tag: "Balanced",
      tagColor: "#065f46",
    },
    {
      name: "Dwarka Expressway Corridor",
      icon: "🚀",
      color: "#dc2626",
      sectors: ["Sector 102", "Sector 103", "Sector 104", "Sector 105", "Sector 106", "Sector 107", "Sector 108"],
      description: "High-growth investment corridor with upcoming metro connectivity, infrastructure development, and strong appreciation potential driven by proximity to Delhi.",
      highlights: ["Upcoming metro line", "Delhi proximity", "High appreciation", "Infrastructure boom"],
      tag: "High Growth",
      tagColor: "#991b1b",
    },
    {
      name: "New Gurugram",
      icon: "🏗️",
      color: "#0891b2",
      sectors: ["Sector 82", "Sector 83", "Sector 84", "Sector 85", "Sector 86", "Sector 88", "Sector 89"],
      description: "Emerging residential hubs with modern township developments, planned infrastructure, and affordable pricing that makes them ideal for first-time buyers and investors.",
      highlights: ["Planned townships", "Affordable entry", "Future-ready", "Township living"],
      tag: "Emerging",
      tagColor: "#0c4a6e",
    },
    {
      name: "Industrial & Smart City",
      icon: "🏭",
      color: "#65a30d",
      sectors: ["Reliance MET City", "Manesar", "IMT Manesar", "Sector 80", "Sector 81"],
      description: "Industrial and smart city developments driving future economic growth. Reliance MET City represents the next generation of integrated urban living and investment.",
      highlights: ["Reliance MET City launch", "Smart city planning", "Industrial growth", "Future investment"],
      tag: "New Launch",
      tagColor: "#16a34a",
    },
  ];

  const coverageList = [
    "Sector 4", "Sector 9", "Sector 42", "Sector 46",
    "DLF Phase 1–5", "Golf Course Road", "Golf Course Extension Road",
    "Sohna Road", "Dwarka Expressway", "New Gurugram", "Reliance MET City",
    "MG Road", "Sector 43", "Sector 56", "Sector 57", "Manesar",
  ];

  const pick = (i) => {
    const n = Math.max(0, Math.min(zones.length - 1, i));
    setActive(n);
    chipRow.current?.children[n]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };
  const swipe = useSwipe({ onLeft: () => { pick(active + 1); vibrate(); }, onRight: () => { pick(active - 1); vibrate(); } });
  const z = zones[active];

  return (
    <section id="ch-locations" ref={ref} className="chapter">
      <div className="wrap">
        <ChapterHead n={7} label="Our service area" visible={visible}
          title={<><Rise>Our projects across</Rise><Rise d={0.12}><em>Gurugram</em></Rise></>}
          lede="From established residential sectors to emerging investment zones — serving clients across all major micro-markets in Gurugram." />

        <div className={`zones fade-up ${visible ? "in" : ""}`} style={{ "--d": ".2s" }}>
          <div className="zone-list" role="tablist" aria-label="Zones">
            {zones.map((zz, i) => (
              <button key={zz.name} role="tab" aria-selected={i === active} className={`zone-btn ${i === active ? "on" : ""}`} onClick={() => pick(i)}>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <b>{zz.name}</b>
                <span className="zdot" style={{ background: zz.color }} />
              </button>
            ))}
          </div>

          <div>
            <div className="chips zone-chips" ref={chipRow} role="tablist" aria-label="Zones" style={{ marginBottom: 12 }}>
              {zones.map((zz, i) => (
                <button key={zz.name} role="tab" aria-selected={i === active} className={`chip glass ${i === active ? "on" : ""}`} onClick={() => pick(i)}>{zz.name}</button>
              ))}
            </div>
            <div key={active} className="panel zone-card" {...swipe}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span className="tag" style={{ background: `${z.color}2e`, color: "#fff" }}><span className="wa-dot" style={{ background: z.color, boxShadow: "none" }} />{z.tag}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg3)" }}>Zone {String(active + 1).padStart(2, "0")} / {String(zones.length).padStart(2, "0")}</span>
              </div>
              <h3 className="serif" style={{ fontWeight: 400, fontSize: "clamp(28px, 3.4vw, 42px)", lineHeight: 1.05, margin: "18px 0 14px" }}>{z.name}</h3>
              <p className="lede" style={{ maxWidth: 640 }}>{z.description}</p>
              <div className="hl-grid">
                {z.highlights.map((hh) => <div key={hh} className="hl"><i style={{ background: z.color }} />{hh}</div>)}
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--fg3)", marginTop: 28 }}>Areas covered</div>
              <div className="sector-pills">{z.sectors.map((s) => <span key={s}>{s}</span>)}</div>
            </div>
          </div>
        </div>

        <div className={`fade-up ${visible ? "in" : ""}`} style={{ "--d": ".35s", marginTop: "clamp(48px, 8vh, 80px)", textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--fg3)" }}>Key areas we work in</div>
          <div className="cloud">{coverageList.map((a) => <span key={a}>{a}</span>)}</div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────── 08 WHY ─────────────────────────── */
const WhyChapter = () => {
  const { ref, visible } = useReveal(0.12);

  const reasons = [
    { icon: "🚇", title: "Delhi Connectivity", desc: "Direct metro lines, NH-48, and Dwarka Expressway offer seamless access to Delhi — a key driver of demand and resale value.", stat: "30 min", statLabel: "to Delhi by metro" },
    { icon: "📈", title: "Rapid Infrastructure", desc: "Massive investments in metro expansion, expressways, smart city projects, and commercial hubs make Gurugram one of India's fastest-growing cities.", stat: "₹50K Cr+", statLabel: "infra investment" },
    { icon: "💰", title: "High Rental Demand", desc: "Home to 250+ Fortune 500 companies, Gurugram generates consistent rental demand from corporate professionals across all sectors.", stat: "6–8%", statLabel: "avg rental yield" },
    { icon: "🏆", title: "Investment Growth", desc: "Property appreciation of 15–25% in key micro-markets over the past 3 years, with Dwarka Expressway and New Gurugram leading the surge.", stat: "25%+", statLabel: "appreciation in key zones" },
    { icon: "🏫", title: "World-class Amenities", desc: "Premium schools, hospitals, malls, golf courses, and international restaurants create a lifestyle that attracts both buyers and renters.", stat: "500+", statLabel: "schools & colleges" },
    { icon: "🌆", title: "Emerging Zones", desc: "New Gurugram, Dwarka Expressway, and Reliance MET City represent the next wave of affordable yet appreciating real estate opportunities.", stat: "3 zones", statLabel: "of high growth" },
  ];

  return (
    <section id="ch-why" ref={ref} className="chapter">
      <div className="wrap">
        <ChapterHead n={8} label="Why invest here" visible={visible}
          title={<><Rise>Why</Rise><Rise d={0.12}><em>Gurugram</em></Rise></>}
          lede="India's Millennium City — a convergence of world-class infrastructure, corporate investment, and real estate opportunity." />
        <div className={`why-grid ${visible ? "in" : ""}`}>
          {reasons.map((r, i) => (
            <article key={r.title} className="why fade-up" style={{ "--d": `${0.07 * i}s` }}>
              <div>
                <div className="why-stat">{r.stat}</div>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--fg3)", marginTop: 10 }}>{r.statLabel}</div>
              </div>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </article>
          ))}
        </div>
        <div className={`panel fade-up ${visible ? "in" : ""}`} style={{ "--d": ".4s", marginTop: 20, padding: "clamp(24px, 3vw, 36px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div className="serif" style={{ fontSize: "clamp(24px, 2.6vw, 32px)" }}>Ready to invest in Gurugram?</div>
            <p style={{ color: "var(--fg2)", marginTop: 6, fontSize: 15 }}>Speak to our team about ongoing projects, site visits, and investment options.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="pill pill-solid" href={`tel:${PHONE}`}><Phone size={17} /> Call now</a>
            <a className="pill glass" href={`${WA_URL}?text=Hi%2C%20I%27m%20interested%20in%20investing%20in%20Gurugram.`} target="_blank" rel="noreferrer"><span className="wa-dot" /> WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────── 09 FAQ ─────────────────────────── */
const FAQChapter = () => {
  const { ref, visible } = useReveal(0.1);
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    // { q: "What is the RERA registration number?", a: "ShineOne Estate is RERA registered with number P51900052847. All our projects comply fully with RERA regulations, ensuring complete transparency in construction timelines, costs, and delivery." },
    { q: "What are the current ongoing projects?", a: "We currently have two active projects — Sector 42, Gurugram (78% complete, handover June 2026) and Reliance MET City (8% complete, newly launched, handover June 2027). Both projects are on schedule." },
    { q: "What types of properties are available?", a: "We offer Plots, Flats, Independent Floors, and full Construction services. Properties range from ₹2.5 Cr to ₹4.8 Cr across Gurugram's most sought-after sectors — 4, 9, 42, and 46." },
    { q: "What materials and brands are used in construction?", a: "We use only premium certified materials — UltraTech Cement (ISO 9001:2015), Tata Tiscon Steel (BIS Certified), Kajaria Premium Tiles, Polycab wiring (ISI Mark), Astral pipes, and Dr. Fixit waterproofing. All materials come with quality certificates." },
    { q: "How can I track construction progress?", a: "You get daily construction logs with photos, weekly stories per sector, and real-time progress percentage updates right on this website. We believe in complete transparency — you can see exactly what's happening on site every single day." },
    { q: "Can I book a site visit?", a: "Absolutely! WhatsApp us at +91 93109 94032 or call directly. We arrange guided site visits on working days with our site manager. You'll get a full tour of the construction, material storage, and quality checks." },
    { q: "What is the payment structure?", a: "Payment is milestone-linked — tied to actual construction stages (Foundation, Structure, Finishing, etc.). This ensures you only pay as real work gets completed. Full details are shared at the time of booking." },
    { q: "Are the completed projects available for reference visits?", a: "Yes! Our completed projects in Sector 4, 9, and 46 can be visited to see the quality of finish, materials, and workmanship firsthand. Many buyers find this very reassuring before making a decision." },
  ];

  return (
    <section id="ch-faq" ref={ref} className="chapter">
      <div className="wrap" style={{ maxWidth: 980 }}>
        <ChapterHead n={9} label="FAQ" visible={visible}
          title={<><Rise>Common questions</Rise><Rise d={0.12}><em>answered</em></Rise></>}
          lede="Everything you need to know before making your decision." />
        <div className={`faq ${visible ? "in" : ""}`}>
          {faqs.map((f, i) => {
            const open = openIdx === i;
            return (
              <div key={f.q} className={`faq-item fade-up ${open ? "open" : ""}`} style={{ "--d": `${0.05 * i}s` }}>
                <button className="faq-q" onClick={() => setOpenIdx(open ? -1 : i)} aria-expanded={open}>
                  <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                  <b>{f.q}</b>
                  <span className="faq-plus glass"><Plus size={18} /></span>
                </button>
                <div className="faq-a"><div><p>{f.a}</p></div></div>
              </div>
            );
          })}
        </div>
        <div className={`fade-up ${visible ? "in" : ""}`} style={{ "--d": ".35s", marginTop: 36, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="serif" style={{ fontSize: 24 }}>Still have questions?</div>
            <div style={{ color: "var(--fg2)", marginTop: 4, fontSize: 15 }}>Our team responds within minutes on WhatsApp</div>
          </div>
          <a className="pill pill-solid" href={`${WA_URL}?text=Hi%2C%20I%20have%20a%20question%20about%20ShineOne%20Estate.`} target="_blank" rel="noreferrer"><WhatsAppIcon size={17} /> Ask on WhatsApp</a>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────── 10 CONTACT ─────────────────────────── */
const ContactChapter = () => {
  const { ref, visible } = useReveal(0.12);
  let profileImg = null;
  try { profileImg = require("./data/Profile/my_img.jpeg"); } catch (e) {}
  const footProjects = [["Sector 4", "Completed"], ["Sector 9", "Completed"], ["Sector 46", "Completed"], ["Sector 42", "Ongoing"], ["Reliance MET City", "NEW"]];

  return (
    <section id="ch-contact" ref={ref} className="chapter" style={{ paddingBottom: "calc(110px + env(safe-area-inset-bottom))" }}>
      <div className="wrap">
        <ChapterHead n={10} label="Get in touch" visible={visible}
          title={<><Rise>Let's build your</Rise><Rise d={0.12}><em>dream together</em></Rise></>} />
        <div className={`panel contact-card fade-up ${visible ? "in" : ""}`} style={{ "--d": ".2s" }}>
          <div className="avatar">{profileImg ? <img src={profileImg} alt="Parveen Chawla" loading="lazy" /> : <div style={{ display: "grid", placeItems: "center", background: "#1a1d26" }} className="serif">PC</div>}</div>
          <div>
            <div className="serif" style={{ fontSize: "clamp(30px, 3.4vw, 44px)", lineHeight: 1 }}>Parveen Chawla</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--fg3)", marginTop: 10 }}>Founder · ShineOne Estate</div>
            <div className="contact-actions">
              <a className="pill pill-solid" href={`tel:${PHONE}`}><Phone size={17} /> +91 93109 94032</a>
              <a className="pill glass" href={WA_URL} target="_blank" rel="noreferrer"><span className="wa-dot" /> WhatsApp chat</a>
              <a className="pill glass" href={`mailto:${EMAIL}`} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{EMAIL}</a>
            </div>
          </div>
        </div>

        <footer className="foot">
          <div>
            <div className="serif" style={{ fontSize: 32 }}>ShineOne Estate</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--fg3)", marginTop: 8 }}>We build your vision</div>
            <p style={{ color: "var(--fg2)", fontSize: 14.5, lineHeight: 1.8, marginTop: 16, maxWidth: 380 }}>Premium residential development focused on transparent construction, quality materials and timely delivery across Gurugram's key sectors.</p>
          </div>
          <div>
            <h4>Projects</h4>
            {footProjects.map(([n, s]) => (
              <div key={n} className="foot-row"><span>{n}</span><span className="mono" style={{ fontSize: 10.5, color: s === "Completed" ? "#86efac" : "var(--sand)" }}>{s}</span></div>
            ))}
          </div>
          <div>
            <h4>Contact</h4>
            <div className="foot-row"><a href={`tel:${PHONE}`}>+91 93109 94032</a><ArrowUpRight size={14} /></div>
            <div className="foot-row"><a href={`mailto:${EMAIL}`} style={{ overflowWrap: "anywhere" }}>{EMAIL}</a><ArrowUpRight size={14} /></div>
            <div className="foot-row"><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><MapPin size={14} /> Gurugram, Haryana</span></div>
          </div>
        </footer>
        <div className="foot-base"><span>© 2026 ShineOne Estate</span><span>Built with transparency and trust</span></div>
      </div>
    </section>
  );
};

/* ─────────────────────────── APP ─────────────────────────── */
export default function App() {
  const folderImages = useBackendMedia();
  const reduced = useReducedMotion();
  const finePointer = useFinePointer();
  const [entered, setEntered] = useState(() => { try { return sessionStorage.getItem("s1-entered") === "1"; } catch (e) { return false; } });
  const [selected, setSelected] = useState(projectData.projects.find((p) => p.status === "Ongoing")?.name || projectData.projects[0].name);
  const active = useStore((s) => s.active);
  const host = useRef(null);
  const scene = useRef(null);
  const [sceneFailed, setSceneFailed] = useState(false);
  useLockBodyScroll(!entered);

  // Start at the top when arriving (the gate expects the plot to be empty)
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    if (!entered) window.scrollTo(0, 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3D site
  useEffect(() => {
    try { scene.current = new SiteScene(host.current, { reduced }); }
    catch (e) { setSceneFailed(true); return undefined; }
    const s = scene.current;
    const onResize = () => s.resize();
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); s.dispose(); scene.current = null; };
  }, [reduced]);

  // Scroll → chapter position, ground build progress
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const vh = window.innerHeight; const mid = vh * 0.5;
      let idx = 0, frac = 0;
      CHAPTERS.forEach((c, i) => {
        const el = document.getElementById(`ch-${c.id}`); if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top <= mid) { idx = i; frac = Math.min(1, Math.max(0, (mid - r.top) / r.height)); }
      });
      const g = document.getElementById("ch-ground");
      let ground = store.ground;
      if (g) { const r = g.getBoundingClientRect(); ground = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh * 1.15))); }
      store.set({ pos: idx + frac, active: idx, ground });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  // Drive the 3D site from chapter + selections
  useEffect(() => {
    const apply = (st) => {
      const s = scene.current; if (!s) return;
      const ch = CHAPTERS[st.active];
      const proj = projectData.projects.find((p) => p.name === selected) || projectData.projects[0];
      const p = st.active === 0 ? (entered ? st.ground : 0) : st.active === 1 ? 1 : st.active === 2 ? projectSceneP(proj) : 1;
      s.setProgress(p);
      if (ch.scene) s.setFraming(ch.scene);
      s.setNight(ch.night ?? 0.6);
      s.setActive(st.active < SCENE_CHAPTERS + 1 && !document.hidden);
    };
    apply(store);
    store.subs.add(apply);
    const onVis = () => apply(store);
    document.addEventListener("visibilitychange", onVis);
    return () => { store.subs.delete(apply); document.removeEventListener("visibilitychange", onVis); };
  }, [selected, entered, sceneFailed]);

  // Chapter changes → sound mood + whoosh
  const lastActive = useRef(active);
  useEffect(() => {
    if (lastActive.current !== active) { audio.whoosh(0.55); lastActive.current = active; }
    audio.setMood(CHAPTERS[active].mood);
  }, [active]);

  // UI click sound
  useEffect(() => {
    const onClick = (e) => { if (e.target.closest?.("button, a")) audio.click(); };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Pointer parallax (mouse only)
  useEffect(() => {
    if (!finePointer) return undefined;
    const onMove = (e) => scene.current?.setPointer(e.clientX / window.innerWidth * 2 - 1, e.clientY / window.innerHeight * 2 - 1);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [finePointer]);

  // Drag (mouse or horizontal finger) to turn the site model
  const drag = useRef(null);
  const dragHandlers = {
    onPointerDown: (e) => { if (e.target.closest("a, button, input, .panel, .chips")) return; drag.current = { x: e.clientX, id: e.pointerId }; },
    onPointerMove: (e) => { if (!drag.current || drag.current.id !== e.pointerId) return; const dx = e.clientX - drag.current.x; drag.current.x = e.clientX; scene.current?.dragBy(dx); },
    onPointerUp: () => { drag.current = null; },
    onPointerCancel: () => { drag.current = null; },
    style: { touchAction: "pan-y" },
  };

  const enter = () => {
    try { sessionStorage.setItem("s1-entered", "1"); } catch (e) {}
    setEntered(true);
  };
  const selectProject = (name) => { setSelected(name); goToChapter(2); };

  const bgKey = CHAPTERS[active].bg;
  const fallbackImg = (folderImages?.["Caraousel"] || folderImages?.["caraousel"] || projectData.images)[0];

  return (
    <div className="xp">
      <Styles />
      <div className="bg" aria-hidden="true">
        {["dawn", "dusk", "blueprint", "night", "ember", "close"].map((k) => <div key={k} className={`bg-${k} ${bgKey === k ? "on" : ""}`} />)}
      </div>
      <div className={`scene-host ${active >= SCENE_CHAPTERS ? "off" : ""}`} ref={host} aria-hidden="true">
        {sceneFailed && <div className="scene-fallback" style={{ backgroundImage: `url("${fallbackImg}")` }} />}
      </div>
      <div className="grain" aria-hidden="true" />

      {!entered && <EntryGate onEnter={enter} />}
      <Hud hidden={!entered} />

      <main>
        <GroundChapter entered={entered} dragHandlers={dragHandlers} />
        <OverviewChapter onSelectProject={selectProject} />
        <ProgressChapter selected={selected} onSelect={setSelected} dragHandlers={dragHandlers} />
        <StoriesChapter folderImages={folderImages} />
        <GalleryChapter folderImages={folderImages} />
        <TransformChapter />
        <LocationsChapter />
        <WhyChapter />
        <FAQChapter />
        <ContactChapter />
      </main>
      {entered && <ActionBarGate />}
    </div>
  );
}

const ActionBarGate = () => (useIsCompact() ? <ActionBar /> : null);
