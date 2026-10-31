// ShineOne Estate admin dashboard. The original panel (src/admin.jsx) is kept unchanged.
// Media, projects and visibility are managed in Stashr's "ShineOne Estate Manager" (sign-in, uploads,
// show/hide, status, deletes). This page shows exactly what the public website receives from Stashr,
// checks that every file loads, and links to Stashr for any change — it never edits anything itself,
// so it needs no credentials and exposes none.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, RefreshCw, Search, Copy, Check, Image as ImageIcon, Film, FolderOpen, CircleCheck, CircleAlert, Globe } from "lucide-react";
import { Lightbox } from "./components/Media";
import { fetchFromServers, isPhotoOnly, STASHR_HOSTS } from "./services/stashr";
import { cld, isVideo, PROJECTS, slugify, videoPoster } from "./lib/site";
import "./styles/brand.css";
import "./styles/admin.css";

export const STASHR_MANAGER_URL = process.env.REACT_APP_STASHR_MANAGER_URL || "https://stashr.ggnhome.com/media";

const label = (key) => (PROJECTS.find((p) => p.key === key) || {}).name || key.replace(/\b\w/g, (c) => c.toUpperCase());
/** Upload time from the Cloudinary version segment (/v1774204104/ = Unix seconds). */
export const uploadedAt = (url) => { const m = String(url).match(/\/v(\d{10})\//); return m ? new Date(Number(m[1]) * 1000) : null; };
const fileName = (url) => decodeURIComponent(String(url).split("/").pop() || "");
const fmtDate = (d) => (d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

const probe = (url) => new Promise((resolve) => {
  const img = new Image();
  const t = setTimeout(() => resolve(false), 20000);
  img.onload = () => { clearTimeout(t); resolve(true); };
  img.onerror = () => { clearTimeout(t); resolve(false); };
  img.src = isVideo(url) ? videoPoster(url) : cld(url, 200);
});

function useLiveData() {
  const [state, setState] = useState({ loading: true });
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const started = performance.now();
    const [media, site] = await Promise.allSettled([fetchFromServers("/public/shine/media"), fetchFromServers("/public/shine/site")]);
    setState({
      loading: false,
      ms: Math.round(performance.now() - started),
      folders: media.status === "fulfilled" ? media.value.folders || {} : null,
      projects: site.status === "fulfilled" ? site.value.projects || [] : null,
      checkedAt: new Date(),
    });
  }, []);
  useEffect(() => { load(); }, [load]);
  return [state, load];
}

function Stat({ icon: Icon, value, label: l }) {
  return <div className="ad-stat"><Icon size={18} aria-hidden="true" /><strong>{value}</strong><span>{l}</span></div>;
}

export default function AdminPanel() {
  const [data, reload] = useLiveData();
  const [tab, setTab] = useState("overview");
  const [folder, setFolder] = useState("all");
  const [kind, setKind] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [viewer, setViewer] = useState(null);
  const [checks, setChecks] = useState({});
  const [copied, setCopied] = useState(false);

  const folders = useMemo(() => data.folders || {}, [data.folders]);
  const projects = (data.projects || []).filter((p) => !isPhotoOnly(p.key));
  const all = useMemo(() => Object.entries(folders).flatMap(([k, urls]) => urls.map((url) => ({ url, folder: k, video: isVideo(url), date: uploadedAt(url) }))), [folders]);
  const recent = useMemo(() => [...all].sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, 8), [all]);
  const filtered = all.filter((m) => (folder === "all" || m.folder === folder) && (kind === "all" || (kind === "video") === m.video) && (!q || fileName(m.url).toLowerCase().includes(q.toLowerCase()) || m.folder.includes(q.toLowerCase())));

  const runChecks = useCallback(async () => {
    const out = {};
    for (const [k, urls] of Object.entries(folders)) {
      const res = await Promise.all(urls.map(probe));
      out[k] = { ok: res.filter(Boolean).length, total: res.length };
      setChecks({ ...out });
    }
  }, [folders]);
  useEffect(() => { if (data.folders) runChecks(); }, [data.folders, runChecks]);

  const toggle = (url) => setSelected((s) => { const n = new Set(s); if (n.has(url)) n.delete(url); else n.add(url); return n; });
  const copySelected = async () => {
    try { await navigator.clipboard.writeText([...selected].join("\n")); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch (e) { /* clipboard blocked */ }
  };

  const online = data.folders !== null && data.projects !== null;
  const completed = projects.filter((p) => p.status === "Completed").length;
  const TABS = [["overview", "Overview"], ["projects", "Projects"], ["media", "Media library"]];

  return (
    <div className="sx ad">
      <header className="ad-top">
        <div className="sx-wrap ad-topin">
          <Link to="/" className="sx-logo"><img src="/logo192.png" alt="" width="30" height="30" /> <span>ShineOne <em style={{ color: "var(--gold-ink)" }}>Admin</em></span></Link>
          <nav className="ad-tabs" aria-label="Admin sections">
            {TABS.map(([id, l]) => <button key={id} type="button" className={tab === id ? "on" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{l}</button>)}
          </nav>
          <a className="sx-btn sx-btn--primary" href={STASHR_MANAGER_URL} target="_blank" rel="noreferrer">Manage in Stashr <ExternalLink size={15} /></a>
        </div>
      </header>

      <main className="sx-wrap ad-main" id="main">
        <div className={`ad-banner ${online ? "ok" : data.loading ? "" : "bad"}`} role="status">
          {data.loading ? <><RefreshCw size={16} className="ad-spin" /> Checking the Stashr server…</>
            : online ? <><CircleCheck size={16} /> Stashr server is answering ({data.ms} ms). This is exactly what the website shows.</>
            : <><CircleAlert size={16} /> The Stashr server did not answer. The website will show no photos until it is back.</>}
          <button type="button" className="sx-btn sx-btn--ghost ad-small" onClick={reload} disabled={data.loading}><RefreshCw size={14} /> Refresh</button>
        </div>

        <p className="ad-note">Uploads, deletes, show/hide on the website and project status are changed in <a href={STASHR_MANAGER_URL} target="_blank" rel="noreferrer">Stashr → ShineOne Estate Manager</a> (admin sign-in required). Changes reach the website within about a minute.</p>

        {tab === "overview" && (
          <>
            <section className="ad-stats" aria-label="Summary">
              <Stat icon={FolderOpen} value={data.projects ? projects.length : "—"} label="Projects on the website" />
              <Stat icon={CircleCheck} value={data.projects ? completed : "—"} label="Completed" />
              <Stat icon={RefreshCw} value={data.projects ? projects.length - completed : "—"} label="Ongoing" />
              <Stat icon={ImageIcon} value={data.folders ? all.filter((m) => !m.video).length : "—"} label="Photos" />
              <Stat icon={Film} value={data.folders ? all.filter((m) => m.video).length : "—"} label="Videos" />
            </section>

            <section className="ad-card">
              <div className="ad-cardhead"><h2>Folders</h2><span className="ad-muted">Load check opens every file like a visitor's browser.</span></div>
              <div className="ad-table" role="table" aria-label="Folders">
                <div className="ad-row ad-head" role="row"><span role="columnheader">Folder</span><span role="columnheader">Photos</span><span role="columnheader">Videos</span><span role="columnheader">Load check</span><span role="columnheader">Used for</span></div>
                {Object.entries(folders).map(([k, urls]) => {
                  const c = checks[k];
                  return (
                    <div className="ad-row" role="row" key={k}>
                      <span role="cell"><strong>{label(k)}</strong></span>
                      <span role="cell">{urls.filter((u) => !isVideo(u)).length}</span>
                      <span role="cell">{urls.filter(isVideo).length}</span>
                      <span role="cell" className={c ? (c.ok === c.total ? "ad-ok" : "ad-bad") : "ad-muted"}>{!c ? "Checking…" : c.total === 0 ? "Empty" : c.ok === c.total ? `✓ All ${c.total}` : `✗ ${c.total - c.ok} failing`}</span>
                      <span role="cell" className="ad-muted">{isPhotoOnly(k) ? (k.replace(/[^a-z]/g, "") === "profile" ? "Contact photo" : k.replace(/[^a-z]/g, "") === "beforeafter" ? "Before / after" : "Hero background") : <Link to={`/projects/${(PROJECTS.find((p) => p.key === k) || {}).slug || slugify(k)}`}>Project page</Link>}</span>
                    </div>
                  );
                })}
                {data.folders && !Object.keys(folders).length && <p className="ad-muted" style={{ padding: 16 }}>No folders are shown on the website. Turn folders on in Stashr.</p>}
              </div>
            </section>

            <section className="ad-card">
              <div className="ad-cardhead"><h2>Recent uploads</h2></div>
              <div className="ad-thumbs">
                {recent.map((m) => (
                  <button key={m.url} type="button" className="ad-thumb" onClick={() => setViewer({ items: [m.url], index: 0, label: label(m.folder) })}>
                    <img src={m.video ? videoPoster(m.url) : cld(m.url, 300)} alt={`${label(m.folder)} upload`} loading="lazy" width="300" height="225" />
                    <span>{label(m.folder)} · {fmtDate(m.date)}</span>
                  </button>
                ))}
                {!recent.length && <p className="ad-muted">Nothing yet.</p>}
              </div>
            </section>

            <section className="ad-card">
              <div className="ad-cardhead"><h2>Connection</h2></div>
              <dl className="ad-dl">
                <dt>Stashr servers</dt><dd>{STASHR_HOSTS.map((h) => <div key={h}><code>{h.replace("https://", "")}</code></div>)}</dd>
                <dt>Last checked</dt><dd>{data.checkedAt ? data.checkedAt.toLocaleTimeString("en-IN") : "—"}</dd>
                <dt>Website</dt><dd><a href="/" target="_blank" rel="noreferrer"><Globe size={14} style={{ verticalAlign: "-2px" }} /> Open the live site</a></dd>
              </dl>
            </section>
          </>
        )}

        {tab === "projects" && (
          <section className="ad-card">
            <div className="ad-cardhead"><h2>Projects</h2><a className="sx-btn sx-btn--ghost ad-small" href={STASHR_MANAGER_URL} target="_blank" rel="noreferrer">Edit status in Stashr <ExternalLink size={14} /></a></div>
            <div className="ad-table" role="table" aria-label="Projects">
              <div className="ad-row ad-row6 ad-head" role="row"><span>Project</span><span>Status</span><span>Progress</span><span>Stage</span><span>ETA</span><span>Area</span></div>
              {projects.map((p) => (
                <div className="ad-row ad-row6" role="row" key={p.key}>
                  <span><Link to={`/projects/${(PROJECTS.find((x) => x.key === p.key) || {}).slug || slugify(p.key)}`}><strong>{p.name}</strong></Link></span>
                  <span><span className={`sx-tag ${p.status === "Completed" ? "sx-tag--done" : "sx-tag--ongoing"}`}>{p.status}</span></span>
                  <span><div className="sx-progress-bar" style={{ width: 90, display: "inline-block", verticalAlign: "middle" }}><span style={{ width: `${p.progress}%` }} /></div> {p.progress}%</span>
                  <span>{p.stage || "—"}</span>
                  <span>{p.status === "Completed" ? "—" : p.eta || "—"}</span>
                  <span>{p.area || "—"}</span>
                </div>
              ))}
              {data.projects && !projects.length && <p className="ad-muted" style={{ padding: 16 }}>No projects are shown on the website.</p>}
            </div>
          </section>
        )}

        {tab === "media" && (
          <section className="ad-card">
            <div className="ad-filters">
              <label className="ad-search"><Search size={16} aria-hidden="true" /><span className="sx-visually-hidden">Search files</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file or folder" /></label>
              <label><span className="sx-visually-hidden">Folder</span><select className="sx-select" value={folder} onChange={(e) => setFolder(e.target.value)}><option value="all">All folders</option>{Object.keys(folders).map((k) => <option key={k} value={k}>{label(k)}</option>)}</select></label>
              <div className="sx-filters" role="group" aria-label="Type" style={{ margin: 0 }}>
                {[["all", "All"], ["image", "Photos"], ["video", "Videos"]].map(([k, l]) => <button key={k} type="button" className="sx-chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{l}</button>)}
              </div>
              <span className="ad-muted" style={{ marginLeft: "auto" }}>{filtered.length} files{selected.size ? ` · ${selected.size} selected` : ""}</span>
              {selected.size > 0 && <>
                <button type="button" className="sx-btn sx-btn--ghost ad-small" onClick={copySelected}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy URLs"}</button>
                <button type="button" className="sx-btn sx-btn--ghost ad-small" onClick={() => setSelected(new Set())}>Clear</button>
              </>}
            </div>
            <div className="ad-lib">
              {filtered.map((m, i) => (
                <figure key={m.url} className={`ad-item ${selected.has(m.url) ? "sel" : ""}`}>
                  <button type="button" className="ad-prev" onClick={() => setViewer({ items: filtered.map((x) => x.url), index: i, label: "Media library" })} aria-label={`Preview ${fileName(m.url)}`}>
                    <img src={m.video ? videoPoster(m.url) : cld(m.url, 360)} alt="" loading="lazy" width="360" height="270" />
                    {m.video && <span className="ad-badge">Video</span>}
                  </button>
                  <figcaption>
                    <label><input type="checkbox" checked={selected.has(m.url)} onChange={() => toggle(m.url)} /> <span className="sx-visually-hidden">Select</span></label>
                    <span title={fileName(m.url)}>{label(m.folder)}</span>
                    <small>{fmtDate(m.date)}</small>
                    <a href={m.url} target="_blank" rel="noreferrer" aria-label="Open original"><ExternalLink size={13} /></a>
                  </figcaption>
                </figure>
              ))}
              {data.folders && !filtered.length && <p className="ad-muted">No files match.</p>}
            </div>
          </section>
        )}
      </main>
      {viewer && <Lightbox items={viewer.items} index={viewer.index} onIndex={(i) => setViewer((v) => ({ ...v, index: i }))} onClose={() => setViewer(null)} label={viewer.label} />}
    </div>
  );
}
