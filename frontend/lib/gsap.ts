"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Motion tokens, matching the CSS custom properties in globals.css.
export const ease = {
  out: "power4.out", // quint out
  expo: "expo.out",
  inOut: "power3.inOut",
} as const;

export { gsap, ScrollTrigger, useGSAP };
