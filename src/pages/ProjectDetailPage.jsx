import React from "react";
import { useParams } from "react-router-dom";
import { Phone } from "lucide-react";
import PageLayout, { PageHero, SectionHeading, EmptyState, WhatsAppGlyph, CtaBand } from "../components/Layout";
import ProjectCard, { ProgressBar, StatusTag } from "../components/ProjectCard";
import { MediaGrid } from "../components/Media";
import usePageMeta from "../hooks/usePageMeta";
import { projectRoute } from "../lib/routes";
import { useProjects, isCompleted, splitMedia, progressOf } from "../lib/projects";
import { CONTACT, STAGES, waLink, cld } from "../lib/site";
import NotFoundPage from "./NotFoundPage";
import { MaterialsBand, FaqList } from "../components/Sections";

const stageState = (project, i) => {
  if (isCompleted(project)) return "done";
  const cur = project.stage ? STAGES.indexOf(project.stage) : Math.min(STAGES.length - 1, Math.floor(progressOf(project) / (100 / STAGES.length)));
  return i < cur ? "done" : i === cur ? "current" : "";
};

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { projects, folders, loading, mediaLoading } = useProjects();
  const project = projects.find((p) => p.slug === slug);
  const meta = project ? projectRoute(project) : { title: "Project not found | ShineOne Estate", description: "", path: `/projects/${slug}` };
  const folder = project ? folders[project.key] || [] : [];
  const { images, videos } = splitMedia(folder);
  usePageMeta({ ...meta, path: `/projects/${slug}`, image: images[0] ? cld(images[0], 1200) : undefined, noindex: !project && !loading });

  if (!project) return loading ? <PageLayout><div className="sx-wrap sx-section"><div className="sx-skel" style={{ height: 320, borderRadius: 22 }} /></div></PageLayout> : <NotFoundPage />;

  const related = projects.filter((p) => p.slug !== slug).slice(0, 3);
  const done = isCompleted(project);

  return (
    <PageLayout>
      <PageHero eyebrow={done ? "Completed project" : "Ongoing project"} title={<>{project.name}<em>, Gurugram</em></>}
        lede={project.description || `${project.status} ShineOne Estate project in ${project.location}.`}
        image={images[0] ? cld(images[0], 1800) : null}
        crumbs={[["/", "Home"], ["/projects", "Projects"], [null, project.name]]}>
        <div className="sx-btn-row">
          <a className="sx-btn sx-btn--gold" href={waLink(`Hi, I'd like to know more about ${project.name}.`)} target="_blank" rel="noreferrer"><WhatsAppGlyph /> Enquire on WhatsApp</a>
          <a className="sx-btn sx-btn--light" href={`tel:${CONTACT.phone}`}><Phone size={17} /> Call {CONTACT.phoneDisplay}</a>
        </div>
      </PageHero>

      <section className="sx-section">
        <div className="sx-wrap sx-detail">
          <div style={{ display: "grid", gap: 40 }}>
            <div style={{ display: "grid", gap: 16 }}>
              <SectionHeading eyebrow="Overview" title="About this project" />
              {project.type && <p className="sx-lede">{project.type}.</p>}
              {project.highlights?.length > 0 && <ul className="sx-list">{project.highlights.map((h) => <li key={h}>{h}</li>)}</ul>}
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <SectionHeading eyebrow="Construction" title={done ? "Delivered" : "Construction progress"} />
              <ProgressBar project={project} />
              <ol className="sx-stages" aria-label="Construction stages">
                {STAGES.map((s, i) => { const st = stageState(project, i); return <li key={s} className={st} aria-current={st === "current" ? "step" : undefined}>{s}</li>; })}
              </ol>
            </div>

            <div style={{ display: "grid", gap: 16 }} id="gallery">
              <SectionHeading eyebrow="Gallery" title="Photos from the site" />
              {mediaLoading ? <div className="sx-skel" style={{ height: 220, borderRadius: 14 }} />
                : images.length ? <MediaGrid items={images} label={project.name} />
                : <EmptyState title="Photos coming soon.">We add site photos as work progresses.</EmptyState>}
            </div>

            {videos.length > 0 && (
              <div style={{ display: "grid", gap: 16 }}>
                <SectionHeading eyebrow="Video" title="Site videos" />
                <MediaGrid items={videos} label={`${project.name} video`} />
              </div>
            )}
          </div>

          <aside className="sx-facts" aria-label="Project facts">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 22 }}>Project facts</strong>
              <StatusTag project={project} />
            </div>
            <dl>
              <dt>Location</dt><dd>{project.location}</dd>
              <dt>Status</dt><dd>{project.status}</dd>
              {project.area && <><dt>Area</dt><dd>{project.area}</dd></>}
              <dt>Progress</dt><dd>{progressOf(project)}%</dd>
              {!done && project.stage && <><dt>Current stage</dt><dd>{project.stage}</dd></>}
              {!done && project.eta && <><dt>Est. completion</dt><dd>{project.eta}</dd></>}
              <dt>Media</dt><dd>{images.length} photos · {videos.length} videos</dd>
            </dl>
            <a className="sx-btn sx-btn--primary" href={waLink(`Hi, I'd like to book a site visit at ${project.name}.`)} target="_blank" rel="noreferrer"><WhatsAppGlyph /> Book a site visit</a>
            <a className="sx-btn sx-btn--ghost" href={`tel:${CONTACT.phone}`}><Phone size={17} /> Call {CONTACT.phoneDisplay}</a>
          </aside>
        </div>
      </section>

      <section className="sx-section sx-section--forest">
        <div className="sx-wrap"><MaterialsBand /></div>
      </section>
      {related.length > 0 && (
        <section className="sx-section sx-section--stone">
          <div className="sx-wrap">
            <SectionHeading eyebrow="More projects" title="Related projects" />
            <div className="sx-grid">{related.map((p) => <ProjectCard key={p.slug} project={p} folder={folders[p.key] || []} />)}</div>
          </div>
        </section>
      )}
      <section className="sx-section">
        <div className="sx-wrap"><FaqList limit={4} /></div>
      </section>
      <CtaBand />
    </PageLayout>
  );
}
