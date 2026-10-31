// Node copy of src/lib/routes.js for the prerender script. Keep in sync (src/lib/routes.test.js checks it).
const content = require("../src/lib/content.json");

const projectRoute = (p) => ({
  path: `/projects/${p.slug}`,
  title: `${p.name}, Gurugram — ${p.status} Project | ShineOne Estate`,
  description: `${p.name} by ShineOne Estate: ${String(p.status).toLowerCase()} residential project in ${p.location}${p.area ? `, ${p.area}` : ""}. Photos, videos and construction progress.`,
  h1: `${p.name}, Gurugram`,
  project: p.slug,
});

const ROUTES = [...content.staticRoutes, ...content.projects.map(projectRoute)];

module.exports = { ROUTES, projectRoute, content };
