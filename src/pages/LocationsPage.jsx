import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageLayout, { PageHero, SectionHeading, Reveal, CtaBand } from "../components/Layout";
import { Img } from "../components/Media";
import usePageMeta from "../hooks/usePageMeta";
import { routeFor } from "../lib/routes";
import { useProjects, splitMedia } from "../lib/projects";
import { heroImage } from "./shared";
import { StatsStrip, FaqList, Ticker } from "../components/Sections";

// Descriptions and highlights are the neighbourhood notes that were already on the home page.
// No distances or travel times are added; a map is not shown because no verified coordinates exist.
export default function LocationsPage() {
  const meta = routeFor("/locations");
  usePageMeta({ ...meta, path: "/locations" });
  const { projects, folders } = useProjects();
  return (
    <PageLayout>
      <PageHero short eyebrow="Locations" title={<>Where we <em>build</em> in Gurugram</>}
        lede="Each of our projects sits in a Gurugram sector with its own character. Here is what each one offers."
        image={heroImage(folders)} crumbs={[["/", "Home"], [null, "Locations"]]} />
      <Ticker items={["Sector 4", "Sector 9", "Sector 42", "Sector 46", "Reliance MET City", "Plots", "Builder floors", "Flats", "House construction", "Gurugram"]} />
      <section className="sx-section">
        <div className="sx-wrap">
          <SectionHeading eyebrow="Our sectors" title={<>{projects.length} locations, <em>one standard</em></>} />
          <div className="sx-grid">
            {projects.map((p) => {
              const { images } = splitMedia(folders[p.key] || []);
              return (
                <Reveal key={p.key} as="article" className="sx-loc">
                  <div className="sx-card-media" style={{ borderRadius: 12 }}><Img src={images[0]} alt={`${p.location}`} w={700} sizes="(max-width: 700px) 100vw, 33vw" width="700" height="525" /></div>
                  {p.type && <span className="sx-meta">{p.type}</span>}
                  <h2 style={{ fontSize: "1.6rem" }}>{p.location}</h2>
                  {p.description && <p>{p.description}</p>}
                  {p.highlights?.length > 0 && <ul className="sx-list">{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>}
                  <Link className="sx-card-cta" to={`/projects/${p.slug}`} style={{ textDecoration: "none" }}>Our {p.name} project <ArrowRight size={16} /></Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      <section className="sx-section sx-section--forest">
        <div className="sx-wrap" style={{ display: "grid", gap: 28 }}>
          <SectionHeading eyebrow="Across Gurugram" title={<>One builder, <em>many neighbourhoods</em></>}>Visit any completed project to see our finish and workmanship first-hand.</SectionHeading>
          <StatsStrip projects={projects} folders={folders} />
        </div>
      </section>
      <section className="sx-section sx-section--stone">
        <div className="sx-wrap"><FaqList /></div>
      </section>
      <CtaBand />
    </PageLayout>
  );
}
