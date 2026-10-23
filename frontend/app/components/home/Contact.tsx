"use client";

import { useEffect, useRef, useState } from "react";

import { Check, Copy } from "@/app/components/icons";
import { siteConfig } from "@/lib/site";

import heroStyles from "./Hero.module.scss";
import styles from "./Contact.module.scss";

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(siteConfig.email);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" className={styles.copy} onClick={copy}>
      {copied ? <Check size={16} className={styles.copied} /> : <Copy size={16} />}
      <span aria-live="polite">{copied ? "Copied to clipboard" : siteConfig.email}</span>
    </button>
  );
}

export function Contact() {
  return (
    <section className={styles.contact} aria-labelledby="contact-title">
      <h2 id="contact-title" className={styles.title}>
        Have an app in mind?
        <br />
        Let’s build it together.
      </h2>
      <p className={styles.lead}>From the first Figma frame to the App Store release.</p>
      <div className={styles.actions}>
        <a className={heroStyles.primary} href={`mailto:${siteConfig.email}`} style={{ justifyContent: "center" }}>
          Get in touch
        </a>
        <CopyEmail />
      </div>
    </section>
  );
}
