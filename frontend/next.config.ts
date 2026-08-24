import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Emits .next/standalone: a self-contained server plus only the node_modules
  // files Next traced as actually reachable. The production image ships that
  // instead of the full dependency tree, which is mostly build-time tooling
  // (typescript, vite, rolldown, playwright) that never runs in production.
  //
  // Affects `next build` only -- `next dev` ignores it, so the native and
  // containerised dev workflows are unchanged.
  output: "standalone",
};

export default nextConfig;
