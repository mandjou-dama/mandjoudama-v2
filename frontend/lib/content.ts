import path from "node:path";

import { createReader } from "@keystatic/core/reader";
import type { Node } from "@markdoc/markdoc";
import { imageSizeFromFile } from "image-size/fromFile";
import { cache } from "react";

import keystaticConfig from "@/keystatic.config";

import type { GridItem, Project, ProjectCounts } from "./projects";

// Reads content/ (edited with Keystatic) at build time, on the server only. Client components get the
// data as props from the pages, so it never ships as a module to the browser.
const reader = createReader(process.cwd(), keystaticConfig);

type Entry = Awaited<ReturnType<typeof reader.collections.projects.readOrThrow>>;

// Keystatic stores empty optional fields as "" or null; the site treats them as absent.
const text = (value: string) => value || undefined;
/** An optional size in px, stored as text; empty or 0 means none. */
const pixels = (value: string) => Number(value) || undefined;

/** An image's size in px: the entry's values when both are set, otherwise read from the file in public/. */
async function sizeOf(src: string, width: string, height: string) {
  if (pixels(width) && pixels(height)) return { width: Number(width), height: Number(height) };
  const size = await imageSizeFromFile(path.join(process.cwd(), "public", src)).catch((error: unknown) => {
    throw new Error(`Can't read the size of ${src} (content/projects): ${error}`);
  });
  // EXIF orientations 5–8 are stored rotated a quarter turn.
  const turned = (size.orientation ?? 1) >= 5;
  return { width: turned ? size.height : size.width, height: turned ? size.width : size.height };
}

async function toProject(slug: string, e: Entry): Promise<Project> {
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
    maxHeight: pixels(e.maxHeight),
    soon: e.soon || undefined,
    url: text(e.url),
    palette: { ...e.palette, chrome: text(e.palette.chrome), muted: text(e.palette.muted) },
    background: e.background ?? undefined,
    slides:
      preview.discriminant === "carousel"
        ? preview.value.map((s) => ({ ink: text(s.ink), hero: pixels(s.hero) }))
        : undefined,
    before: preview.discriminant === "compare" ? preview.value : undefined,
    media:
      media.discriminant === "image"
        ? {
            type: "image",
            src: media.value.src,
            alt: media.value.alt,
            ...(await sizeOf(media.value.src, media.value.width, media.value.height)),
          }
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
  const projects = await Promise.all(entries.map(({ slug, entry }) => toProject(slug, entry)));
  return projects.sort((a, b) => (rank.get(a.slug) ?? Infinity) - (rank.get(b.slug) ?? Infinity) || a.title.localeCompare(b.title));
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

/** Projects per filter tab. Reads the entries only (no image sizes): the layout needs it on every page, 404s included. */
export async function getProjectCounts(): Promise<ProjectCounts> {
  const kinds = (await reader.collections.projects.all()).map(({ entry }) => entry.kind);
  return {
    all: kinds.length,
    mobile: kinds.filter((kind) => kind === "mobile").length,
    web: kinds.filter((kind) => kind === "web").length,
  };
}

/** The case study's story (Markdoc), or null. */
export async function getCaseStudyBody(slug: string): Promise<Node | null> {
  const entry = await reader.collections.projects.read(slug);
  return entry ? (await entry.body()).node : null;
}
