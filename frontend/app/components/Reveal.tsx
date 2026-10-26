"use client";

import { useRef, type ReactNode } from "react";

import { ease, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Children marked `data-reveal` rise in once, in staggered batches, as they enter the viewport.
 * Their hidden state lives in globals.css, behind `.js` and `prefers-reduced-motion: no-preference`.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: ease.expo, stagger: 0.08, overwrite: true }),
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
