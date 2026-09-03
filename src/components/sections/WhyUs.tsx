import { Reveal } from '@/components/motion/Reveal';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getContent } from '@/lib/queries';

export async function WhyUs() {
  const why = await getContent('home.why');

  return (
    <section className="section-y" aria-labelledby="why-heading">
      <Container className="flex flex-col gap-12">
        <SectionHeading eyebrow="Why us" id="why-heading" title={why.title} />

        <Reveal as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {why.cards.map((card, i) => (
            <li
              key={card.title}
              className="border-line bg-surface rounded-card hover:border-line-strong relative flex flex-col gap-3 border p-7 transition-colors duration-300"
            >
              <span
                aria-hidden
                className="font-latin text-brand-gradient text-2xl font-extrabold"
                dir="ltr"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-h3 text-fg">{card.title}</h3>
              <p className="text-muted text-[0.9375rem] leading-relaxed">{card.description}</p>
            </li>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
