"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";

import { ease, gsap, useGSAP } from "@/lib/gsap";

import styles from "./About.module.scss";

// `tilt` (deg) and `drop` (px) are the resting pose, set in CSS on the slot.
const photos = [
  { tilt: -3, src: "/images/about/portrait.jpg" },
  { tilt: 2, drop: 10, src: "/images/about/portrait-studio.jpg" },
  { tilt: -1.5, src: "/images/about/portrait-sky.jpg" },
  { tilt: 3, drop: 6 },
];

/**
 * Hovering a photo straightens, lifts and tilts it towards the pointer while the others fan out.
 * GSAP moves the inner card, so the slot keeps its CSS tilt and the two never fight over transform.
 */
export function PhotoRow() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const row = ref.current!;
        const slots = gsap.utils.toArray<HTMLElement>(`.${styles.slot}`, row);
        const cards = slots.map((slot) => slot.firstElementChild as HTMLElement);
        const images = cards.map((card) => card.querySelector("img"));

        gsap.set(cards, { transformPerspective: 800 });
        const tiltX = cards.map((card) => gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" }));
        const tiltY = cards.map((card) => gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" }));

        function pose(active: number | null) {
          cards.forEach((card, i) => {
            const offset = active === null ? 0 : i - active;
            const focused = active === i;
            gsap.set(slots[i], { zIndex: focused ? 1 : 0 });
            gsap.to(card, {
              x: Math.sign(offset) * 14,
              y: focused ? -12 : 0,
              rotation: focused ? -photos[i].tilt : Math.sign(offset) * 1.5,
              scale: focused ? 1.05 : 1,
              duration: 0.7,
              ease: ease.out,
              overwrite: "auto",
            });
            if (images[i]) {
              gsap.to(images[i], { scale: focused ? 1.08 : 1, duration: 0.9, ease: ease.out, overwrite: "auto" });
            }
          });
        }

        const listeners = slots.map((slot, i) => {
          const enter = (e: PointerEvent) => e.pointerType === "mouse" && pose(i);
          const move = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const r = slot.getBoundingClientRect();
            tiltY[i](((e.clientX - r.left) / r.width - 0.5) * 14);
            tiltX[i]((0.5 - (e.clientY - r.top) / r.height) * 14);
          };
          const leave = () => {
            tiltX[i](0);
            tiltY[i](0);
          };
          slot.addEventListener("pointerenter", enter);
          slot.addEventListener("pointermove", move);
          slot.addEventListener("pointerleave", leave);
          return () => {
            slot.removeEventListener("pointerenter", enter);
            slot.removeEventListener("pointermove", move);
            slot.removeEventListener("pointerleave", leave);
          };
        });
        const reset = () => pose(null);
        row.addEventListener("pointerleave", reset);

        // Hover tweens run outside this context, so they are cleared here when the query stops matching.
        return () => {
          listeners.forEach((remove) => remove());
          row.removeEventListener("pointerleave", reset);
          const targets = [...slots, ...cards, ...images.filter((img) => img !== null)];
          gsap.killTweensOf(targets);
          gsap.set(targets, { clearProps: "transform,zIndex" });
        };
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={styles.photos} aria-hidden="true" data-reveal="">
      {photos.map((photo, i) => (
        <span
          key={i}
          className={styles.slot}
          style={{ "--tilt": `${photo.tilt}deg`, "--drop": photo.drop ? `${photo.drop}px` : undefined } as CSSProperties}
        >
          <span className={styles.card}>
            {photo.src ? <Image src={photo.src} alt="" fill sizes="(min-width: 760px) 180px, 25vw" /> : "[Photo]"}
          </span>
        </span>
      ))}
    </div>
  );
}
