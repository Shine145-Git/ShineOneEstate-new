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

const useIsMobile = () => {
  const [v, setV] = useState(typeof window !== "undefined" && window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setV(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
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
const colors = { cream: "#F5F0E8", lightBlue: "#8FABD4", darkBlue: "#2B5BA8", black: "#0D0D0D", gold: "#C9A84C" };

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

/* Auto-generate stories from require.context */
(function generateStories() {
  let folderImages = {};
  try {
    const ctx = require.context("./data", true, /\.(png|jpe?g|webp|gif|mp4|webm|ogg)$/i);
    ctx.keys().forEach((k) => {
      const clean = k.replace(/^\.\//, "");
      const parts = clean.split("/");
      if (parts.length >= 2) {
        const folder = parts[0];
        if (!folderImages[folder]) folderImages[folder] = [];
        try { folderImages[folder].push(ctx(k)); } catch (e) {}
      }
    });
  } catch (e) {}
  try {
    const rmcCtx = require.context("./Reliance Met City", false, /\.(png|jpe?g|webp|gif|mp4|webm|ogg)$/i);
    rmcCtx.keys().forEach((k) => {
      try {
        if (!folderImages["Reliance Met City"]) folderImages["Reliance Met City"] = [];
        folderImages["Reliance Met City"].push(rmcCtx(k));
      } catch (e) {}
    });
  } catch (e) {}

  projectData.folderImages = folderImages;

  const order = ["sec 4", "sec 9", "sec 46", "sec 42", "reliance met city"];
  const keys = Object.keys(folderImages);
  const sorted = order.map((d) => keys.find((k) => k.toLowerCase() === d)).filter(Boolean);
  const rest = keys.filter((k) => !sorted.includes(k));
  projectData.stories = [...sorted, ...rest].map((folder) => ({
    week: folder, title: folder,
    image: (folderImages[folder] && folderImages[folder][0]) || projectData.images[0],
  }));

  if (!projectData.stories.length) {
    projectData.stories = projectData.projects.map((p) => ({ week: p.name, title: p.name, image: projectData.images[0] }));
  }
})();

/* ─────────────────────────── GLOBAL STYLES ─────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..500;9..600;9..700;9..800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; background: #F5F0E8; color: #0D0D0D; }
    ::-webkit-scrollbar { width: 5px; } 
    ::-webkit-scrollbar-track { background: #F5F0E8; }
    ::-webkit-scrollbar-thumb { background: #2B5BA8; border-radius: 3px; }
    
    .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.75s cubic-bezier(.22,1,.36,1), transform 0.75s cubic-bezier(.22,1,.36,1); }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-left { opacity: 0; transform: translateX(-40px); transition: opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1); }
    .reveal-left.visible { opacity: 1; transform: translateX(0); }
    .reveal-right { opacity: 0; transform: translateX(40px); transition: opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1); }
    .reveal-right.visible { opacity: 1; transform: translateX(0); }

    @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
    @keyframes float2 { 0%,100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-6px) rotate(2deg); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(43,91,168,0.4); } 70% { box-shadow: 0 0 0 12px rgba(43,91,168,0); } 100% { box-shadow: 0 0 0 0 rgba(43,91,168,0); } }
    @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(22,163,74,0.5); } 70% { box-shadow: 0 0 0 10px rgba(22,163,74,0); } 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); } }
    @keyframes gradient-x { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes slide-up { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
    @keyframes slide-up-delay { 0%,30% { opacity:0; transform:translateY(20px); } 100% { opacity:1; transform:translateY(0); } }
    @keyframes fade-in { from { opacity:0; } to { opacity:1; } }
    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    @keyframes hero-img-scale { from { transform: scale(1.08); } to { transform: scale(1); } }
    @keyframes count-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes glow-pulse { 0%,100% { opacity:0.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.2); } }
    @keyframes border-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes ping { 0% { transform:scale(1); opacity:0.75; } 100% { transform:scale(2.4); opacity:0; } }

    .btn-primary {
      background: linear-gradient(135deg, #2B5BA8 0%, #1a3f7a 100%);
      color: #fff; border: none; border-radius: 12px; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: 0.3px;
      transition: all 0.28s cubic-bezier(.22,1,.36,1); display: inline-flex; align-items: center; gap: 8px;
      position: relative; overflow: hidden;
    }
    .btn-primary::after { content:''; position:absolute; inset:0; background:rgba(255,255,255,0); transition: background 0.2s; }
    .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(43,91,168,0.45); }
    .btn-primary:hover::after { background:rgba(255,255,255,0.08); }
    .btn-primary:active { transform: translateY(-1px); }

    .btn-wa {
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      color: #fff; border: none; border-radius: 12px; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-weight: 700;
      transition: all 0.28s cubic-bezier(.22,1,.36,1); display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-wa:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(37,211,102,0.4); }

    .btn-ghost {
      background: rgba(255,255,255,0.12); backdrop-filter: blur(12px);
      color: #fff; border: 1.5px solid rgba(255,255,255,0.35); border-radius: 12px; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-weight: 700;
      transition: all 0.28s ease; display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-ghost:hover { background: rgba(255,255,255,0.22); transform: translateY(-3px); border-color: rgba(255,255,255,0.6); }

    .card-hover { transition: all 0.4s cubic-bezier(.22,1,.36,1); }
    .card-hover:hover { transform: translateY(-8px); box-shadow: 0 28px 56px rgba(0,0,0,0.14) !important; }

    .story-ring { 
      background: conic-gradient(#2B5BA8, #C9A84C, #2B5BA8, #C9A84C, #2B5BA8);
      animation: border-spin 4s linear infinite;
      padding: 3px; border-radius: 50%;
    }
    .story-ring-inner { background: #F5F0E8; border-radius: 50%; padding: 3px; }

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
      backdrop-filter: blur(10px); border-radius: 50px;
      padding: 8px 18px; color: #C9A84C; font-size: 12px; font-weight: 700;
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
      font-weight: 700; line-height: 1.02; color: #0D0D0D;
    }

    .ticker-inner { display: flex; width: max-content; animation: marquee 28s linear infinite; }

    .hero-stat-card {
      background: rgba(255,255,255,0.96); backdrop-filter: blur(20px);
      border-radius: 18px; padding: 16px 20px; border: 1px solid rgba(255,255,255,0.8);
      box-shadow: 0 8px 32px rgba(0,0,0,0.12); min-width: 140px;
    }

    .img-thumb {
      border-radius: 12px; overflow: hidden; cursor: pointer;
      transition: all 0.3s ease; border: 2px solid rgba(255,255,255,0.2);
    }
    .img-thumb:hover { transform: scale(1.05); border-color: #C9A84C; }
    .img-thumb.active { border-color: #C9A84C; box-shadow: 0 0 0 2px #C9A84C; }

    input, select, textarea { font-family: 'DM Sans', sans-serif; }

    @media (max-width: 768px) {
      .hero-stat-row { flex-wrap: wrap; gap: 10px !important; }
      .hero-stat-card { min-width: calc(50% - 5px) !important; padding: 12px 14px !important; }
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
const StickyHeader = () => {
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    fn(); window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Overview", id: "section-overview" },
    { label: "Progress", id: "section-progress" },
    { label: "Stories", id: "section-stories" },
    { label: "Gallery", id: "section-gallery" },
    { label: "Contact", id: "section-contact" },
  ];
  const goTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1500, transition: "all 0.3s ease",
      background: scrolled ? "rgba(245,240,232,0.95)" : "rgba(12,15,26,0.45)",
      backdropFilter: "blur(20px)",
      borderBottom: scrolled ? "1px solid rgba(43,91,168,0.12)" : "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "12px 16px" : "14px 28px" }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: isMobile ? 18 : 22, color: scrolled ? colors.darkBlue : "#fff", lineHeight: 1 }}>ShineOne Estate</div>
          {!isMobile && <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: scrolled ? "#666" : "rgba(255,255,255,0.65)", marginTop: 3 }}>We Build Your Vision</div>}
        </div>

        {!isMobile ? (
          <nav style={{ display: "flex", gap: 6 }}>
            {links.map((l) => (
              <button key={l.id} onClick={() => goTo(l.id)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 14px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14,
                  color: scrolled ? colors.black : "#fff",
                  transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { e.target.style.background = scrolled ? "rgba(43,91,168,0.08)" : "rgba(255,255,255,0.15)"; }}
                onMouseLeave={(e) => { e.target.style.background = "none"; }}
              >{l.label}</button>
            ))}
          </nav>
        ) : (
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: colors.darkBlue }}>
            <div style={{ width: 22, height: 2, background: colors.darkBlue, marginBottom: 5, borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
            <div style={{ width: 22, height: 2, background: colors.darkBlue, marginBottom: 5, borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: "all 0.3s" }} />
            <div style={{ width: 22, height: 2, background: colors.darkBlue, borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          </button>
        )}
      </div>
      {isMobile && menuOpen && (
        <div style={{ background: "rgba(245,240,232,0.98)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(43,91,168,0.1)", padding: "12px 16px", animation: "slide-up 0.2s ease" }}>
          {links.map((l) => (
            <button key={l.id} onClick={() => goTo(l.id)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "12px 8px", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 15, color: colors.black, borderBottom: "1px solid rgba(43,91,168,0.06)" }}>{l.label}</button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────── HERO ─────────────────────────── */
const Hero = () => {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const carousel = (projectData.folderImages?.["Caraousel"] || projectData.folderImages?.["caraousel"]) || projectData.images;
  const [current, setCurrent] = useState(0);
  const [textPhase, setTextPhase] = useState(0); // for cycling headline words

  const headlines = ["Vision", "Dream", "Future", "Legacy"];

  useEffect(() => {
    if (reduced || !carousel?.length) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % carousel.length), 4000);
    return () => clearInterval(t);
  }, [carousel, reduced]);

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

  if (isMobile) {
    // MOBILE: Full-screen image with strong bottom overlay
    const bg = carousel?.[current] || projectData.images[0];
    return (
      <div style={{ position: "relative", height: "100svh", overflow: "hidden", background: "#0a0a0a" }}>
        {(carousel || projectData.images).map((src, i) => (
          <img key={i} src={src} alt="" loading={i === 0 ? "eager" : "lazy"}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center",
              opacity: i === current ? 1 : 0, transition: "opacity 1.4s ease", filter: "brightness(0.45)" }} />
        ))}
        {/* Strong bottom gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.1) 100%)" }} />

        {/* Content */}
        <div style={{ position: "absolute", bottom: 100, left: 0, right: 0, padding: "0 20px", zIndex: 5 }}>
          <div className="hero-badge" style={{ marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.gold, animation: "glow-pulse 2s infinite" }} />
            Premium Real Estate · Gurugram
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "3.6rem", color: "#fff", lineHeight: 1.0, marginBottom: 10 }}>
            We Build<br />
            <span style={{ color: colors.gold, fontStyle: "italic", display: "inline-block", animation: "slide-up 0.5s ease both", key: textPhase }}>
              Your {headlines[textPhase]}
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, lineHeight: 1.75, marginBottom: 24, fontWeight: 400 }}>
            Plots · Flats · Floors · Construction<br />Sector 4, 9, 42, 46 & Reliance MET City
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="tel:+919310994032" style={{ textDecoration: "none", flex: 1 }}>
              <button className="btn-primary" style={{ width: "100%", padding: "14px 16px", fontSize: 15, justifyContent: "center" }}>
                <Phone size={17} /> Call Now
              </button>
            </a>
            <a href="https://wa.me/919310994032" target="_blank" rel="noreferrer" style={{ textDecoration: "none", flex: 1 }}>
              <button className="btn-wa" style={{ width: "100%", padding: "14px 16px", fontSize: 15, justifyContent: "center" }}>
                <MessageCircle size={17} /> WhatsApp
              </button>
            </a>
          </div>
          {/* Stat pills */}
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            {heroStats.slice(0,3).map((s,i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{s.label.replace("\n"," ")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 5, display: "flex", gap: 6 }}>
          {(carousel||[]).map((_,i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{ width: i===current?20:6, height: 6, borderRadius: 3, background: i===current?colors.gold:"rgba(255,255,255,0.4)", cursor:"pointer", transition:"all 0.3s ease" }} />
          ))}
        </div>
      </div>
    );
  }

  // DESKTOP: Split layout — bold left panel + image showcase right
  const bg = carousel?.[current] || projectData.images[0];
  return (
    <div style={{ display: "flex", height: "100vh", background: "#0C0F1A", overflow: "hidden", position: "relative", minHeight: 600 }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ width: "52%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 52px 0 56px", position: "relative", zIndex: 5, flexShrink: 0 }}>

        {/* Subtle background texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 80%, rgba(43,91,168,0.18) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(201,168,76,0.1) 0%, transparent 50%)", pointerEvents: "none" }} />

        {/* Animated badge */}
        <div className="hero-badge" style={{ width: "fit-content", marginBottom: 32, animation: "slide-up 0.6s ease 0.2s both", opacity: 0 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: colors.gold, animation: "glow-pulse 1.8s ease-in-out infinite" }} />
          Premium Real Estate · Gurugram
        </div>

        {/* Main heading — massive bold serif */}
        <div style={{ animation: "slide-up 0.7s ease 0.35s both", opacity: 0 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(3.2rem, 5.5vw, 6rem)", color: "#FFFFFF", lineHeight: 0.95, marginBottom: 4 }}>
            We Build
          </h1>
          <div style={{ overflow: "hidden", height: "clamp(3.5rem, 6vw, 6.8rem)", display: "flex", alignItems: "center" }}>
            <h1 key={textPhase} style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(3.4rem, 6vw, 6.8rem)", color: colors.gold, lineHeight: 0.95, animation: "slide-up 0.4s cubic-bezier(.22,1,.36,1) both", whiteSpace: "nowrap" }}>
              Your {headlines[textPhase]}
            </h1>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28, marginBottom: 24, animation: "slide-up 0.7s ease 0.5s both", opacity: 0 }}>
          <div style={{ height: 1, width: 48, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.4))" }} />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>Gurugram</span>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0))" }} />
        </div>

        {/* Description */}
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 17, lineHeight: 1.85, maxWidth: 440, fontWeight: 400, animation: "slide-up 0.7s ease 0.6s both", opacity: 0 }}>
          Plots · Flats · Floors · Construction across<br />Sector 4, 9, 42, 46 & Reliance MET City.<br />
          <span style={{ color: colors.gold, fontWeight: 600 }}>Transparent builds. On-time delivery.</span>
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap", animation: "slide-up 0.7s ease 0.75s both", opacity: 0 }}>
          <a href="tel:+919310994032" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ padding: "15px 28px", fontSize: 15 }}>
              <Phone size={18} /> Call Now
            </button>
          </a>
          <a href="https://wa.me/919310994032" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <button className="btn-wa" style={{ padding: "15px 28px", fontSize: 15 }}>
              <MessageCircle size={18} /> WhatsApp
            </button>
          </a>
          <a href="mailto:parveen@shineoneestate.co.in" style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ padding: "15px 22px", fontSize: 15 }}>
              <MailIcon color="#fff" size={18} /> Email
            </button>
          </a>
        </div>

        {/* Stat cards row */}
        <div className="hero-stat-row" style={{ display: "flex", gap: 12, marginTop: 44, animation: "slide-up 0.7s ease 0.9s both", opacity: 0 }}>
          {heroStats.map((s, i) => (
            <div key={i} className="hero-stat-card" style={{ animationDelay: `${0.9 + i * 0.08}s` }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: colors.darkBlue, lineHeight: 1, marginTop: 6 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 4, lineHeight: 1.4, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — Image showcase ── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", minWidth: 0 }}>
        {/* Main images — darkened heavily to kill the property ad text on them */}
        {(carousel || projectData.images).map((src, i) => (
          <img key={i} src={src} alt="" loading={i === 0 ? "eager" : "lazy"}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center top",
              opacity: i === current ? 1 : 0, transition: "opacity 1.4s ease",
              filter: "brightness(0.35) contrast(1.1) saturate(0.8)",
            }} />
        ))}

        {/* Heavy overlay to completely suppress image text */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(12,15,26,0.55)", zIndex: 1 }} />
        {/* Gradient bleed into left panel */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, background: "linear-gradient(to right, #0C0F1A 0%, rgba(12,15,26,0.2) 25%, transparent 55%)" }} />
        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 180, zIndex: 2, background: "linear-gradient(to top, rgba(12,15,26,0.9), transparent)" }} />
        {/* Top fade */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, zIndex: 2, background: "linear-gradient(to bottom, rgba(12,15,26,0.5), transparent)" }} />

        {/* ── Floating card: Sector 42 progress ── */}
        <div style={{ position: "absolute", top: 100, right: 20, zIndex: 5, maxWidth: 200, animation: "float2 5s ease-in-out infinite" }}>
          <div style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", borderRadius: 18, padding: "16px 18px", boxShadow: "0 16px 48px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.8)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #2B5BA8, #1a3f7a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <TrendingUp size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Sector 42</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: colors.darkBlue, lineHeight: 1.2 }}>On Schedule</div>
              </div>
            </div>
            <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
              <div className="progress-bar-fill" style={{ width: "78%" }} />
            </div>
            <div style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>78% · ETA June 2026</div>
          </div>
        </div>

        {/* ── Floating card: Star rating ── */}
        <div style={{ position: "absolute", bottom: 110, right: 20, zIndex: 5, animation: "float 4s ease-in-out 1s infinite" }}>
          <div style={{ background: "rgba(201,168,76,0.97)", borderRadius: 16, padding: "12px 16px", boxShadow: "0 12px 32px rgba(201,168,76,0.4)", display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={12} color="#fff" fill="#fff" />)}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.95)", fontWeight: 700, marginTop: 3 }}>Trusted Builder</div>
            </div>
          </div>
        </div>

        {/* ── NEW badge ── */}
        <div style={{ position: "absolute", top: 100, left: 24, zIndex: 5 }}>
          <div style={{ background: "#16a34a", color: "#fff", borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 8px 24px rgba(22,163,74,0.45)", animation: "pulse-green 2.5s infinite" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", whiteSpace: "nowrap" }}>New · Reliance MET City</span>
          </div>
        </div>

        {/* ── Centre showcase: large property name watermark ── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 4.5rem)", fontWeight: 700, color: "rgba(255,255,255,0.08)", letterSpacing: 8, textTransform: "uppercase", textAlign: "center", userSelect: "none" }}>
            ShineOne<br />Estate
          </div>
        </div>

        {/* ── Thumbnail strip — bottom ── */}
        <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, zIndex: 5, display: "flex", gap: 8, justifyContent: "center", padding: "0 20px" }}>
          {(carousel || []).slice(0, 6).map((src, i) => (
            <div key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: 52, height: 38, borderRadius: 10, overflow: "hidden", cursor: "pointer", flexShrink: 0,
                border: i === current ? `2px solid ${colors.gold}` : "2px solid rgba(255,255,255,0.2)",
                transition: "all 0.3s ease",
                transform: i === current ? "scale(1.1) translateY(-3px)" : "scale(1)",
                boxShadow: i === current ? `0 6px 20px rgba(201,168,76,0.5)` : "none",
              }}>
              <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", filter: i === current ? "none" : "brightness(0.6)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── STATS ROW ─────────────────────────── */
const StatsRow = () => {
  const { ref, visible } = useReveal();
  const c1 = useCountUp(3, 1200, visible);
  const c2 = useCountUp(14400, 1500, visible);
  const c3 = useCountUp(5, 1000, visible);
  const c4 = useCountUp(78, 1800, visible);

  const stats = [
    { value: c1, suffix: "+", label: "Completed Projects", icon: <CheckCircle size={24} color={colors.gold} /> },
    { value: c2.toLocaleString(), suffix: "", label: "Sq. Ft. Delivered", icon: <Home size={24} color={colors.gold} /> },
    { value: c3, suffix: "", label: "Active Sectors", icon: <MapPin size={24} color={colors.gold} /> },
    { value: c4, suffix: "%", label: "Sector 42 Progress", icon: <TrendingUp size={24} color={colors.gold} /> },
  ];

  return (
    <div ref={ref} style={{ background: colors.darkBlue, padding: "40px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
        {stats.map((s, i) => (
          <div key={i} className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: `${i * 0.1}s`, textAlign: "center", padding: "24px 16px", borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{s.value}{s.suffix}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 6, letterSpacing: 0.5, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
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
    <section id="section-overview" ref={ref} style={{ padding: isMobile ? "64px 16px" : "100px 28px", background: colors.cream }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>Projects Overview</div>
          <h2 className="display-heading" style={{ fontSize: isMobile ? "2.2rem" : "3.5rem" }}>
            Built with<br /><em style={{ fontStyle: "italic", color: colors.darkBlue }}>precision & pride</em>
          </h2>
          <p style={{ maxWidth: 520, margin: "20px auto 0", color: "#555", fontSize: 16, lineHeight: 1.8 }}>
            A snapshot of every development — from foundation to handover — across Gurugram's most sought-after sectors.
          </p>
        </div>

        {/* Completed Projects */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ fontWeight: 600, fontSize: 15, color: "#16a34a", textTransform: "uppercase", letterSpacing: 1 }}>Completed & Delivered</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
            {completed.map((p, i) => (
              <div key={i} className={`card-hover reveal${visible ? " visible" : ""}`} style={{ transitionDelay: `${i * 0.1}s`, background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid rgba(43,91,168,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(43,91,168,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Home size={20} color={colors.darkBlue} />
                  </div>
                  <span className="tag-pill" style={{ background: "#dcfce7", color: "#16a34a" }}>DELIVERED</span>
                </div>
                <h3 style={{ fontSize: 20, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: colors.darkBlue, marginBottom: 6 }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{p.area}</p>
                <div style={{ marginTop: 16, height: 4, background: "#f0f0f0", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: "100%", background: "#16a34a", borderRadius: 2 }} />
                </div>
                <p style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>100% Complete</p>
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
              <div key={i} className={`card-hover reveal${visible ? " visible" : ""}`} style={{ transitionDelay: `${(i + 3) * 0.1}s`, background: "#fff", borderRadius: 16, padding: "28px", border: "1px solid rgba(43,91,168,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 22, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: colors.darkBlue }}>{p.name}</h3>
                    <p style={{ fontSize: 13, color: "#888", marginTop: 4, fontWeight: 500 }}>{p.area}</p>
                  </div>
                  <span className="tag-pill" style={{ background: "#fef3c7", color: "#92400e" }}>
                    {p.stage ? p.stage.toUpperCase() : "ONGOING"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#666" }}>Completion</span>
                  <span style={{ fontSize: 20, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: colors.darkBlue }}>{p.progress || 0}%</span>
                </div>
                <div style={{ height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                  <div className="progress-bar-fill" style={{ width: `${p.progress || 0}%` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <span style={{ fontSize: 13, color: "#888" }}>ETA</span>
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

  const stageColors = { completed: { bg: "#dcfce7", border: "#16a34a", text: "#16a34a", label: "Completed" }, ongoing: { bg: "#fef3c7", border: colors.gold, text: "#92400e", label: "In Progress" }, pending: { bg: "#f9fafb", border: "#e5e7eb", text: "#9ca3af", label: "Pending" } };

  return (
    <div id="section-progress" ref={ref} style={{ padding: isMobile ? "64px 16px" : "100px 28px", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>Construction Progress</div>
          <h2 className="display-heading" style={{ fontSize: isMobile ? "2.2rem" : "3.5rem" }}>
            Track every<br /><em style={{ fontStyle: "italic", color: colors.darkBlue }}>milestone</em>
          </h2>
        </div>

        {/* Project selector */}
        <div className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.15s", display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
          {projectData.projects.map((p, i) => (
            <button key={i} onClick={() => setSelectedProject(p.name)}
              style={{ padding: "10px 20px", borderRadius: 50, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer",
                background: selectedProject === p.name ? colors.darkBlue : "transparent",
                color: selectedProject === p.name ? "#fff" : colors.darkBlue,
                border: `2px solid ${colors.darkBlue}`, transition: "all 0.25s ease" }}>
              {p.name}
            </button>
          ))}
        </div>

        {/* Progress display */}
        <div className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.2s", background: colors.cream, borderRadius: 24, padding: isMobile ? "24px" : "48px", marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: colors.darkBlue }}>{selectedProject}</h3>
              <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{project.status} {project.eta ? `· ETA: ${project.eta}` : ""}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 700, color: colors.darkBlue, lineHeight: 1 }}>{progress}<span style={{ fontSize: 24 }}>%</span></div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Overall Completion</div>
            </div>
          </div>
          <div style={{ height: 12, background: "rgba(43,91,168,0.1)", borderRadius: 6, overflow: "hidden" }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Stages grid */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(6, 1fr)", gap: 12 }}>
          {stages.map((stage, idx) => {
            const s = stageStatuses[idx]; const c = stageColors[s];
            return (
              <div key={stage} className={`reveal${visible ? " visible" : ""}`}
                style={{ transitionDelay: `${idx * 0.07}s`, background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 16, padding: "20px 14px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.border, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  {s === "completed" ? <CheckCircle size={18} color="#fff" /> : s === "ongoing" ? <Clock size={18} color="#fff" /> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{stage}</div>
                <div style={{ fontSize: 11, color: c.text, opacity: 0.8, marginTop: 4 }}>{c.label}</div>
                {idx < stages.length - 1 && !isMobile && (
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
  const { ref, visible } = useReveal();
  const folderImages = projectData.folderImages || {};
  const [openStory, setOpenStory] = useState({ open: false, folder: "", images: [], idx: 0 });
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(4000);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchRef = useRef({ startX: 0, endX: 0 });
  const animTimer = useRef(null);
  const rafRef = useRef(null);
  useLockBodyScroll(openStory.open);

  const DEFAULT_DURATION = 4000;
  const isVideo = (src) => /\.(mp4|webm|ogg)$/i.test(String(src));

  const open = (folder) => {
    const imgs = folderImages[folder] || [];
    if (!imgs.length) return;
    setOpenStory({ open: true, folder, images: imgs, idx: 0 });
    setProgress(0); setIsPaused(false); setCurrentDuration(DEFAULT_DURATION);
  };
  const close = () => { setOpenStory({ open: false, folder: "", images: [], idx: 0 }); setProgress(0); setIsPaused(false); setCurrentDuration(DEFAULT_DURATION); };

  const showIndex = (newIdx) => {
    if (!openStory.open) return;
    if (newIdx < 0) newIdx = 0;
    if (newIdx >= openStory.images.length) return close();
    setIsAnimating(true);
    if (animTimer.current) clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => { setOpenStory((s) => ({ ...s, idx: newIdx })); setProgress(0); setIsAnimating(false); }, 200);
  };
  const next = () => { if (!openStory.open) return; const ni = openStory.idx + 1; if (ni >= openStory.images.length) return close(); showIndex(ni); };
  const prev = () => { if (!openStory.open) return; const pi = openStory.idx - 1; if (pi < 0) { setProgress(0); return; } showIndex(pi); };

  useEffect(() => {
    if (!openStory.open || isPaused) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = Date.now();
    const run = () => { const p = Math.min(1, (Date.now() - start) / currentDuration); setProgress(p); if (p >= 1) next(); else rafRef.current = requestAnimationFrame(run); };
    rafRef.current = requestAnimationFrame(run);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [openStory.open, openStory.idx, isPaused, currentDuration]);

  useEffect(() => { return () => { if (animTimer.current) clearTimeout(animTimer.current); if (rafRef.current) cancelAnimationFrame(rafRef.current); }; }, []);

  useEffect(() => {
    if (!openStory.open) return;
    const h = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight" || e.key === "Enter") next(); if (e.key === "ArrowLeft") prev(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [openStory.open, openStory.idx]);

  const handleTouchStart = (e) => { touchRef.current.startX = (e.touches ? e.touches[0].clientX : e.clientX); setIsPaused(true); };
  const handleTouchMove = (e) => { touchRef.current.endX = (e.touches ? e.touches[0].clientX : e.clientX); };
  const handleTouchEnd = () => { const dx = touchRef.current.endX - touchRef.current.startX; if (Math.abs(dx) > 40) { if (dx > 0) prev(); else next(); } touchRef.current.startX = 0; touchRef.current.endX = 0; setIsPaused(false); };

  const tap = (e) => { const rect = e.currentTarget.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; if (x < rect.width / 2) prev(); else next(); };

  const storyFolders = ["sec 4", "sec 9", "sec 46", "sec 42", "reliance met city"]
    .map((d) => Object.keys(folderImages).find((k) => k.toLowerCase() === d)).filter(Boolean);

  const sectorLabels = { "sec 4": "Sector 4", "sec 9": "Sector 9", "sec 46": "Sector 46", "sec 42": "Sector 42", "reliance met city": "Reliance MET" };

  return (
    <div id="section-stories" ref={ref} style={{ padding: isMobile ? "64px 16px" : "100px 28px", background: colors.cream }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>Live Site Stories</div>
          <h2 className="display-heading" style={{ fontSize: isMobile ? "2.2rem" : "3.5rem" }}>
            See the work<br /><em style={{ fontStyle: "italic", color: colors.darkBlue }}>in progress</em>
          </h2>
          <p style={{ maxWidth: 520, margin: "20px auto 0", color: "#555", fontSize: 16, lineHeight: 1.8 }}>
            Real on-site updates from every sector — captured as they happen.
          </p>
        </div>

        <div style={{ display: "flex", gap: isMobile ? 20 : 32, overflowX: "auto", paddingBottom: 16, justifyContent: storyFolders.length <= 5 ? "center" : "flex-start" }}>
          {storyFolders.map((folder, i) => {
            const label = sectorLabels[folder.toLowerCase()] || folder;
            const isNew = folder.toLowerCase() === "reliance met city";
            return (
              <div key={folder} className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: `${i * 0.1}s`, textAlign: "center", cursor: "pointer", minWidth: isMobile ? 90 : 110, flexShrink: 0 }}
                onClick={() => open(folder)}>
                <div style={{ position: "relative", marginBottom: 10 }}>
                  {isNew && (
                    <div style={{ position: "absolute", top: -4, right: -4, background: "#16a34a", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 20, zIndex: 3, animation: "pulse-green 2s infinite", letterSpacing: 0.5 }}>NEW</div>
                  )}
                  <div className="story-ring" style={{ width: isMobile ? 88 : 108, height: isMobile ? 88 : 108, margin: "0 auto" }}>
                    <div className="story-ring-inner">
                      <img src={(folderImages[folder] || [])[0] || projectData.images[0]} loading="lazy" alt={folder}
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block", transition: "transform 0.35s ease" }}
                        onMouseEnter={(e) => { e.target.style.transform = "scale(1.08)"; }}
                        onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }} />
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: colors.black }}>{label}</div>
                <div style={{ fontSize: 11, color: colors.darkBlue, opacity: 0.7, marginTop: 3 }}>{(folderImages[folder] || []).length} updates</div>
              </div>
            );
          })}
        </div>

        {/* FULLSCREEN STORY VIEWER */}
        {openStory.open && (
          <div onClick={tap} onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
            style={{ position: "fixed", inset: 0, background: "#000", zIndex: 2000, display: "flex", justifyContent: "center", alignItems: "center" }}>
            {/* Progress bars */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "12px 16px 0", display: "flex", gap: 4, zIndex: 5 }}>
              {openStory.images.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.25)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#fff", width: i < openStory.idx ? "100%" : i === openStory.idx ? `${progress * 100}%` : "0%", transition: "width 100ms linear" }} />
                </div>
              ))}
            </div>

            {/* Header */}
            <div style={{ position: "absolute", top: 20, left: 16, display: "flex", alignItems: "center", gap: 12, zIndex: 5 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.8)" }}>
                <img src={openStory.images[0]} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{openStory.folder}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{openStory.idx + 1} / {openStory.images.length}</div>
              </div>
            </div>

            {/* Close button */}
            <button onClick={(e) => { e.stopPropagation(); close(); }}
              style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
              <X size={20} color="#fff" />
            </button>

            {/* Media */}
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 16px 40px", boxSizing: "border-box" }}>
              <div style={{ opacity: isAnimating ? 0 : 1, transition: "opacity 200ms ease", maxWidth: isMobile ? "100%" : 600, width: "100%", maxHeight: "100%", borderRadius: 12, overflow: "hidden", background: "#111" }}>
                {/\.(mp4|webm|ogg)$/i.test(String(openStory.images[openStory.idx])) ? (
                  <video key={openStory.images[openStory.idx]} src={openStory.images[openStory.idx]} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                    controls={!isMobile} playsInline autoPlay preload="metadata" muted
                    onLoadedMetadata={(e) => { const d = e.target.duration; setCurrentDuration(d > 0 ? d * 1000 : DEFAULT_DURATION); setProgress(0); }}
                    onEnded={next} />
                ) : (
                  <img key={openStory.images[openStory.idx]} src={openStory.images[openStory.idx]} alt="" loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000", maxHeight: "80vh" }}
                    onLoad={() => setCurrentDuration(DEFAULT_DURATION)} />
                )}
              </div>
            </div>

            {/* Nav zones */}
            <div style={{ position: "absolute", left: 0, top: 80, bottom: 40, width: "30%", cursor: "w-resize" }} onClick={(e) => { e.stopPropagation(); prev(); }} />
            <div style={{ position: "absolute", right: 0, top: 80, bottom: 40, width: "30%", cursor: "e-resize" }} onClick={(e) => { e.stopPropagation(); next(); }} />
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
  const folderImages = projectData.folderImages || {};
  const keys = Object.keys(folderImages);
  const isVideo = (src) => /\.(mp4|webm|ogg)$/i.test(String(src));

  const [lightbox, setLightbox] = useState({ open: false, src: "", folder: "", index: 0, items: [] });
  const [touchStart, setTouchStart] = useState(null);

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

  const openImg = (folder, src, idx, items) => setLightbox({ open: true, src, folder, index: idx, items });
  const close = () => setLightbox({ open: false, src: "", folder: "", index: 0, items: [] });
  const goNext = () => { const n = (lightbox.index + 1) % lightbox.items.length; setLightbox((s) => ({ ...s, index: n, src: s.items[n] })); };
  const goPrev = () => { const p = (lightbox.index - 1 + lightbox.items.length) % lightbox.items.length; setLightbox((s) => ({ ...s, index: p, src: s.items[p] })); };

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
      <div className={`card-hover reveal${visible ? " visible" : ""}`}
        style={{ transitionDelay: `${delay}s`, background: "#fff", borderRadius: 20, overflow: "hidden", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid rgba(43,91,168,0.06)" }}
        onClick={() => openImg(folder, items[0], 0, items)}>
        <div style={{ position: "relative", overflow: "hidden", aspectRatio: "4/3" }}>
          {isNew && (
            <div style={{ position: "absolute", top: 12, right: 12, background: "#16a34a", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, zIndex: 3, animation: "pulse-green 2s infinite", letterSpacing: 0.5 }}>NEW LAUNCH</div>
          )}
          <img src={items[0]} alt={folder} loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
            onMouseEnter={(e) => { e.target.style.transform = "scale(1.07)"; }}
            onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)" }} />
          <div style={{ position: "absolute", bottom: 14, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>{folder}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{items.length} photos</div>
          </div>
        </div>
        <div style={{ padding: "16px 18px" }}>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{projectDesc[key] || "Construction project."}</p>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, color: colors.darkBlue, fontSize: 13, fontWeight: 600 }}>
            View Gallery <ArrowRight size={14} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="section-gallery" ref={ref} style={{ padding: isMobile ? "64px 16px" : "100px 28px", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>Photo Gallery</div>
          <h2 className="display-heading" style={{ fontSize: isMobile ? "2.2rem" : "3.5rem" }}>Every project,<br /><em style={{ fontStyle: "italic", color: colors.darkBlue }}>documented</em></h2>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", letterSpacing: 2, textTransform: "uppercase" }}>Completed & Delivered</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
            {completedResolved.map((f, i) => <GalleryFolder key={f} folder={f} delay={i * 0.1} />)}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.gold, animation: "pulse-ring 2s infinite" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e", letterSpacing: 2, textTransform: "uppercase" }}>Active Construction</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 20 }}>
            {ongoingResolved.map((f, i) => <GalleryFolder key={f} folder={f} isNew={f.toLowerCase() === "reliance met city"} delay={(i + 3) * 0.1} />)}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <div onClick={close}
          onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touchStart; if (Math.abs(dx) > 50) { if (dx < 0) goNext(); else goPrev(); } setTouchStart(null); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1500, animation: "fade-in 0.2s ease" }}>
          <div style={{ maxWidth: isMobile ? "96%" : 1100, width: "95%", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.src} alt="" loading="lazy"
              style={{ width: "100%", height: "auto", maxHeight: "85vh", objectFit: "contain", borderRadius: 16, display: "block" }} />
            <div style={{ position: "absolute", top: 14, left: 14, glass: true, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", color: "#fff", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
              {lightbox.folder} · {lightbox.index + 1}/{lightbox.items.length}
            </div>
            <button onClick={close} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={20} color="#fff" />
            </button>
            {!isMobile && (
              <>
                <button onClick={goPrev} style={{ position: "absolute", left: -22, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.95)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                  <ChevronLeft size={20} color={colors.black} />
                </button>
                <button onClick={goNext} style={{ position: "absolute", right: -22, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.95)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                  <ChevronRight size={20} color={colors.black} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────── MAP SECTION ─────────────────────────── */
const MapSection = () => {
  const isMobile = useIsMobile();
  const { ref, visible } = useReveal();
  const [activeIndex, setActiveIndex] = useState(0);
  const sectors = projectData.neighbourhood.nearby;
  const active = sectors[activeIndex];

  const iconColors = ["#2B5BA8", "#C9A84C", "#16a34a", "#ef4444"];

  return (
    <div ref={ref} style={{ padding: isMobile ? "64px 16px" : "100px 28px", background: colors.cream }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>Location & Neighbourhood</div>
          <h2 className="display-heading" style={{ fontSize: isMobile ? "2.2rem" : "3.5rem" }}>
            Strategically<br /><em style={{ fontStyle: "italic", color: colors.darkBlue }}>located</em>
          </h2>
        </div>

        {/* Sector tabs */}
        <div className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.15s", display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
          {sectors.map((s, i) => (
            <button key={i} onClick={() => setActiveIndex(i)}
              style={{ padding: "10px 20px", borderRadius: 50, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.25s ease",
                background: i === activeIndex ? colors.darkBlue : "#fff",
                color: i === activeIndex ? "#fff" : colors.darkBlue,
                border: `2px solid ${i === activeIndex ? colors.darkBlue : "rgba(43,91,168,0.2)"}`,
                boxShadow: i === activeIndex ? "0 8px 20px rgba(43,91,168,0.3)" : "none" }}>
              {s.name.split(",")[0]}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 }}>
          {/* Left card */}
          <div className={`reveal-left${visible ? " visible" : ""}`} style={{ background: colors.darkBlue, borderRadius: 24, padding: isMobile ? "28px" : "48px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

            <div style={{ width: 56, height: 56, borderRadius: 16, background: colors.gold, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <MapPin size={28} color="#fff" />
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 12, lineHeight: 1.2 }}>{active.name}</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 24 }}>{active.description}</p>

            <div style={{ borderRadius: 14, overflow: "hidden", height: 180 }}>
              <img src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1000" alt="map" loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65)" }} />
            </div>
          </div>

          {/* Right highlights */}
          <div className={`reveal-right${visible ? " visible" : ""}`} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {active.highlights.map((h, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1px solid rgba(43,91,168,0.08)", display: "flex", alignItems: "flex-start", gap: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.05)", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(6px)"; e.currentTarget.style.borderColor = "rgba(43,91,168,0.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.borderColor = "rgba(43,91,168,0.08)"; }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${iconColors[i % iconColors.length]}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Star size={20} color={iconColors[i % iconColors.length]} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: colors.black, marginBottom: 4 }}>{h}</div>
                  <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>Key advantage of {active.name.split(",")[0]}</div>
                </div>
              </div>
            ))}
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
    <div id="section-contact" ref={ref} style={{ padding: isMobile ? "64px 16px" : "100px 28px", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>Get in Touch</div>
          <h2 className="display-heading" style={{ fontSize: isMobile ? "2.2rem" : "3.5rem" }}>
            Let's build your<br /><em style={{ fontStyle: "italic", color: colors.darkBlue }}>dream together</em>
          </h2>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.15s", background: colors.cream, borderRadius: 28, padding: isMobile ? "36px 24px" : "56px 64px", maxWidth: 520, width: "100%", textAlign: "center", position: "relative", overflow: "hidden" }}>
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

            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: colors.black, marginBottom: 4 }}>Parveen Chawla</h3>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 32, fontWeight: 500 }}>Founder · ShineOne Estate</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="tel:9310994032" style={{ textDecoration: "none" }}>
                <button className="btn-primary" style={{ width: "100%", padding: "14px 20px", fontSize: 15, justifyContent: "center" }}>
                  <Phone size={18} /> +91 93109 94032
                </button>
              </a>
              <a href="https://wa.me/919310994032" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <button className="btn-wa" style={{ width: "100%", padding: "14px 20px", fontSize: 15, justifyContent: "center" }}>
                  <MessageCircle size={18} /> WhatsApp Chat
                </button>
              </a>
              <a href="mailto:parveen@shineoneestate.co.in" style={{ textDecoration: "none" }}>
                <button style={{ width: "100%", padding: "14px 20px", fontSize: 15, background: "transparent", border: `2px solid ${colors.darkBlue}`, borderRadius: 10, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: colors.darkBlue, transition: "all 0.25s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.darkBlue; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = colors.darkBlue; }}>
                  <MailIcon color="currentColor" size={18} /> parveen@shineoneestate.co.in
                </button>
              </a>
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
  return (
    <footer style={{ background: "#0D0D0D", color: colors.cream, padding: isMobile ? "56px 16px 120px" : "80px 28px 120px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: colors.gold, marginBottom: 8 }}>ShineOne Estate</div>
            <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>We Build Your Vision</div>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: "rgba(255,255,255,0.6)", maxWidth: 360 }}>
              Premium residential development focused on transparent construction, quality materials and timely delivery across Gurugram's key sectors.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <a href="tel:+919310994032" style={{ textDecoration: "none" }}>
                <button style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "background 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}>
                  <Phone size={14} /> Call
                </button>
              </a>
              <a href="https://wa.me/919310994032" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <button style={{ background: "rgba(37,211,102,0.15)", border: "none", borderRadius: 10, padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#25D366", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "background 0.2s" }}>
                  <MessageCircle size={14} /> WhatsApp
                </button>
              </a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Projects</h4>
            {[["Sector 4", "Completed"], ["Sector 9", "Completed"], ["Sector 46", "Completed"], ["Sector 42", "Ongoing"], ["Reliance MET City", "NEW"]].map(([name, status]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>{name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: status === "Completed" ? "#4ade80" : status === "NEW" ? colors.gold : "#fbbf24", letterSpacing: 0.5 }}>{status}</span>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Contact</h4>
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
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>© 2026 ShineOne Estate · Built with transparency and trust.</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>RERA Reg: P51900052847</span>
        </div>
      </div>
    </footer>
  );
};

/* ─────────────────────────── STICKY CTA ─────────────────────────── */
const StickyCTA = () => {
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 2000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 500, background: "rgba(13,13,13,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.1)", padding: isMobile ? "12px 12px calc(12px + env(safe-area-inset-bottom))" : "14px 24px", display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap",
      transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.5s cubic-bezier(.22,1,.36,1)" }}>
      <a href="tel:+919310994032" style={{ textDecoration: "none", flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
        <button className="btn-primary" style={{ width: isMobile ? "100%" : "auto", padding: isMobile ? "13px 20px" : "12px 24px", fontSize: 14, justifyContent: "center" }}>
          <Phone size={16} /> Call Now
        </button>
      </a>
      <a href="https://wa.me/919310994032" target="_blank" rel="noreferrer" style={{ textDecoration: "none", flex: isMobile ? "1 1 45%" : "0 0 auto" }}>
        <button className="btn-wa" style={{ width: "100%", padding: isMobile ? "13px 16px" : "12px 24px", fontSize: 14, justifyContent: "center" }}>
          <MessageCircle size={16} /> WhatsApp
        </button>
      </a>
      <a href="mailto:parveen@shineoneestate.co.in" style={{ textDecoration: "none", flex: isMobile ? "1 1 45%" : "0 0 auto" }}>
        <button style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, cursor: "pointer", padding: isMobile ? "13px 16px" : "12px 24px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", transition: "background 0.2s" }}>
          <MailIcon color="#fff" size={16} /> Email
        </button>
      </a>
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
    // Count 0→100 over ~1.6s
    const start = Date.now();
    const dur = 1600;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(ease * 100));
      if (p < 1) requestAnimationFrame(tick);
      else {
        setPhase(1);
        setTimeout(() => { setPhase(2); setTimeout(onDone, 500); }, 700);
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
      transition: "opacity 0.6s ease, transform 0.6s ease",
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
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
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
  const isMobile = useIsMobile();
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
  <div style={{ position: "relative", overflow: "hidden", height: 72, background: bottomColor, marginTop: -1 }}>
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
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? scrolled / total : 0);
      setVisible(scrolled > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const circumference = 2 * Math.PI * 20;

  return (
    <button onClick={scrollUp} data-cursor-hover
      style={{
        position: "fixed", bottom: 90, right: 20, zIndex: 400, width: 52, height: 52,
        borderRadius: "50%", border: "none", cursor: "pointer",
        background: colors.darkBlue, boxShadow: "0 8px 24px rgba(43,91,168,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
        transition: "all 0.4s cubic-bezier(.22,1,.36,1)",
        pointerEvents: visible ? "all" : "none",
      }}>
      {/* SVG progress ring */}
      <svg width="52" height="52" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
        <circle cx="26" cy="26" r="20" fill="none" stroke={colors.gold} strokeWidth="2.5"
          strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.1s linear" }} />
      </svg>
      <ChevronLeft size={18} color="#fff" style={{ transform: "rotate(90deg)" }} />
    </button>
  );
};

/* ─────────────────────────── WHATSAPP WIDGET ─────────────────────────── */
const WhatsAppWidget = () => {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 3000);
    return () => clearTimeout(t);
  }, []);

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
    <div style={{ position: "fixed", bottom: isMobile ? 90 : 96, right: isMobile ? 12 : 20, zIndex: 450 }}>
      {/* Chat panel */}
      {open && (
        <div style={{
          position: "absolute", bottom: 68, right: 0,
          width: isMobile ? "calc(100vw - 32px)" : 320,
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
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
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
      <button onClick={() => setOpen(!open)} data-cursor-hover
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

  const onMouseMove = (e) => { if (dragging) updateSlider(e.clientX); };
  const onTouchMove = (e) => { updateSlider(e.touches[0].clientX); };
  const stop = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    return () => { window.removeEventListener("mouseup", stop); window.removeEventListener("touchend", stop); };
  }, []);

  return (
    <div ref={ref} style={{ padding: isMobile ? "64px 16px" : "100px 28px", background: "#0C0F1A" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: 52 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16, color: "rgba(201,168,76,0.9)" }}>
            <span style={{ background: colors.gold }} /> Before & After
          </div>
          <h2 className="display-heading" style={{ fontSize: isMobile ? "2.2rem" : "3.2rem", color: "#fff" }}>
            The transformation<br /><em style={{ color: colors.gold, fontStyle: "italic" }}>speaks for itself</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginTop: 16, lineHeight: 1.8 }}>
            Drag the slider to reveal the before & after transformation
          </p>
        </div>

        <div className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.2s" }}>
          <div ref={containerRef}
            onMouseMove={onMouseMove} onTouchMove={onTouchMove}
            onMouseLeave={stop}
            style={{ position: "relative", borderRadius: 24, overflow: "hidden", userSelect: "none", aspectRatio: isMobile ? "4/3" : "16/7", cursor: dragging ? "grabbing" : "grab", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>

            {/* AFTER (full background) */}
            <img src={afterImg} alt="After" loading="lazy"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />

            {/* BEFORE (clipped left side) */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", width: `${sliderX}%` }}>
              <img src={beforeImg} alt="Before" loading="lazy"
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
            <div onMouseDown={(e) => { e.preventDefault(); setDragging(true); }}
              onTouchStart={() => setDragging(true)}
              style={{
                position: "absolute", top: "50%", left: `${sliderX}%`,
                transform: "translate(-50%, -50%)",
                width: 48, height: 48, borderRadius: "50%",
                background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "grab", zIndex: 3, transition: dragging ? "none" : "left 0.05s",
                border: `3px solid ${colors.gold}`,
              }}>
              <div style={{ display: "flex", gap: 3 }}>
                <ChevronLeft size={14} color={colors.darkBlue} />
                <ChevronRight size={14} color={colors.darkBlue} />
              </div>
            </div>
          </div>

          {/* Hint text */}
          <div style={{ textAlign: "center", marginTop: 16, color: "rgba(255,255,255,0.35)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>👆</span> Drag the handle to compare
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
    { q: "What types of properties are available?", a: "We offer Plots, Flats, Independent Floors, and full Construction services. Properties are available across Gurugram's most sought-after sectors." },
    { q: "What materials and brands are used in construction?", a: "We use only premium certified materials — UltraTech Cement (ISO 9001:2015), Tata Tiscon Steel (BIS Certified), Kajaria Premium Tiles, Polycab wiring (ISI Mark), Astral pipes, and Dr. Fixit waterproofing. All materials come with quality certificates." },
    { q: "How can I track construction progress?", a: "You get daily construction logs with photos, weekly stories per sector, and real-time progress percentage updates right on the Whatsapp. We believe in complete transparency — you can see exactly what's happening on site every single day." },
    { q: "Can I book a site visit?", a: "Absolutely! WhatsApp us at +91 93109 94032 or call directly. We arrange guided site visits on working days with our site manager. You'll get a full tour of the construction, material storage, and quality checks." },
    // { q: "What is the payment structure?", a: "Payment is milestone-linked — tied to actual construction stages (Foundation, Structure, Finishing, etc.). This ensures you only pay as real work gets completed. Full details are shared at the time of booking." },
    { q: "Are the completed projects available for reference visits?", a: "Yes! Our completed projects in Sector 4, 9, and 46 can be visited to see the quality of finish, materials, and workmanship firsthand. Many buyers find this very reassuring before making a decision." },
  ];

  return (
    <div ref={ref} style={{ padding: isMobile ? "64px 16px" : "100px 28px", background: colors.cream }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div className={`reveal${visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>FAQ</div>
          <h2 className="display-heading" style={{ fontSize: isMobile ? "2.2rem" : "3.2rem" }}>
            Common questions<br /><em style={{ color: colors.darkBlue, fontStyle: "italic" }}>answered</em>
          </h2>
          <p style={{ color: "#666", fontSize: 15, marginTop: 16, lineHeight: 1.8 }}>
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
                <button onClick={() => setOpenIdx(isOpen ? null : i)}
                  style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
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
                <div style={{ maxHeight: isOpen ? 300 : 0, overflow: "hidden", transition: "max-height 0.45s cubic-bezier(.22,1,.36,1)" }}>
                  <div style={{ padding: isMobile ? "0 18px 20px" : "0 28px 24px", fontSize: 14, color: "#555", lineHeight: 1.85, borderTop: "1px solid rgba(43,91,168,0.08)" }}>
                    <div style={{ paddingTop: 16 }}>{faq.a}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA below FAQ */}
        <div className={`reveal${visible ? " visible" : ""}`} style={{ transitionDelay: "0.4s", textAlign: "center", marginTop: 48, padding: "36px 28px", background: colors.darkBlue, borderRadius: 20, boxShadow: "0 16px 48px rgba(43,91,168,0.25)" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Still have questions?</div>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, marginBottom: 20 }}>Our team responds within minutes on WhatsApp</p>
          <a href="https://wa.me/919310994032?text=Hi%2C%20I%20have%20a%20question%20about%20ShineOne%20Estate." target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <button className="btn-wa" style={{ padding: "14px 28px", fontSize: 15 }}>
              <MessageCircle size={18} /> Ask on WhatsApp
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── APP ─────────────────────────── */
export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: colors.cream, minHeight: "100vh" }}>
      <GlobalStyles />
      <CustomCursor />
      {loading && <PageLoader onDone={() => setLoading(false)} />}

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

        <MapSection />
        <WaveDivider topColor="#fff" bottomColor={colors.cream} />

        <ContactSection />
        <Footer />
        <StickyCTA />
        <WhatsAppWidget />
        <ScrollToTop />
      </div>
    </div>
  );
}