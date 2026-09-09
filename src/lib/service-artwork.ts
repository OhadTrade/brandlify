/** The same approved raster is used on a service card and its destination page. */
const artwork: Record<string, string> = {
  websites: '/brand/services/websites-v1.webp',
  branding: '/brand/services/branding-v1.webp',
  marketing: '/brand/services/marketing-v1.webp',
  seo: '/brand/services/seo-v1.webp',
  automations: '/brand/services/automations-v1.webp',
};

export function getServiceArtwork(slug: string): string {
  return artwork[slug] ?? '/brand/flowing-b.webp';
}
