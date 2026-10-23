// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {

//   output: "export",
//   /* config options here */
//   allowedDevOrigins: ['192.168.1.83'],
//   experimental: {
//     agentFeedback: true,
//   },
//   devIndicators: false,
//   cacheComponents: true,
//   partialPrefetching: true,
//   turbopack: {
//     rules: {
//       "*.css": {
//         loaders: ["@tailwindcss/turbopack"],
//         as: "*.css",
//       },
//     },
//   },
// };

// export default nextConfig;



import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // for export deploy to firebase
  output: "export",

  allowedDevOrigins: ["192.168.1.83"],

  experimental: {
    agentFeedback: true,
  },

  devIndicators: false,

  // Disable features that conflict with static export
  cacheComponents: false,
  partialPrefetching: false,

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
