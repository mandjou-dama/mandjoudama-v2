import type { Metadata } from "next";

import { keystaticEnabled } from "@/lib/keystatic";
import { siteConfig } from "@/lib/site";

import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Admin",
  robots: { index: false, follow: false },
};

// Its own root layout: the admin brings its own UI, without the site's header, footer and styles.
export default function KeystaticLayout() {
  return (
    <html lang="en">
      <body>
        {keystaticEnabled ? (
          <KeystaticApp />
        ) : (
          <p style={{ fontFamily: "system-ui", padding: 24 }}>The admin is not set up on this deployment.</p>
        )}
      </body>
    </html>
  );
}
