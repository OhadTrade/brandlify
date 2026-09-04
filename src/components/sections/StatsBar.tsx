import { Reveal } from '@/components/motion/Reveal';
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
    <section className="border-line bg-surface border-y" aria-label="ההתחייבויות שלנו">
      <Container>
        <Reveal
          as="ul"
          y={20}
          stagger={0.08}
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
        </Reveal>
      </Container>
    </section>
  );
}
