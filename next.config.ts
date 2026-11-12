import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Import only the icons used, not the whole Phosphor set.
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
