import React from "react";
import { Phone } from "lucide-react";
import PageLayout, { PageHero, SectionHeading, Reveal, CtaBand, WhatsAppGlyph } from "../components/Layout";
import usePageMeta from "../hooks/usePageMeta";
import { routeFor } from "../lib/routes";
import { useProjects } from "../lib/projects";
import { SERVICES, STAGES, CONTACT, waLink } from "../lib/site";
import { heroImage } from "./shared";
import { ProcessSteps, MaterialsBand, FaqList, PhotoStrip, Ticker } from "../components/Sections";

// Benefits only restate what the site already promised (FAQ / home page).
const BENEFITS = {
  plots: ["Plots across established and emerging Gurugram sectors", "Our own construction team can build on the plot for you", "Guided site visits on working days"],
  floors: ["Built by our own team with certified materials", "Daily construction logs with photos", "Milestone-linked payment structure"],
  flats: ["Options across Sectors 4, 9, 42 and 46", "Completed projects available for reference visits", "Help with site visits through our team"],
  construction: [`Stage-by-stage delivery: ${STAGES.join(", ")}`, "Pay only as real work is completed", "Progress percentage and photos you can follow online"],
};

export default function ServicesPage() {
  const meta = routeFor("/services");
  usePageMeta({ ...meta, path: "/services" });
  const { projects, folders } = useProjects();
  return (
    <PageLayout>
      <PageHero eyebrow="Services" title={<>Plots, floors, flats <em>&amp; construction</em></>}
        lede="Everything we offer in Gurugram — from the land to the finished home."
        image={heroImage(folders)} crumbs={[["/", "Home"], [null, "Services"]]} />
      <Ticker items={["Sector 4", "Sector 9", "Sector 42", "Sector 46", "Reliance MET City", "Plots", "Builder floors", "Flats", "House construction", "Gurugram"]} />
      <section className="sx-section">
        <div className="sx-wrap">
          <SectionHeading eyebrow="What we do" title={<>Real estate &amp; construction <em>in Gurugram</em></>} />
          {SERVICES.map((s, i) => (
            <Reveal key={s.id} as="article" className="sx-service" id={s.id}>
              <span className="num">0{i + 1}</span>
              <div style={{ display: "grid", gap: 12 }}>
                <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>{s.title}</h2>
                <p>{s.text}</p>
              </div>
              <div style={{ display: "grid", gap: 18 }}>
                <ul className="sx-list">{BENEFITS[s.id].map((b) => <li key={b}>{b}</li>)}</ul>
                <div className="sx-btn-row">
                  <a className="sx-btn sx-btn--primary" href={waLink(`Hi, I'm interested in ${s.title.toLowerCase()} in Gurugram.`)} target="_blank" rel="noreferrer"><WhatsAppGlyph /> Ask about this</a>
                  <a className="sx-btn sx-btn--ghost" href={`tel:${CONTACT.phone}`}><Phone size={16} /> Call</a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="sx-section sx-section--soft">
        <div className="sx-wrap"><ProcessSteps title={<>From empty plot to <em>your keys</em></>} /></div>
      </section>
      <section className="sx-section sx-section--forest">
        <div className="sx-wrap"><MaterialsBand /></div>
      </section>
      <section className="sx-section" style={{ paddingBottom: 24 }}>
        <div className="sx-wrap"><SectionHeading eyebrow="Our work" title={<>See what we <em>build</em></>} /></div>
        <PhotoStrip projects={projects} folders={folders} perProject={1} />
      </section>
      <section className="sx-section sx-section--stone">
        <div className="sx-wrap"><FaqList /></div>
      </section>
      <CtaBand />
    </PageLayout>
  );
}
