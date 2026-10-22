"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useRef } from "react";

import { GitHub, LinkedIn, XLogo } from "@/app/components/icons";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { parseFilter, projectCount, type Filter } from "@/lib/projects";
import { siteConfig } from "@/lib/site";
import { useBamakoClock } from "@/lib/useBamakoClock";

import styles from "./SiteHeader.module.scss";

const tabs: { filter: Filter; label: string; href: string }[] = [
  { filter: "all", label: "Everything", href: "/" },
  { filter: "mobile", label: "Mobile", href: "/?filter=mobile" },
  { filter: "web", label: "Web", href: "/?filter=web" },
];

type Current = Filter | "about" | null;

function Nav({ current }: { current: Current }) {
  return (
    <nav className={styles.nav} aria-label="Primary">
      {tabs.map((tab) => (
        <Link
          key={tab.filter}
          href={tab.href}
          scroll={false}
          className={styles.tab}
          aria-current={current === tab.filter ? "page" : undefined}
        >
          {tab.label}
          <span className={styles.tabCount}>{projectCount(tab.filter)}</span>
        </Link>
      ))}
      <Link href="/about" className={styles.tab} aria-current={current === "about" ? "page" : undefined}>
        About
      </Link>
    </nav>
  );
}

// Reads the query string, so it renders inside a Suspense boundary.
function CurrentNav() {
  const pathname = usePathname();
  const filter = parseFilter(useSearchParams().get("filter"));
  const current: Current = pathname === "/" ? filter : pathname.startsWith("/about") ? "about" : null;
  return <Nav current={current} />;
}

function LocalTime() {
  const clock = useBamakoClock();
  return (
    <p className={styles.time}>
      <span>{clock ? `It’s ${clock.time} in Bamako, ML` : "Bamako, ML"}</span>
      {clock && <span className={styles.relative}>{clock.relative}</span>}
    </p>
  );
}

const socialIcons = {
  X: <XLogo size={14} />,
  GitHub: <GitHub size={16} />,
  LinkedIn: <LinkedIn size={15} />,
} as const;

export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);

  // The glass background comes in as soon as the page moves, so nothing slides under a bare
  // header; "Get in touch" waits until the hero's own button has scrolled away.
  useGSAP(() => {
    const header = ref.current;
    if (!header) return;
    ScrollTrigger.create({
      start: 1,
      end: "max",
      onToggle: (self) => header.classList.toggle(styles.scrolled, self.isActive),
    });
    ScrollTrigger.create({
      start: 280,
      end: "max",
      onToggle: (self) => header.classList.toggle(styles.withCta, self.isActive),
    });
  });

  return (
    <header ref={ref} className={styles.header}>
      <LocalTime />
      <Suspense fallback={<Nav current={null} />}>
        <CurrentNav />
      </Suspense>
      <div className={styles.end}>
        <a href={`mailto:${siteConfig.email}`} className={styles.cta}>
          Get in touch
        </a>
        {[...siteConfig.socials].reverse().map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="me noreferrer"
            className={styles.social}
            aria-label={social.label}
          >
            {socialIcons[social.label]}
          </a>
        ))}
      </div>
    </header>
  );
}
