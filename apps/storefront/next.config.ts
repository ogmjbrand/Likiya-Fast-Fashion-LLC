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
    "@likiya/analytics",
    "@likiya/hooks",
    "@likiya/inventory",
    "@likiya/email",
    "@likiya/payments",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
