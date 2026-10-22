"use client";

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { createPortal } from "react-dom";

import { CtaLink } from "@/app/components/CtaLink";
import { ArrowUpRight, ChevronLeft, ChevronRight, Close } from "@/app/components/icons";
import { BrowserMockup, DatedPhoneMockup, PhoneMockup } from "@/app/components/mockups/Mockups";
import { ease, gsap, useGSAP } from "@/lib/gsap";
import type { Project } from "@/lib/projects";

import styles from "./Lightbox.module.scss";

type Props = {
  projects: Project[];
  index: number;
  onIndexChange: (index: number) => void;
  /** The card's device element for a project, if it is on screen: the lightbox opens from and closes to it. */
  getOrigin: (slug: string) => HTMLElement | null;
  onClose: () => void;
};

type FlipVars = { x: number; y: number; scale: number; transformOrigin: string };

/** Transform that puts the lightbox's visible device exactly over the card's device. */
function flipVars(show: HTMLElement, origin: HTMLElement | null): FlipVars | null {
  if (!origin) return null;
  const anchor = [...show.querySelectorAll<HTMLElement>("[data-anchor]")].find((el) => el.offsetWidth > 0);
  const o = origin.getBoundingClientRect();
  if (!anchor || o.width === 0 || o.bottom < 0 || o.top > window.innerHeight) return null;
  const a = anchor.getBoundingClientRect();
  const s = show.getBoundingClientRect();
  return {
    x: o.left + o.width / 2 - (a.left + a.width / 2),
    y: o.top + o.height / 2 - (a.top + a.height / 2),
    scale: o.width / a.width,
    transformOrigin: `${a.left + a.width / 2 - s.left}px ${a.top + a.height / 2 - s.top}px`,
  };
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Lightbox({ projects, index, onIndexChange, getOrigin, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const showRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const swipe = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const direction = useRef(0);
  const opened = useRef(false);

  const project = projects[index];
  // The visible screen on phones; resets when the project changes.
  const [screenOf, setScreenOf] = useState({ slug: project.slug, screen: 0 });
  const screen = screenOf.slug === project.slug ? screenOf.screen : 0;
  const slides = project.slides ?? [{}];
  const isCompare = project.preview === "compare" && !!project.before;
  const screens = isCompare ? 2 : slides.length;

  // Open: the backdrop fades in and the device flies from the card into place.
  useGSAP(
    () => {
      const show = showRef.current!;
      const reduce = reducedMotion();
      gsap.from("[data-lb-fade]", { opacity: 0, duration: 0.3, ease: "power2.out" });
      gsap.from("[data-lb-chrome]", { opacity: 0, y: reduce ? 0 : 10, duration: 0.4, delay: 0.12, ease: ease.out });
      const flip = reduce ? null : flipVars(show, getOrigin(project.slug));
      if (flip) {
        gsap.set(show, { transformOrigin: flip.transformOrigin });
        gsap.from(show, { x: flip.x, y: flip.y, scale: flip.scale, duration: 0.75, ease: ease.expo, clearProps: "transform" });
      } else {
        gsap.from(show, { opacity: 0, scale: reduce ? 1 : 0.97, duration: 0.3, ease: ease.out });
      }
      opened.current = true;
    },
    { scope: rootRef },
  );

  // Changing project: the new device slides in from the side it came from; web previews scroll.
  useGSAP(
    () => {
      const reduce = reducedMotion();
      if (opened.current && direction.current !== 0) {
        gsap.from(showRef.current, { opacity: 0, x: reduce ? 0 : direction.current * 32, duration: 0.4, ease: ease.out });
      }
      if (project.preview === "video" && pageRef.current && !reduce) {
        gsap.to(pageRef.current, { yPercent: -42, duration: 6, ease: "sine.inOut", repeat: -1, yoyo: true, repeatDelay: 0.6, delay: 0.6 });
      }
    },
    { scope: rootRef, dependencies: [project.slug], revertOnUpdate: true },
  );

  // Close: the device flies back into its card (or fades), then the lightbox unmounts.
  function close() {
    const root = rootRef.current;
    const show = showRef.current;
    if (closing.current || !root || !show) return;
    closing.current = true;
    const flip = reducedMotion() ? null : flipVars(show, getOrigin(project.slug));
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(root.querySelectorAll("[data-lb-chrome]"), { opacity: 0, duration: 0.18 }, 0);
    if (flip) {
      gsap.set(show, { transformOrigin: flip.transformOrigin });
      tl.to(show, { x: flip.x, y: flip.y, scale: flip.scale, duration: 0.45, ease: ease.inOut }, 0);
      tl.to(show, { opacity: 0, duration: 0.12 }, 0.36);
    } else {
      tl.to(show, { opacity: 0, scale: 0.97, duration: 0.22, ease: "power2.in" }, 0);
    }
    tl.to(root.querySelectorAll("[data-lb-fade]"), { opacity: 0, duration: 0.3 }, 0.12);
  }

  const go = (step: number) => {
    direction.current = step;
    onIndexChange((index + step + projects.length) % projects.length);
  };

  const pick = (i: number) => {
    if (i === index) return;
    direction.current = i > index ? 1 : -1;
    onIndexChange(i);
  };

  // Keyboard: Escape closes, arrows change project, Tab stays inside the dialog.
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "Tab" && rootRef.current) {
      const focusable = [...rootRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter(
        (el) => el.offsetWidth > 0,
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  useEffect(() => {
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    const listener = (e: KeyboardEvent) => onKey(e);
    document.addEventListener("keydown", listener);
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", listener);
      html.style.overflow = overflow;
    };
  }, []);

  function onPointerDown(e: PointerEvent) {
    swipe.current = { x: e.clientX, y: e.clientY, moved: false };
  }

  function onPointerUp(e: PointerEvent) {
    const start = swipe.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      start.moved = true;
      go(dx < 0 ? 1 : -1);
    }
  }

  function nextScreen() {
    if (swipe.current?.moved) return;
    if (screens > 1) setScreenOf({ slug: project.slug, screen: (screen + 1) % screens });
  }

  const kindLabel = project.kind === "mobile" ? "Mobile app" : "Website";
  const hint = screens > 1 ? "Tap the screen · swipe for next project" : "Swipe for next project";

  let content;
  if (project.media?.type === "image") {
    content = (
      <div className={styles.mediaBox} data-anchor="" style={{ aspectRatio: `${project.media.width} / ${project.media.height}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- already optimised by the card's next/image */}
        <img src={project.media.src} alt={project.media.alt} />
      </div>
    );
  } else if (project.media?.type === "video") {
    content = (
      <div className={styles.mediaBox} data-anchor="">
        <video src={project.media.src} poster={project.media.poster} muted loop playsInline autoPlay controls />
      </div>
    );
  } else if (project.device === "browser") {
    content = <BrowserMockup project={project} pageRef={pageRef} className={styles.browser} anchor />;
  } else {
    content = (
      <>
        <div className={styles.phoneRow} style={{ "--n": isCompare ? 2 : slides.length } as CSSProperties}>
          {isCompare ? (
            <>
              <figure className={styles.figure}>
                <DatedPhoneMockup project={project} className={styles.phone} />
                <figcaption className={styles.caption}>Before</figcaption>
              </figure>
              <figure className={styles.figure} data-anchor="">
                <PhoneMockup project={project} className={styles.phone} />
                <figcaption className={styles.caption}>After</figcaption>
              </figure>
            </>
          ) : (
            slides.map((slide, i) => (
              <PhoneMockup key={i} project={project} slides={[slide]} className={styles.phone} anchor={i === 0} />
            ))
          )}
        </div>
        <div className={styles.phoneSingle}>
          <button
            type="button"
            className={styles.phoneButton}
            onClick={nextScreen}
            aria-label={screens > 1 ? `Show next screen (${screen + 1} of ${screens})` : `${project.title} screen`}
          >
            {isCompare && screen === 1 ? (
              <DatedPhoneMockup project={project} className={styles.phone} />
            ) : (
              <PhoneMockup project={project} slides={isCompare ? [{}] : slides} index={isCompare ? 0 : screen} className={styles.phone} anchor />
            )}
          </button>
          {screens > 1 && (
            <div className={styles.dots} aria-hidden="true">
              {Array.from({ length: screens }, (_, i) => (
                <span key={i} className={i === screen ? styles.dotOn : undefined} />
              ))}
            </div>
          )}
          {isCompare && <span className={styles.caption}>{screen === 1 ? "Before" : "After"}</span>}
        </div>
      </>
    );
  }

  return createPortal(
    <div ref={rootRef} className={styles.root} role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
      <div className={styles.backdrop} data-lb-fade="" onClick={close} />
      <div className={styles.panel}>
        <header className={styles.top} data-lb-chrome="">
          <div className={styles.heading}>
            <div className={styles.tags}>
              <span className={styles.tag}>{kindLabel}</span>
              <span className={styles.counter}>
                {index + 1} / {projects.length}
              </span>
            </div>
            <h2 id="lightbox-title" className={styles.title}>
              {project.title}
            </h2>
            <p className={styles.meta}>
              {project.meta} · {project.year}
            </p>
          </div>
          <div className={styles.actions}>
            <CtaLink href={project.cta.href} className={[styles.cta, styles.ctaTop].join(" ")}>
              {project.cta.label}
              <ArrowUpRight size={14} />
            </CtaLink>
            <button ref={closeRef} type="button" className={styles.round} onClick={close} aria-label="Close preview">
              <Close size={16} />
            </button>
          </div>
        </header>

        <div className={styles.stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <button type="button" className={[styles.round, styles.nav, styles.prev].join(" ")} onClick={() => go(-1)} aria-label="Previous project">
            <ChevronLeft size={18} />
          </button>
          <div key={project.slug} ref={showRef} className={styles.show}>
            {content}
          </div>
          <button type="button" className={[styles.round, styles.nav, styles.next].join(" ")} onClick={() => go(1)} aria-label="Next project">
            <ChevronRight size={18} />
          </button>
        </div>

        <p className={styles.hint} data-lb-chrome="">
          {hint}
        </p>

        <footer className={styles.bottom} data-lb-chrome="">
          <CtaLink href={project.cta.href} className={[styles.cta, styles.ctaBottom].join(" ")}>
            {project.cta.label}
            <ArrowUpRight size={15} />
          </CtaLink>
          <div className={styles.thumbs}>
            {projects.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                className={styles.thumb}
                style={{ "--bg": p.palette.bg, "--screen": p.palette.screen } as CSSProperties}
                aria-label={`Show ${p.title}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => pick(i)}
              >
                <span className={p.device === "phone" ? styles.thumbPhone : styles.thumbBrowser} />
              </button>
            ))}
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
