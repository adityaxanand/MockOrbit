import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
          hostname: 'randomuser.me',
        },
      {
        protocol: 'https',
          hostname: 'picsum.photos',
        },
        {
          protocol: 'https',
          hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
