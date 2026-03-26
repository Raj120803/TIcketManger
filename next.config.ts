import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["googleapis"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.ngrok.io",
        "*.ngrok.app",
        "*.ngrok-free.app",
        "*.loca.lt"
      ],
    },
  },
};

export default nextConfig;
