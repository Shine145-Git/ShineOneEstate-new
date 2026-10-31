// Photos, videos and project status come from the Stashr server, which lists the ShineOne/<folder>
// folders in Cloudinary. Upload, hide or delete them from Stashr's "ShineOne Estate Manager" page and the
// site follows within a minute or two. No photos are stored in this repo.
// The server list comes from the Stashr registry (app "shineoneestate"); change it there, no redeploy needed.
import { useEffect, useState } from "react";

export const STASHR_HOSTS = ["https://password-manager-server-g305.onrender.com", "https://password-manager-server-xxdr.onrender.com"];
const TIMEOUT_MS = 15000;

const getJson = async (url) => {
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), TIMEOUT_MS) : null;
  try {
    const res = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { if (timer) clearTimeout(timer); }
};

let serversRequest = null;
const loadServers = () => {
  if (!serversRequest) {
    serversRequest = (async () => {
      for (const host of STASHR_HOSTS) {
        try {
          const { urls } = await getJson(`${host}/registry/shineoneestate`);
          if (Array.isArray(urls) && urls.length) return urls;
        } catch (e) { /* try the next host */ }
      }
      return STASHR_HOSTS;
    })();
  }
  return serversRequest;
};

/** Tries each registry server in order until one answers. */
export const fetchFromServers = async (path) => {
  let last = new Error("no server");
  for (const base of await loadServers()) {
    try { return await getJson(base.replace(/\/+$/, "") + path); } catch (e) { last = e; }
  }
  throw last;
};

// Folders that hold photos for one part of the page rather than a construction project.
export const PHOTO_ONLY_FOLDERS = ["profile", "beforeafter", "caraousel", "carousel"];
export const isPhotoOnly = (key) => PHOTO_ONLY_FOLDERS.includes(String(key || "").toLowerCase().replace(/[^a-z]/g, ""));
/** Finds a server folder by loose name ("Before After" == "before-after" == "beforeafter"). */
export const findFolder = (folders, name) => {
  const want = String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  return Object.keys(folders || {}).find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, "") === want);
};

// Fetched once and shared by everything that shows photos. null = server unreachable.
let mediaRequest = null;
export const loadMedia = () => {
  if (!mediaRequest) {
    mediaRequest = fetchFromServers("/public/shine/media")
      .then(({ folders }) => ({ ...(folders || {}) }))
      .catch(() => null);
  }
  return mediaRequest;
};

let siteRequest = null;
/** Project status list (photo-only folders removed). null = server unreachable. */
export const loadSite = () => {
  if (!siteRequest) {
    siteRequest = fetchFromServers("/public/shine/site")
      .then(({ projects }) => (Array.isArray(projects) ? projects : []).filter((p) => !isPhotoOnly(p.key || p.name)))
      .catch(() => null);
  }
  return siteRequest;
};

/** { folders, loading, failed } — folders is {} until loaded. */
export const useMedia = () => {
  const [state, setState] = useState({ folders: {}, loading: true, failed: false });
  useEffect(() => {
    let alive = true;
    loadMedia().then((m) => { if (alive) setState({ folders: m || {}, loading: false, failed: m === null }); });
    return () => { alive = false; };
  }, []);
  return state;
};

/** { projects, loading, failed } — raw server projects (key, name, status, area, progress, stage, eta, visible). */
export const useSiteStatus = () => {
  const [state, setState] = useState({ projects: null, loading: true, failed: false });
  useEffect(() => {
    let alive = true;
    loadSite().then((p) => { if (alive) setState({ projects: p, loading: false, failed: p === null }); });
    return () => { alive = false; };
  }, []);
  return state;
};

