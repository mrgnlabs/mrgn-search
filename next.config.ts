import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "storage.googleapis.com",
        pathname: "/mrgn-public/mrgn-token-icons/**",
      },
    ],
  },
};

export default nextConfig;
