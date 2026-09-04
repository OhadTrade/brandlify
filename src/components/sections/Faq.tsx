import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getContent, getFaqs } from '@/lib/queries';

/**
 * FAQ accordion.
 *
 * Built on native <details>/<summary>: keyboard operable, exposed correctly to
 * screen readers, and functional before any JavaScript loads. A hand-rolled
 * accordion would ship state, ARIA and key handling to do worse.
 */
export async function Faq() {
  const [faqs, copy] = await Promise.all([getFaqs(), getContent('home.faq')]);
  if (faqs.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <section
      data-flow="lift" className="section-y" aria-labelledby="faq-heading">
      <Container className="flex flex-col gap-12 lg:flex-row lg:gap-16">
        <div className="lg:w-2/5">
          <SectionHeading
            eyebrow="FAQ"
            id="faq-heading"
            title={copy.title}
            subtitle={copy.subtitle}
          />
        </div>

        <div className="border-line divide-line divide-y border-y lg:w-3/5">
          {faqs.map((faq) => (
            <details key={faq.question} className="group">
              <summary className="text-fg flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-start text-lg font-bold [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden
                  className="border-line text-violet group-open:bg-cta group-open:border-magenta mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 group-open:text-white"
                >
                  <Icon
                    name="plus"
                    className="h-4 w-4 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                    strokeWidth={2}
                  />
                </span>
              </summary>
              <p className="text-muted pb-6 pe-14 text-[0.9375rem] leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Container>

      <script
        type="application/ld+json"
        // Content is our own copy from the database, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
