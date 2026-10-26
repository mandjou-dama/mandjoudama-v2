"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

import { CtaLink } from "@/app/components/CtaLink";
import { Expand, Pause, Play } from "@/app/components/icons";
import { BrowserMockup, PhoneMockup } from "@/app/components/mockups/Mockups";
import { gsap, useGSAP } from "@/lib/gsap";
import { mediaRatio, pictureColor, type Project } from "@/lib/projects";

import styles from "./Card.module.scss";
import { Compare } from "./Compare";

export type OpenRequest = { origin: HTMLElement; trigger: HTMLElement };

type Props = {
  project: Project;
  onOpen?: (request: OpenRequest) => void;
};

const STEP_SECONDS = 3.2;
const SIZES = "(min-width: 1200px) 25vw, (min-width: 880px) 33vw, (min-width: 560px) 50vw, 100vw";

export function ProjectCard({ project, onOpen }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const magnetRef = useRef<HTMLSpanElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const follow = useRef<{ mx?: gsap.QuickToFunc; my?: gsap.QuickToFunc }>({});
  const pageTween = useRef<gsap.core.Tween | null>(null);
  const stepTween = useRef<gsap.core.Tween | null>(null);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const slides = project.slides ?? [{}];
  const isCarousel = project.preview === "carousel" && slides.length > 1;
  const isVideo = project.preview === "video";
  const isCompare = project.preview === "compare" && !!project.before;
  const openable = !project.soon && !isCompare;
  // Like the reference, only static cards zoom their picture on hover; interactive ones keep still.
  const zooms = project.preview === "still" && project.media?.type !== "video";

  // Magnet (expand button or "Coming soon" pill) and the video preview loop.
  useGSAP(
    () => {
      if (magnetRef.current) {
        // The pill has no fixed size, so it is centred here rather than with CSS margins.
        if (project.soon && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          gsap.set(magnetRef.current, { xPercent: -50, yPercent: -50 });
        }
        follow.current.mx = gsap.quickTo(magnetRef.current, "x", { duration: 0.45, ease: "power3.out" });
        follow.current.my = gsap.quickTo(magnetRef.current, "y", { duration: 0.45, ease: "power3.out" });
      }
      if (isVideo && pageRef.current) {
        pageTween.current = gsap.to(pageRef.current, {
          yPercent: -42,
          duration: 6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          repeatDelay: 0.6,
          paused: true,
        });
      }
    },
    { scope: rootRef },
  );

  // Carousel: the active step fills over STEP_SECONDS, then moves on.
  useGSAP(
    () => {
      if (!isCarousel || !fillRef.current) return;
      stepTween.current = gsap.fromTo(
        fillRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: STEP_SECONDS,
          ease: "none",
          paused: !playing,
          onComplete: () => setIndex((i) => (i + 1) % slides.length),
        },
      );
    },
    { scope: rootRef, dependencies: [index], revertOnUpdate: true },
  );

  useEffect(() => {
    stepTween.current?.paused(!playing);
    if (pageTween.current) pageTween.current.paused(!playing);
    const video = videoRef.current;
    if (video && isVideo) {
      if (playing) void video.play();
      else video.pause();
    }
  }, [playing, isVideo]);

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    follow.current.mx?.((e.clientX - r.left - r.width / 2) * 0.3);
    follow.current.my?.((e.clientY - r.top - r.height / 2) * 0.3);
  }

  function onPointerLeave() {
    follow.current.mx?.(0);
    follow.current.my?.(0);
  }

  const mediaStyle = {
    "--bg": pictureColor(project),
    "--ratio": mediaRatio(project),
    maxHeight: project.maxHeight,
  } as CSSProperties;

  return (
    <article ref={rootRef} className={styles.card} data-reveal="">
      <div
        ref={mediaRef}
        className={styles.media}
        style={mediaStyle}
        data-device={project.device}
        data-media=""
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <div className={[styles.picture, zooms && styles.zoom].filter(Boolean).join(" ")} data-picture="">
          {project.background && (
            <Image src={project.background} alt="" fill sizes={SIZES} className={styles.mediaFill} data-background="" />
          )}
          {project.media?.type === "image" ? (
            <Image src={project.media.src} alt={project.media.alt} fill sizes={SIZES} className={styles.mediaFill} />
          ) : project.media?.type === "video" ? (
            <video
              ref={videoRef}
              className={styles.mediaFill}
              src={project.media.src}
              poster={project.media.poster}
              muted
              loop
              playsInline
              preload="metadata"
              autoPlay={!isVideo}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            />
          ) : project.device === "browser" ? (
            <BrowserMockup ref={deviceRef} pageRef={pageRef} project={project} className={styles.deviceBrowser} anchor />
          ) : (
            <PhoneMockup ref={deviceRef} project={project} slides={slides} index={index} className={styles.devicePhone} anchor />
          )}
        </div>

        {isCompare && !project.media && <Compare project={project} />}

        {openable && (
          <>
            <button
              type="button"
              className={styles.open}
              aria-label={`Preview ${project.title}`}
              onClick={(e) => onOpen?.({ origin: deviceRef.current ?? mediaRef.current!, trigger: e.currentTarget })}
            />
            <span ref={magnetRef} className={styles.magnet} aria-hidden="true">
              <span className={styles.magnetDot}>
                <Expand size={20} />
              </span>
            </span>
            <span className={styles.hint} aria-hidden="true">
              <Expand size={14} />
            </span>
          </>
        )}

        {project.soon && (
          <span ref={magnetRef} className={styles.soon} aria-hidden="true">
            <span className={styles.soonPill}>Coming soon</span>
          </span>
        )}
      </div>

      <div className={styles.label}>
        <div className={styles.labelInner}>
          <div className={styles.labelRow}>
            <h3 className={styles.title}>
              {project.title}
              {project.soon && <span className="sr-only"> — coming soon</span>}
            </h3>

            {isCarousel && (
              <div className={styles.stepper} role="group" aria-label={`Screen ${index + 1} of ${slides.length}`}>
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={styles.step}
                    aria-label={`Show screen ${i + 1}`}
                    aria-current={i === index ? "step" : undefined}
                    onClick={() => setIndex(i)}
                  >
                    <span className={styles.stepTrack}>
                      {i === index && <span ref={fillRef} className={styles.stepFill} />}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {(isCarousel || isVideo) && (
              <button
                type="button"
                className={styles.round}
                aria-label={`${playing ? "Pause" : "Play"} ${isCarousel ? "carousel" : "preview"}`}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Pause /> : <Play />}
              </button>
            )}

            {!project.soon && !isCarousel && !isVideo && (
              <CtaLink href={project.cta.href} className={styles.pill}>
                {project.cta.label}
              </CtaLink>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
