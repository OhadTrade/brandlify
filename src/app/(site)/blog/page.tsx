import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { EmptyState, PageHero } from '@/components/layout/PageHero';
import { Reveal } from '@/components/motion/Reveal';
import { FinalCta } from '@/components/sections/FinalCta';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { getPublishedPosts } from '@/lib/queries';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'מאמרים',
  description: 'מדריכים ותובנות על בניית אתרים, קידום, שיווק דיגיטלי ואוטומציות לעסקים בישראל.',
  alternates: { canonical: '/blog' },
};

const dateFormatter = new Intl.DateTimeFormat('he-IL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHero
        eyebrow="From the blog"
        title="מה שלמדנו בדרך."
        lead="בלי באזזוורדס ובלי הבטחות. דברים שאפשר ליישם."
        crumbs={[{ href: '/blog', label: 'מאמרים' }]}
      />

      <section className="section-y">
        <Container>
          {posts.length === 0 ? (
            <EmptyState
              title="המאמר הראשון בכתיבה"
              body="בינתיים, אם יש שאלה שמעניינת אותך — שאל אותנו ישירות. סביר שהתשובה תהפוך למאמר."
              ctaLabel="לשאול אותנו"
            />
          ) : (
            <Reveal as="ul" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id} className="group">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="border-line bg-surface rounded-card hover:border-line-strong hover:shadow-lift flex h-full flex-col overflow-hidden border transition-[translate,scale,border-color,box-shadow] duration-200 ease-snap active:scale-[0.99] active:duration-75 motion-reduce:active:scale-100 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    {post.cover_image ? (
                      <div className="bg-base relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={post.cover_image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-400 ease-snap group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
                        />
                      </div>
                    ) : null}

                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <p className="text-label font-latin text-magenta flex flex-wrap items-center gap-2 uppercase">
                        {post.category ? <span>{post.category}</span> : null}
                        {post.published_at ? (
                          <time dateTime={post.published_at} className="text-muted normal-case">
                            {dateFormatter.format(new Date(post.published_at))}
                          </time>
                        ) : null}
                        {post.reading_time ? (
                          <span className="text-muted normal-case">
                            {post.reading_time} דקות קריאה
                          </span>
                        ) : null}
                      </p>
                      <h2 className="text-h3 text-fg">{post.title}</h2>
                      {post.excerpt ? (
                        <p className="text-muted flex-1 text-[0.9375rem] leading-relaxed">
                          {post.excerpt}
                        </p>
                      ) : null}
                      <span className="text-pink flex items-center gap-2 text-sm font-semibold">
                        קריאה
                        <Icon
                          name="arrow"
                          className="h-4 w-4 transition-transform duration-200 ease-snap group-hover:-translate-x-1 motion-reduce:transform-none"
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </Reveal>
          )}
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
