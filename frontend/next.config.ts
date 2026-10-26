import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lib/content.ts reads content/ with Keystatic. Static pages do it at build time, but routes rendered on
  // demand (the 404 catch-all, unknown /work slugs) do it at runtime, and the tracer can't see those reads.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  // In GitHub mode Keystatic moves the local admin from localhost to 127.0.0.1, its OAuth callback host. The
  // dev server blocks dev resources (HMR) for other origins by default, and the admin then never renders.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
