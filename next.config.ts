import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['924b-83-111-95-84.ngrok-free.app'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
