// Types and pure helpers for projects. The data lives in content/ (edited with Keystatic, read by lib/content.ts).

export type Filter = "all" | "mobile" | "web";

export type Palette = {
  /** Background of the card's picture area. */
  bg: string;
  screen: string;
  ink: string;
  line: string;
  text: string;
  /** Browser mockups only. */
  chrome?: string;
  muted?: string;
};

/** One screen of a phone mockup; `hero` is the hero block height in px at the 185px base width. */
export type Slide = { ink?: string; hero?: number };

/**
 * How the card previews the project:
 * - still: a static mockup, the label shows the CTA button
 * - video: a play/pause button that runs the preview (the page scrolls in the browser)
 * - carousel: a stepper and play button that cycle through `slides`
 * - compare: a before/after slider (needs `before`)
 */
export type Preview = "still" | "video" | "carousel" | "compare";

/** A real screenshot or recording; when set it replaces the mockup. Files go in /public/work. */
export type ProjectMedia =
  | { type: "image"; src: string; alt: string; width: number; height: number }
  | { type: "video"; src: string; poster?: string };

export type CaseStudy = {
  summary: string;
  role: string;
  platforms: string;
  stack: string[];
  links: { label: string; href: string }[];
  figures: string[];
};

export type Project = {
  slug: string;
  title: string;
  kind: "mobile" | "web";
  device: "phone" | "browser";
  meta: string;
  year: string;
  shipped: string;
  cta: { label: string; href: string };
  preview: Preview;
  /** Aspect ratio of the card's picture area ("w / h"); varies per project so the grid is uneven. */
  ratio?: string;
  /** Caps the picture area's height in px (the reference grid caps some 9:16 cards at 450px). */
  maxHeight?: number;
  /** Shows "Coming soon" instead of a link or preview. */
  soon?: boolean;
  url?: string;
  palette: Palette;
  /** Image behind the mockup in the card's picture (object-fit: cover); palette.bg shows without it. */
  background?: string;
  slides?: Slide[];
  before?: Pick<Palette, "screen" | "ink" | "line" | "text">;
  media?: ProjectMedia;
  caseStudy?: CaseStudy;
};

export type GridItem =
  | { type: "project"; project: Project }
  | { type: "widget"; widget: "music" | "time" };

export function mediaRatio(project: Project) {
  // Defaults match the reference grid: tall 9:16 phones, 387:290 landscape windows.
  return project.ratio ?? (project.device === "phone" ? "9 / 16" : "387 / 290");
}

/** The card picture's base colour: none under real media (its transparent parts show the card), the palette's otherwise. */
export function pictureColor(project: Pick<Project, "media" | "palette">) {
  return project.media ? "transparent" : project.palette.bg;
}

export function parseFilter(value: string | null | undefined): Filter {
  return value === "mobile" || value === "web" ? value : "all";
}

/** Projects per filter tab. */
export type ProjectCounts = Record<Filter, number>;

/** The home grid (in its curated order, see lib/content.ts) for a filter; widgets only show under "all". */
export function filterGrid(items: GridItem[], filter: Filter): GridItem[] {
  if (filter === "all") return items;
  return items.filter((item) => item.type === "project" && item.project.kind === filter);
}

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}
