import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Award,
  Home,
  X,
  CheckCircle,
  TrendingUp,
  Shield,
  Star,
  ArrowRight,
} from "lucide-react";

/* ─────────────────────────── UTILITIES ─────────────────────────── */
const formatTime = (s = 0) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

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

// Phones / small tablets
const useIsMobile = () => useWindowWidth() <= 768;
// Tablets & small laptops in portrait-ish widths
const useIsTablet = () => { const w = useWindowWidth(); return w > 768 && w < 1024; };
// Anything below a laptop: gets the touch-first layout (bottom action bar, compact hero)
const useIsCompact = () => useWindowWidth() < 1024;

// True only for a real mouse/trackpad — touch laptops & tablets don't get hover-only UI
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

const useLockBodyScroll = (locked) => {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
};

// Horizontal swipe + optional vertical swipe-down detection for touch surfaces.
// Returns handlers to spread on an element and a ref telling whether the last touch was a swipe
// (so a following synthetic click can be ignored).
const useSwipe = ({ onLeft, onRight, onDown, threshold = 45 } = {}) => {
  const start = useRef(null);
  const swiped = useRef(false);
  const onTouchStart = (e) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    swiped.current = false;
  };
  const onTouchEnd = (e) => {
    if (!start.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.2) {
      swiped.current = true;
      if (dx < 0) onLeft?.(); else onRight?.();
    } else if (onDown && dy > threshold * 2 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      swiped.current = true;
      onDown();
    }
  };
  return { handlers: { onTouchStart, onTouchEnd }, swiped };
};

const vibrate = (ms = 8) => { try { navigator.vibrate?.(ms); } catch (e) {} };

const useReducedMotion = () => {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setR(mq.matches); on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return r;
};

const useReveal = (threshold = 0.1) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
};

const useCountUp = (target, duration = 1500, start = false) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, start]);
  return value;
};

/* ─────────────────────────── DATA ─────────────────────────── */
const colors = { cream: "#F5F0E8", lightBlue: "#8FABD4", darkBlue: "#2B5BA8", black: "#0D0D0D", gold: "#C9A84C", navy: "#0C0F1A", muted: "#5f6470", subtle: "#767b85" };

const PHONE = "+919310994032";
const WA_URL = "https://wa.me/919310994032";
const EMAIL = "parveen@shineoneestate.co.in";

// Readable names for the media folders
const FOLDER_LABELS = {
  "sec 4": "Sector 4",
  "sec 9": "Sector 9",
  "sec 46": "Sector 46",
  "sec 42": "Sector 42",
  "reliance met city": "Reliance MET City",
};
const folderLabel = (f) => FOLDER_LABELS[String(f || "").toLowerCase().trim()] || f;

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

const useBackendMedia = () => {
  const [folderImages, setFolderImages] = useState(CLOUDINARY_FOLDER_IMAGES);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const res = await fetch(MEDIA_API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { folders } = await res.json();
        const names = Object.keys(folders || {});
        // Every folder empty means the server isn't reading the right account: keep the fallback
        // rather than blanking the site. Otherwise the server's list is the truth for each folder.
        if (!names.some((f) => folders[f].length > 0)) throw new Error("empty");
        const merged = { ...CLOUDINARY_FOLDER_IMAGES };
        names.forEach((folder) => { merged[folder] = folders[folder]; });
        if (!cancelled) setFolderImages(merged);
      } catch (err) {
        // Keeps the last-known hardcoded list.
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  return folderImages;
};

/* ─────────────────────────── GLOBAL STYLES ─────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
    body { font-family: 'DM Sans', sans-serif; background: #F5F0E8; color: #0D0D0D; overflow-x: hidden; }
    img, video { max-width: 100%; }
    button, a { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
    button { font-family: inherit; }
    :focus { outline: none; }
    :focus-visible { outline: 2.5px solid #C9A84C; outline-offset: 3px; border-radius: 10px; }
    ::selection { background: rgba(201,168,76,0.35); }
    [id^="section-"] { scroll-margin-top: 72px; }
    @media (min-width: 1024px) { ::-webkit-scrollbar { width: 8px; } }
    ::-webkit-scrollbar-track { background: #F5F0E8; }
    ::-webkit-scrollbar-thumb { background: #2B5BA8; border-radius: 4px; }

    .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.75s cubic-bezier(.22,1,.36,1), transform 0.75s cubic-bezier(.22,1,.36,1); }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-left { opacity: 0; transform: translateX(-40px); transition: opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1); }
    .reveal-left.visible { opacity: 1; transform: translateX(0); }
    .reveal-right { opacity: 0; transform: translateX(40px); transition: opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1); }
    .reveal-right.visible { opacity: 1; transform: translateX(0); }
    @media (max-width: 768px) {
      .reveal { transform: translateY(20px); transition-duration: 0.55s; }
    }

    @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
    @keyframes float2 { 0%,100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-6px) rotate(2deg); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(43,91,168,0.4); } 70% { box-shadow: 0 0 0 12px rgba(43,91,168,0); } 100% { box-shadow: 0 0 0 0 rgba(43,91,168,0); } }
    @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(22,163,74,0.5); } 70% { box-shadow: 0 0 0 10px rgba(22,163,74,0); } 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); } }
    @keyframes gradient-x { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes slide-up { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
    @keyframes slide-up-delay { 0%,30% { opacity:0; transform:translateY(20px); } 100% { opacity:1; transform:translateY(0); } }
    @keyframes fade-in { from { opacity:0; } to { opacity:1; } }
    @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    @keyframes hero-img-scale { from { transform: scale(1.08); } to { transform: scale(1); } }
    @keyframes count-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes glow-pulse { 0%,100% { opacity:0.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.2); } }
    @keyframes border-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes ping { 0% { transform:scale(1); opacity:0.75; } 100% { transform:scale(2.4); opacity:0; } }
    @keyframes scroll-cue { 0% { transform: translateY(0); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(10px); opacity: 0; } }
    @keyframes nudge-x { 0%,100% { transform: translateX(0); } 50% { transform: translateX(6px); } }

    .btn-primary {
      background: linear-gradient(135deg, #2B5BA8 0%, #1a3f7a 100%);
      color: #fff; border: none; border-radius: 12px; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: 0.3px;
      transition: transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s ease, background 0.2s ease;
      display: inline-flex; align-items: center; gap: 8px; min-height: 48px;
      position: relative; overflow: hidden; box-shadow: 0 6px 18px rgba(43,91,168,0.28);
    }
    .btn-wa {
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      color: #fff; border: none; border-radius: 12px; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-weight: 700; min-height: 48px;
      transition: transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s ease;
      display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 6px 18px rgba(18,140,126,0.28);
    }
    .btn-ghost {
      background: rgba(255,255,255,0.12); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: #fff; border: 1.5px solid rgba(255,255,255,0.35); border-radius: 12px; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-weight: 700; min-height: 48px;
      transition: all 0.28s ease; display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-outline {
      background: transparent; color: #2B5BA8; border: 2px solid #2B5BA8; border-radius: 12px; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-weight: 700; min-height: 48px;
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      transition: background 0.25s ease, color 0.25s ease, transform 0.2s ease;
    }
    .icon-btn {
      width: 44px; height: 44px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid rgba(255,255,255,0.22); background: rgba(255,255,255,0.14);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); cursor: pointer; flex-shrink: 0;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .chip {
      padding: 10px 18px; border-radius: 50px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
      cursor: pointer; white-space: nowrap; min-height: 44px; flex-shrink: 0; scroll-snap-align: center;
      transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
    }

    /* Hover effects only for real mouse/trackpad users — avoids "stuck" hover after a tap */
    @media (hover: hover) and (pointer: fine) {
      .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(43,91,168,0.45); }
      .btn-wa:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(37,211,102,0.4); }
      .btn-ghost:hover { background: rgba(255,255,255,0.22); transform: translateY(-3px); border-color: rgba(255,255,255,0.6); }
      .btn-outline:hover { background: #2B5BA8; color: #fff; }
      .icon-btn:hover { background: rgba(255,255,255,0.26); }
      .card-hover:hover { transform: translateY(-8px); box-shadow: 0 28px 56px rgba(0,0,0,0.14) !important; }
      .tilt-card:hover { transform: perspective(800px) rotateX(-3deg) rotateY(5deg) translateY(-4px); box-shadow: 12px 24px 48px rgba(0,0,0,0.15); }
      .shine-card:hover::before { left: 150%; }
      .neon-hover:hover { box-shadow: 0 0 0 1px #C9A84C, 0 0 20px rgba(201,168,76,0.2), 0 8px 32px rgba(0,0,0,0.12) !important; }
      .img-thumb:hover { transform: scale(1.06); border-color: #C9A84C; }
      .zoom-img:hover { transform: scale(1.07); }
      .lift:hover { transform: translateY(-6px); }
      .pill-hover:hover { background: #2B5BA8 !important; color: #fff !important; }
      .nav-link:hover { background: var(--nav-hover); }
    }
    /* Touch feedback */
    .btn-primary:active, .btn-wa:active, .btn-ghost:active, .btn-outline:active, .icon-btn:active, .chip:active, .press:active { transform: scale(0.96); }
    .card-hover:active, .lift:active { transform: scale(0.985); }

    .card-hover { transition: transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s cubic-bezier(.22,1,.36,1); }

    .story-ring {
      background: linear-gradient(135deg, #2B5BA8, #C9A84C);
      padding: 3px; border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(201,168,76,0.5);
      animation: story-glow 2.5s ease-in-out infinite;
    }
    @keyframes story-glow {
      0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
      50% { box-shadow: 0 0 0 6px rgba(201,168,76,0.25), 0 0 20px rgba(43,91,168,0.2); }
    }
    .story-ring-inner { background: #F5F0E8; border-radius: 50%; padding: 3px; width: 100%; height: 100%; }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #1a3f7a, #2B5BA8, #C9A84C, #2B5BA8);
      background-size: 300% 100%;
      animation: shimmer 2.5s linear infinite;
      border-radius: inherit;
      transition: width 1.4s cubic-bezier(.22,1,.36,1);
    }

    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.4);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 50px;
      padding: 8px 18px; color: #D9BC68; font-size: 12px; font-weight: 700;
      letter-spacing: 2px; text-transform: uppercase;
    }

    .tag-pill {
      display: inline-flex; align-items: center;
      padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.3px;
    }

    .section-label {
      font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 800;
      letter-spacing: 4px; text-transform: uppercase; color: #2B5BA8;
      display: flex; align-items: center; gap: 10px;
    }
    .section-label::before { content: ''; display: block; width: 28px; height: 2px; background: linear-gradient(90deg,#2B5BA8,#C9A84C); }

    .display-heading {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 700; line-height: 1.04; color: #0D0D0D; letter-spacing: -0.3px;
    }
    .section-sub { max-width: 560px; margin: 18px auto 0; color: #5f6470; font-size: 16px; line-height: 1.8; }

    .ticker-inner { display: flex; width: max-content; animation: marquee 28s linear infinite; }

    /* Horizontal swipe rows (chips, story circles) */
    .h-scroll {
      display: flex; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x proximity;
      -webkit-overflow-scrolling: touch; scrollbar-width: none; scroll-padding-inline: 16px;
    }
    .h-scroll::-webkit-scrollbar { display: none; }
    /* Center when everything fits, start-aligned when it overflows (no clipped first item) */
    .h-scroll > :first-child { margin-left: auto; }
    .h-scroll > :last-child { margin-right: auto; }
    .h-scroll-fade { position: relative; }
    .h-scroll-fade::after {
      content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 36px; pointer-events: none;
      background: linear-gradient(90deg, rgba(255,255,255,0), var(--fade-bg, #fff));
    }
    @media (min-width: 1024px) { .h-scroll-fade::after { display: none; } }

    /* ── GLASSMORPHISM SYSTEM ── */
    .glass-card {
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 20px;
    }
    .glass-card-light {
      background: rgba(255,255,255,0.86);
      backdrop-filter: blur(24px) saturate(200%);
      -webkit-backdrop-filter: blur(24px) saturate(200%);
      border: 1px solid rgba(255,255,255,0.9);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6);
    }
    .glass-dark {
      background: rgba(12,15,26,0.6);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
    }
    .glass-gold {
      background: rgba(201,168,76,0.12);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(201,168,76,0.3);
      border-radius: 16px;
    }

    /* ── FLOATING PARTICLES ── */
    .particle {
      position: absolute; border-radius: 50%; pointer-events: none;
      animation: particle-float linear infinite;
    }
    @keyframes particle-float {
      0% { transform: translateY(100vh) scale(0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 0.6; }
      100% { transform: translateY(-10vh) scale(1); opacity: 0; }
    }

    .tilt-card { transition: transform 0.3s ease, box-shadow 0.3s ease; transform-style: preserve-3d; }

    .shine-card { position: relative; overflow: hidden; }
    .shine-card::before {
      content: ''; position: absolute; top: -50%; left: -100%; width: 60%; height: 200%;
      background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
      transition: left 0.6s ease; pointer-events: none; z-index: 1;
    }
    .neon-hover { transition: all 0.3s ease; }
    .zoom-img { transition: transform 0.6s ease; }
    .lift { transition: transform 0.3s ease; }

    .hero-stat-card {
      background: rgba(255,255,255,0.92); backdrop-filter: blur(24px) saturate(200%); -webkit-backdrop-filter: blur(24px) saturate(200%);
      border-radius: 18px; padding: 16px 20px;
      border: 1px solid rgba(255,255,255,0.95);
      box-shadow: 0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8);
      min-width: 0; flex: 1 1 0;
    }
    /* Laptop screens with limited height (e.g. 1366×768, 1280×720) — keep the whole hero visible */
    @media (min-width: 1024px) and (max-height: 820px) {
      .hero-desk-badge { margin-top: 0 !important; margin-bottom: 18px !important; }
      .hero-desk-divider { margin-top: 18px !important; margin-bottom: 14px !important; }
      .hero-desk-desc { font-size: 15px !important; line-height: 1.7 !important; }
      .hero-desk-cta { margin-top: 24px !important; }
      .hero-stat-row { margin-top: 26px !important; }
      .hero-stat-card { padding: 11px 14px !important; }
      .hero-stat-card .hs-icon { display: none; }
    }
    @media (min-width: 1024px) and (max-height: 680px) {
      .hero-stat-row { display: none !important; }
    }
    .img-thumb {
      border-radius: 10px; overflow: hidden; cursor: pointer;
      transition: all 0.3s ease; border: 2px solid rgba(255,255,255,0.2);
    }
    .img-thumb.active { border-color: #C9A84C; box-shadow: 0 0 0 2px #C9A84C; }
    input, select, textarea { font-family: 'DM Sans', sans-serif; font-size: 16px; }

    @media (max-width: 768px) {
      .section-label { font-size: 10px !important; letter-spacing: 3px !important; }
      .section-sub { font-size: 15px; line-height: 1.7; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }
      .reveal, .reveal-left, .reveal-right { opacity: 1 !important; transform: none !important; }
    }
  `}</style>
);

/* ─────────────────────────── MAIL ICON ─────────────────────────── */
const MailIcon = ({ color = "currentColor", size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

/* ─────────────────────────── TICKER ─────────────────────────── */
const Ticker = () => {
  const items = ["✦ 3 Completed Projects", "✦ 5700 Sq. Ft. Delivered", "✦ Sector 42 — 78% Complete", "✦ Reliance MET City — Now Launching", "✦ Quality Certified Materials", "✦ RERA Registered"];
  const doubled = [...items, ...items];
  return (
    <div style={{ background: colors.darkBlue, padding: "10px 0", overflow: "hidden" }}>
      <div className="ticker-inner" style={{ gap: 0 }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ color: "#fff", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", padding: "0 28px", opacity: 0.95 }}>{item}</span>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────── STICKY HEADER ─────────────────────────── */
const NAV_LINKS = [
  { label: "Overview", id: "section-overview", icon: Home },
  { label: "Progress", id: "section-progress", icon: TrendingUp },
  { label: "Stories", id: "section-stories", icon: Star },
  { label: "Gallery", id: "section-gallery", icon: Award },
  { label: "Locations", id: "section-locations", icon: MapPin },
  { label: "Contact", id: "section-contact", icon: Phone },
];

const StickyHeader = () => {
  const width = useWindowWidth();
  const isMobile = width <= 768;
  const useDrawer = width < 960;
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("");
  useLockBodyScroll(menuOpen);
  const drawerSwipe = useSwipe({ onRight: () => setMenuOpen(false) });

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 60);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, window.scrollY / total) : 0);
    };
    fn(); window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Highlight the section currently on screen
  useEffect(() => {
    const els = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [menuOpen]);

  useEffect(() => { if (!useDrawer) setMenuOpen(false); }, [useDrawer]);

  const goTo = (id) => {
    setMenuOpen(false);
    // let the body unlock before scrolling
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 10);
  };

  const fg = scrolled ? colors.black : "#fff";
  const brand = scrolled ? colors.darkBlue : "#fff";

  return (
    <>
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1500, transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        background: scrolled ? "rgba(245,240,232,0.94)" : "linear-gradient(to bottom, rgba(12,15,26,0.7), rgba(12,15,26,0.25))",
        backdropFilter: "blur(18px) saturate(160%)", WebkitBackdropFilter: "blur(18px) saturate(160%)",
        borderBottom: scrolled ? "1px solid rgba(43,91,168,0.12)" : "1px solid rgba(255,255,255,0.06)",
        boxShadow: scrolled ? "0 6px 24px rgba(13,13,13,0.06)" : "none",
        paddingTop: "env(safe-area-inset-top)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: isMobile ? "10px 16px" : "12px 28px", minHeight: isMobile ? 60 : 68 }}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="ShineOne Estate — back to top"
            style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: isMobile ? 34 : 38, height: isMobile ? 34 : 38, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: `linear-gradient(135deg, ${colors.darkBlue}, ${colors.gold})`, color: "#fff", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: isMobile ? 17 : 19, boxShadow: "0 4px 14px rgba(43,91,168,0.3)" }}>S1</span>
            <span>
              <span style={{ display: "block", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: isMobile ? 19 : 22, color: brand, lineHeight: 1, transition: "color 0.3s" }}>ShineOne Estate</span>
              <span style={{ display: "block", fontSize: isMobile ? 9 : 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: scrolled ? colors.subtle : "rgba(255,255,255,0.7)", marginTop: 3, transition: "color 0.3s" }}>We Build Your Vision</span>
            </span>
          </button>

          {!useDrawer ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <nav aria-label="Main" style={{ display: "flex", gap: 2 }}>
                {NAV_LINKS.map((l) => {
                  const isActive = active === l.id;
                  return (
                    <button key={l.id} onClick={() => goTo(l.id)} className="nav-link" aria-current={isActive ? "true" : undefined}
                      style={{ "--nav-hover": scrolled ? "rgba(43,91,168,0.08)" : "rgba(255,255,255,0.14)", background: "none", border: "none", cursor: "pointer", padding: "9px 13px", borderRadius: 10, fontWeight: isActive ? 700 : 500, fontSize: 14,
                        color: isActive ? (scrolled ? colors.darkBlue : colors.gold) : fg, position: "relative", transition: "background 0.2s ease, color 0.2s ease" }}>
                      {l.label}
                      <span style={{ position: "absolute", left: 13, right: 13, bottom: 4, height: 2, borderRadius: 2, background: scrolled ? colors.darkBlue : colors.gold, transform: `scaleX(${isActive ? 1 : 0})`, transition: "transform 0.3s cubic-bezier(.22,1,.36,1)" }} />
                    </button>
                  );
                })}
              </nav>
              <a href={`tel:${PHONE}`} className="btn-primary" style={{ textDecoration: "none", padding: "0 18px", minHeight: 42, fontSize: 14, borderRadius: 11 }}>
                <Phone size={16} /> Call Now
              </a>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <a href={`tel:${PHONE}`} aria-label="Call ShineOne Estate" className="icon-btn press"
                style={{ background: scrolled ? colors.darkBlue : "rgba(255,255,255,0.14)", borderColor: scrolled ? colors.darkBlue : "rgba(255,255,255,0.22)" }}>
                <Phone size={18} color="#fff" />
              </a>
              <button onClick={() => setMenuOpen((o) => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} className="icon-btn press"
                style={{ background: scrolled ? "rgba(43,91,168,0.08)" : "rgba(255,255,255,0.14)", borderColor: scrolled ? "rgba(43,91,168,0.18)" : "rgba(255,255,255,0.22)" }}>
                <span style={{ position: "relative", width: 20, height: 14, display: "block" }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{ position: "absolute", left: 0, width: i === 1 ? 14 : 20, height: 2, borderRadius: 2, background: scrolled ? colors.darkBlue : "#fff", top: i * 6, transition: "all 0.3s ease" }} />
                  ))}
                </span>
              </button>
            </div>
          )}
        </div>
        {/* Scroll progress */}
        <div style={{ position: "absolute", left: 0, bottom: -1, height: 2, width: `${progress * 100}%`, background: `linear-gradient(90deg, ${colors.darkBlue}, ${colors.gold})`, transition: "width 0.1s linear", opacity: scrolled ? 1 : 0 }} />
      </header>

      {/* Mobile / tablet drawer */}
      {useDrawer && menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1600, background: "rgba(12,15,26,0.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", animation: "fade-in 0.25s ease" }}>
          <aside role="dialog" aria-modal="true" aria-label="Menu" onClick={(e) => e.stopPropagation()} {...drawerSwipe.handlers}
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(86vw, 360px)", background: colors.cream, boxShadow: "-20px 0 60px rgba(0,0,0,0.25)",
              display: "flex", flexDirection: "column", animation: "slide-in-right 0.35s cubic-bezier(.22,1,.36,1)",
              padding: "calc(16px + env(safe-area-inset-top)) 20px calc(20px + env(safe-area-inset-bottom))", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 24, color: colors.darkBlue, lineHeight: 1 }}>ShineOne Estate</div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: colors.subtle, marginTop: 4 }}>Gurugram · Since day one</div>
              </div>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="icon-btn press" style={{ background: "rgba(43,91,168,0.08)", borderColor: "rgba(43,91,168,0.15)" }}>
                <X size={20} color={colors.darkBlue} />
              </button>
            </div>
            <nav aria-label="Main" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {NAV_LINKS.map((l, i) => {
                const Icon = l.icon; const isActive = active === l.id;
                return (
                  <button key={l.id} onClick={() => goTo(l.id)} className="press"
                    style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", background: isActive ? "rgba(43,91,168,0.09)" : "transparent", border: "none", cursor: "pointer",
                      padding: "14px 12px", borderRadius: 14, fontWeight: isActive ? 700 : 600, fontSize: 16, color: isActive ? colors.darkBlue : colors.black,
                      animation: `slide-up 0.4s cubic-bezier(.22,1,.36,1) ${0.04 * i + 0.05}s both`, transition: "transform 0.15s ease" }}>
                    <span style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: isActive ? colors.darkBlue : "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", flexShrink: 0 }}>
                      <Icon size={17} color={isActive ? "#fff" : colors.darkBlue} />
                    </span>
                    <span style={{ flex: 1 }}>{l.label}</span>
                    <ChevronRight size={18} color={colors.subtle} />
                  </button>
                );
              })}
            </nav>
            <div style={{ marginTop: "auto", paddingTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              <a href={`tel:${PHONE}`} className="btn-primary" style={{ textDecoration: "none", justifyContent: "center", padding: "0 18px", fontSize: 15 }}><Phone size={17} /> +91 93109 94032</a>
              <a href={WA_URL} target="_blank" rel="noreferrer" className="btn-wa" style={{ textDecoration: "none", justifyContent: "center", padding: "0 18px", fontSize: 15 }}><MessageCircle size={17} /> Chat on WhatsApp</a>
              <div style={{ textAlign: "center", fontSize: 12, color: colors.subtle, marginTop: 6 }}>Swipe right to close</div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

/* ─────────────────────────── HERO ─────────────────────────── */
const Hero = () => {
  const isCompact = useIsCompact();
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const folderImages = useBackendMedia();
  const carousel = (folderImages?.["Caraousel"] || folderImages?.["caraousel"]) || projectData.images;
  const [current, setCurrent] = useState(0);
  const [textPhase, setTextPhase] = useState(0); // for cycling headline words

  const headlines = ["Vision", "Dream", "Future", "Legacy"];
  const count = carousel?.length || 0;
  const go = (i) => setCurrent(((i % count) + count) % count);
  const swipe = useSwipe({ onLeft: () => { go(current + 1); vibrate(); }, onRight: () => { go(current - 1); vibrate(); } });

  // Auto-advance; restarts after every manual change so a swipe never gets "double skipped"
  useEffect(() => {
    if (reduced || count < 2) return;
    const t = setTimeout(() => setCurrent((p) => (p + 1) % count), 5000);
    return () => clearTimeout(t);
  }, [current, count, reduced]);

  useEffect(() => {
    const t = setInterval(() => setTextPhase((p) => (p + 1) % headlines.length), 2800);
    return () => clearInterval(t);
  }, []);

  const heroStats = [
    { value: "3+", label: "Completed\nProjects", icon: "🏠" },
    { value: "14K+", label: "Sq. Ft.\nDelivered", icon: "📐" },
    { value: "78%", label: "Sector 42\nProgress", icon: "📊" },
    { value: "2027", label: "MET City\nHandover", icon: "🏗️" },
  ];

  if (isCompact) {
    // PHONE / TABLET: full-bleed swipeable photo with content anchored to the bottom
    return (
      <section aria-label="Introduction" {...swipe.handlers}
        style={{ position: "relative", minHeight: "100svh", overflow: "hidden", background: colors.navy, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        {(carousel || projectData.images).map((src, i) => (
          <img key={i} src={src} alt="" loading={i === 0 ? "eager" : "lazy"} draggable={false}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center",
              opacity: i === current ? 1 : 0, transform: i === current ? "scale(1)" : "scale(1.06)", transition: "opacity 1.2s ease, transform 6s ease", filter: "brightness(0.55)" }} />
        ))}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(12,15,26,0.98) 0%, rgba(12,15,26,0.78) 40%, rgba(12,15,26,0.15) 75%, rgba(12,15,26,0.45) 100%)" }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 5, width: "100%", maxWidth: 640, margin: "0 auto", padding: `calc(96px + env(safe-area-inset-top)) ${isMobile ? 20 : 32}px 28px` }}>
          <div className="hero-badge" style={{ marginBottom: 18, fontSize: 11, padding: "7px 14px", letterSpacing: 1.6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.gold, animation: "glow-pulse 2s infinite" }} />
            Premium Real Estate · Gurugram
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: isMobile ? "clamp(2.6rem, 12vw, 3.6rem)" : "4.4rem", color: "#fff", lineHeight: 1.0, marginBottom: 12 }}>
            We Build<br />
            <span key={textPhase} style={{ color: colors.gold, fontStyle: "italic", display: "inline-block", animation: "slide-up 0.5s cubic-bezier(.22,1,.36,1) both" }}>
              Your {headlines[textPhase]}
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: isMobile ? 15 : 17, lineHeight: 1.7, marginBottom: 22, fontWeight: 400 }}>
            Plots · Flats · Floors · Construction<br />Sector 4, 9, 42, 46 & Reliance MET City
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <a href={`tel:${PHONE}`} className="btn-primary" style={{ textDecoration: "none", padding: "0 14px", minHeight: 52, fontSize: 15, justifyContent: "center" }}>
              <Phone size={18} /> Call Now
            </a>
            <a href={WA_URL} target="_blank" rel="noreferrer" className="btn-wa" style={{ textDecoration: "none", padding: "0 14px", minHeight: 52, fontSize: 15, justifyContent: "center" }}>
              <MessageCircle size={18} /> WhatsApp
            </a>
          </div>
          {/* Glass stat pills */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${isMobile ? 3 : 4}, 1fr)`, gap: 8, marginTop: 14 }}>
            {heroStats.slice(0, isMobile ? 3 : 4).map((s, i) => (
              <div key={i} className="glass-dark" style={{ padding: "10px 8px", textAlign: "center", borderRadius: 14 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.7)", marginTop: 4, lineHeight: 1.3 }}>{s.label.replace("\n", " ")}</div>
              </div>
            ))}
          </div>

          {/* Dots + scroll cue */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18 }}>
            <div style={{ display: "flex", gap: 2, marginLeft: -8 }} role="tablist" aria-label="Hero photos">
              {(carousel || []).map((_, i) => (
                <button key={i} onClick={() => go(i)} aria-label={`Photo ${i + 1}`} aria-selected={i === current} role="tab"
                  style={{ background: "none", border: "none", padding: "10px 4px", cursor: "pointer" }}>
                  <span style={{ display: "block", width: i === current ? 22 : 7, height: 7, borderRadius: 4, background: i === current ? colors.gold : "rgba(255,255,255,0.45)", transition: "all 0.3s ease" }} />
                </button>
              ))}
            </div>
            <button onClick={() => document.getElementById("section-overview")?.scrollIntoView({ behavior: "smooth" })} aria-label="Scroll to projects"
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 0" }}>
              Explore
              <span style={{ width: 20, height: 30, borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.55)", display: "flex", justifyContent: "center", paddingTop: 5 }}>
                <span style={{ width: 3, height: 7, borderRadius: 2, background: colors.gold, animation: "scroll-cue 1.6s ease-in-out infinite" }} />
              </span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // DESKTOP: Split layout — bold left panel + image showcase right
  return (
    <section aria-label="Introduction" style={{ display: "flex", minHeight: "100vh", background: "#0C0F1A", overflow: "hidden", position: "relative" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ width: "52%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "96px clamp(28px, 4vw, 52px) 40px clamp(28px, 4.5vw, 64px)", position: "relative", zIndex: 5, flexShrink: 0 }}>

        {/* Subtle background texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 80%, rgba(43,91,168,0.18) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(201,168,76,0.1) 0%, transparent 50%)", pointerEvents: "none" }} />

        {/* Animated badge — pushed down from top */}
        <div className="hero-badge hero-desk-badge" style={{ width: "fit-content", marginBottom: 28, marginTop: 24, animation: "slide-up 0.6s ease 0.2s both", opacity: 0 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: colors.gold, animation: "glow-pulse 1.8s ease-in-out infinite" }} />
          Premium Real Estate · Gurugram
        </div>

        {/* Main heading — massive bold serif */}
        <div style={{ animation: "slide-up 0.7s ease 0.35s both", opacity: 0 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(3rem, min(5.5vw, 10vh), 6rem)", color: "#FFFFFF", lineHeight: 0.95, marginBottom: 4 }}>
            We Build
          </h1>
          <div style={{ overflow: "hidden", height: "clamp(3.3rem, min(6vw, 11vh), 6.8rem)", display: "flex", alignItems: "center" }}>
            <h1 key={textPhase} style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(3.2rem, min(6vw, 11vh), 6.8rem)", color: colors.gold, lineHeight: 0.95, animation: "slide-up 0.4s cubic-bezier(.22,1,.36,1) both", whiteSpace: "nowrap" }}>
              Your {headlines[textPhase]}
            </h1>
          </div>
        </div>

        {/* Divider */}
        <div className="hero-desk-divider" style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28, marginBottom: 24, animation: "slide-up 0.7s ease 0.5s both", opacity: 0 }}>
          <div style={{ height: 1, width: 48, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.4))" }} />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.62)", letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>Gurugram</span>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0))" }} />
        </div>

        {/* Description */}
        <p className="hero-desk-desc" style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, lineHeight: 1.85, maxWidth: 460, fontWeight: 400, animation: "slide-up 0.7s ease 0.6s both", opacity: 0 }}>
          Plots · Flats · Floors · Construction across<br />Sector 4, 9, 42, 46 & Reliance MET City.<br />
          <span style={{ color: colors.gold, fontWeight: 600 }}>Transparent builds. On-time delivery.</span>
        </p>

        {/* CTA buttons */}
        <div className="hero-desk-cta" style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap", animation: "slide-up 0.7s ease 0.75s both", opacity: 0 }}>
          <a href={`tel:${PHONE}`} className="btn-primary" style={{ textDecoration: "none", padding: "0 26px", minHeight: 52, fontSize: 15 }}>
            <Phone size={18} /> Call Now
          </a>
          <a href={WA_URL} target="_blank" rel="noreferrer" className="btn-wa" style={{ textDecoration: "none", padding: "0 26px", minHeight: 52, fontSize: 15 }}>
            <MessageCircle size={18} /> WhatsApp
          </a>
          <a href={`mailto:${EMAIL}`} className="btn-ghost" style={{ textDecoration: "none", padding: "0 22px", minHeight: 52, fontSize: 15 }}>
            <MailIcon color="#fff" size={18} /> Email
          </a>
        </div>

        {/* Stat cards row */}
        <div className="hero-stat-row" style={{ display: "flex", gap: 12, marginTop: 44, animation: "slide-up 0.7s ease 0.9s both", opacity: 0 }}>
          {heroStats.map((s, i) => (
            <div key={i} className="hero-stat-card" style={{ animationDelay: `${0.9 + i * 0.08}s` }}>
              <div className="hs-icon" style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: colors.darkBlue, lineHeight: 1, marginTop: 6 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: colors.muted, marginTop: 4, lineHeight: 1.4, fontWeight: 600, whiteSpace: "pre-line" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — Image showcase ── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", minWidth: 0 }}>
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" style={{
            width: 4 + (i % 3) * 3, height: 4 + (i % 3) * 3,
            background: i % 2 === 0 ? "rgba(201,168,76,0.6)" : "rgba(43,91,168,0.5)",
            left: `${10 + i * 11}%`,
            animationDuration: `${6 + i * 1.5}s`,
            animationDelay: `${i * 0.8}s`,
          }} />
        ))}

        {/* Main images */}
        {(carousel || projectData.images).map((src, i) => (
          <img key={i} src={src} alt="" loading={i === 0 ? "eager" : "lazy"}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center top",
              opacity: i === current ? 1 : 0, transition: "opacity 1.4s ease",
              filter: "brightness(0.3) contrast(1.1) saturate(0.7)",
            }} />
        ))}

        {/* Overlays */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(12,15,26,0.5)", zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 2, background: "linear-gradient(to right, #0C0F1A 0%, rgba(12,15,26,0.15) 28%, transparent 55%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, zIndex: 2, background: "linear-gradient(to top, rgba(12,15,26,0.95), transparent)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, zIndex: 2, background: "linear-gradient(to bottom, rgba(12,15,26,0.6), transparent)" }} />

        {/* ── Glass card: Sector 42 progress ── */}
        <div style={{ position: "absolute", top: 100, right: 20, zIndex: 5, maxWidth: 210, animation: "float2 5s ease-in-out infinite" }}>
          <div className="glass-card-light" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #2B5BA8, #1a3f7a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(43,91,168,0.4)" }}>
                <TrendingUp size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 10, color: colors.subtle, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Sector 42</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: colors.darkBlue, lineHeight: 1.2 }}>On Schedule ✓</div>
              </div>
            </div>
            <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
              <div className="progress-bar-fill" style={{ width: "78%" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: colors.subtle, fontWeight: 600 }}>78% Complete</span>
              <span style={{ fontSize: 11, color: colors.darkBlue, fontWeight: 700 }}>June 2026</span>
            </div>
          </div>
        </div>

        {/* ── Glass card: Star rating ── */}
        <div style={{ position: "absolute", bottom: 120, right: 20, zIndex: 5, animation: "float 4.5s ease-in-out 0.8s infinite" }}>
          <div className="glass-gold" style={{ padding: "14px 18px" }}>
            <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
              {[1,2,3,4,5].map(s => <Star key={s} size={14} color={colors.gold} fill={colors.gold} />)}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Trusted Builder</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", marginTop: 2 }}>Premium Quality</div>
          </div>
        </div>

        {/* ── Glass NEW badge ── */}
        <div style={{ position: "absolute", top: 100, left: 24, zIndex: 5 }}>
          <div className="glass-dark" style={{ padding: "9px 16px", display: "flex", alignItems: "center", gap: 8, animation: "pulse-green 2.5s infinite", border: "1px solid rgba(22,163,74,0.4)" }}>
            <div style={{ position: "relative" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#4ade80", animation: "ping 1.5s ease-out infinite" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: "#fff", whiteSpace: "nowrap" }}>New · Reliance MET City</span>
          </div>
        </div>

        {/* ── Ghost watermark ── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 3, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 4.5rem)", fontWeight: 700, color: "rgba(255,255,255,0.05)", letterSpacing: 10, textTransform: "uppercase", textAlign: "center", userSelect: "none" }}>
            ShineOne<br />Estate
          </div>
        </div>

        {/* ── Thumbnail strip ── */}
        <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, zIndex: 5, display: "flex", gap: 8, justifyContent: "center", padding: "0 20px" }}>
          {(carousel || []).slice(0, 6).map((src, i) => (
            <button key={i} onClick={() => setCurrent(i)} aria-label={`Show photo ${i + 1}`}
              style={{
                padding: 0, background: "none",
                width: 52, height: 38, borderRadius: 10, overflow: "hidden", cursor: "pointer", flexShrink: 0,
                border: i === current ? `2px solid ${colors.gold}` : "2px solid rgba(255,255,255,0.15)",
                transition: "all 0.3s cubic-bezier(.22,1,.36,1)",
                transform: i === current ? "scale(1.12) translateY(-4px)" : "scale(1)",
                boxShadow: i === current ? `0 8px 24px rgba(201,168,76,0.5)` : "none",
              }}>
              <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: i === current ? "none" : "brightness(0.5)" }} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────── STATS ROW ─────────────────────────── */
const StatsRow = () => {
  const isMobile = useIsMobile();
  const { ref, visible } = useReveal();
  const c1 = useCountUp(3, 1200, visible);
  const c2 = useCountUp(14400, 1500, visible);
  const c3 = useCountUp(5, 1000, visible);
  const c4 = useCountUp(78, 1800, visible);

  const stats = [
    { value: c1, suffix: "+", label: "Completed Projects", icon: <CheckCircle size={isMobile ? 20 : 24} color={colors.gold} /> },
    { value: c2.toLocaleString("en-IN"), suffix: "", label: "Sq. Ft. Delivered", icon: <Home size={isMobile ? 20 : 24} color={colors.gold} /> },
    { value: c3, suffix: "", label: "Active Sectors", icon: <MapPin size={isMobile ? 20 : 24} color={colors.gold} /> },
    { value: c4, suffix: "%", label: "Sector 42 Progress", icon: <TrendingUp size={isMobile ? 20 : 24} color={colors.gold} /> },
  ];

  return (
    <div ref={ref} style={{ background: `linear-gradient(135deg, ${colors.darkBlue} 0%, #1f4a8f 100%)`, padding: isMobile ? "20px 12px" : "36px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 0 : 2 }}>
        {stats.map((s, i) => {
          const divider = isMobile ? { borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.12)" : "none", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.12)" : "none" }
            : { borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none" };
          return (
            <div key={i} className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: `${i * 0.1}s`, textAlign: "center", padding: isMobile ? "18px 8px" : "26px 16px", ...divider }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: isMobile ? 8 : 12 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? 32 : 42, fontWeight: 700, color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{s.value}{s.suffix}</div>
              <div style={{ fontSize: isMobile ? 12 : 13, color: "rgba(255,255,255,0.78)", marginTop: 6, letterSpacing: 0.4, fontWeight: 500 }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────── QUICK SNAPSHOT ─────────────────────────── */
const QuickSnapshot = () => {
  const isMobile = useIsMobile();
  const { ref, visible } = useReveal();

  const completed = projectData.projects.filter((p) => p.status.toLowerCase().includes("completed"));
  const ongoing = projectData.projects.filter((p) => p.status.toLowerCase().includes("ongoing"));

  return (
    <section id="section-overview" ref={ref} style={{ padding: isMobile ? "60px 16px" : "clamp(72px, 8vw, 100px) 28px", background: colors.cream }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: isMobile ? 40 : 64 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>Projects Overview</div>
          <h2 className="display-heading" style={{ fontSize: "clamp(2.1rem, 5.2vw, 3.5rem)" }}>
            Built with<br /><em style={{ fontStyle: "italic", color: colors.darkBlue }}>precision & pride</em>
          </h2>
          <p className="section-sub">
            A snapshot of every development — from foundation to handover — across Gurugram's most sought-after sectors.
          </p>
        </div>

        {/* Completed Projects */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ fontWeight: 600, fontSize: 15, color: "#16a34a", textTransform: "uppercase", letterSpacing: 1 }}>Completed & Delivered</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 12 : 16 }}>
            {completed.map((p, i) => (
              <div key={i} className={`card-hover shine-card reveal${visible ? " visible" : ""}`} style={{ transitionDelay: `${i * 0.1}s`, background: "#fff", borderRadius: 20, padding: isMobile ? "22px" : "28px", border: "1px solid rgba(43,91,168,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(43,91,168,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Home size={20} color={colors.darkBlue} />
                  </div>
                  <span className="tag-pill" style={{ background: "#dcfce7", color: "#16a34a" }}>DELIVERED</span>
                </div>
                <h3 style={{ fontSize: 20, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: colors.darkBlue, marginBottom: 6 }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: colors.subtle, fontWeight: 500 }}>{p.area}</p>
                <div style={{ marginTop: 16, height: 4, background: "#f0f0f0", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: "100%", background: "#16a34a", borderRadius: 2 }} />
                </div>
                <p style={{ fontSize: 12, color: colors.subtle, marginTop: 8 }}>100% Complete</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ongoing Projects */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors.gold, animation: "pulse-ring 2s infinite" }} />
            <span style={{ fontWeight: 600, fontSize: 15, color: "#b45309", textTransform: "uppercase", letterSpacing: 1 }}>Active Construction</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
            {ongoing.map((p, i) => (
              <div key={i} className={`card-hover reveal${visible ? " visible" : ""}`} style={{ transitionDelay: `${(i + 3) * 0.1}s`, background: "#fff", borderRadius: 20, padding: isMobile ? "22px" : "28px", border: "1px solid rgba(43,91,168,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 22, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: colors.darkBlue }}>{p.name}</h3>
                    <p style={{ fontSize: 13, color: colors.subtle, marginTop: 4, fontWeight: 500 }}>{p.area}</p>
                  </div>
                  <span className="tag-pill" style={{ background: "#fef3c7", color: "#92400e" }}>
                    {p.stage ? p.stage.toUpperCase() : "ONGOING"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: colors.muted }}>Completion</span>
                  <span style={{ fontSize: 20, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: colors.darkBlue }}>{p.progress || 0}%</span>
                </div>
                <div style={{ height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                  <div className="progress-bar-fill" style={{ width: `${p.progress || 0}%` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <span style={{ fontSize: 13, color: colors.subtle }}>ETA</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.darkBlue }}>{p.eta || "TBD"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────── PROGRESS TIMELINE ─────────────────────────── */
const ProgressTimeline = () => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const chipRow = useRef(null);
  const { ref, visible } = useReveal();
  const [selectedProject, setSelectedProject] = useState(projectData.projects[0].name);
  const project = projectData.projects.find((p) => p.name === selectedProject) || projectData.projects[0];
  const progress = project.progress !== undefined ? project.progress : project.status.toLowerCase().includes("completed") ? 100 : 78;

  const stages = ["Foundation", "Structure", "Finishing", "Interior Works", "Final Inspection", "Handover"];
  const stageStatuses = stages.map((s, idx) => {
    if (project.status.toLowerCase().includes("completed")) return "completed";
    if (project.status.toLowerCase().includes("ongoing")) {
      if (project.stage) {
        const ci = stages.findIndex((st) => st.toLowerCase() === String(project.stage).toLowerCase());
        if (ci === -1) return "pending";
        if (idx < ci) return "completed";
        if (idx === ci) return "ongoing";
        return "pending";
      }
      if (s === "Finishing") return "ongoing";
      const fi = stages.indexOf("Finishing");
      if (idx < fi) return "completed";
      return "pending";
    }
    return "pending";
  });

  const selectProject = (name, el) => {
    setSelectedProject(name);
    vibrate();
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };
  const projectIdx = projectData.projects.findIndex((p) => p.name === selectedProject);
  const swipe = useSwipe({
    onLeft: () => { const n = projectData.projects[projectIdx + 1]; if (n) selectProject(n.name, chipRow.current?.children[projectIdx + 1]); },
    onRight: () => { const n = projectData.projects[projectIdx - 1]; if (n) selectProject(n.name, chipRow.current?.children[projectIdx - 1]); },
  });

  const stageColors = { completed: { bg: "#dcfce7", border: "#16a34a", text: "#16a34a", label: "Completed" }, ongoing: { bg: "#fef3c7", border: colors.gold, text: "#92400e", label: "In Progress" }, pending: { bg: "#f9fafb", border: "#e5e7eb", text: "#6b7280", label: "Pending" } };

  return (
    <div id="section-progress" ref={ref} style={{ padding: isMobile ? "60px 16px" : "clamp(72px, 8vw, 100px) 28px", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>Construction Progress</div>
          <h2 className="display-heading" style={{ fontSize: "clamp(2.1rem, 5.2vw, 3.5rem)" }}>
            Track every<br /><em style={{ fontStyle: "italic", color: colors.darkBlue }}>milestone</em>
          </h2>
        </div>

        {/* Project selector */}
        <div className={`h-scroll-fade reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.15s", marginBottom: isMobile ? 24 : 40, marginLeft: isMobile ? -16 : 0, marginRight: isMobile ? -16 : 0 }}>
          <div ref={chipRow} className="h-scroll" role="tablist" aria-label="Choose a project" style={{ gap: 10, padding: isMobile ? "4px 16px 8px" : "4px 0 8px" }}>
            {projectData.projects.map((p, i) => {
              const on = selectedProject === p.name;
              return (
                <button key={i} role="tab" aria-selected={on} onClick={(e) => selectProject(p.name, e.currentTarget)} className="chip"
                  style={{ background: on ? colors.darkBlue : "#fff", color: on ? "#fff" : colors.darkBlue,
                    border: `2px solid ${on ? colors.darkBlue : "rgba(43,91,168,0.25)"}`, boxShadow: on ? "0 8px 20px rgba(43,91,168,0.3)" : "none" }}>
                  {p.name}
                  {p.status === "Ongoing" && <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: on ? colors.gold : "#f59e0b", marginLeft: 8, verticalAlign: "middle" }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress display */}
        <div {...swipe.handlers} className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.2s", background: colors.cream, borderRadius: 24, padding: isMobile ? "22px 20px" : "44px 48px", marginBottom: isMobile ? 20 : 32, border: "1px solid rgba(43,91,168,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? 24 : 30, fontWeight: 700, color: colors.darkBlue, lineHeight: 1.1 }}>{selectedProject}</h3>
              <p style={{ fontSize: 13, color: colors.subtle, marginTop: 4 }}>{project.status} {project.eta ? `· ETA: ${project.eta}` : ""}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? 44 : 56, fontWeight: 700, color: colors.darkBlue, lineHeight: 1 }}>{progress}<span style={{ fontSize: 24 }}>%</span></div>
              <div style={{ fontSize: 12, color: colors.subtle, marginTop: 4 }}>Overall Completion</div>
            </div>
          </div>
          <div style={{ height: 12, background: "rgba(43,91,168,0.1)", borderRadius: 6, overflow: "hidden" }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Stages grid */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "repeat(3, 1fr)" : "repeat(6, 1fr)", gap: isMobile ? 10 : 12 }}>
          {stages.map((stage, idx) => {
            const s = stageStatuses[idx]; const c = stageColors[s];
            return (
              <div key={stage} className={`reveal${visible ? " visible" : ""}`}
                style={{ transitionDelay: `${idx * 0.07}s`, background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 16, padding: isMobile ? "16px 10px" : "20px 14px", textAlign: "center", position: "relative", overflow: "visible" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.border, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  {s === "completed" ? <CheckCircle size={18} color="#fff" /> : s === "ongoing" ? <Clock size={18} color="#fff" /> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{stage}</div>
                <div style={{ fontSize: 11, color: c.text, opacity: 0.8, marginTop: 4 }}>{c.label}</div>
                {idx < stages.length - 1 && !isMobile && !isTablet && (
                  <div style={{ position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)", zIndex: 1 }}>
                    <ArrowRight size={14} color={c.border} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── STORIES VIEWER ─────────────────────────── */
const StoriesViewer = () => {
  const isMobile = useIsMobile();
  const finePointer = useFinePointer();
  const { ref, visible } = useReveal();
  const folderImages = useBackendMedia();
  const [openStory, setOpenStory] = useState({ open: false, folder: "", images: [], idx: 0 });
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(4000);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragY, setDragY] = useState(0);
  const touchRef = useRef(null);
  const animTimer = useRef(null);
  const rafRef = useRef(null);
  const elapsedRef = useRef(0);
  useLockBodyScroll(openStory.open);

  const DEFAULT_DURATION = 4000;

  const open = (folder) => {
    const imgs = folderImages[folder] || [];
    if (!imgs.length) return;
    elapsedRef.current = 0;
    setOpenStory({ open: true, folder, images: imgs, idx: 0 });
    setProgress(0); setIsPaused(false); setCurrentDuration(DEFAULT_DURATION); setDragY(0);
  };
  const close = () => { setOpenStory({ open: false, folder: "", images: [], idx: 0 }); setProgress(0); setIsPaused(false); setCurrentDuration(DEFAULT_DURATION); setDragY(0); };

  const showIndex = (newIdx) => {
    if (!openStory.open) return;
    if (newIdx < 0) newIdx = 0;
    if (newIdx >= openStory.images.length) return close();
    setIsAnimating(true);
    if (animTimer.current) clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => { elapsedRef.current = 0; setOpenStory((s) => ({ ...s, idx: newIdx })); setProgress(0); setIsAnimating(false); }, 160);
  };
  const next = () => { if (!openStory.open) return; const ni = openStory.idx + 1; if (ni >= openStory.images.length) return close(); showIndex(ni); };
  const prev = () => { if (!openStory.open) return; const pi = openStory.idx - 1; if (pi < 0) { elapsedRef.current = 0; setProgress(0); return; } showIndex(pi); };

  // Progress timer — pausing keeps the elapsed time so "hold to pause" resumes where it left off
  useEffect(() => {
    if (!openStory.open || isPaused) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = Date.now() - elapsedRef.current;
    const run = () => {
      elapsedRef.current = Date.now() - start;
      const p = Math.min(1, elapsedRef.current / currentDuration);
      setProgress(p);
      if (p >= 1) next(); else rafRef.current = requestAnimationFrame(run);
    };
    rafRef.current = requestAnimationFrame(run);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [openStory.open, openStory.idx, isPaused, currentDuration]);

  useEffect(() => { return () => { if (animTimer.current) clearTimeout(animTimer.current); if (rafRef.current) cancelAnimationFrame(rafRef.current); }; }, []);

  useEffect(() => {
    if (!openStory.open) return;
    const h = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") { e.preventDefault(); setIsPaused((p) => !p); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [openStory.open, openStory.idx]);

  // Touch: tap left/right third = prev/next, horizontal swipe = prev/next, hold = pause, swipe down = close
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, time: Date.now(), dy: 0 };
    setIsPaused(true);
  };
  const onTouchMove = (e) => {
    if (!touchRef.current) return;
    const t = e.touches[0];
    const dy = t.clientY - touchRef.current.y;
    const dx = t.clientX - touchRef.current.x;
    if (dy > 0 && Math.abs(dy) > Math.abs(dx)) { touchRef.current.dy = dy; setDragY(dy); }
  };
  const onTouchEnd = (e) => {
    const st = touchRef.current; touchRef.current = null;
    if (!st) return;
    e.preventDefault(); // stop the synthetic click (otherwise a tap would advance twice)
    const t = e.changedTouches[0];
    const dx = t.clientX - st.x; const dy = t.clientY - st.y; const held = Date.now() - st.time;
    setIsPaused(false);
    if (dy > 110 && Math.abs(dy) > Math.abs(dx)) { close(); return; }
    setDragY(0);
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { if (dx > 0) prev(); else next(); return; }
    if (held < 250 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      if (t.clientX < window.innerWidth * 0.33) prev(); else next();
    }
  };

  const storyFolders = ["sec 4", "sec 9", "sec 46", "sec 42", "reliance met city"]
    .map((d) => Object.keys(folderImages).find((k) => k.toLowerCase() === d)).filter(Boolean);

  const sectorSubtitles = {
    "sec 4": "Residential Project",
    "sec 9": "Residential Development",
    "sec 46": "Premium Floors",
    "sec 42": "Under Construction",
    "reliance met city": "New Launch",
  };

  const current = openStory.images[openStory.idx];
  const currentIsVideo = /\.(mp4|webm|ogg|mov)$/i.test(String(current));
  const ringSize = isMobile ? 82 : 108;

  return (
    <div id="section-stories" ref={ref} style={{ padding: isMobile ? "60px 0" : "clamp(72px, 8vw, 100px) 28px", background: `linear-gradient(160deg, ${colors.cream} 0%, #EDE8DF 100%)`, position: "relative", overflow: "hidden" }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(43,91,168,0.05)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(201,168,76,0.07)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: isMobile ? 28 : 56, padding: isMobile ? "0 16px" : 0 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>Live Site Stories</div>
          <h2 className="display-heading" style={{ fontSize: "clamp(2.1rem, 5.2vw, 3.5rem)" }}>
            See the work<br /><em style={{ fontStyle: "italic", color: colors.darkBlue }}>in progress</em>
          </h2>
          <p className="section-sub">
            Real on-site updates from every sector — tap a circle to watch.
          </p>
        </div>

        <div className="h-scroll" style={{ gap: isMobile ? 12 : 32, padding: isMobile ? "8px 20px 16px" : "8px 0 16px", scrollPaddingInline: isMobile ? 20 : 0 }}>
          {storyFolders.map((folder, i) => {
            const label = folderLabel(folder);
            const isNew = folder.toLowerCase() === "reliance met city";
            return (
              <button key={folder} className={`lift press reveal${visible ? " visible" : ""}`} onClick={() => open(folder)} aria-label={`Watch ${label} stories`}
                style={{ transitionDelay: `${i * 0.1}s`, textAlign: "center", cursor: "pointer", width: ringSize + 26, flexShrink: 0, background: "none", border: "none", padding: 0, scrollSnapAlign: "start" }}>
                <div style={{ position: "relative", marginBottom: 10 }}>
                  {isNew && (
                    <div style={{ position: "absolute", top: -4, right: 0, background: "#16a34a", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 20, zIndex: 3, animation: "pulse-green 2s infinite", letterSpacing: 0.5 }}>NEW</div>
                  )}
                  <div className="story-ring" style={{ width: ringSize, height: ringSize, margin: "0 auto" }}>
                    <div className="story-ring-inner">
                      <img src={(folderImages[folder] || [])[0] || projectData.images[0]} loading="lazy" alt="" className="zoom-img"
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }} />
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: isMobile ? 12.5 : 13, fontWeight: 700, color: colors.black, lineHeight: 1.25 }}>{label}</div>
                <div style={{ fontSize: 10.5, color: colors.darkBlue, marginTop: 2, fontWeight: 600 }}>{sectorSubtitles[folder.toLowerCase()] || ""}</div>
                <div style={{ fontSize: 10.5, color: colors.subtle, marginTop: 1 }}>{(folderImages[folder] || []).length} updates</div>
              </button>
            );
          })}
        </div>

        {/* FULLSCREEN STORY VIEWER */}
        {openStory.open && (
          <div role="dialog" aria-modal="true" aria-label={`${folderLabel(openStory.folder)} stories`}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
            onMouseDown={() => finePointer && setIsPaused(true)} onMouseUp={() => finePointer && setIsPaused(false)}
            style={{ position: "fixed", inset: 0, background: `rgba(0,0,0,${1 - Math.min(dragY / 400, 0.6)})`, zIndex: 2000, display: "flex", justifyContent: "center", alignItems: "center", animation: "fade-in 0.2s ease", touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}>
            <div style={{ position: "absolute", inset: 0, transform: `translateY(${dragY}px) scale(${1 - Math.min(dragY / 2000, 0.1)})`, transition: dragY ? "none" : "transform 0.25s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Progress bars */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "calc(10px + env(safe-area-inset-top)) 12px 0", display: "flex", gap: 4, zIndex: 5, maxWidth: 640, margin: "0 auto" }}>
                {openStory.images.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.3)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "#fff", width: i < openStory.idx ? "100%" : i === openStory.idx ? `${progress * 100}%` : "0%" }} />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div style={{ position: "absolute", top: "calc(24px + env(safe-area-inset-top))", left: 0, right: 0, maxWidth: 640, margin: "0 auto", padding: "0 12px", display: "flex", alignItems: "center", gap: 12, zIndex: 6 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.85)", flexShrink: 0 }}>
                  <img src={openStory.images[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{folderLabel(openStory.folder)}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{openStory.idx + 1} / {openStory.images.length}{isPaused && !dragY ? " · Paused" : ""}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); close(); }} onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); close(); }} aria-label="Close stories" className="icon-btn">
                  <X size={20} color="#fff" />
                </button>
              </div>

              {/* Media */}
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(76px + env(safe-area-inset-top)) 0 calc(44px + env(safe-area-inset-bottom))" }}>
                <div style={{ opacity: isAnimating ? 0 : 1, transition: "opacity 160ms ease", maxWidth: isMobile ? "100%" : 600, width: "100%", height: "100%", borderRadius: isMobile ? 0 : 14, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {currentIsVideo ? (
                    <video key={current} src={current} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                      playsInline autoPlay preload="metadata" muted
                      onLoadedMetadata={(e) => { const d = e.target.duration; elapsedRef.current = 0; setCurrentDuration(d > 0 && isFinite(d) ? d * 1000 : DEFAULT_DURATION); setProgress(0); }}
                      onEnded={next} />
                  ) : (
                    <img key={current} src={current} alt={`${folderLabel(openStory.folder)} update ${openStory.idx + 1}`} draggable={false}
                      style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
                  )}
                </div>
              </div>

              {/* Desktop prev/next arrows & click zones */}
              {!isMobile && (
                <>
                  <div style={{ position: "absolute", left: 0, top: 90, bottom: 40, width: "35%", cursor: "pointer", zIndex: 4 }} onClick={prev} />
                  <div style={{ position: "absolute", right: 0, top: 90, bottom: 40, width: "35%", cursor: "pointer", zIndex: 4 }} onClick={next} />
                  <button onClick={prev} aria-label="Previous" className="icon-btn" style={{ position: "absolute", left: "max(16px, calc(50% - 360px))", top: "50%", transform: "translateY(-50%)", zIndex: 5, width: 48, height: 48, opacity: openStory.idx === 0 ? 0.35 : 1 }}>
                    <ChevronLeft size={22} color="#fff" />
                  </button>
                  <button onClick={next} aria-label="Next" className="icon-btn" style={{ position: "absolute", right: "max(16px, calc(50% - 360px))", top: "50%", transform: "translateY(-50%)", zIndex: 5, width: 48, height: 48 }}>
                    <ChevronRight size={22} color="#fff" />
                  </button>
                </>
              )}

              {/* Gesture hint */}
              <div style={{ position: "absolute", bottom: "calc(14px + env(safe-area-inset-bottom))", left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: 11.5, letterSpacing: 0.3, zIndex: 5, pointerEvents: "none" }}>
                {isMobile ? "Tap to skip · Hold to pause · Swipe down to close" : "← → to navigate · Space to pause · Esc to close"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────── IMAGE GALLERY ─────────────────────────── */
const ImageGallery = () => {
  const isMobile = useIsMobile();
  const { ref, visible } = useReveal();
  const folderImages = useBackendMedia();
  const keys = Object.keys(folderImages);
  const isVideo = (src) => /\.(mp4|webm|ogg)$/i.test(String(src));

  const [lightbox, setLightbox] = useState({ open: false, src: "", folder: "", index: 0, items: [] });
  const thumbsRef = useRef(null);
  useLockBodyScroll(lightbox.open);

  const completedFolders = ["sec 4", "sec 9", "sec 46"];
  const ongoingFolders = ["sec 42", "reliance met city"];
  const normalize = (s) => String(s || "").toLowerCase().trim();
  const resolveFolder = (name) => keys.find((k) => normalize(k) === normalize(name));
  const completedResolved = completedFolders.map(resolveFolder).filter(Boolean);
  const ongoingResolved = ongoingFolders.map(resolveFolder).filter(Boolean);

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

  const openImg = (folder, src, idx, items) => setLightbox({ open: true, src, folder, index: idx, items });
  const close = () => setLightbox({ open: false, src: "", folder: "", index: 0, items: [] });
  const goNext = () => { const n = (lightbox.index + 1) % lightbox.items.length; setLightbox((s) => ({ ...s, index: n, src: s.items[n] })); };
  const goPrev = () => { const p = (lightbox.index - 1 + lightbox.items.length) % lightbox.items.length; setLightbox((s) => ({ ...s, index: p, src: s.items[p] })); };
  const goTo = (i) => setLightbox((s) => ({ ...s, index: i, src: s.items[i] }));
  const lbSwipe = useSwipe({ onLeft: () => { goNext(); vibrate(); }, onRight: () => { goPrev(); vibrate(); }, onDown: close });

  useEffect(() => {
    if (!lightbox.open) return;
    thumbsRef.current?.children[lightbox.index]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [lightbox.open, lightbox.index]);

  useEffect(() => {
    if (!lightbox.open) return;
    const h = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") goNext(); if (e.key === "ArrowLeft") goPrev(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lightbox.open, lightbox.index]);

  const GalleryFolder = ({ folder, isNew = false, delay = 0 }) => {
    const items = (folderImages[folder] || []).filter((src) => !isVideo(src));
    if (!items.length) return null;
    const key = normalize(folder);
    return (
      <div role="button" tabIndex={0} aria-label={`Open ${folderLabel(folder)} gallery, ${items.length} photos`}
        className={`card-hover shine-card neon-hover reveal${visible ? " visible" : ""}`}
        style={{ transitionDelay: `${delay}s`, background: "#fff", borderRadius: 20, overflow: "hidden", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid rgba(43,91,168,0.08)" }}
        onClick={() => openImg(folder, items[0], 0, items)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openImg(folder, items[0], 0, items); } }}>
        <div style={{ position: "relative", overflow: "hidden", aspectRatio: "4/3" }}>
          {isNew && (
            <div style={{ position: "absolute", top: 12, right: 12, background: "#16a34a", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, zIndex: 3, animation: "pulse-green 2s infinite", letterSpacing: 0.5 }}>NEW LAUNCH</div>
          )}
          <img src={items[0]} alt={folderLabel(folder)} loading="lazy" className="zoom-img"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2, background: "rgba(12,15,26,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 5 }}>
            📷 {items.length}
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)" }} />
          <div style={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>{folderLabel(folder)}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 3, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{projectSubtitle[key] || ""}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.66)", marginTop: 2 }}>{items.length} photos</div>
          </div>
        </div>
        <div style={{ padding: "16px 18px" }}>
          <p style={{ fontSize: 13, color: colors.muted, lineHeight: 1.6 }}>{projectDesc[key] || "Construction project."}</p>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, color: colors.darkBlue, fontSize: 13, fontWeight: 600 }}>
            View Gallery <ArrowRight size={14} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="section-gallery" ref={ref} style={{ padding: isMobile ? "60px 16px" : "clamp(72px, 8vw, 100px) 28px", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>Photo Gallery</div>
          <h2 className="display-heading" style={{ fontSize: "clamp(2.1rem, 5.2vw, 3.5rem)" }}>Every project,<br /><em style={{ fontStyle: "italic", color: colors.darkBlue }}>documented</em></h2>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", letterSpacing: 2, textTransform: "uppercase" }}>Completed & Delivered</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))", gap: isMobile ? 16 : 20 }}>
            {completedResolved.map((f, i) => <GalleryFolder key={f} folder={f} delay={i * 0.1} />)}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.gold, animation: "pulse-ring 2s infinite" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e", letterSpacing: 2, textTransform: "uppercase" }}>Active Construction</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: isMobile ? 16 : 20 }}>
            {ongoingResolved.map((f, i) => <GalleryFolder key={f} folder={f} isNew={f.toLowerCase() === "reliance met city"} delay={(i + 3) * 0.1} />)}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <div role="dialog" aria-modal="true" aria-label={`${folderLabel(lightbox.folder)} photos`} onClick={close} {...lbSwipe.handlers}
          style={{ position: "fixed", inset: 0, background: "rgba(5,7,14,0.96)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", flexDirection: "column", zIndex: 2000, animation: "fade-in 0.2s ease",
            padding: "env(safe-area-inset-top) 0 env(safe-area-inset-bottom)" }}>
          {/* Top bar */}
          <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: isMobile ? "12px 14px" : "18px 24px", color: "#fff" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? 20 : 24, fontWeight: 700, lineHeight: 1.1 }}>{folderLabel(lightbox.folder)}</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Photo {lightbox.index + 1} of {lightbox.items.length}</div>
            </div>
            <button onClick={close} aria-label="Close gallery" className="icon-btn"><X size={20} color="#fff" /></button>
          </div>

          {/* Image stage */}
          <div style={{ flex: 1, minHeight: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "0 8px" : "0 84px" }}>
            <img key={lightbox.src} src={lightbox.src} alt={`${folderLabel(lightbox.folder)} — ${lightbox.index + 1} of ${lightbox.items.length}`} onClick={(e) => e.stopPropagation()} draggable={false}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: isMobile ? 10 : 14, display: "block", animation: "fade-in 0.25s ease", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
            {lightbox.items.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Previous photo" className="icon-btn"
                  style={{ position: "absolute", left: isMobile ? 12 : 20, top: "50%", transform: "translateY(-50%)", width: isMobile ? 40 : 52, height: isMobile ? 40 : 52, background: isMobile ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.12)" }}>
                  <ChevronLeft size={isMobile ? 20 : 24} color="#fff" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Next photo" className="icon-btn"
                  style={{ position: "absolute", right: isMobile ? 12 : 20, top: "50%", transform: "translateY(-50%)", width: isMobile ? 40 : 52, height: isMobile ? 40 : 52, background: isMobile ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.12)" }}>
                  <ChevronRight size={isMobile ? 20 : 24} color="#fff" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          <div onClick={(e) => e.stopPropagation()} style={{ padding: isMobile ? "12px 0 8px" : "16px 0 12px" }}>
            <div ref={thumbsRef} className="h-scroll" style={{ gap: 8, padding: "4px 14px" }}>
              {lightbox.items.map((src, i) => (
                <button key={i} onClick={() => goTo(i)} aria-label={`Photo ${i + 1}`}
                  style={{ flexShrink: 0, width: isMobile ? 56 : 72, height: isMobile ? 42 : 52, padding: 0, borderRadius: 8, overflow: "hidden", cursor: "pointer",
                    border: i === lightbox.index ? `2px solid ${colors.gold}` : "2px solid transparent", opacity: i === lightbox.index ? 1 : 0.55, transition: "all 0.2s ease", background: "#111" }}>
                  <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 11.5, marginTop: 8 }}>
              {isMobile ? "Swipe to browse · Swipe down to close" : "Use ← → keys · Esc to close"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────── GURUGRAM LOCATIONS SECTION ─────────────────────────── */
const GurugramLocations = () => {
  const isMobile = useIsMobile();
  const { ref, visible } = useReveal();
  const [activeZone, setActiveZone] = useState(0);

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

  const az = zones[activeZone];
  const zoneRow = useRef(null);
  const pickZone = (i) => {
    const n = Math.max(0, Math.min(zones.length - 1, i));
    setActiveZone(n);
    zoneRow.current?.children[n]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };
  const zoneSwipe = useSwipe({ onLeft: () => { pickZone(activeZone + 1); vibrate(); }, onRight: () => { pickZone(activeZone - 1); vibrate(); } });

  const coverageList = [
    "Sector 4", "Sector 9", "Sector 42", "Sector 46",
    "DLF Phase 1–5", "Golf Course Road", "Golf Course Extension Road",
    "Sohna Road", "Dwarka Expressway", "New Gurugram", "Reliance MET City",
    "MG Road", "Sector 43", "Sector 56", "Sector 57", "Manesar",
  ];

  return (
    <div ref={ref} style={{ background: "#fff" }}>
      {/* ── MAIN ZONES SECTION ── */}
      <div style={{ padding: isMobile ? "60px 16px" : "clamp(72px, 8vw, 100px) 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56 }}>
            <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>Our Service Area</div>
            <h2 className="display-heading" style={{ fontSize: "clamp(2.1rem, 5.2vw, 3.5rem)" }}>
              Our Projects Across<br /><em style={{ fontStyle: "italic", color: colors.darkBlue }}>Gurugram</em>
            </h2>
            <p className="section-sub">
              From established residential sectors to emerging investment zones — serving clients across all major micro-markets in Gurugram.
            </p>
          </div>

          {/* Zone tab selector — swipeable on touch */}
          <div className={`h-scroll-fade reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.1s", marginBottom: isMobile ? 20 : 40, marginLeft: isMobile ? -16 : 0, marginRight: isMobile ? -16 : 0 }}>
            <div ref={zoneRow} className={isMobile ? "h-scroll" : undefined} role="tablist" aria-label="Gurugram zones" style={{ display: "flex", gap: 8, padding: isMobile ? "6px 16px 10px" : "6px 0 10px", flexWrap: isMobile ? "nowrap" : "wrap", justifyContent: isMobile ? "flex-start" : "center" }}>
              {zones.map((z, i) => {
                const on = i === activeZone;
                return (
                  <button key={i} role="tab" aria-selected={on} onClick={() => pickZone(i)} className="chip"
                    style={{ fontSize: isMobile ? 13 : 13.5, padding: isMobile ? "9px 14px" : "10px 18px",
                      background: on ? z.color : "#fff", color: on ? "#fff" : colors.muted,
                      border: `2px solid ${on ? z.color : "rgba(0,0,0,0.09)"}`,
                      boxShadow: on ? `0 8px 24px ${z.color}40` : "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <span style={{ marginRight: 6 }}>{z.icon}</span>{z.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active zone card */}
          <div className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.2s" }} {...zoneSwipe.handlers}>
            <div key={activeZone} style={{
              animation: "fade-in 0.35s ease",
              background: `linear-gradient(135deg, ${az.color}08 0%, ${az.color}04 100%)`,
              border: `1.5px solid ${az.color}25`,
              borderRadius: 28, overflow: "hidden",
              boxShadow: `0 20px 60px ${az.color}12`,
            }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 0 }}>
                {/* Left info */}
                <div style={{ padding: isMobile ? "26px 20px" : "clamp(32px, 4vw, 52px) clamp(28px, 4vw, 48px)", borderRight: isMobile ? "none" : `1px solid ${az.color}20` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: az.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                      {az.icon}
                    </div>
                    <div>
                      <div style={{ display: "inline-block", background: az.tagColor + "18", color: az.tagColor, fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, marginBottom: 4 }}>{az.tag}</div>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: colors.black, lineHeight: 1.15 }}>{az.name}</h3>
                    </div>
                  </div>
                  <p style={{ fontSize: isMobile ? 14.5 : 15, color: colors.muted, lineHeight: 1.8, marginBottom: isMobile ? 22 : 32 }}>{az.description}</p>

                  {/* Highlights */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
                    {az.highlights.map((h, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 12, padding: "10px 14px", border: `1px solid ${az.color}18`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: az.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: colors.black }}>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right sectors */}
                <div style={{ padding: isMobile ? "0 20px 26px" : "clamp(32px, 4vw, 52px) clamp(28px, 4vw, 48px)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: colors.subtle, marginBottom: 20 }}>Areas Covered</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {az.sectors.map((s, i) => (
                      <div key={i} style={{
                        padding: "8px 16px", borderRadius: 50,
                        background: i === 0 ? az.color : `${az.color}12`,
                        color: i === 0 ? "#fff" : az.color,
                        fontSize: 13, fontWeight: 700,
                        border: `1.5px solid ${i === 0 ? az.color : az.color + "30"}`,
                        transition: "all 0.2s ease",
                      }}>
                        {s}
                      </div>
                    ))}
                  </div>

                  {/* Zone note */}
                  <div style={{ marginTop: 32, padding: "20px", background: "#fff", borderRadius: 16, border: `1px solid ${az.color}20` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <MapPin size={16} color={az.color} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: colors.black }}>Serving clients across this zone</span>
                    </div>
                    <p style={{ fontSize: 13, color: colors.subtle, lineHeight: 1.6 }}>
                      We work with buyers and investors across all major residential and investment zones in Gurugram. Get in touch to discuss your requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, fontSize: 12, color: colors.subtle }}>
              {zones.map((_, i) => <span key={i} style={{ width: i === activeZone ? 16 : 6, height: 6, borderRadius: 3, background: i === activeZone ? az.color : "rgba(0,0,0,0.15)", transition: "all 0.3s ease" }} />)}
            </div>
          )}

          {/* Coverage pill cloud */}
          <div className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.3s", marginTop: isMobile ? 40 : 56, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: colors.subtle, marginBottom: 20 }}>Key Areas We Work In</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {coverageList.map((a, i) => (
                <div key={i} className="pill-hover" style={{ padding: "7px 14px", borderRadius: 50, background: colors.cream, border: "1px solid rgba(43,91,168,0.15)", fontSize: isMobile ? 12.5 : 13, fontWeight: 600, color: colors.darkBlue, transition: "all 0.2s" }}>
                  {a}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: colors.subtle, marginTop: 20, fontStyle: "italic" }}>
              Serving clients across major residential and investment zones in Gurugram
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── WHY GURUGRAM SECTION ─────────────────────────── */
const WhyGurugram = () => {
  const isMobile = useIsMobile();
  const { ref, visible } = useReveal();

  const reasons = [
    { icon: "🚇", title: "Delhi Connectivity", desc: "Direct metro lines, NH-48, and Dwarka Expressway offer seamless access to Delhi — a key driver of demand and resale value.", stat: "30 min", statLabel: "to Delhi by metro" },
    { icon: "📈", title: "Rapid Infrastructure", desc: "Massive investments in metro expansion, expressways, smart city projects, and commercial hubs make Gurugram one of India's fastest-growing cities.", stat: "₹50K Cr+", statLabel: "infra investment" },
    { icon: "💰", title: "High Rental Demand", desc: "Home to 250+ Fortune 500 companies, Gurugram generates consistent rental demand from corporate professionals across all sectors.", stat: "6–8%", statLabel: "avg rental yield" },
    { icon: "🏆", title: "Investment Growth", desc: "Property appreciation of 15–25% in key micro-markets over the past 3 years, with Dwarka Expressway and New Gurugram leading the surge.", stat: "25%+", statLabel: "appreciation in key zones" },
    { icon: "🏫", title: "World-class Amenities", desc: "Premium schools, hospitals, malls, golf courses, and international restaurants create a lifestyle that attracts both buyers and renters.", stat: "500+", statLabel: "schools & colleges" },
    { icon: "🌆", title: "Emerging Zones", desc: "New Gurugram, Dwarka Expressway, and Reliance MET City represent the next wave of affordable yet appreciating real estate opportunities.", stat: "3 zones", statLabel: "of high growth" },
  ];

  return (
    <div ref={ref} style={{ padding: isMobile ? "60px 16px" : "clamp(72px, 8vw, 100px) 28px", background: "#0C0F1A" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: isMobile ? 40 : 64 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16, color: "rgba(201,168,76,0.85)" }}>
            <span style={{ background: colors.gold }} /> Why Invest Here
          </div>
          <h2 className="display-heading" style={{ fontSize: "clamp(2.1rem, 5.2vw, 3.5rem)", color: "#fff" }}>
            Why <em style={{ color: colors.gold, fontStyle: "italic" }}>Gurugram</em>
          </h2>
          <p style={{ maxWidth: 520, margin: "20px auto 0", color: "rgba(255,255,255,0.66)", fontSize: 16, lineHeight: 1.85 }}>
            India's Millennium City — a convergence of world-class infrastructure, corporate investment, and real estate opportunity.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: isMobile ? 12 : 20 }}>
          {reasons.map((r, i) => (
            <div key={i} className={`tilt-card reveal${visible ? " visible" : ""}`}
              style={{
                transitionDelay: `${i * 0.08}s`,
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20, padding: isMobile ? "22px" : "28px",
                cursor: "default",
              }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{r.icon}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: colors.gold, lineHeight: 1 }}>{r.stat}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{r.statLabel}</div>
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{r.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>{r.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.5s", marginTop: isMobile ? 36 : 56, textAlign: "center", padding: isMobile ? "28px 18px" : "36px 28px", background: "rgba(201,168,76,0.08)", borderRadius: 20, border: "1px solid rgba(201,168,76,0.2)" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
            Ready to invest in Gurugram?
          </div>
          <p style={{ color: "rgba(255,255,255,0.66)", fontSize: 14, marginBottom: 24 }}>
            Speak to our team about ongoing projects, site visits, and investment options.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "auto auto", gap: 10, justifyContent: "center" }}>
            <a href={`tel:${PHONE}`} className="btn-primary" style={{ textDecoration: "none", padding: "0 24px", fontSize: 15, justifyContent: "center" }}>
              <Phone size={17} /> Call Now
            </a>
            <a href={`${WA_URL}?text=Hi%2C%20I%27m%20interested%20in%20investing%20in%20Gurugram.`} target="_blank" rel="noreferrer" className="btn-wa" style={{ textDecoration: "none", padding: "0 24px", fontSize: 15, justifyContent: "center" }}>
              <MessageCircle size={17} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── CONTACT SECTION ─────────────────────────── */
const ContactSection = () => {
  const isMobile = useIsMobile();
  const { ref, visible } = useReveal();

  let profileImg = null;
  try { profileImg = require("./data/Profile/my_img.jpeg"); } catch (e) {}

  return (
    <div id="section-contact" ref={ref} style={{ padding: isMobile ? "60px 16px" : "clamp(72px, 8vw, 100px) 28px", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>Get in Touch</div>
          <h2 className="display-heading" style={{ fontSize: "clamp(2.1rem, 5.2vw, 3.5rem)" }}>
            Let's build your<br /><em style={{ fontStyle: "italic", color: colors.darkBlue }}>dream together</em>
          </h2>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.15s", background: "linear-gradient(145deg, rgba(245,240,232,0.95), rgba(235,228,215,0.9))", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: 28, padding: isMobile ? "32px 20px" : "56px 64px", maxWidth: 520, width: "100%", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 20px 60px rgba(43,91,168,0.12)" }}>
            <div style={{ position: "absolute", top: -30, left: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(43,91,168,0.06)" }} />
            <div style={{ position: "absolute", bottom: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(201,168,76,0.1)" }} />

            {profileImg ? (
              <div style={{ width: isMobile ? 100 : 120, height: isMobile ? 100 : 120, borderRadius: "50%", margin: "0 auto 24px", position: "relative" }}>
                <div style={{ position: "absolute", inset: -4, borderRadius: "50%", background: `linear-gradient(135deg, ${colors.darkBlue}, ${colors.gold})`, zIndex: 0 }} />
                <img src={profileImg} alt="Parveen Chawla" loading="lazy"
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "4px solid #fff", position: "relative", zIndex: 1 }} />
              </div>
            ) : (
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: `linear-gradient(135deg, ${colors.darkBlue}, ${colors.gold})`, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#fff" }}>PC</span>
              </div>
            )}

            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: colors.black, marginBottom: 4, position: "relative" }}>Parveen Chawla</h3>
            <p style={{ fontSize: 14, color: colors.subtle, marginBottom: isMobile ? 24 : 32, fontWeight: 500, position: "relative" }}>Founder · ShineOne Estate</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
              <a href={`tel:${PHONE}`} className="btn-primary" style={{ textDecoration: "none", width: "100%", padding: "0 20px", minHeight: 52, fontSize: 15, justifyContent: "center" }}>
                <Phone size={18} /> +91 93109 94032
              </a>
              <a href={WA_URL} target="_blank" rel="noreferrer" className="btn-wa" style={{ textDecoration: "none", width: "100%", padding: "0 20px", minHeight: 52, fontSize: 15, justifyContent: "center" }}>
                <MessageCircle size={18} /> WhatsApp Chat
              </a>
              <a href={`mailto:${EMAIL}`} className="btn-outline" style={{ textDecoration: "none", width: "100%", padding: "0 16px", minHeight: 52, fontSize: isMobile ? 14 : 15, overflowWrap: "anywhere" }}>
                <MailIcon color="currentColor" size={18} /> {EMAIL}
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 18, fontSize: 12.5, color: colors.subtle, position: "relative" }}>
              <Clock size={14} /> Usually replies within minutes · Site visits on working days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── FOOTER ─────────────────────────── */
const Footer = () => {
  const isMobile = useIsMobile();
  const isCompact = useIsCompact();
  return (
    <footer style={{ background: "#0D0D0D", color: colors.cream, padding: isCompact ? "56px 20px calc(100px + env(safe-area-inset-bottom))" : "80px 28px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr 1fr", gap: isMobile ? 36 : 40, marginBottom: isMobile ? 36 : 48 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: colors.gold, marginBottom: 8 }}>ShineOne Estate</div>
            <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>We Build Your Vision</div>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: "rgba(255,255,255,0.72)", maxWidth: 360 }}>
              Premium residential development focused on transparent construction, quality materials and timely delivery across Gurugram's key sectors.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <a href={`tel:${PHONE}`} className="press" style={{ textDecoration: "none", background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "0 16px", minHeight: 44, display: "flex", alignItems: "center", gap: 8, color: "#fff", fontSize: 13.5, fontWeight: 600, transition: "transform 0.15s" }}>
                <Phone size={15} /> Call
              </a>
              <a href={WA_URL} target="_blank" rel="noreferrer" className="press" style={{ textDecoration: "none", background: "rgba(37,211,102,0.15)", borderRadius: 10, padding: "0 16px", minHeight: 44, display: "flex", alignItems: "center", gap: 8, color: "#4ade80", fontSize: 13.5, fontWeight: 600, transition: "transform 0.15s" }}>
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>Projects</h4>
            {[["Sector 4", "Completed"], ["Sector 9", "Completed"], ["Sector 46", "Completed"], ["Sector 42", "Ongoing"], ["Reliance MET City", "NEW"]].map(([name, status]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>{name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: status === "Completed" ? "#4ade80" : status === "NEW" ? colors.gold : "#fbbf24", letterSpacing: 0.5 }}>{status}</span>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: <Phone size={15} />, text: "+91 93109 94032", href: "tel:+919310994032" },
                { icon: <MailIcon color="currentColor" size={15} />, text: "parveen@shineoneestate.co.in", href: "mailto:parveen@shineoneestate.co.in" },
                { icon: <MapPin size={15} />, text: "Gurugram, Haryana", href: null },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ color: colors.gold, marginTop: 1, flexShrink: 0 }}>{item.icon}</div>
                  {item.href ? (
                    <a href={item.href} style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", textDecoration: "none", lineHeight: 1.6 }}>{item.text}</a>
                  ) : (
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{item.text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>© 2026 ShineOne Estate · Built with transparency and trust.</span>
         
        </div>
      </div>
    </footer>
  );
};

/* ─────────────────────────── STICKY CTA (phones & tablets) ─────────────────────────── */
const StickyCTA = () => {
  const isCompact = useIsCompact();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Appears once the hero (which has its own buttons) is scrolled past
    const fn = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    fn(); window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!isCompact) return null;
  return (
    <div role="region" aria-label="Quick contact" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 500, background: "rgba(13,13,13,0.94)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)",
      borderTop: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 -8px 30px rgba(0,0,0,0.25)",
      padding: "10px 12px calc(10px + env(safe-area-inset-bottom))",
      transform: visible ? "translateY(0)" : "translateY(110%)", transition: "transform 0.45s cubic-bezier(.22,1,.36,1)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 52px", gap: 8 }}>
        <a href={`tel:${PHONE}`} className="btn-primary" style={{ textDecoration: "none", padding: "0 12px", fontSize: 15, justifyContent: "center", boxShadow: "none" }}>
          <Phone size={17} /> Call
        </a>
        <a href={`${WA_URL}?text=${encodeURIComponent("Hi, I'm interested in a ShineOne Estate project.")}`} target="_blank" rel="noreferrer" className="btn-wa" style={{ textDecoration: "none", padding: "0 12px", fontSize: 15, justifyContent: "center", boxShadow: "none" }}>
          <MessageCircle size={17} /> WhatsApp
        </a>
        <a href={`mailto:${EMAIL}`} aria-label="Email us" className="btn-ghost" style={{ textDecoration: "none", justifyContent: "center", padding: 0, background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}>
          <MailIcon color="#fff" size={19} />
        </a>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   NEW FEATURES
═══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────── PAGE LOADER ─────────────────────────── */
const PageLoader = ({ onDone }) => {
  const [phase, setPhase] = useState(0); // 0=counting, 1=reveal, 2=done
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Count 0→100 over ~0.9s
    const start = Date.now();
    const dur = 900;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(ease * 100));
      if (p < 1) requestAnimationFrame(tick);
      else {
        setPhase(1);
        setTimeout(() => { setPhase(2); onDone(); }, 450);
      }
    };
    requestAnimationFrame(tick);
  }, []);

  if (phase === 2) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#0C0F1A",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: phase === 1 ? 0 : 1,
      transform: phase === 1 ? "scale(1.04)" : "scale(1)",
      transition: "opacity 0.45s ease, transform 0.45s ease",
      pointerEvents: phase === 1 ? "none" : "all",
    }}>
      {/* Spinning ring */}
      <div style={{ position: "relative", width: 110, height: 110, marginBottom: 32 }}>
        <svg width="110" height="110" style={{ position: "absolute", inset: 0, animation: "border-spin 2.5s linear infinite" }}>
          <circle cx="55" cy="55" r="50" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="2" />
          <circle cx="55" cy="55" r="50" fill="none" stroke="url(#loaderGrad)" strokeWidth="2.5"
            strokeDasharray="314" strokeDashoffset={314 - (314 * count / 100)}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.05s linear" }} />
          <defs>
            <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2B5BA8" />
              <stop offset="100%" stopColor="#C9A84C" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: "#fff" }}>{count}</span>
        </div>
      </div>

      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "#fff", letterSpacing: 1, marginBottom: 8 }}>
        ShineOne <span style={{ color: colors.gold, fontStyle: "italic" }}>Estate</span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
        We Build Your Vision
      </div>

      {/* Progress bar */}
      <div style={{ width: 200, height: 2, background: "rgba(255,255,255,0.1)", borderRadius: 1, marginTop: 32, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${count}%`, background: "linear-gradient(90deg, #2B5BA8, #C9A84C)", transition: "width 0.05s linear", borderRadius: 1 }} />
      </div>
    </div>
  );
};

/* ─────────────────────────── CUSTOM CURSOR ─────────────────────────── */
const CustomCursor = () => {
  const isMobile = !useFinePointer();
  const dot = useRef(null);
  const ring = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (isMobile) return;
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dot.current) {
        dot.current.style.left = e.clientX + "px";
        dot.current.style.top = e.clientY + "px";
      }
    };
    const onDown = () => setClicked(true);
    const onUp = () => setClicked(false);

    // Detect hover on interactive elements
    const onEnter = (e) => {
      if (e.target.closest("a,button,[data-cursor-hover]")) setHovered(true);
    };
    const onLeave = (e) => {
      if (e.target.closest("a,button,[data-cursor-hover]")) setHovered(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);

    // Smooth ring follow
    let raf;
    const lerp = (a, b, t) => a + (b - a) * t;
    const follow = () => {
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.1);
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.1);
      if (ring.current) {
        ring.current.style.left = ringPos.current.x + "px";
        ring.current.style.top = ringPos.current.y + "px";
      }
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      {/* Dot — snaps instantly */}
      <div ref={dot} style={{
        position: "fixed", pointerEvents: "none", zIndex: 99999,
        width: clicked ? 6 : 8, height: clicked ? 6 : 8,
        borderRadius: "50%", background: colors.gold,
        transform: "translate(-50%, -50%)",
        transition: "width 0.15s, height 0.15s",
        mixBlendMode: "normal",
      }} />
      {/* Ring — lags behind */}
      <div ref={ring} style={{
        position: "fixed", pointerEvents: "none", zIndex: 99998,
        width: hovered ? 48 : clicked ? 20 : 32,
        height: hovered ? 48 : clicked ? 20 : 32,
        borderRadius: "50%",
        border: `1.5px solid ${hovered ? colors.gold : "rgba(43,91,168,0.7)"}`,
        transform: "translate(-50%, -50%)",
        transition: "width 0.3s cubic-bezier(.22,1,.36,1), height 0.3s cubic-bezier(.22,1,.36,1), border-color 0.3s",
        background: hovered ? "rgba(201,168,76,0.08)" : "transparent",
      }} />
    </>
  );
};

/* ─────────────────────────── WAVE DIVIDER ─────────────────────────── */
const WaveDivider = ({ topColor = "#fff", bottomColor = "#F5F0E8", flip = false }) => (
  <div aria-hidden="true" style={{ position: "relative", overflow: "hidden", height: "clamp(32px, 5vw, 72px)", background: bottomColor, marginTop: -1 }}>
    <svg viewBox="0 0 1440 72" preserveAspectRatio="none"
      style={{ position: "absolute", bottom: flip ? "auto" : 0, top: flip ? 0 : "auto", width: "100%", height: "100%", transform: flip ? "scaleY(-1)" : "none" }}>
      <path d="M0,36 C240,72 480,0 720,36 C960,72 1200,0 1440,36 L1440,72 L0,72 Z" fill={topColor} />
    </svg>
  </div>
);

const DiagonalDivider = ({ color = "#fff" }) => (
  <div style={{ height: 60, background: "transparent", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, background: color, clipPath: "polygon(0 0, 100% 40%, 100% 100%, 0 100%)" }} />
  </div>
);

/* ─────────────────────────── SCROLL TO TOP ─────────────────────────── */
const ScrollToTop = () => {
  const isCompact = useIsCompact();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? scrolled / total : 0);
      setVisible(scrolled > window.innerHeight * 1.2);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => { vibrate(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const size = isCompact ? 46 : 52;
  const r = size / 2 - 5;
  const circumference = 2 * Math.PI * r;

  return (
    <button onClick={scrollUp} data-cursor-hover aria-label="Back to top"
      style={{
        position: "fixed", zIndex: 450, width: size, height: size,
        bottom: isCompact ? "calc(84px + env(safe-area-inset-bottom))" : 100, right: isCompact ? 14 : 26,
        borderRadius: "50%", border: "none", cursor: "pointer",
        background: colors.darkBlue, boxShadow: "0 8px 24px rgba(43,91,168,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
        transition: "opacity 0.4s cubic-bezier(.22,1,.36,1), transform 0.4s cubic-bezier(.22,1,.36,1)",
        pointerEvents: visible ? "auto" : "none",
      }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.gold} strokeWidth="2.5"
          strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round" />
      </svg>
      <ChevronLeft size={18} color="#fff" style={{ transform: "rotate(90deg)" }} />
    </button>
  );
};

/* ─────────────────────────── WHATSAPP WIDGET ─────────────────────────── */
const WhatsAppWidget = () => {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const isCompact = useIsCompact();
  const boxRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [open]);

  if (isCompact) return null;

  const messages = [
    { text: "👋 Hi! Interested in a project?", from: "them", delay: 0 },
    { text: "We have ongoing projects in Sector 42 & Reliance MET City.", from: "them", delay: 400 },
  ];

  const quickReplies = [
    { label: "Sector 42 details", msg: "Hi, I'd like to know more about Sector 42 project." },
    { label: "Reliance MET City", msg: "Hi, I'm interested in the Reliance MET City project." },
    { label: "Book a site visit", msg: "Hi, I'd like to book a site visit." },
    { label: "Pricing & plans", msg: "Hi, can you share pricing details?" },
  ];

  return (
    <div ref={boxRef} style={{ position: "fixed", bottom: 26, right: 24, zIndex: 460 }}>
      {/* Chat panel */}
      {open && (
        <div style={{
          position: "absolute", bottom: 68, right: 0,
          width: 330,
          maxHeight: 440,
          background: "#fff", borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
          animation: "slide-up 0.3s cubic-bezier(.22,1,.36,1) both",
          border: "1px solid rgba(0,0,0,0.06)",
        }}>
          {/* Header */}
          <div style={{ background: "#25D366", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 22 }}>🏠</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>ShineOne Estate</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
                Online · Typically replies in minutes
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
              <X size={18} color="rgba(255,255,255,0.8)" />
            </button>
          </div>

          {/* Chat bubbles */}
          <div style={{ padding: "16px 14px 8px", background: "#ECE5DD", minHeight: 120 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8, animation: `slide-up 0.4s ease ${m.delay}ms both` }}>
                <div style={{ background: "#fff", borderRadius: "0 12px 12px 12px", padding: "10px 14px", maxWidth: "85%", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", fontSize: 14, lineHeight: 1.5, color: "#0D0D0D" }}>
                  {m.text}
                </div>
              </div>
            ))}
            <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", textAlign: "center", marginTop: 8, fontStyle: "italic" }}>
              Choose a message to send
            </div>
          </div>

          {/* Quick replies */}
          <div style={{ padding: "10px 12px 14px", background: "#fff", display: "flex", flexDirection: "column", gap: 7 }}>
            {quickReplies.map((r, i) => (
              <a key={i} href={`https://wa.me/919310994032?text=${encodeURIComponent(r.msg)}`}
                target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <button style={{
                  width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 10,
                  border: "1.5px solid #25D366", background: "transparent",
                  color: "#128C7E", fontWeight: 600, fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                  transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f0fdf4"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  {r.label} <ArrowRight size={14} />
                </button>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* FAB button */}
      <button onClick={() => setOpen(!open)} data-cursor-hover aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp chat"} aria-expanded={open}
        style={{
          width: 58, height: 58, borderRadius: "50%", border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #25D366, #128C7E)",
          boxShadow: open ? "0 8px 24px rgba(37,211,102,0.5)" : "0 8px 32px rgba(37,211,102,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: entered ? 1 : 0,
          transform: entered ? "scale(1)" : "scale(0.5)",
          transition: "all 0.4s cubic-bezier(.22,1,.36,1)",
          animation: entered && !open ? "pulse-green 2.5s infinite" : "none",
        }}>
        {open
          ? <X size={24} color="#fff" />
          : <MessageCircle size={26} color="#fff" />
        }
      </button>

      {/* Notification dot */}
      {!open && entered && (
        <div style={{ position: "absolute", top: 2, right: 2, width: 14, height: 14, borderRadius: "50%", background: "#ef4444", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>1</span>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────── BEFORE / AFTER SLIDER ─────────────────────────── */
const BeforeAfterSlider = () => {
  const isMobile = useIsMobile();
  const { ref, visible } = useReveal();
  const [sliderX, setSliderX] = useState(50); // percentage
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  let beforeImg, afterImg;
  try { beforeImg = require("./data/beforeafter/before.jpeg"); } catch (e) {}
  try { afterImg = require("./data/beforeafter/After.jpeg"); } catch (e) {}

  // Fallback to stock images
  if (!beforeImg) beforeImg = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900";
  if (!afterImg) afterImg = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900";

  const updateSlider = (clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setSliderX(pct);
  };

  // Pointer events cover mouse, touch and pen. touch-action: pan-y keeps vertical page scrolling
  // working while a horizontal drag moves the slider.
  const onPointerDown = (e) => {
    setDragging(true);
    updateSlider(e.clientX);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  };
  const onPointerMove = (e) => { if (dragging) updateSlider(e.clientX); };
  const stop = () => setDragging(false);
  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); setSliderX((x) => Math.max(5, x - 5)); }
    if (e.key === "ArrowRight") { e.preventDefault(); setSliderX((x) => Math.min(95, x + 5)); }
  };

  return (
    <div ref={ref} style={{ padding: isMobile ? "60px 16px" : "clamp(72px, 8vw, 100px) 28px", background: "#0C0F1A" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: isMobile ? 36 : 52 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16, color: "rgba(201,168,76,0.9)" }}>
            <span style={{ background: colors.gold }} /> Before & After
          </div>
          <h2 className="display-heading" style={{ fontSize: "clamp(2.1rem, 5vw, 3.2rem)", color: "#fff" }}>
            The transformation<br /><em style={{ color: colors.gold, fontStyle: "italic" }}>speaks for itself</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.66)", fontSize: 15, marginTop: 16, lineHeight: 1.8 }}>
            See how our sites go from bare ground to finished homes
          </p>
        </div>

        <div className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.2s" }}>
          <div ref={containerRef}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={stop} onPointerCancel={stop}
            role="slider" tabIndex={0} aria-label="Before and after comparison" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(sliderX)} onKeyDown={onKeyDown}
            style={{ position: "relative", borderRadius: isMobile ? 18 : 24, overflow: "hidden", userSelect: "none", WebkitUserSelect: "none", touchAction: "pan-y", aspectRatio: isMobile ? "4/3" : "16/7", maxHeight: "72vh", width: "100%", cursor: dragging ? "grabbing" : "ew-resize", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>

            {/* AFTER (full background) */}
            <img src={afterImg} alt="After" loading="lazy" draggable={false}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />

            {/* BEFORE (clipped left side) */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", width: `${sliderX}%` }}>
              <img src={beforeImg} alt="Before" loading="lazy" draggable={false}
                style={{ width: `${10000 / sliderX}%`, maxWidth: "none", height: "100%", objectFit: "cover", objectPosition: "center" }} />
            </div>

            {/* Labels */}
            <div style={{ position: "absolute", top: 18, left: 18, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", color: "#fff", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.2)" }}>
              Before
            </div>
            <div style={{ position: "absolute", top: 18, right: 18, background: "rgba(43,91,168,0.85)", backdropFilter: "blur(8px)", color: "#fff", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.2)" }}>
              After
            </div>

            {/* Divider line */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sliderX}%`, width: 2, background: "#fff", transform: "translateX(-50%)", boxShadow: "0 0 12px rgba(255,255,255,0.6)" }} />

            {/* Drag handle */}
            <div aria-hidden="true"
              style={{
                position: "absolute", top: "50%", left: `${sliderX}%`,
                transform: "translate(-50%, -50%)",
                width: 48, height: 48, borderRadius: "50%",
                background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "grab", zIndex: 3, transition: dragging ? "none" : "left 0.25s cubic-bezier(.22,1,.36,1)",
                pointerEvents: "none",
                border: `3px solid ${colors.gold}`,
              }}>
              <div style={{ display: "flex", gap: 3 }}>
                <ChevronLeft size={14} color={colors.darkBlue} />
                <ChevronRight size={14} color={colors.darkBlue} />
              </div>
            </div>
          </div>

          {/* Hint text */}
          <div style={{ textAlign: "center", marginTop: 16, color: "rgba(255,255,255,0.55)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 16, display: "inline-block", animation: "nudge-x 1.6s ease-in-out infinite" }}>👆</span> {isMobile ? "Slide or tap anywhere on the photo" : "Drag, click, or use ← → keys to compare"}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── FAQ SECTION ─────────────────────────── */
const FAQSection = () => {
  const isMobile = useIsMobile();
  const { ref, visible } = useReveal();
  const [openIdx, setOpenIdx] = useState(null);

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
    <div ref={ref} style={{ padding: isMobile ? "60px 16px" : "clamp(72px, 8vw, 100px) 28px", background: colors.cream }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>FAQ</div>
          <h2 className="display-heading" style={{ fontSize: "clamp(2.1rem, 5vw, 3.2rem)" }}>
            Common questions<br /><em style={{ color: colors.darkBlue, fontStyle: "italic" }}>answered</em>
          </h2>
          <p className="section-sub">
            Everything you need to know before making your decision.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className={`reveal${visible ? " visible" : ""}`}
                style={{ transitionDelay: `${i * 0.05}s`, background: "#fff", borderRadius: 16, overflow: "hidden",
                  border: `1.5px solid ${isOpen ? colors.darkBlue : "rgba(43,91,168,0.1)"}`,
                  boxShadow: isOpen ? "0 8px 32px rgba(43,91,168,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.3s ease" }}>
                <button onClick={() => setOpenIdx(isOpen ? null : i)} aria-expanded={isOpen}
                  style={{ minHeight: 60, width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
                    padding: isMobile ? "18px 18px" : "22px 28px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 14 : 16, fontWeight: 700, color: isOpen ? colors.darkBlue : colors.black, lineHeight: 1.4 }}>
                    {faq.q}
                  </span>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: isOpen ? colors.darkBlue : "rgba(43,91,168,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s ease" }}>
                    <div style={{ width: 10, height: 10, position: "relative" }}>
                      <div style={{ position: "absolute", width: 10, height: 2, background: isOpen ? "#fff" : colors.darkBlue, borderRadius: 1, top: "50%", left: 0, transform: "translateY(-50%)" }} />
                      <div style={{ position: "absolute", width: 2, height: 10, background: isOpen ? "#fff" : colors.darkBlue, borderRadius: 1, top: 0, left: "50%", transform: `translateX(-50%) scaleY(${isOpen ? 0 : 1})`, transition: "transform 0.3s ease" }} />
                    </div>
                  </div>
                </button>
                <div style={{ maxHeight: isOpen ? 600 : 0, overflow: "hidden", transition: "max-height 0.45s cubic-bezier(.22,1,.36,1)" }}>
                  <div style={{ padding: isMobile ? "0 18px 20px" : "0 28px 24px", fontSize: 14, color: colors.muted, lineHeight: 1.85, borderTop: "1px solid rgba(43,91,168,0.08)" }}>
                    <div style={{ paddingTop: 16 }}>{faq.a}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA below FAQ */}
        <div className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.4s", textAlign: "center", marginTop: isMobile ? 32 : 48, padding: isMobile ? "28px 20px" : "36px 28px", background: `linear-gradient(135deg, ${colors.darkBlue}, #1f4a8f)`, borderRadius: 20, boxShadow: "0 16px 48px rgba(43,91,168,0.25)" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Still have questions?</div>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginBottom: 20 }}>Our team responds within minutes on WhatsApp</p>
          <a href={`${WA_URL}?text=Hi%2C%20I%20have%20a%20question%20about%20ShineOne%20Estate.`} target="_blank" rel="noreferrer" className="btn-wa" style={{ textDecoration: "none", padding: "0 28px", fontSize: 15, justifyContent: "center", width: isMobile ? "100%" : "auto" }}>
            <MessageCircle size={18} /> Ask on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── APP ─────────────────────────── */
export default function App() {
  // Intro loader plays once per browser session (and never for reduced-motion users)
  const [loading, setLoading] = useState(() => {
    try {
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
      return !sessionStorage.getItem("s1-intro-seen");
    } catch (e) { return true; }
  });
  const finishLoading = () => {
    try { sessionStorage.setItem("s1-intro-seen", "1"); } catch (e) {}
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: colors.cream, minHeight: "100vh", overflowX: "clip" }}>
      <GlobalStyles />
      <CustomCursor />
      {loading && <PageLoader onDone={finishLoading} />}

      <div style={{ opacity: loading ? 0 : 1, transition: "opacity 0.5s ease 0.1s" }}>
        <StickyHeader />
        <Hero />
        <Ticker />
        <StatsRow />

        <WaveDivider topColor={colors.cream} bottomColor="#fff" />
        <QuickSnapshot />
        <WaveDivider topColor="#fff" bottomColor="#fff" />

        <ProgressTimeline />

        <WaveDivider topColor="#fff" bottomColor={colors.cream} />
        <StoriesViewer />
        <WaveDivider topColor={colors.cream} bottomColor="#fff" />

        <ImageGallery />

        <BeforeAfterSlider />

        <WaveDivider topColor="#0C0F1A" bottomColor={colors.cream} />
        <FAQSection />
        <WaveDivider topColor={colors.cream} bottomColor="#fff" />

        <div id="section-locations">
          <GurugramLocations />
        </div>

        <WhyGurugram />

        <WaveDivider topColor="#0C0F1A" bottomColor="#fff" />

        <ContactSection />
        <Footer />
        <StickyCTA />
        <WhatsAppWidget />
        <ScrollToTop />
      </div>
    </div>
  );
}