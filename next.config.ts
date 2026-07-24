import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Photo uploads are compressed client-side before being sent, but this
      // gives a bit of headroom over the 1 MB default as a safety net.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
