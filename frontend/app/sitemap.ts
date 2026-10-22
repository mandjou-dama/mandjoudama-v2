import type { MetadataRoute } from "next";

import { projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${siteConfig.url}/about`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.8 },
    ...projects
      .filter((p) => p.caseStudy)
      .map((p) => ({
        url: `${siteConfig.url}/work/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.7,
      })),
  ];
}
