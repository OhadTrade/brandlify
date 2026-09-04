import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublishedPosts } from "@/lib/queries";

const dateFormatter = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Hidden entirely until there are published posts. */
export async function LatestPosts() {
  const posts = await getPublishedPosts(3);
  if (posts.length === 0) return null;

  return (
    <section
      data-flow="lift"
      className="section-y"
      aria-labelledby="blog-heading"
    >
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="From the blog"
          id="blog-heading"
          title="מאמרים"
          subtitle="מה שלמדנו בדרך, בלי באזזוורדס."
        />

        <ul className="grid gap-6 md:grid-cols-3">
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
                      sizes="(min-width: 768px) 400px, 100vw"
                      className="object-cover transition-transform duration-400 ease-snap group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
                    />
                  </div>
                ) : null}

                <div className="flex flex-1 flex-col gap-3 p-6">
                  <p className="text-label font-latin text-magenta flex flex-wrap items-center gap-2 uppercase">
                    {post.category ? <span>{post.category}</span> : null}
                    {post.category && post.published_at ? (
                      <span aria-hidden className="text-muted">
                        ·
                      </span>
                    ) : null}
                    {post.published_at ? (
                      <time
                        dateTime={post.published_at}
                        className="text-muted normal-case"
                      >
                        {dateFormatter.format(new Date(post.published_at))}
                      </time>
                    ) : null}
                    {post.reading_time ? (
                      <>
                        <span aria-hidden className="text-muted">
                          ·
                        </span>
                        <span className="text-muted normal-case">
                          {post.reading_time} דקות קריאה
                        </span>
                      </>
                    ) : null}
                  </p>

                  <h3 className="text-h3 text-fg">{post.title}</h3>
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
        </ul>

        <div>
          <Button href="/blog" variant="secondary" size="lg">
            לכל המאמרים
            <Icon name="arrow" className="h-5 w-5" />
          </Button>
        </div>
      </Container>
    </section>
  );
}
