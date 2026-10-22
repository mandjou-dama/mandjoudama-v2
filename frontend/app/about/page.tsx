import type { Metadata } from "next";
import Image from "next/image";
import { Fragment, type CSSProperties, type ReactNode } from "react";

import { ArrowRight } from "@/app/components/icons";
import { Reveal } from "@/app/components/Reveal";
import { NowPlayingRow } from "@/app/components/work/Widgets";
import { dailyTools, experiences, shippedFor, sideProjects } from "@/lib/profile";

import styles from "./About.module.scss";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mandjou Dama started as a frontend developer in 2019, moved into UX/UI design, and now ships mobile and web apps with React Native, Expo and Next.js.",
  alternates: { canonical: "/about" },
};

function list<T>(items: T[], render: (item: T) => ReactNode) {
  // Each name keeps its comma (or the "and" after it); lines break at the space that follows.
  return items.map((item, i) => {
    const separator = i < items.length - 2 ? "," : i === items.length - 2 ? " and" : "";
    return (
      <Fragment key={i}>
        <span style={{ whiteSpace: "nowrap" }}>
          {render(item)}
          {separator}
        </span>
        {i < items.length - 1 && " "}
      </Fragment>
    );
  });
}

const photos = [
  { tilt: "-3deg" },
  { tilt: "2deg", drop: "10px" },
  { tilt: "-1.5deg" },
  { tilt: "3deg", drop: "6px" },
];

export default function AboutPage() {
  return (
    <Reveal>
      <article className={styles.page}>
        <h1 className={styles.title}>A bit about me…</h1>
        <p className={styles.text} data-reveal="">
          I started writing code in 2019 as a frontend developer at Elim Communication. In 2021 I moved into UX/UI
          design at Kabakoo Academies, then went back to code with a designer’s eye. Since then I’ve been shipping
          mobile and web apps with React Native, Expo and Next.js — from the first Figma frame to the store release.
        </p>
        <p className={styles.text} data-reveal="">
          I’ve shipped products for{" "}
          {list(shippedFor, (brand) => (
            <span className={styles.inline}>
              <span className={styles.logo} style={{ background: brand.color, color: brand.ink ?? "#fff" }} aria-hidden="true">
                {brand.logo ? <Image src={brand.logo} alt="" width={16} height={16} /> : brand.initial}
              </span>
              {brand.name}
            </span>
          ))}
          .
        </p>
        <p className={styles.text} data-reveal="">
          Day to day I work with{" "}
          {list(dailyTools, (tool) => (
            <span className={styles.inline}>
              <span className={styles.dot} style={{ background: tool.color }} aria-hidden="true" />
              {tool.name}
            </span>
          ))}
          , and I still design my screens in Figma. Native in French, fluent in English.
        </p>

        <section className={styles.section} aria-labelledby="experience">
          <h2 id="experience" className={styles.overline}>
            EXPERIENCE
          </h2>
          <ul>
            {experiences.map((job) => (
              <li key={`${job.employer}-${job.role}`} className={styles.row} data-reveal="">
                <span>
                  {job.role} <span className={styles.employer}>· {job.employer}</span>
                </span>
                <span className={[styles.period, job.current && styles.now].filter(Boolean).join(" ")}>
                  {job.current ? "Now" : job.period}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="side-projects">
          <h2 id="side-projects" className={styles.overline}>
            SIDE PROJECTS
          </h2>
          <ul>
            {sideProjects.map((project) => (
              <li key={project.title} data-reveal="">
                <a className={styles.link} href={project.href} target="_blank" rel="noreferrer">
                  <span>
                    {project.title} {project.note && <span className={styles.note}>· {project.note}</span>}
                  </span>
                  <ArrowRight size={16} />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p className={styles.text} style={{ marginTop: 16 }} data-reveal="">
          Outside of work, I enjoy [your hobbies] — and whatever is on repeat in my headphones.
        </p>
        <div data-reveal="">
          <NowPlayingRow />
        </div>
      </article>

      <div className={styles.photos} aria-hidden="true" data-reveal="">
        {photos.map((photo, i) => (
          <span key={i} style={{ "--tilt": photo.tilt, "--drop": photo.drop } as CSSProperties}>
            [Photo]
          </span>
        ))}
      </div>
    </Reveal>
  );
}
