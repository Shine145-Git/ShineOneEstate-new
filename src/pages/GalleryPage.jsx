import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout, { PageHero, SectionHeading, EmptyState, CtaBand } from "../components/Layout";
import { MediaGrid, BeforeAfterSlider } from "../components/Media";
import usePageMeta from "../hooks/usePageMeta";
import { routeFor } from "../lib/routes";
import { useProjects, splitMedia } from "../lib/projects";
import { heroImage, beforeAfter } from "./shared";
import { StatsStrip } from "../components/Sections";

export default function GalleryPage() {
  const meta = routeFor("/gallery");
  usePageMeta({ ...meta, path: "/gallery" });
  const { projects, folders, mediaLoading } = useProjects();
  const [params, setParams] = useSearchParams();
  const withMedia = projects.filter((p) => (folders[p.key] || []).length);
  const sel = withMedia.some((p) => p.key === params.get("project")) ? params.get("project") : "all";
  const shown = sel === "all" ? withMedia : withMedia.filter((p) => p.key === sel);
  const ba = beforeAfter(folders);
  const total = withMedia.reduce((n, p) => n + (folders[p.key] || []).length, 0);

  return (
    <PageLayout>
      <PageHero short eyebrow="Gallery" title={<>Our sites, <em>photo by photo</em></>}
        lede={total ? `${total} photos and videos from ${withMedia.length} projects, straight from our sites.` : "Photos and videos straight from our construction sites."}
        image={heroImage(folders)} crumbs={[["/", "Home"], [null, "Gallery"]]} />
      <section className="sx-section" style={{ paddingBottom: 0 }}>
        <div className="sx-wrap"><StatsStrip projects={projects} folders={folders} /></div>
      </section>
      <section className="sx-section">
        <div className="sx-wrap" style={{ display: "grid", gap: 48 }}>
          {mediaLoading ? <div className="sx-skel" style={{ height: 320, borderRadius: 22 }} /> : !withMedia.length ? (
            <EmptyState title="No photos to show right now.">Please check back shortly.</EmptyState>
          ) : (
            <>
              <div className="sx-filters" role="group" aria-label="Filter by project" style={{ marginBottom: 0 }}>
                <button type="button" className="sx-chip" aria-pressed={sel === "all"} onClick={() => setParams({}, { replace: true })}>All projects</button>
                {withMedia.map((p) => <button key={p.key} type="button" className="sx-chip" aria-pressed={sel === p.key} onClick={() => setParams({ project: p.key }, { replace: true })}>{p.name}</button>)}
              </div>
              {shown.map((p) => {
                const { images, videos } = splitMedia(folders[p.key]);
                return (
                  <div key={p.key} style={{ display: "grid", gap: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, flexWrap: "wrap" }}>
                      <SectionHeading eyebrow={`${images.length} photos · ${videos.length} videos`} title={p.name} />
                      <Link className="sx-btn sx-btn--ghost" to={`/projects/${p.slug}`} style={{ marginBottom: 28 }}>Project details</Link>
                    </div>
                    <MediaGrid items={[...images, ...videos]} label={p.name} />
                  </div>
                );
              })}
            </>
          )}
          {ba && sel === "all" && (
            <div style={{ display: "grid", gap: 8 }}>
              <SectionHeading eyebrow="Before & after" title={<>The <em>transformation</em></>}>Drag to compare.</SectionHeading>
              <BeforeAfterSlider before={ba[0]} after={ba[1]} label="ShineOne Estate project" />
            </div>
          )}
        </div>
      </section>
      <CtaBand />
    </PageLayout>
  );
}
