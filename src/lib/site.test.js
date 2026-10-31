import { cld, isVideo, slugify, totalArea, PROJECTS, projectBySlug } from "./site";
import { ROUTES, projectRoute } from "./routes";
import { mergeProjects, filterProjects, progressOf } from "./projects";
import { isPhotoOnly, findFolder } from "../services/stashr";

const cjs = require("../../scripts/routes.cjs");

test("prerender routes match the app routes exactly", () => {
  expect(cjs.ROUTES).toEqual(ROUTES);
  expect(ROUTES.map((r) => r.path)).toEqual(expect.arrayContaining(["/", "/projects", "/about", "/services", "/gallery", "/locations", "/contact", "/projects/sector-4", "/projects/sector-9", "/projects/sector-42", "/projects/sector-46", "/projects/reliance-met-city"]));
  expect(new Set(ROUTES.map((r) => r.title)).size).toBe(ROUTES.length);
});

test("every project has a unique slug and a route", () => {
  expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(PROJECTS.length);
  expect(projectBySlug("sector-42").key).toBe("sec 42");
  expect(projectRoute(PROJECTS[0]).path).toBe("/projects/sector-4");
});

test("cloudinary helpers", () => {
  const img = "https://res.cloudinary.com/x/image/upload/v1/ShineOne/sec%204/a.jpg";
  expect(cld(img, 600)).toBe("https://res.cloudinary.com/x/image/upload/f_auto,q_auto,c_limit,w_600/v1/ShineOne/sec%204/a.jpg");
  expect(isVideo("https://res.cloudinary.com/x/video/upload/v1/a.mp4")).toBe(true);
  expect(isVideo(img)).toBe(false);
  expect(cld("https://example.com/a.jpg", 600)).toBe("https://example.com/a.jpg");
});

test("slugify and totals", () => {
  expect(slugify("sec 12")).toBe("sector-12");
  expect(slugify("Green Valley!")).toBe("green-valley");
  expect(totalArea([{ area: "5700 Sq. Feet" }, { area: "" }, { area: "1620 Sq. Feet" }])).toBe(7320);
});

test("server status overrides built-in data; hidden and photo-only folders are dropped", () => {
  expect(mergeProjects(undefined)).toHaveLength(PROJECTS.length);
  const merged = mergeProjects([
    { key: "sec 42", name: "Sector 42", status: "Ongoing", progress: 85, stage: "Finishing", eta: "Dec 2026", visible: true },
    { key: "sec 9", name: "Sector 9", status: "Completed", visible: false },
    { key: "profile", name: "Profile", status: "Ongoing", visible: true },
    { key: "sector 12", name: "Sector 12", status: "Ongoing", progress: 0, visible: true },
  ]);
  expect(merged.map((p) => p.slug)).toEqual(["sector-42", "sector-12"]);
  expect(merged[0]).toMatchObject({ progress: 85, stage: "Finishing", eta: "Dec 2026", location: "Sector 42, Gurugram" });
  expect(mergeProjects([])).toEqual([]);
});

test("filters", () => {
  const all = mergeProjects(undefined);
  expect(filterProjects(all, { status: "completed" }).every((p) => p.status === "Completed")).toBe(true);
  expect(filterProjects(all, { status: "ongoing" }).map((p) => p.slug)).toEqual(["sector-42", "reliance-met-city"]);
  expect(filterProjects(all, { status: "new" }).map((p) => p.slug)).toEqual(["reliance-met-city"]);
  expect(filterProjects(all, { key: "sec 4" })).toHaveLength(1);
  expect(progressOf({ status: "Completed", progress: 10 })).toBe(100);
});

test("photo-only folders", () => {
  expect(isPhotoOnly("before after")).toBe(true);
  expect(isPhotoOnly("Profile")).toBe(true);
  expect(isPhotoOnly("sec 4")).toBe(false);
  expect(findFolder({ "before after": [] }, "Before-After")).toBe("before after");
});
