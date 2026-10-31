import { PROJECTS, projectByKey, slugify, isVideo } from "./site";
import { useMedia, useSiteStatus, isPhotoOnly } from "../services/stashr";

/**
 * Built-in project info + live server status. When the server answered, its list decides which
 * projects exist (folders hidden in Stashr disappear); when it didn't, the built-in list is used.
 */
export const mergeProjects = (serverProjects) => {
  if (!Array.isArray(serverProjects)) return PROJECTS.map((p) => ({ ...p }));
  return serverProjects
    .filter((s) => s && s.visible !== false && !isPhotoOnly(s.key || s.name))
    .map((s) => {
      const base = projectByKey(s.key) || {
        key: s.key, slug: slugify(s.key || s.name), name: s.name, location: `${s.name}, Gurugram`,
        type: "", description: "", highlights: [],
      };
      return {
        ...base,
        name: s.name || base.name,
        status: s.status || base.status,
        area: s.area || base.area || "",
        progress: typeof s.progress === "number" ? s.progress : base.progress,
        stage: s.stage || base.stage || "",
        eta: s.eta || base.eta || "",
      };
    });
};

export const isCompleted = (p) => String(p.status || "").toLowerCase() === "completed";
export const progressOf = (p) => (isCompleted(p) ? 100 : Math.max(0, Math.min(100, Number(p.progress) || 0)));

/** Splits a folder's URLs into images and videos. */
export const splitMedia = (urls = []) => ({
  images: urls.filter((u) => !isVideo(u)),
  videos: urls.filter((u) => isVideo(u)),
});

export const filterProjects = (projects, { status = "all", key = "all" } = {}) =>
  projects.filter((p) =>
    (status === "all" || (status === "completed" ? isCompleted(p) : status === "ongoing" ? !isCompleted(p) : status === "new" ? p.isNew : true)) &&
    (key === "all" || p.key === key));

/** { projects, folders, loading, failed } */
export const useProjects = () => {
  const site = useSiteStatus();
  const media = useMedia();
  return {
    projects: mergeProjects(site.loading ? undefined : site.projects),
    folders: media.folders,
    loading: site.loading || media.loading,
    mediaLoading: media.loading,
    failed: site.failed && media.failed,
  };
};
