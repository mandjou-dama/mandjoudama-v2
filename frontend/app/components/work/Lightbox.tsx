"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { createPortal } from "react-dom";

import { CtaLink } from "@/app/components/CtaLink";
import { ArrowUpRight, ChevronLeft, ChevronRight, Close } from "@/app/components/icons";
import { BrowserMockup, DatedPhoneMockup, PhoneMockup } from "@/app/components/mockups/Mockups";
import { ease, gsap, useGSAP } from "@/lib/gsap";
import { pictureColor, type Project } from "@/lib/projects";

import styles from "./Lightbox.module.scss";

type Props = {
  projects: Project[];
  index: number;
  onIndexChange: (index: number) => void;
  /** The card's picture (palette box and device) for a project: the lightbox opens from and closes into it. */
  getOrigin: (slug: string) => HTMLElement | null;
  onClose: () => void;
};

type FlipVars = { x: number; y: number; scale: number; transformOrigin: string };

/** The real picture a thumbnail shows: the project's image or its video's poster. Mockups get a drawn outline. */
const thumbPicture = (project: Project) => (project.media?.type === "image" ? project.media.src : project.media?.poster);

const visibleAnchor = (show: HTMLElement) =>
  [...show.querySelectorAll<HTMLElement>("[data-anchor]")].find((el) => el.offsetWidth > 0);

/** Transform that puts the lightbox's visible device exactly over the device in the card's picture. */
function flipVars(show: HTMLElement, media: HTMLElement | null): FlipVars | null {
  if (!media) return null;
  const anchor = visibleAnchor(show);
  const o = (media.querySelector<HTMLElement>("[data-anchor]") ?? media).getBoundingClientRect();
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

/** The morph layer's box: over the card's picture, or over the whole screen. */
function boxOf(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: getComputedStyle(el).borderRadius };
}

/** Phones next to the anchor (other screens, the "before" phone): they only fade, they have no place in the card. */
function extrasOf(show: HTMLElement) {
  const anchor = visibleAnchor(show);
  return anchor?.parentElement && anchor.parentElement !== show
    ? [...anchor.parentElement.children].filter((el) => el !== anchor)
    : [];
}

/**
 * Dresses the morph layer as the card's picture: its background image (the card's already-loaded file)
 * over the palette colour. Returns the picture's current hover zoom, for the morph to start from.
 */
function dressMorph(image: HTMLImageElement, media: HTMLElement) {
  const background = media.querySelector<HTMLImageElement>("img[data-background]")?.currentSrc;
  image.hidden = !background;
  if (background) image.src = background;
  const picture = media.querySelector<HTMLElement>("[data-picture]");
  return (picture && parseFloat(getComputedStyle(picture).scale)) || 1;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Lightbox({ projects, index, onIndexChange, getOrigin, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const showRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const morphRef = useRef<HTMLDivElement>(null);
  const morphImageRef = useRef<HTMLImageElement>(null);
  const topRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const thumbsShown = useRef(false);
  const hidden = useRef<HTMLElement | null>(null);
  const closing = useRef(false);
  const swipe = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const direction = useRef(0);
  const opened = useRef(false);

  const project = projects[index];
  // The top bar lags behind `index` while its text rolls out, then rolls the new project in.
  const [headIndex, setHeadIndex] = useState(index);
  const rolledIn = useRef(index);
  const head = projects[headIndex];
  // The visible screen on phones; resets when the project changes.
  const [screenOf, setScreenOf] = useState({ slug: project.slug, screen: 0 });
  const screen = screenOf.slug === project.slug ? screenOf.screen : 0;
  const slides = project.slides ?? [{}];
  const isCompare = project.preview === "compare" && !!project.before;
  const screens = isCompare ? 2 : slides.length;

  // The card stays empty while its picture is "in" the lightbox, so there is only ever one of it.
  function hideOrigin(media: HTMLElement | null) {
    if (hidden.current) hidden.current.style.visibility = "";
    hidden.current = media;
    if (media) media.style.visibility = "hidden";
  }

  // Open (shared element): the card's picture box grows over the screen and dissolves into the backdrop,
  // while the device flies from the card into place.
  useGSAP(
    () => {
      const show = showRef.current!;
      const morph = morphRef.current!;
      const reduce = reducedMotion();
      gsap.from("[data-lb-fade]", { opacity: 0, duration: 0.3, ease: "power2.out" });
      gsap.from("[data-lb-chrome]", { opacity: 0, y: reduce ? 0 : 10, duration: 0.4, delay: 0.12, ease: ease.out });
      const media = reduce ? null : getOrigin(project.slug);
      const flip = flipVars(show, media);
      if (flip && media) {
        gsap.set(show, { transformOrigin: flip.transformOrigin });
        gsap.from(show, { x: flip.x, y: flip.y, scale: flip.scale, duration: 0.75, ease: ease.expo, clearProps: "transform" });
        const extras = extrasOf(show);
        if (extras.length) gsap.from(extras, { opacity: 0, duration: 0.4, delay: 0.1, ease: "power2.out" });
        const zoom = dressMorph(morphImageRef.current!, media);
        gsap.set(morph, { ...boxOf(media), opacity: 1 });
        gsap.to(morph, { ...boxOf(rootRef.current!), duration: 0.75, ease: ease.expo });
        gsap.fromTo(morphImageRef.current, { scale: zoom }, { scale: 1, duration: 0.75, ease: ease.expo });
        gsap.to(morph, { opacity: 0, duration: 0.45, delay: 0.15, ease: "power1.inOut" });
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
      hideOrigin(reduce ? null : getOrigin(project.slug));
      if (opened.current && direction.current !== 0) {
        gsap.from(showRef.current, { opacity: 0, x: reduce ? 0 : direction.current * 32, duration: 0.4, ease: ease.out });
      }
      if (project.preview === "video" && pageRef.current && !reduce) {
        gsap.to(pageRef.current, { yPercent: -42, duration: 6, ease: "sine.inOut", repeat: -1, yoyo: true, repeatDelay: 0.6, delay: 0.6 });
      }
    },
    { scope: rootRef, dependencies: [project.slug], revertOnUpdate: true },
  );

  // Changing project, top bar: the shown text rolls out the way the arrow points, then the current
  // project's rolls in from the other side. Keyed on both indexes, so it always ends on the current one.
  useGSAP(
    () => {
      const items = topRef.current!.querySelectorAll("[data-lb-roll]");
      const dir = direction.current || 1;
      if (headIndex !== index) {
        if (reducedMotion()) setHeadIndex(index);
        else {
          gsap.to(items, {
            opacity: 0,
            y: -10 * dir,
            duration: 0.16,
            ease: "power2.in",
            stagger: 0.025,
            overwrite: true,
            onComplete: () => setHeadIndex(index),
          });
        }
      } else if (rolledIn.current !== headIndex) {
        rolledIn.current = headIndex;
        gsap.fromTo(
          items,
          { opacity: 0, y: 10 * dir },
          { opacity: 1, y: 0, duration: 0.45, ease: ease.out, stagger: 0.04, overwrite: true },
        );
      } else {
        // Back on the project still shown (arrow pressed twice quickly): undo the roll-out.
        gsap.to(items, { opacity: 1, y: 0, duration: 0.3, ease: ease.out, overwrite: true });
      }
    },
    { scope: rootRef, dependencies: [index, headIndex] },
  );

  // When the strip overflows (phones), it scrolls to keep the active thumbnail centred under its sliding ring.
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.querySelectorAll("button")[index];
    if (!strip || !thumb) return;
    const s = strip.getBoundingClientRect();
    const t = thumb.getBoundingClientRect();
    const left = strip.scrollLeft + t.left - s.left - (s.width - t.width) / 2;
    strip.scrollTo({ left, behavior: thumbsShown.current && !reducedMotion() ? "smooth" : "instant" });
    thumbsShown.current = true;
  }, [index]);

  // Close: the device flies back into its card while the picture box shrinks back around it,
  // landing exactly on the card's picture, which then takes over (or everything fades).
  function close() {
    const root = rootRef.current;
    const show = showRef.current;
    const morph = morphRef.current;
    if (closing.current || !root || !show || !morph) return;
    closing.current = true;
    const media = reducedMotion() ? null : getOrigin(project.slug);
    const flip = flipVars(show, media);
    const tl = gsap.timeline({
      onComplete: () => {
        hideOrigin(null);
        onClose();
      },
    });
    tl.to(root.querySelectorAll("[data-lb-chrome]"), { opacity: 0, duration: 0.18 }, 0);
    if (flip && media) {
      gsap.set(show, { transformOrigin: flip.transformOrigin });
      tl.to(show, { x: flip.x, y: flip.y, scale: flip.scale, duration: 0.45, ease: ease.inOut }, 0);
      const extras = extrasOf(show);
      if (extras.length) tl.to(extras, { opacity: 0, duration: 0.2 }, 0);
      dressMorph(morphImageRef.current!, media);
      tl.fromTo(morph, boxOf(root), { ...boxOf(media), duration: 0.45, ease: ease.inOut }, 0);
      tl.fromTo(morph, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" }, 0);
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
      hideOrigin(null);
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

  const kindLabel = head.kind === "mobile" ? "Mobile app" : "Website";
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
      <div ref={morphRef} className={styles.morph} style={{ background: pictureColor(project) }} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- the card's already-loaded image, set on open and close */}
        <img ref={morphImageRef} className={styles.morphImage} alt="" hidden />
      </div>
      <div className={styles.panel}>
        <header ref={topRef} className={styles.top} data-lb-chrome="">
          <div className={styles.heading}>
            <div className={styles.tags} data-lb-roll="">
              <span className={styles.tag}>{kindLabel}</span>
              <span className={styles.counter}>
                {headIndex + 1} / {projects.length}
              </span>
            </div>
            <h2 id="lightbox-title" className={styles.title} data-lb-roll="">
              {head.title}
            </h2>
            <p className={styles.meta} data-lb-roll="">
              {head.meta} · {head.year}
            </p>
          </div>
          <div className={styles.actions}>
            <CtaLink href={head.cta.href} className={[styles.cta, styles.ctaTop].join(" ")} data-lb-roll="">
              {head.cta.label}
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
          <div ref={thumbsRef} className={styles.thumbs}>
            <div className={styles.track} style={{ "--active": index } as CSSProperties}>
              {projects.map((p, i) => {
                const picture = thumbPicture(p);
                return (
                  <button
                    key={p.slug}
                    type="button"
                    className={styles.thumb}
                    style={{ "--bg": pictureColor(p), "--screen": p.palette.screen } as CSSProperties}
                    aria-label={`Show ${p.title}`}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => pick(i)}
                  >
                    {picture ? (
                      <span className={styles.thumbPicture}>
                        <Image src={picture} alt="" fill sizes="72px" />
                      </span>
                    ) : (
                      <span className={p.device === "phone" ? styles.thumbPhone : styles.thumbBrowser} />
                    )}
                  </button>
                );
              })}
              <span className={styles.thumbRing} aria-hidden="true" />
            </div>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
