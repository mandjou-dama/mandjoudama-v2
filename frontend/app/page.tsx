import { Suspense } from "react";

import { Contact } from "@/app/components/home/Contact";
import { Hero } from "@/app/components/home/Hero";
import { WorkGrid, WorkGridFromQuery } from "@/app/components/work/WorkGrid";
import { experiences, stacks } from "@/lib/profile";
import { siteConfig } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "en",
      publisher: { "@id": `${siteConfig.url}/#person` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteConfig.url}/#profilepage`,
      url: siteConfig.url,
      name: `${siteConfig.name} – ${siteConfig.jobTitle}`,
      isPartOf: { "@id": `${siteConfig.url}/#website` },
      mainEntity: { "@id": `${siteConfig.url}/#person` },
      inLanguage: "en",
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.name,
      url: siteConfig.url,
      email: `mailto:${siteConfig.email}`,
      jobTitle: siteConfig.jobTitle,
      description: siteConfig.description,
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.location.city,
        addressCountry: siteConfig.location.countryCode,
      },
      knowsLanguage: ["fr", "en"],
      knowsAbout: stacks,
      worksFor: experiences
        .filter(({ current }) => current)
        .map(({ employer }) => ({ "@type": "Organization", name: employer })),
      sameAs: siteConfig.socials.map(({ href }) => href),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      {/* The grid reads ?filter= on the client, which keeps this page static; the fallback is the full grid. */}
      <Suspense fallback={<WorkGrid filter="all" />}>
        <WorkGridFromQuery />
      </Suspense>
      <Contact />
    </>
  );
}
