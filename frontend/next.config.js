/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    // Dev: proxy same-origin /api → backend (evita CORS en uploads multipart)
    if (process.env.NODE_ENV === 'development') {
      const backend = process.env.INTERNAL_API_URL || 'http://localhost:8000'
      return [
        {
          source: '/api/v1/:path*',
          destination: `${backend.replace(/\/$/, '')}/api/v1/:path*`,
        },
      ]
    }
    return []
  },
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