import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageLayout, { PageHero, EmptyState, CtaBand, SectionHeading } from "../components/Layout";

import ProjectCard from "../components/ProjectCard";
import usePageMeta from "../hooks/usePageMeta";
import { routeFor } from "../lib/routes";
import { useProjects, filterProjects, isCompleted } from "../lib/projects";
import { heroImage } from "./shared";
import { StatsStrip, PhotoStrip, ProcessSteps, FaqList, Ticker } from "../components/Sections";

const SectionHeadingInline = () => <SectionHeading eyebrow="On site" title={<>Straight from <em>our sites</em></>}>Real photos from each project — tap one to open its page.</SectionHeading>;

const STATUS = [["all", "All"], ["ongoing", "Ongoing"], ["completed", "Completed"], ["new", "New"]];

export default function ProjectsPage() {
  const meta = routeFor("/projects");
  usePageMeta({ ...meta, path: "/projects" });
  const { projects, folders } = useProjects();
  const [params, setParams] = useSearchParams();
  const status = STATUS.some(([k]) => k === params.get("status")) ? params.get("status") : "all";
  const key = projects.some((p) => p.key === params.get("sector")) ? params.get("sector") : "all";
  const update = (k, val) => { const n = new URLSearchParams(params); if (val === "all") n.delete(k); else n.set(k, val); setParams(n, { replace: true }); };
  const list = useMemo(() => filterProjects(projects, { status, key }), [projects, status, key]);
  const counts = { all: projects.length, ongoing: projects.filter((p) => !isCompleted(p)).length, completed: projects.filter(isCompleted).length, new: projects.filter((p) => p.isNew).length };

  return (
    <PageLayout>
      <PageHero short eyebrow="Projects" title={<>Homes we have <em>built</em> &amp; are building</>}
        lede="Every project with its live construction status, area, photos and videos — updated from our sites."
        image={heroImage(folders)} crumbs={[["/", "Home"], [null, "Projects"]]} />
      <Ticker items={["Sector 4", "Sector 9", "Sector 42", "Sector 46", "Reliance MET City", "Plots", "Builder floors", "Flats", "House construction", "Gurugram"]} />
      <section className="sx-section" style={{ paddingBottom: 0 }}>
        <div className="sx-wrap"><StatsStrip projects={projects} folders={folders} /></div>
      </section>
      <section className="sx-section">
        <div className="sx-wrap">
          <div className="sx-filters" role="group" aria-label="Filter projects">
            {STATUS.filter(([k]) => k === "all" || counts[k] > 0).map(([k, label]) => (
              <button key={k} type="button" className="sx-chip" aria-pressed={status === k} onClick={() => update("status", k)}>{label} <span style={{ opacity: .6 }}>({counts[k]})</span></button>
            ))}
            <label className="sx-visually-hidden" htmlFor="sector-filter">Location</label>
            <select id="sector-filter" className="sx-select" value={key} onChange={(e) => update("sector", e.target.value)}>
              <option value="all">All locations</option>
              {projects.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
            </select>
          </div>
          <p className="sx-visually-hidden" aria-live="polite">{list.length} project{list.length === 1 ? "" : "s"} shown</p>
          {list.length ? (
            <div className="sx-grid">{list.map((p) => <ProjectCard key={p.slug} project={p} folder={folders[p.key] || []} headingLevel="h2" />)}</div>
          ) : (
            <EmptyState title="No projects match these filters." action={<button type="button" className="sx-btn sx-btn--ghost" onClick={() => setParams({}, { replace: true })}>Clear filters</button>} />
          )}
        </div>
      </section>
      <section className="sx-section sx-section--soft">
        <div className="sx-wrap"><ProcessSteps /></div>
      </section>
      <section className="sx-section" style={{ paddingInline: 0 }}>
        <div className="sx-wrap"><SectionHeadingInline /></div>
        <PhotoStrip projects={projects} folders={folders} />
      </section>
      <section className="sx-section sx-section--stone">
        <div className="sx-wrap"><FaqList /></div>
      </section>
      <CtaBand />
    </PageLayout>
  );
}
