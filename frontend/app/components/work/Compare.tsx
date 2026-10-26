"use client";

import { useEffect, useRef } from "react";

import { ChevronsLeftRight } from "@/app/components/icons";
import { DatedPhoneMockup } from "@/app/components/mockups/Mockups";
import { gsap } from "@/lib/gsap";
import type { Project } from "@/lib/projects";

import styles from "./Card.module.scss";

// The divider is a spring. Its middle stays under the handle while its ends trail behind, so a quick drag
// bows the line and it wobbles straight once the drag stops. Positions are % of the card's width.
const STIFFNESS = 700;
const DAMPING = 24;
const MAX_BEND = 10;
const SAMPLES = 16;

/** The before/after slider of a compare card: the dated phone, clipped along the divider, over the new one. */
export function Compare({ project }: { project: Project }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);
  const moveTo = useRef<(value: number) => void>(undefined);

  useEffect(() => {
    let target = 50;
    let end = 50;
    let velocity = 0;
    let running = false;

    // A quadratic curve from (end, 0) to (end, 100) through (target, 50). The before layer is clipped along
    // the same curve, sampled, so its edge stays under the line.
    function draw() {
      const bend = target - end;
      lineRef.current?.setAttribute("d", `M${end} 0 Q${target + bend} 50 ${end} 100`);
      const points = ["0% 0%"];
      for (let i = 0; i <= SAMPLES; i++) {
        const t = i / SAMPLES;
        points.push(`${end + 4 * t * (1 - t) * bend}% ${t * 100}%`);
      }
      points.push("0% 100%");
      layerRef.current?.style.setProperty("clip-path", `polygon(${points.join(", ")})`);
      handleRef.current?.style.setProperty("left", `${target}%`);
    }

    function step(_time: number, deltaTime: number) {
      const dt = deltaTime / 1000;
      velocity += (STIFFNESS * (target - end) - DAMPING * velocity) * dt;
      end += velocity * dt;
      // At the bend limit the ends are dragged along, so they stop building speed of their own.
      if (Math.abs(target - end) > MAX_BEND) {
        end = target - Math.sign(target - end) * MAX_BEND;
        velocity = 0;
      }
      if (Math.abs(target - end) < 0.01 && Math.abs(velocity) < 0.1) {
        end = target;
        velocity = 0;
        running = false;
        gsap.ticker.remove(step);
      }
      draw();
    }

    moveTo.current = (value) => {
      target = value;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        end = value;
        velocity = 0;
      } else if (!running) {
        running = true;
        gsap.ticker.add(step);
      }
      draw();
    };

    return () => gsap.ticker.remove(step);
  }, []);

  return (
    <>
      <div ref={layerRef} className={styles.beforeLayer}>
        <DatedPhoneMockup project={project} className={styles.devicePhone} />
      </div>
      <svg className={styles.divider} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path ref={lineRef} d="M50 0 Q50 50 50 100" />
      </svg>
      <span className={[styles.tag, styles.tagBefore].join(" ")} aria-hidden="true">
        Before
      </span>
      <span className={[styles.tag, styles.tagAfter].join(" ")} aria-hidden="true">
        After
      </span>
      <input
        type="range"
        min={0}
        max={100}
        defaultValue={50}
        className={styles.range}
        aria-label={`Compare the old and new ${project.title} designs`}
        onChange={(e) => moveTo.current?.(e.currentTarget.valueAsNumber)}
      />
      <span ref={handleRef} className={styles.handle} aria-hidden="true">
        <ChevronsLeftRight size={16} />
      </span>
    </>
  );
}
