//@ts-ignore
import "./page.scss";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

import NowPlaying from "./components/NowPlaying";
import Location from "./components/Location";

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
    link: "https://github.com/mandjou-dama/treize-preview.git",
  },
  {
    title: "O-Bambu App",
    date: "March 2025",
    status: "Done",
    stacks: ["React Native", "Expo", "Supabase"],
    link: "https://apps.apple.com/ml/app/o-bambu/id6746059635",
  },
  {
    title: "O-Bambu",
    date: "April 2025",
    status: "Done",
    stacks: ["Next.js", "Sanity.io"],
    link: "https://www.o-bambu.com/",
  },
  {
    title: "Yumi - Currency Converter",
    date: "April 2025",
    status: "Done",
    stacks: ["React Native", "Expo"],
    link: "https://apps.apple.com/ml/app/yumi/id6747351946",
  },
  {
    title: "Bamako Art Gallery",
    date: "February 2025",
    status: "Done",
    stacks: ["Next.js", "Sanity.io"],
    link: "https://www.bamakoartgallery.com/en",
  },
  {
    title: "Kabakoo - App",
    date: "September 2024",
    status: "Done",
    stacks: ["Figma", "Pitch"],
    link: "https://apps.apple.com/ml/app/kabakoo/id6504529066",
  },
  {
    title: "Kabakoo - Website",
    date: "April 2024",
    status: "Done",
    stacks: ["Webflow", "Figma"],
    link: "https://www.kabakoo.africa/",
  },
  {
    title: "Tiecoura N'Daou",
    date: "February 2024",
    status: "Done",
    stacks: ["Webflow", "Figma"],
    link: "https://tiecoura-com.webflow.io/",
  },
  {
    title: "CoolFaces",
    date: "December 2023",
    status: "Done",
    stacks: ["Next.js", "Sanity.io"],
    link: "https://coolfaces.vercel.app/",
  },
  // {
  //   title: "Ikazic",
  //   date: "March 2023",
  //   status: "Done",
  //   stacks: ["Next.js"],
  //   link: "https://ikazic.vercel.app/",
  // },
];

const experiences = [
  {
    employer: "Yoboo Labs",
    role: "Mobile & Frontend Developper",
    date: "Current",
  },
  {
    employer: "Kabakoo Academies",
    role: "UX / UI Designer",
    date: "2022-2024",
  },
  {
    employer: "Freelancer",
    role: "Frontend Developper",
    date: "2021-2022",
  },
  {
    employer: "Elim Communication",
    role: "Frontend Developper",
    date: "2019-2021",
  },
];

const stacks = [
  "React Native",
  "Expo",
  "Next.js",
  "Vercel",
  "Supabase",
  "Tanstack Query",
  "Cloudflare",
  "Sanity.io",
  "Figma",
  "Typescript",
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
          I&apos;m a mobile and front-end developer, passionate about everything
          related to software development. I enjoy crafting modern, seamless
          user interfaces while also exploring the more technical aspects of
          development, both on the client and server sides.
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
            {projects.map(({ title, date, status, stacks, link }, index) => (
              <div key={`project_${index}`} className={"project_item"}>
                <div className={"project_dot"}>
                  <p>{index + 1}</p>
                </div>

                <div className={"project_details"}>
                  <div className={"project_details_header"}>
                    <Link target="_blank" href={link}>
                      {title}
                    </Link>
                    <div className={"middle_dot"}></div>
                    <p>{`${date} ${status === "Current" ? `- ${status}` : ""}`}</p>
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
