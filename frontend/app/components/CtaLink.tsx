import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { isExternal } from "@/lib/projects";

type Props = Omit<ComponentProps<"a">, "href"> & { href: string; children: ReactNode };

/** Next.js <Link> for pages of this site, a plain <a> opening a new tab for everything else. */
export function CtaLink({ href, children, ...props }: Props) {
  if (isExternal(href) || href.startsWith("mailto:")) {
    const newTab = isExternal(href);
    return (
      <a href={href} target={newTab ? "_blank" : undefined} rel={newTab ? "noreferrer" : undefined} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
