import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export for GitHub Pages (no Node server). The build lands in /out.
  output: "export",
  // GitHub Pages serves this repo under /clavex; the deploy workflow sets it. Empty locally.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  // no image server on a static host: images are served as-is (they are already small .webp files)
  images: { unoptimized: true },
  // cacheComponents / partial prerendering are off: they need a server and can't run in a static export
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
