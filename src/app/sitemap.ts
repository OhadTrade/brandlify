import type { MetadataRoute } from 'next';
import { services as serviceContent } from '@/content/services';
import { getPublishedPosts, getPublishedProjects, getServices } from '@/lib/queries';
import { site } from '@/lib/site';

export const revalidate = 3600;

/**
 * Sitemap.
 *
 * Only ever lists what the public can actually reach: unpublished projects and
 * posts are invisible to the anon key, so they cannot leak in here. /admin is
 * absent by construction rather than by exclusion.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => new URL(path, site.url).toString();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: url('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: url('/services'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: url('/portfolio'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: url('/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: url('/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: url('/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: url('/accessibility'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [services, projects, posts] = await Promise.all([
    getServices(),
    getPublishedProjects(),
    getPublishedPosts(),
  ]);

  // Fall back to the canonical slugs so the service pages are listed even if the
  // database is unreachable when the sitemap is generated.
  const serviceSlugs = (services.length > 0 ? services : serviceContent).map((s) => s.slug);

  return [
    ...staticEntries,
    ...serviceSlugs.map((slug) => ({
      url: url(`/services/${slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...projects.map((project) => ({
      url: url(`/portfolio/${project.slug}`),
      lastModified: new Date(project.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: url(`/blog/${post.slug}`),
      lastModified: new Date(post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
