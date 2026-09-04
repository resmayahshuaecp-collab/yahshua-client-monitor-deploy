import path from "node:path";
import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(process.env.DOCKER_BUILD ? {
    output: "standalone",
    outputFileTracingRoot: path.join(__dirname),
  } : {}),
  async rewrites() {
    if (!backendUrl || backendUrl.includes("localhost")) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;