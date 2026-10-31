import { findFolder } from "../services/stashr";
import { isVideo, PROJECTS } from "../lib/site";

/** Hero photo: first "Caraousel" photo, else the newest photo of the first project that has one. */
export const heroImage = (folders) => {
  const c = findFolder(folders, "caraousel") || findFolder(folders, "carousel");
  const fromCarousel = c && (folders[c] || []).find((u) => !isVideo(u));
  if (fromCarousel) return fromCarousel;
  for (const p of PROJECTS) {
    const img = (folders[p.key] || []).find((u) => !isVideo(u));
    if (img) return img;
  }
  return null;
};

/** [before, after] photos from the "before after" folder, or null. */
export const beforeAfter = (folders) => {
  const k = findFolder(folders, "before after");
  const imgs = (k ? folders[k] : []).filter((u) => !isVideo(u));
  return imgs.length >= 2 ? [imgs[0], imgs[1]] : null;
};

export const profilePhoto = (folders) => {
  const k = findFolder(folders, "profile");
  return (k ? folders[k] : []).find((u) => !isVideo(u)) || null;
};
