import { ScrubGroup } from '@/components/motion/ScrubGroup';
import { Container } from '@/components/ui/Container';
import { CountingNumber } from '@/components/ui/counting-number';
import { getContent } from '@/lib/queries';

/**
 * The four commitments, below the hero.
 *
 * Every figure here is something the business has decided to stand behind —
 * response time, target performance score, warranty length, Hebrew support.
 * No project counts, no satisfaction percentages: numbers with nothing behind
 * them are a legal exposure, not social proof.
 *
 * Values arrive as free text because not all of them are numbers ("24-48",
 * "עברית"), so each one is classified before rendering rather than forced
 * through a counter that would show NaN.
 */

type Figure =
  | { kind: 'number'; value: number }
  | { kind: 'range'; from: number; to: number }
  | { kind: 'text'; value: string };

function classify(value: string): Figure {
  const range = value.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (range) return { kind: 'range', from: Number(range[1]), to: Number(range[2]) };
  if (/^\d+$/.test(value)) return { kind: 'number', value: Number(value) };
  return { kind: 'text', value };
}

export async function StatsBar() {
  const { items } = await getContent('home.stats');

  return (
    /*
     * Pulled up over the hero's foot rather than butted against it, and
     * translucent rather than solid: the mark is on a sticky layer behind this
     * band now, and a solid surface would have hidden the middle third of the
     * move it makes.
     *
     * The hero's vignette already fades its bottom to near-black, and this band
     * is a lighter surface with a rule on top of it, so the two met as a hard
     * horizontal seam right where the eye leaves the hero. Overlapping them by
     * a few rem, with no rule on the leading edge, turns that seam into the
     * band emerging from underneath the hero. `relative` is what puts it above
     * the hero in paint order despite the negative margin.
     */
    <section
      className="border-line relative -mt-10 border-b bg-[rgb(23_16_33/0.72)] backdrop-blur-[2px] md:-mt-14"
      aria-label="ההתחייבויות שלנו"
      /*
       * Removing the top rule was not enough on its own: the band's surface is
       * lighter than the hero's foot, so the two still met as a colour step in
       * exactly the same place. The mask fades the band's own background in
       * over its first 4rem, which is entirely inside its top padding, so the
       * figures below are untouched and the edge simply stops existing.
       */
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, #000 4rem)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 4rem)',
      }}
    >
      <Container>
        {/*
          Scrubbed rather than played once. This band is the first thing under
          the hero, so it is where the reader finds out whether the page
          responds to them at all; an intro that fires at a line and finishes at
          its own speed regardless teaches them that it does not.

          `exit` is on because this section carries no data-flow of its own: it
          overlaps the hero with a negative margin and a mask, and a transform
          on the section would move that seam.
        */}
        <ScrubGroup
          as="ul"
          y={26}
          stagger={0.1}
          exit
          className="grid grid-cols-2 gap-x-8 gap-y-12 py-14 sm:grid-cols-4 md:py-16"
        >
          {items.map((stat, i) => {
            const figure = classify(stat.value);
            // The counters are staggered so the row reads left to right rather
            // than all four landing at once.
            const transition = {
              duration: 1.8,
              ease: 'easeOut',
              type: 'tween',
              delay: i * 0.12,
            } as const;

            return (
              <li key={stat.label} className="text-center">
                <div
                  className="font-latin text-fg text-3xl leading-none font-extrabold tracking-tight sm:text-4xl md:text-[2.75rem]"
                  dir="ltr"
                >
                  {figure.kind === 'number' ? (
                    <CountingNumber target={figure.value} startOnView transition={transition} />
                  ) : null}

                  {figure.kind === 'range' ? (
                    <>
                      <CountingNumber target={figure.from} startOnView transition={transition} />
                      <span className="text-muted mx-0.5">-</span>
                      <CountingNumber target={figure.to} startOnView transition={transition} />
                    </>
                  ) : null}

                  {figure.kind === 'text' ? (
                    <span dir="rtl" className="font-heading">
                      {figure.value}
                    </span>
                  ) : null}

                  {stat.unit ? (
                    <span className="text-brand-gradient ms-1 align-baseline text-xl sm:text-2xl">
                      {stat.unit}
                    </span>
                  ) : null}
                </div>

                <p className="text-muted mt-3 text-sm leading-snug text-balance">{stat.label}</p>
              </li>
            );
          })}
        </ScrubGroup>
      </Container>
    </section>
  );
}
