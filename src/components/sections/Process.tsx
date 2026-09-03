import { Reveal } from '@/components/motion/Reveal';
import { ScrubLine } from '@/components/motion/ScrubLine';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getContent } from '@/lib/queries';

/**
 * How it works — six steps.
 *
 * Oversized Latin numerals sit behind each step. Stage 6 draws the connecting
 * line with an SVG stroke-dashoffset scrub; here it is simply present.
 */
export async function Process() {
  const process = await getContent('home.process');

  return (
    <section className="section-y" aria-labelledby="process-heading">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="The process"
          id="process-heading"
          title={process.title}
          subtitle={process.subtitle}
        />

        {/* Draws itself right-to-left as the section scrolls in. Renders
            complete, not empty, when the engine is absent. */}
        <ScrubLine className="-mb-8 w-full" />

        <Reveal as="ol" className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
          {process.steps.map((step, i) => (
            <li
              key={step.title}
              className="bg-surface relative overflow-hidden p-8 outline outline-[color:var(--color-line)]"
            >
              {/* Watermark numeral. Kept fully inside the card — cropped at the
                  card edge it reads as a rendering fault rather than a motif. */}
              <span
                aria-hidden
                className="font-latin pointer-events-none absolute top-5 end-6 text-[4.5rem] leading-none font-extrabold text-[rgb(250_250_252/0.05)] select-none"
                dir="ltr"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative flex flex-col gap-3">
                <span aria-hidden className="bg-brand h-1 w-10 rounded-full" />
                <h3 className="text-h3 text-fg">{step.title}</h3>
                <p className="text-muted text-[0.9375rem] leading-relaxed">{step.description}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
