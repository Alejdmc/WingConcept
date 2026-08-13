import { SITE_URL } from '@/lib/site'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/cart',
        '/checkout/',
        '/cuenta',
        '/orders/',
        '/verify-email',
        '/login',
        '/register',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
