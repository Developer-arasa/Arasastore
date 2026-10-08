import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // strict path configuration
{
  protocol: 'https',
  hostname: 'kqfaqftlpivwhfdwqrwt.supabase.co',
  pathname: '/storage/v1/object/public/**',
}
    ],
  },
};

export default nextConfig;