import type { NextConfig } from "next";

const supabaseFallbackKey = Buffer.from('c2Jfc2VjcmV0X1BLMTVuVmhIWTU5UUdERDFjdmh2bGdfZFFLd2R4N2k=', 'base64').toString('utf-8');

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uyflqpwvchawiynooaia.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseFallbackKey,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
