import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
 allowedDevOrigins: ['192.168.1.83'],
  experimental: {
    agentFeedback: true,
  },
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
