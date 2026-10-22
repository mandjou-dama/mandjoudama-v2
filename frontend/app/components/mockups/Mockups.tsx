import type { CSSProperties, Ref } from "react";

import type { Palette, Project, Slide } from "@/lib/projects";

import styles from "./Mockups.module.scss";

const PHONE_BASE = 185;

function paletteVars(palette: Partial<Palette>): CSSProperties {
  return {
    "--screen": palette.screen,
    "--ink": palette.ink,
    "--line": palette.line,
    "--text": palette.text,
    "--chrome": palette.chrome,
    "--muted": palette.muted,
  } as CSSProperties;
}

function cx(...names: (string | false | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

function PhoneSlide({ title, ink, hero = 96 }: { title: string; ink?: string; hero?: number }) {
  const vars = { "--hero": `${(hero / PHONE_BASE) * 100}cqw`, ...(ink ? { "--ink": ink } : {}) } as CSSProperties;
  return (
    <div className={styles.slide} style={vars}>
      <div className={styles.top}>
        <span />
        <span />
      </div>
      <div className={styles.heading}>
        <span className={styles.bar} />
        <span className={styles.appTitle}>{title}</span>
      </div>
      <div className={styles.hero}>
        <span />
        <span />
      </div>
      <div className={styles.tiles}>
        <span />
        <span />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className={styles.listRow}>
          <span />
          <span>
            <span className={styles.bar} />
            <span className={styles.bar} />
          </span>
        </div>
      ))}
    </div>
  );
}

type PhoneProps = {
  project: Pick<Project, "title" | "palette">;
  /** Screens to show; defaults to one screen in the project's colours. */
  slides?: Slide[];
  /** Index of the visible screen when there are several. */
  index?: number;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
  /** Marks the element the lightbox animates from/to. */
  anchor?: boolean;
};

export function PhoneMockup({ project, slides = [{}], index = 0, className, style, ref, anchor }: PhoneProps) {
  return (
    <div
      ref={ref}
      className={cx(styles.phone, className)}
      style={{ ...paletteVars(project.palette), ...style }}
      data-anchor={anchor ? "" : undefined}
      aria-hidden="true"
    >
      <div className={styles.phoneFrame}>
        <div className={styles.phoneScreen}>
          <span className={styles.island} />
          <div className={styles.track} style={{ transform: `translateX(${-index * 100}%)` }}>
            {slides.map((slide, i) => (
              <PhoneSlide key={i} title={project.title} ink={slide.ink} hero={slide.hero} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The "before" phone of a compare card. */
export function DatedPhoneMockup({
  project,
  className,
  style,
}: {
  project: Pick<Project, "title" | "before">;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={cx(styles.phone, className)} style={{ ...paletteVars(project.before ?? {}), ...style }} aria-hidden="true">
      <div className={styles.phoneFrame}>
        <div className={styles.phoneScreen}>
          <span className={styles.island} />
          <div className={styles.dated}>
            <div className={styles.appBar} />
            <div className={styles.datedTitle}>{project.title}</div>
            <div className={styles.box}>
              <span />
              <span />
            </div>
            <div className={styles.button} />
            <div className={styles.rule} />
            <div className={styles.lines}>
              <span />
              <span />
            </div>
            <div className={styles.rule} />
            <div className={styles.lines}>
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type BrowserProps = {
  project: Pick<Project, "title" | "palette" | "url">;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
  anchor?: boolean;
  /** The scrolling page inside the window, for the video preview. */
  pageRef?: Ref<HTMLDivElement>;
};

export function BrowserMockup({ project, className, style, ref, pageRef, anchor }: BrowserProps) {
  return (
    <div
      ref={ref}
      className={cx(styles.browser, className)}
      style={{ ...paletteVars(project.palette), ...style }}
      data-anchor={anchor ? "" : undefined}
      aria-hidden="true"
    >
      <div className={styles.chrome}>
        <span />
        <span />
        <span />
        <span className={styles.url}>{project.url}</span>
      </div>
      <div ref={pageRef} className={styles.page}>
        <div className={styles.nav}>
          <span />
          <div>
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className={styles.siteTitle}>{project.title}</div>
        <div className={styles.subBar} />
        <div className={styles.gallery}>
          <span />
          <span />
          <span />
        </div>
        <div className={styles.sectionBar} />
        <div className={styles.subBar} />
        <div className={styles.pair}>
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
