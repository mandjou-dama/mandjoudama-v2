export type Experience = {
  employer: string;
  role: string;
  period: string;
  current?: boolean;
};

export const experiences: Experience[] = [
  { employer: "Payme App", role: "Mobile Developer", period: "Full-time", current: true },
  { employer: "Kori Inc", role: "Mobile & Frontend Developer", period: "Part-time", current: true },
  { employer: "Freelance", role: "Mobile & Frontend Developer", period: "2024 — 2025" },
  { employer: "Kabakoo Academies", role: "Mobile & Frontend Developer", period: "2022 — 2024" },
  { employer: "Kabakoo Academies", role: "UX / UI Designer", period: "2021 — 2022" },
  { employer: "Elim Communication", role: "Frontend Developer", period: "2019 — 2021" },
];

// Logo stand-ins: a coloured square with the brand's initial.
export type Brand = { name: string; initial: string; color: string; ink?: string };

export const heroBrands: Brand[] = [
  { name: "Kori Pay", initial: "K", color: "#2563EB" },
  { name: "Kabakoo", initial: "K", color: "#0E9F8E" },
  { name: "O-Bambu", initial: "O", color: "#2E8B57" },
];

export const shippedFor: Brand[] = [
  { name: "Payme", initial: "P", color: "#F2683C", ink: "#0A0A0A" },
  { name: "Kori Pay", initial: "K", color: "#2563EB" },
  { name: "Kabakoo", initial: "K", color: "#0E9F8E" },
  { name: "O-Bambu", initial: "O", color: "#2E8B57" },
  { name: "Maison Amoa", initial: "M", color: "#8C6A4A" },
  { name: "Bamako Art Gallery", initial: "B", color: "#FAFAFA", ink: "#0A0A0A" },
];

export const dailyTools: { name: string; color: string }[] = [
  { name: "React Native", color: "#61DAFB" },
  { name: "Expo", color: "#FAFAFA" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Next.js", color: "#A1A1A1" },
  { name: "Supabase", color: "#3ECF8E" },
  { name: "SwiftUI", color: "#F05138" },
];

export const sideProjects: { title: string; note?: string; href: string }[] = [
  { title: "Treize", note: "building", href: "https://github.com/mandjou-dama/treize-preview" },
  { title: "Dily", note: "building", href: "https://github.com/mandjou-dama/dily" },
  { title: "Yumi — currency converter", href: "https://apps.apple.com/ml/app/yumi/id6747351946" },
  { title: "CoolFaces", href: "https://coolfaces.vercel.app/" },
];

export const stacks = [
  "Typescript",
  "Swift",
  "React Native",
  "Expo",
  "SwiftUI",
  "Next.js",
  "Vercel",
  "Node.js",
  "Supabase",
  "Tanstack Query",
  "Cloudflare",
  "Xcode",
  "Android Studio",
  "Push Notifications",
  "Analytics",
  "Crash Reporting",
  "React Navigation",
  "EAS",
  "Sanity.io",
  "Figma",
  "Webflow",
  "SCSS",
  "CSS",
];
