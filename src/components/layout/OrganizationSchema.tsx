import { contact, site, socialLinks } from '@/lib/site';

/**
 * Site-wide structured data: Organization, LocalBusiness and WebSite.
 *
 * Emitted once from the site shell. Everything here is verifiable — the phone
 * number, the languages, the social profiles the owner confirmed. No
 * aggregateRating, because there are no reviews yet and inventing one is both
 * dishonest and a manual-action risk with Google.
 */
export function OrganizationSchema() {
  const id = `${site.url}/#organization`;

  const graph = [
    {
      '@type': ['Organization', 'ProfessionalService'],
      '@id': id,
      name: site.name,
      url: site.url,
      description: site.description,
      slogan: site.tagline,
      logo: {
        '@type': 'ImageObject',
        url: new URL('/icon-512.png', site.url).toString(),
        width: 512,
        height: 512,
      },
      image: new URL('/brand/og-image-1200x630.png', site.url).toString(),
      telephone: contact.phoneE164,
      email: contact.email,
      areaServed: { '@type': 'Country', name: 'Israel' },
      availableLanguage: [{ '@type': 'Language', name: 'Hebrew', alternateName: 'he' }],
      sameAs: socialLinks.map((link) => link.href),
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: contact.phoneE164,
        contactType: 'sales',
        areaServed: 'IL',
        availableLanguage: ['he'],
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'שירותים',
        itemListElement: [
          'בניית אתרים',
          'מיתוג ועיצוב',
          'שיווק דיגיטלי',
          'קידום אורגני SEO',
          'אוטומציות',
        ].map((name) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name },
        })),
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: site.url,
      name: site.name,
      publisher: { '@id': id },
      inLanguage: 'he-IL',
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
      }}
    />
  );
}
