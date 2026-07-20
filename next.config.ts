import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve("../"),
  },
  images: {
    remotePatterns: [
       { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ]
  },
  webpack : (config) => { 
    config.resolve.alias.canvas = false;
    return config;
  }
};

export default nextConfig;
