import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getApprovedTestimonials, getContent } from "@/lib/queries";

/**
 * Reviews, or — while there are none — the written commitments.
 *
 * The testimonials section is built in full and wired to the table. It renders
 * only when there is at least one APPROVED row. With none, the page shows the
 * promises instead: real, checkable undertakings rather than invented praise.
 * No placeholder reviews exist anywhere in this codebase or in the seed.
 */
export async function SocialProof() {
  const testimonials = await getApprovedTestimonials();

  if (testimonials.length === 0) return <Promises />;

  return (
    <section
      data-flow="lift"
      className="section-y bg-surface border-line border-y"
      aria-labelledby="reviews-heading"
    >
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="Reviews"
          id="reviews-heading"
          title="מה הלקוחות שלנו אומרים"
        />

        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <li
              key={t.id}
              className="border-line bg-elevated rounded-card flex flex-col gap-5 border p-7"
            >
              {t.rating ? (
                <p
                  className="flex gap-0.5"
                  aria-label={`דירוג ${t.rating} מתוך 5`}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className={
                        i < t.rating! ? "text-magenta" : "text-muted opacity-30"
                      }
                    >
                      ★
                    </span>
                  ))}
                </p>
              ) : null}

              <blockquote className="text-fg flex-1 text-[0.9375rem] leading-relaxed">
                {t.content}
              </blockquote>

              <footer className="border-line flex items-center gap-3 border-t pt-5">
                <span
                  aria-hidden
                  className="bg-cta flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white"
                >
                  {t.client_name.trim().charAt(0)}
                </span>
                <span>
                  <span className="text-fg block text-sm font-semibold">
                    {t.client_name}
                  </span>
                  {t.business_name ? (
                    <span className="text-muted block text-xs">
                      {t.business_name}
                    </span>
                  ) : null}
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

async function Promises() {
  const promises = await getContent("home.promises");

  return (
    <section
      className="section-y bg-surface border-line border-y"
      aria-labelledby="promises-heading"
    >
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="Our commitments"
          id="promises-heading"
          title={promises.title}
          subtitle={promises.subtitle}
        />

        <Reveal as="ul" className="grid gap-5 sm:grid-cols-2">
          {promises.items.map((item) => (
            <li
              key={item.title}
              className="border-line bg-elevated rounded-card flex gap-4 border p-7"
            >
              <span
                aria-hidden
                className="border-line chamfer text-magenta flex h-11 w-11 shrink-0 items-center justify-center border bg-[rgb(230_53_240/0.08)]"
              >
                <Icon name="check" className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="text-fg text-lg font-extrabold">
                  {item.title}
                </span>
                <span className="text-muted text-[0.9375rem] leading-relaxed">
                  {item.description}
                </span>
              </span>
            </li>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
