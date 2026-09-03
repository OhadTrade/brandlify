import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { PageHero } from '@/components/layout/PageHero';
import { FinalCta } from '@/components/sections/FinalCta';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { Prose } from '@/components/ui/Prose';
import { getPostBySlug, getPublishedPosts } from '@/lib/queries';
import { site, whatsappUrl } from '@/lib/site';

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'מאמר לא נמצא' };
  const description = post.seo_description ?? post.excerpt ?? undefined;
  return {
    title: post.seo_title ?? post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.seo_title ?? post.title,
      description,
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
  };
}

const dateFormatter = new Intl.DateTimeFormat('he-IL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Pull ## headings out of the markdown for the table of contents. */
function tableOfContents(markdown: string) {
  return Array.from(markdown.matchAll(/^##\s+(.+)$/gm)).map((match) => {
    const text = match[1]!.trim();
    return { text, id: text.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase() };
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getPostBySlug(slug), getPublishedPosts()]);

  if (!post || !post.published) notFound();

  const related = all.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);
  const toc = post.content_mdx ? tableOfContents(post.content_mdx) : [];
  const url = new URL(`/blog/${post.slug}`, site.url).toString();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: site.name, url: site.url },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: { '@type': 'ImageObject', url: new URL('/icon-512.png', site.url).toString() },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'he-IL',
  };

  return (
    <>
      <ReadingProgress targetId="article-body" />

      <PageHero
        eyebrow={post.category ?? 'מאמר'}
        title={post.title}
        lead={post.excerpt ?? undefined}
        crumbs={[
          { href: '/blog', label: 'מאמרים' },
          { href: `/blog/${post.slug}`, label: post.title },
        ]}
      >
        <p className="text-muted flex flex-wrap items-center gap-3 text-sm">
          {post.published_at ? (
            <time dateTime={post.published_at}>{dateFormatter.format(new Date(post.published_at))}</time>
          ) : null}
          {post.reading_time ? <span>· {post.reading_time} דקות קריאה</span> : null}
        </p>
      </PageHero>

      {post.cover_image ? (
        <section className="border-line border-b">
          <Container className="py-10">
            <div className="border-line rounded-card bg-base relative aspect-[16/9] overflow-hidden border">
              <Image
                src={post.cover_image}
                alt=""
                fill
                priority
                sizes="(min-width: 1280px) 1232px, 100vw"
                className="object-cover"
              />
            </div>
          </Container>
        </section>
      ) : null}

      <article id="article-body" className="section-y">
        <Container className="flex flex-col gap-12 lg:flex-row-reverse lg:items-start lg:gap-16">
          {toc.length > 1 ? (
            <nav
              aria-label="תוכן העניינים"
              className="border-line rounded-card bg-surface lg:sticky lg:top-24 border p-6 lg:w-72 lg:shrink-0"
            >
              <h2 className="text-label font-latin text-muted mb-4 uppercase">תוכן העניינים</h2>
              <ol className="space-y-2 text-sm">
                {toc.map((item, i) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-muted hover:text-fg flex gap-2 transition-colors"
                    >
                      <span className="font-latin text-violet" dir="ltr">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <div className="min-w-0 flex-1">
            {post.content_mdx ? (
              <Prose>
                {/* Rendered on the server — next-mdx-remote/rsc ships no client
                    JavaScript. Content comes from the authenticated admin, not
                    from visitors. */}
                <MDXRemote source={post.content_mdx} />
              </Prose>
            ) : null}

            <div className="border-line mt-12 flex flex-wrap items-center gap-4 border-t pt-8">
              <span className="text-muted text-sm font-semibold">שיתוף:</span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${url}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border-line text-muted hover:text-fg hover:border-magenta rounded-btn flex h-10 items-center gap-2 border px-4 text-sm transition-colors"
              >
                <Icon name="whatsapp" className="h-4 w-4" />
                וואטסאפ
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border-line text-muted hover:text-fg hover:border-magenta rounded-btn flex h-10 items-center gap-2 border px-4 text-sm transition-colors"
              >
                פייסבוק
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(url)}`}
                className="border-line text-muted hover:text-fg hover:border-magenta rounded-btn flex h-10 items-center gap-2 border px-4 text-sm transition-colors"
              >
                מייל
              </a>
              <a
                href={whatsappUrl(`היי, קראתי את "${post.title}" ואשמח לשמוע עוד.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink ms-auto text-sm font-semibold"
              >
                יש לך שאלה על המאמר?
              </a>
            </div>
          </div>
        </Container>
      </article>

      {related.length > 0 ? (
        <section
          className="section-y bg-surface border-line border-y"
          aria-labelledby="related-heading"
        >
          <Container className="flex flex-col gap-8">
            <h2 id="related-heading" className="text-h3 text-fg">
              מאמרים קשורים
            </h2>
            <ul className="grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="border-line bg-elevated rounded-card hover:border-line-strong block h-full border p-6 transition-colors"
                  >
                    <h3 className="text-fg font-bold">{item.title}</h3>
                    {item.excerpt ? (
                      <p className="text-muted mt-2 text-sm leading-relaxed">{item.excerpt}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <FinalCta />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
