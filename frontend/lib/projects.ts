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
  sections: { title: string; body?: string; items?: string[] }[];
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
  slides?: Slide[];
  before?: Pick<Palette, "screen" | "ink" | "line" | "text">;
  media?: ProjectMedia;
  caseStudy?: CaseStudy;
};

export const projects: Project[] = [
  {
    slug: "kori-pay",
    title: "Kori Pay",
    kind: "mobile",
    device: "phone",
    meta: "Fintech · iOS & Android",
    year: "2024",
    shipped: "October 2024",
    cta: { label: "Case study", href: "/work/kori-pay" },
    preview: "still",
    ratio: "9 / 16",
    palette: { bg: "#121C30", screen: "#F5F7FB", ink: "#2563EB", line: "#DCE3EF", text: "#0B1220" },
    caseStudy: {
      summary: "[One sentence: what Kori Pay does, who it is for, and what you owned on it.]",
      role: "[Your role]",
      platforms: "iOS · Android",
      stack: ["Figma", "React Native", "TypeScript", "Expo"],
      links: [
        { label: "App Store", href: "https://apps.apple.com/gb/app/kori-pay/id6738018013" },
        {
          label: "Play Store",
          href: "https://play.google.com/store/apps/details?id=ml.kori.koripay&pcampaignid=web_share",
        },
      ],
      sections: [
        {
          title: "Overview",
          body: "[2–3 sentences on the product: who uses Kori Pay, what problem it solves, and the context you joined in.]",
        },
        {
          title: "The challenge",
          body: "[What made it hard: constraints, deadlines, devices, network conditions, compliance — whatever shaped your decisions.]",
        },
        {
          title: "What I built",
          items: [
            "[Key feature or flow you designed or shipped]",
            "[Technical decision worth showing — architecture, performance, offline]",
            "[Release: App Store / Play Store launch, result or learning]",
          ],
        },
      ],
      figures: ["[Flow 01 — screen recording]", "[Flow 02 — screen recording]"],
    },
  },
  {
    slug: "treize",
    title: "Treize",
    kind: "mobile",
    device: "phone",
    meta: "iOS & Android",
    year: "2025",
    shipped: "In progress",
    cta: { label: "View on GitHub", href: "https://github.com/mandjou-dama/treize-preview" },
    preview: "still",
    ratio: "9 / 16",
    maxHeight: 450,
    soon: true,
    palette: { bg: "#2A1A12", screen: "#140D0A", ink: "#F26B3A", line: "#33231B", text: "#FCEFE8" },
  },
  {
    slug: "maison-amoa",
    title: "Maison Amoa",
    kind: "web",
    device: "browser",
    meta: "Next.js · Supabase",
    year: "2026",
    shipped: "January 2026",
    cta: { label: "Visit site", href: "https://maison-amoaa.com" },
    preview: "still",
    ratio: "4 / 5",
    url: "maison-amoaa.com",
    palette: {
      bg: "#231E19",
      screen: "#F3EDE4",
      chrome: "#E6DDD1",
      ink: "#8C6A4A",
      line: "#E0D5C6",
      text: "#2A2018",
      muted: "#6B5B4A",
    },
  },
  {
    slug: "dily",
    title: "Dily",
    kind: "mobile",
    device: "phone",
    meta: "iOS & Android",
    year: "2026",
    shipped: "In progress",
    cta: { label: "View on GitHub", href: "https://github.com/mandjou-dama/dily" },
    preview: "carousel",
    ratio: "9 / 16",
    palette: { bg: "#1A1630", screen: "#FFFFFF", ink: "#6D4AE0", line: "#ECE8F8", text: "#151028" },
    slides: [{}, { ink: "#F59E0B", hero: 140 }, { ink: "#10B981", hero: 64 }],
  },
  {
    slug: "bamako-art-gallery",
    title: "Bamako Art Gallery",
    kind: "web",
    device: "browser",
    meta: "Next.js · Sanity",
    year: "2025",
    shipped: "February 2025",
    cta: { label: "Visit site", href: "https://www.bamakoartgallery.com/en" },
    preview: "still",
    ratio: "387 / 290",
    url: "bamakoartgallery.com",
    palette: {
      bg: "#1B1B1B",
      screen: "#FAFAF8",
      chrome: "#EDEDEA",
      ink: "#111111",
      line: "#E6E6E1",
      text: "#111111",
      muted: "#5C5C58",
    },
  },
  {
    slug: "o-bambu-app",
    title: "O-Bambu",
    kind: "mobile",
    device: "phone",
    meta: "iOS & Android",
    year: "2025",
    shipped: "March 2025",
    cta: { label: "Get the app", href: "https://apps.apple.com/ml/app/o-bambu/id6746059635" },
    preview: "still",
    ratio: "9 / 16",
    maxHeight: 450,
    palette: { bg: "#132418", screen: "#F4F8F2", ink: "#2E8B57", line: "#DDE8DA", text: "#0F1F14" },
  },
  {
    slug: "yumi",
    title: "Yumi",
    kind: "mobile",
    device: "phone",
    meta: "Currency converter · iOS",
    year: "2025",
    shipped: "April 2025",
    cta: { label: "Get iOS app", href: "https://apps.apple.com/ml/app/yumi/id6747351946" },
    preview: "compare",
    ratio: "9 / 16",
    maxHeight: 450,
    palette: { bg: "#2A2210", screen: "#141210", ink: "#E9A517", line: "#2C2820", text: "#FFF6E0" },
    before: { screen: "#F4F4F5", ink: "#A1A1AA", line: "#D4D4D8", text: "#3F3F46" },
  },
  {
    slug: "o-bambu-web",
    title: "O-Bambu",
    kind: "web",
    device: "browser",
    meta: "Next.js · Sanity",
    year: "2025",
    shipped: "April 2025",
    cta: { label: "Visit site", href: "https://www.o-bambu.com/" },
    preview: "video",
    ratio: "1 / 1",
    url: "o-bambu.com",
    palette: {
      bg: "#132418",
      screen: "#FFFFFF",
      chrome: "#EEF3EC",
      ink: "#2E8B57",
      line: "#E3EDE0",
      text: "#0F1F14",
      muted: "#4F6A55",
    },
  },
  {
    slug: "kabakoo-app",
    title: "Kabakoo",
    kind: "mobile",
    device: "phone",
    meta: "Product design · Figma",
    year: "2024",
    shipped: "September 2024",
    cta: { label: "App Store", href: "https://apps.apple.com/ml/app/kabakoo/id6504529066" },
    preview: "carousel",
    ratio: "9 / 16",
    palette: { bg: "#0F2629", screen: "#FFFFFF", ink: "#0E9F8E", line: "#DDEDEB", text: "#0B1F1D" },
    slides: [{}, { ink: "#F97316", hero: 140 }, { ink: "#0B1F1D", hero: 64 }],
  },
  {
    slug: "kabakoo-academies",
    title: "Kabakoo Academies",
    kind: "web",
    device: "browser",
    meta: "Webflow · Figma",
    year: "2024",
    shipped: "April 2024",
    cta: { label: "Visit site", href: "https://www.kabakoo.africa/" },
    preview: "video",
    ratio: "387 / 290",
    url: "kabakoo.africa",
    palette: {
      bg: "#0F2629",
      screen: "#F6FBFA",
      chrome: "#E6F1EF",
      ink: "#0E9F8E",
      line: "#DDEDEB",
      text: "#0B1F1D",
      muted: "#4A6663",
    },
  },
  {
    slug: "coolfaces",
    title: "CoolFaces",
    kind: "web",
    device: "browser",
    meta: "Next.js · Sanity",
    year: "2023",
    shipped: "December 2023",
    cta: { label: "Visit site", href: "https://coolfaces.vercel.app/" },
    preview: "still",
    ratio: "5 / 6",
    url: "coolfaces.vercel.app",
    palette: {
      bg: "#2A1616",
      screen: "#141414",
      chrome: "#1E1E1E",
      ink: "#FF6B5B",
      line: "#2A2A2A",
      text: "#FFEDEB",
      muted: "#A3A3A3",
    },
  },
];

export type GridItem =
  | { type: "project"; project: Project }
  | { type: "widget"; widget: "music" | "time" };

const gridOrder: (string | { widget: "music" | "time" })[] = [
  "kori-pay",
  "treize",
  "maison-amoa",
  { widget: "music" },
  "dily",
  "bamako-art-gallery",
  "o-bambu-app",
  { widget: "time" },
  "yumi",
  "o-bambu-web",
  "kabakoo-app",
  "kabakoo-academies",
  "coolfaces",
];

export function mediaRatio(project: Project) {
  // Defaults match the reference grid: tall 9:16 phones, 387:290 landscape windows.
  return project.ratio ?? (project.device === "phone" ? "9 / 16" : "387 / 290");
}

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function parseFilter(value: string | null | undefined): Filter {
  return value === "mobile" || value === "web" ? value : "all";
}

/** The home grid in its curated order; widgets only show under "all". */
export function gridItems(filter: Filter): GridItem[] {
  return gridOrder.flatMap((entry): GridItem[] => {
    if (typeof entry !== "string") return filter === "all" ? [{ type: "widget", widget: entry.widget }] : [];
    const project = getProject(entry);
    if (!project || (filter !== "all" && project.kind !== filter)) return [];
    return [{ type: "project", project }];
  });
}

export function projectCount(filter: Filter) {
  return filter === "all" ? projects.length : projects.filter((p) => p.kind === filter).length;
}

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}
