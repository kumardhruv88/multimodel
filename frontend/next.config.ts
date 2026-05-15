import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config to acknowledge we're using Turbopack
  // Video files in public folder are served statically, no special config needed
  turbopack: {},
};

export default nextConfig;
