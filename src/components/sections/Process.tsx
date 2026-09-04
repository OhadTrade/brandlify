import { Reveal } from '@/components/motion/Reveal';
import { ScrubLine } from '@/components/motion/ScrubLine';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getContent } from '@/lib/queries';

/**
 * How it works.
 *
 * A vertical rail rather than a card grid. Two reasons, in order of weight:
 *
 *   1. The services section directly above is already a three-column card grid.
 *      Repeating the same layout family two sections later made the page read
 *      as one long grid instead of a sequence of distinct moments.
 *   2. These steps happen in an order. A grid says "here are six things"; a
 *      rail says "first this, then that", which is what the copy claims.
 *
 * The heading holds the other column and sticks while the steps pass it. That
 * is not decoration: a rail on its own is a narrow measure, and left in a
 * single column it stranded half the container as dead space. Pairing it with
 * the heading fills the width and keeps the section title in view for all six
 * steps, which is the one place on this page where the reader is following a
 * sequence rather than scanning.
 *
 * The scrub line was previously a loose rule floating above the grid,
 * decorating rather than organising. Here it is the spine: it draws downward
 * through the step markers as the section passes, so the motion traces the
 * sequence the section describes.
 */
export async function Process() {
  const process = await getContent('home.process');

  return (
    <section
      data-flow="fade" className="section-y" aria-labelledby="process-heading">
      <Container>
        {/*
          Both columns are sized, not stretched, and the pair is centred. A
          1fr step column looked like a centring bug: RTL text starts at the
          rail and runs left, so the column's extra width piled up as dead
          space on the far edge instead of doing anything.
        */}
        <div className="grid gap-12 lg:grid-cols-[16rem_minmax(0,30rem)] lg:items-start lg:justify-center lg:gap-x-20">
          <SectionHeading
            id="process-heading"
            title={process.title}
            subtitle={process.subtitle}
            className="lg:sticky lg:top-[calc(var(--nav-height)+3rem)]"
          />

          <Reveal as="ol" y={20} stagger={0.07} className="relative flex flex-col gap-9">
            {/*
              The rail. Sits at the centre of the marker column and stops short
              at both ends so it emerges from the first marker rather than
              floating past it. Renders complete when the engine is absent.
            */}
            <div
              aria-hidden
              className="pointer-events-none absolute start-[calc(1.5rem-1px)] top-6 bottom-6 w-[2px]"
            >
              <span className="bg-line absolute inset-0 block" />
              <ScrubLine orientation="vertical" className="absolute inset-0" />
            </div>

            {process.steps.map((step, i) => (
              <li
                key={step.title}
                className="relative grid grid-cols-[3rem_1fr] items-start gap-x-5 sm:gap-x-7"
              >
                {/*
                  The marker. Opaque background so the rail passes behind it
                  rather than through it, and the same 45deg chamfer the service
                  icons use.
                */}
                <span
                  aria-hidden
                  className="border-line chamfer bg-base font-latin text-violet relative z-10 flex h-12 w-12 items-center justify-center border text-lg font-extrabold"
                  dir="ltr"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="flex flex-col gap-2 pt-1.5">
                  <h3 className="text-h3 text-fg">{step.title}</h3>
                  <p className="text-muted text-[0.9375rem] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
