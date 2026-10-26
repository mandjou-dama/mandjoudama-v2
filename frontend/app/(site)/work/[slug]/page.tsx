import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { ArrowLeft, ArrowRight, ArrowUpRight } from "@/app/components/icons";
import { BrowserMockup, PhoneMockup } from "@/app/components/mockups/Mockups";
import { Reveal } from "@/app/components/Reveal";
import { getCaseStudyBody, getProject, getProjects } from "@/lib/content";
import type { Project } from "@/lib/projects";

import styles from "./CaseStudy.module.scss";
import { Story } from "./Story";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProjects()).filter((p) => p.caseStudy).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project?.caseStudy) notFound();
  return {
    title: `${project.title} — Case study`,
    description: `${project.title}: ${project.meta}, ${project.year}.`,
    alternates: { canonical: `/work/${project.slug}` },
  };
}

/** The next project in the list that has a case study; otherwise the next project at all. */
function nextProject(current: Project, projects: Project[]) {
  const start = projects.indexOf(current);
  const after = [...projects.slice(start + 1), ...projects.slice(0, start)];
  return after.find((p) => p.caseStudy) ?? after.find((p) => !p.soon) ?? null;
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const [projects, body] = await Promise.all([getProjects(), getCaseStudyBody(slug)]);
  const project = projects.find((p) => p.slug === slug);
  if (!project?.caseStudy || !body) notFound();
  const study = project.caseStudy;
  const next = nextProject(project, projects);
  const slides = project.slides ?? [{}, { hero: 120 }, { hero: 64 }];
  const stageStyle = { "--bg": project.palette.bg } as CSSProperties;

  return (
    <Reveal>
      <article className={styles.page}>
        <Link href="/#work" className={styles.back}>
          <ArrowLeft size={14} />
          All work
        </Link>

        <header className={styles.intro}>
          <p className={styles.overline}>
            CASE STUDY · {project.meta.split(" · ")[0].toUpperCase()} · {project.year}
          </p>
          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.summary}>{study.summary}</p>
        </header>

        <div className={styles.facts} data-reveal="">
          <div className={styles.factsMain}>
            <dl className={styles.dl}>
              <div>
                <dt>ROLE</dt>
                <dd>{study.role}</dd>
              </div>
              <div>
                <dt>SHIPPED</dt>
                <dd>{project.shipped}</dd>
              </div>
              <div>
                <dt>PLATFORMS</dt>
                <dd>{study.platforms}</dd>
              </div>
            </dl>
            <div className={styles.stack}>
              <span className={styles.overline}>STACK</span>
              <ul>
                {study.stack.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.stores}>
            {study.links.map((link) => (
              <a key={link.href} className={styles.store} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
                <ArrowUpRight size={15} />
              </a>
            ))}
          </div>
        </div>

        <div className={styles.showcase}>
          <div className={styles.stage} style={stageStyle}>
            {project.device === "phone" ? (
              <>
                <PhoneMockup project={project} slides={[slides[1] ?? {}]} className={styles.phoneSide} />
                <PhoneMockup project={project} slides={[slides[0]]} className={styles.phoneMain} />
                <PhoneMockup project={project} slides={[slides[2] ?? {}]} className={styles.phoneSide} />
              </>
            ) : (
              <BrowserMockup project={project} className={styles.browser} />
            )}
          </div>
        </div>

        <Story body={body} />

        <div className={styles.figures}>
          {study.figures.map((caption, i) => (
            <figure key={caption} className={styles.figure} data-reveal="">
              <div className={styles.figureStage} style={stageStyle}>
                <PhoneMockup project={project} slides={[slides[(i + 1) % slides.length]]} className={styles.figurePhone} />
              </div>
              <figcaption>{caption}</figcaption>
            </figure>
          ))}
        </div>

        {next && (
          <Link href={next.caseStudy ? `/work/${next.slug}` : "/#work"} className={styles.next} data-reveal="">
            <span className={styles.nextText}>
              <span className={styles.overline}>{next.caseStudy ? "NEXT PROJECT" : "MORE WORK"}</span>
              <span className={styles.nextTitle}>
                {next.title}
                <ArrowRight size={28} strokeWidth={1.8} className={styles.nextArrow} />
              </span>
              <span className={styles.overline} style={{ letterSpacing: 0 }}>
                {next.meta} · {next.year}
              </span>
            </span>
            <span className={styles.nextPeek} style={{ "--bg": next.palette.bg } as CSSProperties}>
              {next.device === "phone" ? (
                <PhoneMockup project={next} slides={next.slides?.slice(0, 1)} className={styles.peekPhone} />
              ) : (
                <BrowserMockup project={next} className={styles.peekBrowser} />
              )}
            </span>
          </Link>
        )}
      </article>
    </Reveal>
  );
}
