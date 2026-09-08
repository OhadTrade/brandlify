import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHero } from '@/components/layout/PageHero';
import { Reveal } from '@/components/motion/Reveal';
import { FinalCta } from '@/components/sections/FinalCta';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { getPublishedPosts } from '@/lib/queries';
import styles from '@/components/sections/studio-pages.module.css';

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
        eyebrow="Brandlify Journal"
        title="מה שלמדנו בדרך."
        lead="בלי באזזוורדס ובלי הבטחות. דברים שאפשר ליישם."
        crumbs={[{ href: '/blog', label: 'מאמרים' }]}
      />

      <section className="section-y">
        <Container>
          {posts.length === 0 ? (
            <div className={styles.emptyJournal}>
              <Image src="/brand/digital-system.webp" alt="" width={500} height={500} sizes="(min-width: 901px) 40vw, 320px" />
              <div>
                <h2>השאלות שלך.<br />נקודת ההתחלה שלנו.</h2>
                <p>עדיין אין כאן מאמרים שפורסמו. בינתיים, אפשר להכיר את השירותים שלנו או לדבר איתנו על השאלה שמעסיקה אותך.</p>
                <Link href="/contact" className={styles.introLink}>לשאול אותנו <Icon name="arrow" className="h-4 w-4" /></Link>
              </div>
            </div>
          ) : (
            <Reveal as="ul" className={styles.journal} y={16} stagger={0.06}>
              {posts.map((post, index) => (
                <li key={post.id} className="group">
                  <Link
                    href={`/blog/${post.slug}`}
                    className={styles.post}
                  >
                    {post.cover_image || index === 0 ? (
                      <div className={styles.postVisual} data-brand-art={post.cover_image ? undefined : true}>
                        <Image
                          src={post.cover_image ?? '/brand/digital-system.webp'}
                          alt=""
                          fill
                          priority={index === 0}
                          sizes="(min-width: 901px) 50vw, 100vw"
                        />
                      </div>
                    ) : null}

                    <div className={styles.postCopy}>
                      <div className={styles.postMeta}>
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
                      </div>
                      <h2>{post.title}</h2>
                      {post.excerpt ? (
                        <p className="text-muted flex-1 text-[0.9375rem] leading-relaxed">
                          {post.excerpt}
                        </p>
                      ) : null}
                      <span className={styles.introLink}>
                        לקריאת המאמר
                        <Icon
                          name="arrow"
                          className="h-4 w-4"
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
