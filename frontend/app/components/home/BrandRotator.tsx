"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import { heroBrands } from "@/lib/profile";

import styles from "./Hero.module.scss";

/** Seconds each name stays on screen. */
const HOLD = 2.2;

/**
 * Cycles through the brands Mandjou shipped for: the letters of the current name roll out
 * upwards one by one while the next name's roll in from below, the logo swaps, and the
 * window eases to the new name's width (only this line of the sentence re-centres).
 */
export function BrandRotator() {
  const rootRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      // Rebuilt at the 640px breakpoint, where the font size (so every width) changes.
      const build = contextSafe!(() => {
        mm.add(
          {
            phone: "(max-width: 640px) and (prefers-reduced-motion: no-preference)",
            wide: "(min-width: 641px) and (prefers-reduced-motion: no-preference)",
          },
          () => {
            const brands = [...root.querySelectorAll<HTMLElement>("[data-brand]")];
            const widths = brands.map((el) => el.offsetWidth);
            const chars = brands.map((el) => el.querySelectorAll("[data-char]"));
            const logos = brands.map((el) => el.querySelector("[data-logo]"));

            gsap.set(root, { width: widths[0] });
            gsap.set(brands.slice(1), { visibility: "visible" });
            gsap.set(chars.slice(1).flatMap((list) => [...list]), { yPercent: 110, opacity: 0 });
            gsap.set(logos.slice(1), { scale: 0.4, opacity: 0 });

            const tl = gsap.timeline({ repeat: -1, delay: 1.8 });
            brands.forEach((_, i) => {
              const next = (i + 1) % brands.length;
              const at = i * (HOLD + 0.8);
              tl.to(chars[i], { yPercent: -110, opacity: 0, duration: 0.42, ease: "power2.in", stagger: 0.022 }, at)
                .to(logos[i], { scale: 0.4, opacity: 0, duration: 0.32, ease: "power2.in" }, at)
                .to(root, { width: widths[next], duration: 0.7, ease: "power3.inOut" }, at + 0.05)
                .fromTo(
                  logos[next],
                  { scale: 0.4, opacity: 0 },
                  { scale: 1, opacity: 1, duration: 0.5, ease: "expo.out", immediateRender: false },
                  at + 0.2,
                )
                .fromTo(
                  chars[next],
                  { yPercent: 110, opacity: 0 },
                  { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.022, immediateRender: false },
                  at + 0.24,
                );
            });
            tl.to({}, { duration: HOLD });
          },
        );
      });

      // Widths are measured in the real font.
      void document.fonts.ready.then(build);
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const names = heroBrands.map((b) => b.name);

  return (
    <span ref={rootRef} className={styles.rotator}>
      <span className="sr-only">{`${names.slice(0, -1).join(", ")} and ${names.at(-1)}`}</span>
      {heroBrands.map((brand) => (
        <span key={brand.name} className={styles.brand} data-brand="" aria-hidden="true">
          <span className={styles.logo} data-logo="" style={{ background: brand.color, color: brand.ink ?? "#fff" }}>
            {brand.initial}
          </span>
          <span>
            {[...brand.name].map((char, i) => (
              <span key={i} className={styles.char} data-char="">
                {char === " " ? " " : char}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
