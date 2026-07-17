import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  devIndicators: false,
  experimental: {
    cpus: 2,
    staticGenerationMaxConcurrency: 2,
    staticGenerationMinPagesPerWorker: 50,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
