import React from "react";
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import PageLayout, { PageHero, SectionHeading, Reveal, CtaBand, WhatsAppGlyph } from "../components/Layout";
import { BeforeAfterSlider, Img } from "../components/Media";
import usePageMeta from "../hooks/usePageMeta";
import { routeFor } from "../lib/routes";
import { useProjects, isCompleted } from "../lib/projects";
import { CONTACT, WA_URL } from "../lib/site";
import { heroImage, beforeAfter, profilePhoto } from "./shared";
import { StatsStrip, PhotoStrip, ProcessSteps, FaqList, MaterialsBand } from "../components/Sections";

// All copy below already appeared on the site (home page, FAQ, footer); nothing new is claimed.
const PRINCIPLES = [
  ["Transparent construction", "Daily construction logs with photos, weekly stories per sector and progress percentages on this website — you can see what is happening on site."],
  ["Certified materials", "Premium certified materials with quality certificates, from cement and steel to wiring, pipes and waterproofing."],
  ["Milestone-linked payments", "Payments are tied to actual construction stages — Foundation, Structure, Finishing and so on — so you pay as real work gets completed."],
  ["Visit our finished homes", "Completed projects in Sector 4, 9 and 46 can be visited to see the finish, materials and workmanship first-hand."],
];

export default function AboutPage() {
  const meta = routeFor("/about");
  usePageMeta({ ...meta, path: "/about" });
  const { projects, folders } = useProjects();
  const ba = beforeAfter(folders);
  const photo = profilePhoto(folders);
  const completed = projects.filter(isCompleted).length;
  const ongoing = projects.length - completed;

  return (
    <PageLayout>
      <PageHero eyebrow="About us" title={<>We build <em>your vision</em></>}
        lede="Premium residential development focused on transparent construction, quality materials and timely delivery across Gurugram's key sectors."
        image={heroImage(folders)} crumbs={[["/", "Home"], [null, "About"]]} />

      <section className="sx-section">
        <div className="sx-wrap sx-split">
          <Reveal style={{ display: "grid", gap: 18 }}>
            <SectionHeading eyebrow="Who we are" title={<>A Gurugram builder that shows its <em>work</em></>} />
            <p className="sx-lede">ShineOne Estate builds and sells plots, flats and independent builder floors, and offers full residential construction across Gurugram — in Sector 4, Sector 9, Sector 42, Sector 46 and Reliance MET City.</p>
            <p style={{ color: "var(--grey)" }}>We currently have {projects.length} projects on this website: {completed} completed and {ongoing} under construction, each with its own live progress page.</p>
            <div className="sx-btn-row"><Link className="sx-btn sx-btn--primary" to="/projects">See our projects</Link></div>
          </Reveal>
          <Reveal className="sx-figure"><Img src={heroImage(folders)} alt="A ShineOne Estate home in Gurugram" w={900} sizes="(max-width: 860px) 100vw, 50vw" /></Reveal>
        </div>
      </section>

      <section className="sx-section sx-section--forest">
        <div className="sx-wrap" style={{ display: "grid", gap: 28 }}>
          <SectionHeading eyebrow="In numbers" title={<>Built in Gurugram, <em>shown in full</em></>} />
          <StatsStrip projects={projects} folders={folders} />
        </div>
      </section>

      <section className="sx-section sx-section--stone">
        <div className="sx-wrap">
          <SectionHeading eyebrow="How we work" title={<>Our development <em>philosophy</em></>} />
          <div className="sx-features">
            {PRINCIPLES.map(([t, d], i) => (
              <article key={t} className="sx-feature"><span className="num">0{i + 1}</span><h3>{t}</h3><p>{d}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="sx-section">
        <div className="sx-wrap"><ProcessSteps /></div>
      </section>

      <section className="sx-section sx-section--clay">
        <div className="sx-wrap"><MaterialsBand /></div>
      </section>

      <section className="sx-section" style={{ paddingBottom: 24 }}>
        <div className="sx-wrap"><SectionHeading eyebrow="On site" title={<>Our work, <em>up close</em></>} /></div>
        <PhotoStrip projects={projects} folders={folders} />
      </section>

      {ba && (
        <section className="sx-section sx-section--stone">
          <div className="sx-wrap" style={{ display: "grid", gap: 8 }}>
            <SectionHeading eyebrow="Before & after" title={<>The transformation <em>speaks for itself</em></>}>Drag the handle to compare the site at the start of work with the finished building.</SectionHeading>
            <BeforeAfterSlider before={ba[0]} after={ba[1]} label="ShineOne Estate project" />
          </div>
        </section>
      )}

      <section className="sx-section">
        <div className="sx-wrap sx-split">
          <div className="sx-figure" style={{ aspectRatio: "1", maxWidth: 420 }}>
            {photo ? <img src={photo} alt={CONTACT.person} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div className="sx-placeholder" style={{ fontFamily: "var(--serif)", fontSize: 64, color: "var(--forest)" }}>PC</div>}
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            <SectionHeading eyebrow="Leadership" title={CONTACT.person}>{CONTACT.role}</SectionHeading>
            <p style={{ color: "var(--grey)" }}>Speak to Parveen directly about a project, a site visit or building on your own plot.</p>
            <div className="sx-btn-row">
              <a className="sx-btn sx-btn--primary" href={`tel:${CONTACT.phone}`}><Phone size={17} /> {CONTACT.phoneDisplay}</a>
              <a className="sx-btn sx-btn--ghost" href={WA_URL} target="_blank" rel="noreferrer"><WhatsAppGlyph /> WhatsApp</a>
            </div>
          </div>
        </div>
      </section>
      <section className="sx-section sx-section--stone">
        <div className="sx-wrap"><FaqList /></div>
      </section>
      <CtaBand />
    </PageLayout>
  );
}
