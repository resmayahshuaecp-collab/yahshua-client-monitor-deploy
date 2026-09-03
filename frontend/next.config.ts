import path from "node:path";

import type { NextConfig } from "next";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://localhost:8085";

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

  // Pin the tracing root to this directory. Standalone tracing infers a
  // workspace root from the nearest lockfiles, and there are unrelated ones
  // in a parent directory on some machines (~/package-lock.json,
  // ~/yarn.lock), which makes it infer ~ and then fail to find the .nft.json
  // files it just wrote -- `next build` compiles, then dies with ENOENT.
  // Docker never hit this because /app has no parent lockfiles.
  outputFileTracingRoot: path.join(__dirname),

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
