"use client";

import { siteConfig } from "@/lib/site";
import { useBamakoClock } from "@/lib/useBamakoClock";

import styles from "./SiteFooter.module.scss";

export function SiteFooter() {
  const clock = useBamakoClock();

  return (
    <footer className={styles.footer}>
      <div className={styles.bar}>
        <span>M ― D · © {new Date().getFullYear()} {siteConfig.name}</span>
        <span>Bamako{clock ? ` · ${clock.time}` : ", Mali"}</span>
        <nav className={styles.links} aria-label="Elsewhere">
          {siteConfig.socials.map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="me noreferrer">
              {social.label}
            </a>
          ))}
          <a href={siteConfig.resumeUrl} target="_blank" rel="noreferrer">
            Resume
          </a>
        </nav>
      </div>
    </footer>
  );
}
