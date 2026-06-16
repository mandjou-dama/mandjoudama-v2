//@ts-ignore
import "./page.scss";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

import NowPlaying from "./components/NowPlaying";
import Location from "./components/Location";

type ProjectLink = {
  label: string;
  href: string;
};

type Project = {
  title: string;
  date: string;
  status: "Current" | "Done";
  stacks: string[];
  links: ProjectLink[];
};

const projects = [
  {
    title: "Treize",
    date: "May 2025",
    status: "Current",
    stacks: [
      "React Native",
      "Expo",
      "Supabase",
      "Cloudflare",
      "Node.js",
      "Tanstack Query",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/mandjou-dama/treize-preview.git",
      },
    ],
  },
  {
    title: "Kori Pay",
    date: "October 2024",
    status: "Done",
    stacks: ["Figma", "React Native", "Typescript", "Expo"],
    links: [
      {
        label: "App Store",
        href: "https://apps.apple.com/gb/app/kori-pay/id6738018013",
      },
      {
        label: "Play Store",
        href: "https://play.google.com/store/apps/details?id=ml.kori.koripay&pcampaignid=web_share",
      },
    ],
  },
  {
    title: "Dily",
    date: "February 2026",
    status: "Current",
    stacks: [
      "React Native",
      "Expo",
      "React Navigation",
      "Supabase",
      "Cloudflare",
      "Node.js",
      "Tanstack Query",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/mandjou-dama/dily",
      },
    ],
  },
  {
    title: "O-Bambu App",
    date: "March 2025",
    status: "Done",
    stacks: ["React Native", "Expo", "Supabase"],
    links: [
      {
        label: "App Store",
        href: "https://apps.apple.com/ml/app/o-bambu/id6746059635",
      },
      {
        label: "Play Store",
        href: "https://play.google.com/store/apps/details?id=com.mandjoudama.obambu&pcampaignid=web_share",
      },
    ],
  },
  {
    title: "Kabakoo - App",
    date: "September 2024",
    status: "Done",
    stacks: ["Figma", "Pitch"],
    links: [
      {
        label: "App Store",
        href: "https://apps.apple.com/ml/app/kabakoo/id6504529066",
      },
      {
        label: "Play Store",
        href: "https://play.google.com/store/apps/details?id=com.app.kabakoo.africa&pcampaignid=web_share",
      },
    ],
  },
  {
    title: "Yumi - Currency Converter",
    date: "April 2025",
    status: "Done",
    stacks: ["React Native", "Expo"],
    links: [
      {
        label: "App Store",
        href: "https://apps.apple.com/ml/app/yumi/id6747351946",
      },
    ],
  },
  {
    title: "Maison Amoa",
    date: "January 2026",
    status: "Done",
    stacks: ["Next.js", "Supabase"],
    links: [
      {
        label: "Website",
        href: "https://maison-amoaa.com",
      },
    ],
  },
  {
    title: "O-Bambu Website",
    date: "April 2025",
    status: "Done",
    stacks: ["Next.js", "Sanity.io"],
    links: [
      {
        label: "Website",
        href: "https://www.o-bambu.com/",
      },
    ],
  },
  {
    title: "Bamako Art Gallery",
    date: "February 2025",
    status: "Done",
    stacks: ["Next.js", "Sanity.io"],
    links: [
      {
        label: "Website",
        href: "https://www.bamakoartgallery.com/en",
      },
    ],
  },
  {
    title: "Kabakoo - Website",
    date: "April 2024",
    status: "Done",
    stacks: ["Webflow", "Figma"],
    links: [
      {
        label: "Website",
        href: "https://www.kabakoo.africa/",
      },
    ],
  },
  {
    title: "CoolFaces",
    date: "December 2023",
    status: "Done",
    stacks: ["Next.js", "Sanity.io"],
    links: [
      {
        label: "Website",
        href: "https://coolfaces.vercel.app/",
      },
    ],
  },
] satisfies Project[];

const experiences = [
  {
    employer: "Payme App",
    role: "Mobile Developper",
    date: "Fulltime Hybrid - Current",
  },
  {
    employer: "Kori Inc",
    role: "Mobile & Frontend Developper",
    date: "Part-time - Current",
  },
  {
    employer: "Freelancer",
    role: "Mobile & Frontend Developer",
    date: "2024-2025",
  },
  {
    employer: "Kabakoo Academies",
    role: "Mobile & Frontend Developer",
    date: "2022-2024",
  },
  {
    employer: "Kabakoo Academies",
    role: "UX / UI Designer",
    date: "2021-2022",
  },
  {
    employer: "Elim Communication",
    role: "Frontend Developper",
    date: "2019-2021",
  },
];

const stacks = [
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

export default async function Page() {
  const { data, error } = await supabase
    .from("now_playing")
    .select("*")
    .eq("id", "now_playing")
    .single();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <main className={"page"}>
      <div>
        <div className={"header"}>
          <h1>Mandjou Dama</h1>
          <a href="mailto:contact@mandjoudama.com">contact@mandjoudama.com</a>
        </div>

        <p className={"description"}>
          Mobile & Frontend Developer with over 4 years of experience building
          responsive, accessible, and high-performance applications for mobile
          and web. Specialized in React, React Native, TypeScript, and Next.js,
          with a strong focus on clean code, scalable architecture, and seamless
          user interfaces. Native in French and fluent in English.
        </p>
      </div>

      <div className={"grid_container"}>
        <div className={"section section_1"}>
          <h3>Experiences</h3>

          <div className={"educations_container"}>
            {experiences.map(({ employer, role, date }) => (
              <div key={`${employer}_${role}`} className={"education_item"}>
                <div className={"education_dot"}>
                  <div></div>
                </div>

                <div className={"education_details"}>
                  <div className={"education_details_header"}>
                    <h5>{employer}</h5>
                    <div className={"middle_dot"}></div>
                    <p>{date}</p>
                  </div>
                  <p>{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={"section section_3"}>
          <h3>Projects</h3>

          <div className={"projects_container"}>
            {projects.map(({ title, date, status, stacks, links }, index) => (
              <div key={`project_${index}`} className={"project_item"}>
                <div className={"project_dot"}>
                  <p>{index + 1}</p>
                </div>

                <div className={"project_details"}>
                  <div className={"project_details_header"}>
                    <h5>{title}</h5>
                    <div className={"middle_dot"}></div>
                    <p>{`${date} ${status === "Current" ? `- ${status}` : ""}`}</p>
                  </div>
                  <div className={"project_links"}>
                    {links.map(({ label, href }) => (
                      <Link
                        key={`${title}_${label}`}
                        target="_blank"
                        rel="noreferrer"
                        href={href}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                  <div className={"project_stacks"}>
                    {stacks.map((stack) => (
                      <div key={stack} className={"project_stack"}>
                        <p>{stack}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={"section section_4"}>
          <div>
            <h3>Tech Stacks</h3>

            <div className={"tech_stacks_header"}>
              <h5>Mobile</h5>
              <div className={"middle_dot"}></div>
              <h5>Front End</h5>
            </div>
            <p className={"role"}>Developper</p>
          </div>

          <div className={"tech_stacks_container"}>
            {stacks.map((stack) => (
              <div key={stack} className={"project_stack"}>
                <p>{stack}</p>
              </div>
            ))}
          </div>
        </div>

        <NowPlaying />

        <Location />
      </div>
    </main>
  );
}
