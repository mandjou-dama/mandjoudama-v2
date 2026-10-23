"use client";

import { useEffect, useState } from "react";

import { siteConfig } from "@/lib/site";

export type BamakoClock = {
  /** "4:55 AM" */
  time: string;
  /** "4:55" */
  clock: string;
  /** "AM" */
  period: string;
  /** "1 hr behind", relative to the visitor's own time zone */
  relative: string;
};

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: siteConfig.timeZone,
  hour: "numeric",
  minute: "2-digit",
});

function read(now: Date): BamakoClock {
  const time = formatter.format(now);
  const [clock, period = ""] = time.split(/\s+/);
  // Bamako is UTC+0, so the offset to it is the visitor's own UTC offset, reversed.
  const diff = now.getTimezoneOffset() / 60;
  const hours = Math.abs(diff);
  const relative =
    diff === 0 ? "Same time as you" : `${hours} hr ${diff < 0 ? "behind" : "ahead"}`;
  return { time, clock, period, relative };
}

/** Bamako's local time, ticking every 30s. Null until mounted, since it depends on the visitor. */
export function useBamakoClock() {
  const [clock, setClock] = useState<BamakoClock | null>(null);

  useEffect(() => {
    const tick = () => setClock(read(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return clock;
}
