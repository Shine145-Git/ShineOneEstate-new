import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Ruler } from "lucide-react";
import { Img } from "./Media";
import { isCompleted, progressOf, splitMedia } from "../lib/projects";

export function StatusTag({ project }) {
  return isCompleted(project)
    ? <span className="sx-tag sx-tag--done">Completed</span>
    : <span className="sx-tag sx-tag--ongoing">Ongoing</span>;
}

export function ProgressBar({ project }) {
  const pct = progressOf(project);
  return (
    <div className="sx-progress">
      <div className="sx-progress-label"><span>{project.stage || (isCompleted(project) ? "Handed over" : "Construction progress")}</span><strong>{pct}%</strong></div>
      <div className="sx-progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${project.name} construction progress`}><span style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function ProjectCard({ project, folder = [], headingLevel = "h3" }) {
  const { images, videos } = splitMedia(folder);
  const H = headingLevel;
  return (
    <Link to={`/projects/${project.slug}`} className="sx-card">
      <div className="sx-card-media">
        <Img src={images[0]} alt={`${project.name} — ShineOne Estate project in Gurugram`} w={800} sizes="(max-width: 700px) 100vw, 33vw" width="800" height="600" />
        <div className="sx-card-tags">
          <StatusTag project={project} />
          {project.isNew && <span className="sx-tag sx-tag--new">New</span>}
        </div>
      </div>
      <div className="sx-card-body">
        <H style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "1.55rem", margin: 0 }}>{project.name}</H>
        <div className="sx-meta">
          <span><MapPin size={14} style={{ verticalAlign: "-2px" }} /> {project.location}</span>
          {project.area && <span><Ruler size={14} style={{ verticalAlign: "-2px" }} /> {project.area}</span>}
        </div>
        {!isCompleted(project) && <ProgressBar project={project} />}
        <div className="sx-meta" style={{ fontSize: 13 }}>
          {images.length > 0 && <span>{images.length} photo{images.length === 1 ? "" : "s"}</span>}
          {videos.length > 0 && <span>{videos.length} video{videos.length === 1 ? "" : "s"}</span>}
          {!isCompleted(project) && project.eta && <span>Est. completion {project.eta}</span>}
        </div>
        <span className="sx-card-cta">View details <ArrowRight size={16} /></span>
      </div>
    </Link>
  );
}
