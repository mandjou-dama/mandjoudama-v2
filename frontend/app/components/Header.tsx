import styles from "./Header.module.scss";

import Link from "next/link";

export default async function Header() {
  return (
    <header className={styles.header}>
      <Link className={styles.logo} href="/">
        M ― D
      </Link>

      <Link
        target="_blank"
        href="https://xmymttluoieutmeorcjb.supabase.co/storage/v1/object/public/personal/Mandjou%20Dama%20-%20CV.pdf"
        className={styles.theme_switchers}
      >
        <p>Resume</p>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className={`${styles.button}`}
        >
          <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
        </svg>
      </Link>
    </header>
  );
}
