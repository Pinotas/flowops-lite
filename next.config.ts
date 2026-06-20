import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs", "@prisma/client"],
};

export default nextConfig;