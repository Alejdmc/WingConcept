import { SITE_URL } from '@/lib/site'

/** Public marketing pages indexed in search. */
const PUBLIC_PATHS = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/paratrike', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/paratrike/vanguard', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/paratrike/nomadic', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/paratrike/vanguard/configuration', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/paratrike/nomadic/configurador', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/paratrike/disruptor', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/paratrike/disruptor/configurador', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/paramotors', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/paramotors/disruptor', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/paramotors/disruptor/configurador', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/parts', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/dealers', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/adventure', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/events', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/shows', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/tourist-flight', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/induction-course', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/manuals', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
]

export default function sitemap() {
  const lastModified = new Date()
  return PUBLIC_PATHS.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
