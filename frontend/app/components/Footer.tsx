import Link from "next/link";
import styles from "./Footer.module.scss";

import { siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        {siteConfig.socials.map(({ label, href }) => (
          <Link
            key={label}
            target="_blank"
            rel="me noopener noreferrer"
            href={href}
          >
            {label}
          </Link>
        ))}
      </div>

      <p>2025 Mandjou Dama. All rights reserved.</p>
    </footer>
  );
}
