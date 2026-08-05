import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // Required for @react-pdf/renderer and pdfjs-dist compatibility
      canvas: { browser: "./empty-module.js", default: "./empty-module.js" },
    },
  },
  webpack: (config) => {
    // Required for @react-pdf/renderer and pdfjs-dist compatibility (webpack mode)
    config.resolve.alias.canvas = false
    return config
  },
  images: {
    remotePatterns: [
       { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ]
  },
};

export default nextConfig;
