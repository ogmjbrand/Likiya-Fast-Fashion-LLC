import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: [
    "@likiya/config",
    "@likiya/database",
    "@likiya/email",
    "@likiya/inventory",
    "@likiya/payments",
  ],
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
