import { createReader } from "@keystatic/core/reader";
import type { Node } from "@markdoc/markdoc";
import { cache } from "react";

import keystaticConfig from "@/keystatic.config";

import type { GridItem, Project, ProjectCounts } from "./projects";

// Reads content/ (edited with Keystatic) at build time, on the server only. Client components get the
// data as props from the pages, so it never ships as a module to the browser.
const reader = createReader(process.cwd(), keystaticConfig);

type Entry = Awaited<ReturnType<typeof reader.collections.projects.readOrThrow>>;

// Keystatic stores empty optional fields as "" or null; the site treats them as absent.
const text = (value: string) => value || undefined;

function toProject(slug: string, e: Entry): Project {
  const { preview, media, caseStudy } = e;
  return {
    slug,
    title: e.title,
    kind: e.kind,
    device: e.device,
    meta: e.meta,
    year: e.year,
    shipped: e.shipped,
    cta: e.cta,
    preview: preview.discriminant,
    ratio: text(e.ratio),
    maxHeight: e.maxHeight ?? undefined,
    soon: e.soon || undefined,
    url: text(e.url),
    palette: { ...e.palette, chrome: text(e.palette.chrome), muted: text(e.palette.muted) },
    slides:
      preview.discriminant === "carousel"
        ? preview.value.map((s) => ({ ink: text(s.ink), hero: s.hero ?? undefined }))
        : undefined,
    before: preview.discriminant === "compare" ? preview.value : undefined,
    media:
      media.discriminant === "image"
        ? { type: "image", ...media.value }
        : media.discriminant === "video"
          ? { type: "video", src: media.value.src, poster: media.value.poster ?? undefined }
          : undefined,
    caseStudy: caseStudy.discriminant
      ? {
          ...caseStudy.value,
          stack: [...caseStudy.value.stack],
          links: caseStudy.value.links.map((link) => ({ ...link })),
          figures: [...caseStudy.value.figures],
        }
      : undefined,
  };
}

const readGrid = cache(async () => (await reader.singletons.grid.readOrThrow()).items);

/** Every project, in the home grid's order (projects left out of the grid come last, by title). */
export const getProjects = cache(async (): Promise<Project[]> => {
  const [entries, grid] = await Promise.all([reader.collections.projects.all(), readGrid()]);
  const rank = new Map(grid.flatMap((item, i) => (item.discriminant === "project" ? [[item.value, i] as const] : [])));
  return entries
    .map(({ slug, entry }) => toProject(slug, entry))
    .sort((a, b) => (rank.get(a.slug) ?? Infinity) - (rank.get(b.slug) ?? Infinity) || a.title.localeCompare(b.title));
});

export async function getProject(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug);
}

/** The home grid in its curated order, widgets included. */
export const getGrid = cache(async (): Promise<GridItem[]> => {
  const [projects, grid] = await Promise.all([getProjects(), readGrid()]);
  return grid.flatMap((item): GridItem[] => {
    if (item.discriminant !== "project") return [{ type: "widget", widget: item.discriminant }];
    const project = projects.find((p) => p.slug === item.value);
    return project ? [{ type: "project", project }] : [];
  });
});

export async function getProjectCounts(): Promise<ProjectCounts> {
  const projects = await getProjects();
  return {
    all: projects.length,
    mobile: projects.filter((p) => p.kind === "mobile").length,
    web: projects.filter((p) => p.kind === "web").length,
  };
}

/** The case study's story (Markdoc), or null. */
export async function getCaseStudyBody(slug: string): Promise<Node | null> {
  const entry = await reader.collections.projects.read(slug);
  return entry ? (await entry.body()).node : null;
}
