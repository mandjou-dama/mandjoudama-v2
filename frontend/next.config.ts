import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lib/content.ts reads content/ with Keystatic. Static pages do it at build time, but routes rendered on
  // demand (the 404 catch-all, unknown /work slugs) do it at runtime, and the tracer can't see those reads.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
};

export default nextConfig;
