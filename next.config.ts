import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "u0m9uz4r42yofjsv.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
