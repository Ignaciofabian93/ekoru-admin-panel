import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Admin previews seller/business/blog imagery served from Cloudflare R2 via
    // the ekoru-image-processor's public CDN domains (shared with the web app).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ekoru.cl",
      },
      {
        protocol: "https",
        hostname: "staging-images.ekoru.cl",
      },
    ],
  },
};

export default nextConfig;
