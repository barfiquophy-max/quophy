import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets-cf.armani.com",
        pathname: "/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
