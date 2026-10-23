import "./globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Figtree, Inter } from "next/font/google";
import localFont from "next/font/local";

import { SiteFooter } from "@/app/components/site/SiteFooter";
import { SiteHeader } from "@/app/components/site/SiteHeader";
import { getProjectCounts } from "@/lib/content";
import { siteConfig } from "@/lib/site";

const defaultTitle = `${siteConfig.name} – ${siteConfig.jobTitle}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  // og:image and twitter:image fall back to app/opengraph-image.jpg (file convention).
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title: defaultTitle,
    description: siteConfig.description,
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: defaultTitle,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "_PmIseyz3VvJwrGjQqJJYKHD_THMBlF7TxopDvZUOxQ",
    other: {
      me: [siteConfig.email, siteConfig.url],
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  referrer: "origin-when-cross-origin",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = localFont({
  src: "../../public/fonts/JetBrainsMono-Variable.woff2",
  variable: "--font-jetbrains",
  display: "swap",
});

// Lets CSS hide what the page animates in, only once JS is known to be running.
const jsFlag = "document.documentElement.classList.add('js')";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const counts = await getProjectCounts();
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body>
        <SiteHeader counts={counts} />
        <main>{children}</main>
        <SiteFooter />
        <SpeedInsights />
      </body>
    </html>
  );
}
