const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      { source: '/vanguard', destination: '/paratrike/vanguard', permanent: true },
      { source: '/nomadic', destination: '/paratrike/nomadic', permanent: true },
      { source: '/disruptor', destination: '/paratrike/disruptor', permanent: true },
      { source: '/paratrike/vanguard-v8', destination: '/paratrike/vanguard', permanent: true },
      { source: '/paratrike/nomadic-trike', destination: '/paratrike/nomadic', permanent: true },
      { source: '/paratrike/vanguard/configurador', destination: '/paratrike/vanguard/configuration', permanent: true },
      { source: '/paratrike/nomadic/configuration', destination: '/paratrike/nomadic/configurador', permanent: true },
    ]
  },
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