import { useEffect } from "react";
import { SITE_URL } from "../lib/site";

const setMeta = (selector, attr, value) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith("link") ? "link" : "meta");
    const m = selector.match(/\[(name|property|rel)="([^"]+)"\]/);
    if (m) el.setAttribute(m[1], m[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

/** Title, description, canonical and social tags for the current page (the prerendered HTML has the same values). */
export default function usePageMeta({ title, description, path, image, noindex = false }) {
  useEffect(() => {
    const url = SITE_URL + (path === "/" ? "/" : path);
    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('link[rel="canonical"]', "href", url);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    if (image) { setMeta('meta[property="og:image"]', "content", image); setMeta('meta[name="twitter:image"]', "content", image); }
    setMeta('meta[name="robots"]', "content", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
  }, [title, description, path, image, noindex]);
}
