import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // Turbopack equivalent of webpack: config.resolve.alias.canvas = false
      // Required for @react-pdf/renderer and pdfjs-dist compatibility
      canvas: { browser: "./empty-module.js", default: "./empty-module.js" },
    },
  },
  images: {
    remotePatterns: [
       { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ]
  },
};

export default nextConfig;
