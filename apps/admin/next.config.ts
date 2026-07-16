import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: [
    "@likiya/ui",
    "@likiya/auth",
    "@likiya/database",
    "@likiya/config",
    "@likiya/utils",
    "@likiya/types",
    "@likiya/inventory",
  ],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
