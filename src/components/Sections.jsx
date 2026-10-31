// Reusable page sections built only from real data: live project numbers, server photos,
// construction stages, the published materials list and the published FAQ.
import React from "react";
import { Link } from "react-router-dom";
import { SectionHeading, Reveal } from "./Layout";
import { cld, isVideo, FAQS, MATERIALS, STAGES, STAGE_NOTES, totalArea } from "../lib/site";
import { isCompleted } from "../lib/projects";

export function StatsStrip({ projects, folders }) {
  const photos = Object.values(folders || {}).flat().filter((u) => !isVideo(u)).length;
  const area = totalArea(projects);
  const items = [
    [projects.length, "Projects across Gurugram"],
    [projects.filter(isCompleted).length, "Homes completed & handed over"],
    [projects.filter((p) => !isCompleted(p)).length, "Under construction right now"],
    area ? [`${area.toLocaleString("en-IN")}`, "Sq. ft. built & building"] : null,
    photos ? [photos, "Site photos you can browse"] : null,
  ].filter(Boolean);
  return (
    <div className="sx-stats" role="list">
      {items.map(([v, l]) => <div key={l} className="sx-stat" role="listitem"><strong>{v}</strong><span>{l}</span></div>)}
    </div>
  );
}

/** Horizontal scroll of real site photos, one or two per project. */
export function PhotoStrip({ projects, folders, perProject = 2 }) {
  const items = projects.flatMap((p) => (folders[p.key] || []).filter((u) => !isVideo(u)).slice(0, perProject).map((url) => ({ url, p })));
  if (!items.length) return null;
  return (
    <div className="sx-strip" role="list" aria-label="Photos from our sites">
      {items.map(({ url, p }) => (
        <Link key={url} to={`/projects/${p.slug}`} className="sx-strip-item" role="listitem">
          <img src={cld(url, 600)} srcSet={`${cld(url, 400)} 400w, ${cld(url, 700)} 700w`} sizes="340px" alt={`${p.name} construction site`} loading="lazy" decoding="async" width="340" height="425" />
          <span>{p.name}</span>
        </Link>
      ))}
    </div>
  );
}

export function ProcessSteps({ title = <>How we <em>build</em></>, lede = "Every home goes through the same six stages — and you pay only as each one is completed." }) {
  return (
    <>
      <SectionHeading eyebrow="Our process" title={title}>{lede}</SectionHeading>
      <ol className="sx-steps">
        {STAGES.map((s) => (
          <Reveal as="li" key={s} className="sx-step"><h3>{s}</h3><p>{STAGE_NOTES[s]}</p></Reveal>
        ))}
      </ol>
    </>
  );
}

export function MaterialsBand() {
  return (
    <div style={{ display: "grid", gap: 22 }}>
      <SectionHeading eyebrow="What goes into your home" title={<>Certified materials, <em>every time</em></>}>All materials come with quality certificates.</SectionHeading>
      <div className="sx-materials">{MATERIALS.map((m) => <span key={m} className="sx-material">{m}</span>)}</div>
    </div>
  );
}

export function FaqList({ limit }) {
  const list = limit ? FAQS.slice(0, limit) : FAQS;
  return (
    <div className="sx-split sx-split--top">
      <SectionHeading eyebrow="FAQ" title={<>Common questions, <em>answered</em></>}>Still unsure? Call or WhatsApp us — we usually reply within minutes.</SectionHeading>
      <div className="sx-faq">
        {list.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}
      </div>
    </div>
  );
}

export function Ticker({ items }) {
  const row = [...items, ...items];
  return (
    <div className="sx-ticker" aria-hidden="true">
      <div className="sx-ticker-track">{row.map((t, i) => <span key={i}>{t}</span>)}</div>
    </div>
  );
}
