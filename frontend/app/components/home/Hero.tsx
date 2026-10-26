import type { CSSProperties } from "react";

import { FileText } from "@/app/components/icons";
import { siteConfig } from "@/lib/site";

import { BrandRotator } from "./BrandRotator";
import styles from "./Hero.module.scss";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export function Hero() {
  return (
    <section className={styles.hero}>
      {siteConfig.available && (
        <p className={styles.available} data-load="" style={delay(0)}>
          <span aria-hidden="true" />
          Available for new projects
        </p>
      )}
      <h1 className={styles.nameMask}>
        <span className={styles.name}>{siteConfig.name}</span>
      </h1>
      <p className={styles.intro} data-load="" style={delay(380)}>
        <span className={styles.line}>Mobile &amp; Frontend Developer. 4+ years</span>
        <span className={styles.line}>
          shipping apps for <BrandRotator />, and now
        </span>
        <span className={styles.line}>
          building mobile at <span className={styles.strong}>Payme</span>.
        </span>
      </p>
      <div className={styles.actions} data-load="" style={delay(480)}>
        <a className={styles.primary} href={`mailto:${siteConfig.email}`}>
          Get in touch
        </a>
        <a className={styles.secondary} href={siteConfig.resumeUrl} target="_blank" rel="noreferrer">
          <FileText size={16} />
          Resume
        </a>
      </div>
    </section>
  );
}
