// Public pages with their SEO metadata. The same rules live in scripts/routes.cjs for the build-time
// prerender (Node can't load this ESM file there); src/lib/routes.test.js keeps the two identical.
import content from "./content.json";

export const projectRoute = (p) => ({
  path: `/projects/${p.slug}`,
  title: `${p.name}, Gurugram — ${p.status} Project | ShineOne Estate`,
  description: `${p.name} by ShineOne Estate: ${String(p.status).toLowerCase()} residential project in ${p.location}${p.area ? `, ${p.area}` : ""}. Photos, videos and construction progress.`,
  h1: `${p.name}, Gurugram`,
  project: p.slug,
});

export const STATIC_ROUTES = content.staticRoutes;
export const ROUTES = [...STATIC_ROUTES, ...content.projects.map(projectRoute)];
export const routeFor = (path) => ROUTES.find((r) => r.path === path) || null;
