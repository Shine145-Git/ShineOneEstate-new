import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Phone, ArrowUpRight, MapPin, Mail } from "lucide-react";
import { CONTACT, WA_URL, waLink, PROJECTS } from "../lib/site";
import "../styles/brand.css";

export const NAV = [
  ["/", "Home"],
  ["/about", "About"],
  ["/projects", "Projects"],
  ["/services", "Services"],
  ["/gallery", "Gallery"],
  ["/locations", "Locations"],
  ["/contact", "Contact"],
];

const LOGO = `${process.env.PUBLIC_URL || ""}/logo192.png`;

export function WhatsAppGlyph({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.1-1.3A9.9 9.9 0 1 0 12.04 2zm0 18.1a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3a8.2 8.2 0 1 1 6.9 3.8zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const burger = useRef(null);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") { setOpen(false); burger.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <header className={`sx-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="sx-wrap">
        <Link to="/" className="sx-logo" aria-label="ShineOne Estate home">
          <img src={LOGO} alt="" width="34" height="34" />
          <span>ShineOne Estate</span>
        </Link>
        <nav className="sx-nav" aria-label="Main">
          {NAV.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"}>{label}</NavLink>)}
        </nav>
        <a className="sx-btn sx-btn--primary sx-btn--cta" href={waLink("Hi, I'd like to book a site visit.")} target="_blank" rel="noreferrer">Book a site visit</a>
        <button ref={burger} type="button" className="sx-burger" aria-expanded={open} aria-controls="sx-mnav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav id="sx-mnav" className={`sx-mnav ${open ? "open" : ""}`} aria-label="Mobile" aria-hidden={!open}>
        {NAV.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} className="sx-mlink" tabIndex={open ? 0 : -1}>{label}</NavLink>)}
        <div className="sx-btn-row">
          <a className="sx-btn sx-btn--primary" href={`tel:${CONTACT.phone}`} tabIndex={open ? 0 : -1}><Phone size={17} /> Call</a>
          <a className="sx-btn sx-btn--ghost" href={WA_URL} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}><WhatsAppGlyph /> WhatsApp</a>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="sx-footer">
      <div className="sx-wrap">
        <div className="sx-footer-grid">
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 30, color: "var(--ivory)" }}>ShineOne Estate</div>
            <p style={{ marginTop: 12, maxWidth: 380, fontSize: 15 }}>Premium residential development focused on transparent construction, quality materials and timely delivery across Gurugram's key sectors.</p>
          </div>
          <div>
            <h4>Projects</h4>
            <ul>{PROJECTS.map((p) => <li key={p.slug}><Link to={`/projects/${p.slug}`}>{p.name}</Link></li>)}</ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>{NAV.filter(([to]) => !["/", "/projects"].includes(to)).map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}</ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href={`tel:${CONTACT.phone}`}><Phone size={14} style={{ verticalAlign: "-2px" }} /> {CONTACT.phoneDisplay}</a></li>
              <li><a href={WA_URL} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={13} style={{ verticalAlign: "-2px" }} /></a></li>
              <li><a href={`mailto:${CONTACT.email}`} style={{ overflowWrap: "anywhere" }}><Mail size={14} style={{ verticalAlign: "-2px" }} /> {CONTACT.email}</a></li>
              <li><MapPin size={14} style={{ verticalAlign: "-2px" }} /> Gurugram, Haryana</li>
            </ul>
          </div>
        </div>
        <div className="sx-footer-base"><span>© {new Date().getFullYear()} ShineOne Estate</span><span>Built with transparency and trust</span></div>
      </div>
    </footer>
  );
}

function ActionBar() {
  return (
    <div className="sx-actionbar" aria-label="Quick contact">
      <a className="sx-btn sx-btn--primary" href={`tel:${CONTACT.phone}`}><Phone size={17} /> Call</a>
      <a className="sx-btn sx-btn--gold" href={waLink("Hi, I'd like to know more about ShineOne Estate.")} target="_blank" rel="noreferrer"><WhatsAppGlyph /> WhatsApp</a>
    </div>
  );
}

/** Shared shell for every content page: skip link, header, main, footer, mobile action bar. */
export default function PageLayout({ children }) {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="sx">
      <a className="sx-skip" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer />
      <ActionBar />
    </div>
  );
}

export function SectionHeading({ eyebrow, title, children, as: H = "h2" }) {
  return (
    <div className="sx-head">
      {eyebrow && <span className="sx-eyebrow">{eyebrow}</span>}
      <H>{title}</H>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Breadcrumbs({ items, dark = false }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={`sx-crumbs ${dark ? "sx-crumbs--dark" : ""}`} style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map(([to, label], i) => (
          <li key={label} style={{ display: "inline-flex", gap: 6 }}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {to ? <Link to={to}>{label}</Link> : <span aria-current="page">{label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({ eyebrow, title, lede, image, crumbs, children, short = false }) {
  return (
    <section className={`sx-hero ${short ? "sx-hero--short" : ""} ${image ? "" : "sx-hero--plain"}`}>
      {image && <img className="sx-hero-img" src={image} alt="" fetchpriority="high" />}
      <div className="sx-wrap">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <span className="sx-eyebrow" style={{ color: "var(--gold)" }}>{eyebrow}</span>}
        <h1>{title}</h1>
        {lede && <p>{lede}</p>}
        {children}
      </div>
    </section>
  );
}

export function EmptyState({ title, children, action }) {
  return <div className="sx-state" role="status"><strong style={{ color: "var(--charcoal)" }}>{title}</strong>{children && <span>{children}</span>}{action}</div>;
}

export function useReveal() {
  const ref = useRef(null);
  const [inView, setIn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setIn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

export function Reveal({ children, as: Tag = "div", className = "", ...rest }) {
  const [ref, inView] = useReveal();
  return <Tag ref={ref} className={`sx-reveal ${inView ? "in" : ""} ${className}`} {...rest}>{children}</Tag>;
}

export function CtaBand({ title = <>Let's build your <em>dream together</em></>, text = "Speak to our team about ongoing projects, site visits and construction." }) {
  return (
    <section className="sx-section sx-section--forest">
      <div className="sx-wrap sx-cta">
        <div style={{ display: "grid", gap: 12 }}>
          <span className="sx-eyebrow">Get in touch</span>
          <h2>{title}</h2>
          <p style={{ color: "rgba(247,245,240,.78)", maxWidth: 520 }}>{text}</p>
        </div>
        <div className="sx-btn-row">
          <a className="sx-btn sx-btn--gold" href={waLink("Hi, I'd like to book a site visit.")} target="_blank" rel="noreferrer"><WhatsAppGlyph /> Book a site visit</a>
          <a className="sx-btn sx-btn--light" href={`tel:${CONTACT.phone}`}><Phone size={17} /> Call {CONTACT.phoneDisplay}</a>
        </div>
      </div>
    </section>
  );
}
