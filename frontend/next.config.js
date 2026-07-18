/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'wingconcept.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.wingconcept.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig