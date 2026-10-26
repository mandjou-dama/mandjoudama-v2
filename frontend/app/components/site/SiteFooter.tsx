import { siteConfig } from "@/lib/site";

import styles from "./SiteFooter.module.scss";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.bar}>
        <span>M ― D · © {new Date().getFullYear()} {siteConfig.name}</span>
      </div>
    </footer>
  );
}
