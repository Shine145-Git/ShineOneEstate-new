import React from "react";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import PageLayout, { PageHero, SectionHeading, WhatsAppGlyph } from "../components/Layout";
import usePageMeta from "../hooks/usePageMeta";
import { routeFor } from "../lib/routes";
import { CONTACT, WA_URL, PROJECTS, waLink } from "../lib/site";
import { FaqList, PhotoStrip } from "../components/Sections";
import { useProjects } from "../lib/projects";

// Enquiries go straight to WhatsApp (no form): each button opens a chat with the message filled in.
const TOPICS = [
  ["Book a site visit", "Hi, I'd like to book a site visit."],
  ...PROJECTS.map((p) => [p.name, `Hi, I'd like to know more about ${p.name}.`]),
  ["Plots & builder floors", "Hi, I'm interested in plots / builder floors in Gurugram."],
  ["Construction services", "Hi, I'd like to discuss construction of my house."],
];

export default function ContactPage() {
  const meta = routeFor("/contact");
  usePageMeta({ ...meta, path: "/contact" });
  const { projects, folders } = useProjects();

  return (
    <PageLayout>
      <PageHero short eyebrow="Contact" title={<>Let's build your <em>dream together</em></>}
        lede="Call or WhatsApp us. We arrange guided site visits on working days with our site manager."
        crumbs={[["/", "Home"], [null, "Contact"]]}>
        <div className="sx-btn-row">
          <a className="sx-btn sx-btn--gold" href={WA_URL} target="_blank" rel="noreferrer"><WhatsAppGlyph /> WhatsApp us</a>
          <a className="sx-btn sx-btn--light" href={`tel:${CONTACT.phone}`}><Phone size={17} /> Call {CONTACT.phoneDisplay}</a>
        </div>
      </PageHero>
      <section className="sx-section">
        <div className="sx-wrap sx-split sx-split--top">
          <div style={{ display: "grid", gap: 24, alignContent: "start" }}>
            <SectionHeading eyebrow="Talk to us" title={CONTACT.person}>{CONTACT.role}</SectionHeading>
            <ul className="sx-list" style={{ gap: 16, fontSize: "1.05rem" }}>
              <li><a href={`tel:${CONTACT.phone}`}><Phone size={16} style={{ verticalAlign: "-2px" }} /> {CONTACT.phoneDisplay}</a></li>
              <li><a href={WA_URL} target="_blank" rel="noreferrer"><WhatsAppGlyph size={16} /> WhatsApp chat</a></li>
              <li><a href={`mailto:${CONTACT.email}`} style={{ overflowWrap: "anywhere" }}><Mail size={16} style={{ verticalAlign: "-2px" }} /> {CONTACT.email}</a></li>
              <li><MapPin size={16} style={{ verticalAlign: "-2px" }} /> {CONTACT.city}</li>
            </ul>
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            <SectionHeading eyebrow="Enquire on WhatsApp" title="What would you like to ask about?" as="h2">Tap a topic — WhatsApp opens with your message ready to send.</SectionHeading>
            <div className="sx-topics">
              {TOPICS.map(([label, text]) => (
                <a key={label} className="sx-topic" href={waLink(text)} target="_blank" rel="noreferrer">
                  <WhatsAppGlyph size={18} /><span>{label}</span><ArrowUpRight size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="sx-section sx-section--soft" style={{ paddingBottom: 24 }}>
        <div className="sx-wrap"><SectionHeading eyebrow="Visit us" title={<>Come see a <em>finished home</em></>}>Our completed projects can be visited before you decide. Pick one and we'll arrange the visit.</SectionHeading></div>
        <PhotoStrip projects={projects} folders={folders} perProject={1} />
      </section>
      <section className="sx-section">
        <div className="sx-wrap"><FaqList /></div>
      </section>
    </PageLayout>
  );
}
