import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'

export default function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    image: `${SITE_URL}/icon-512.png`,
    description: SITE_DESCRIPTION,
    email: 'andres@wingconcept.com',
    sameAs: [
      'https://www.youtube.com/@wingconcept',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
