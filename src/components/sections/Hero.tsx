import { HeroScrollFade } from '@/components/hero/HeroScrollFade';
import { MarkStill } from '@/components/hero/MarkStill';
import { TextReveal } from '@/components/motion/TextReveal';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { getContent } from '@/lib/queries';

/**
 * Hero — full-bleed visual with the copy laid over it.
 *
 * The composition is taken from the interactive hero reference: the 3D object
 * fills the section, the copy sits on top of it, a two-axis vignette darkens the
 * edges and the foot so the text stays readable, and the copy fades out on
 * scroll to uncover the object.
 *
 * What is deliberately NOT taken from it:
 *
 *   - Its Spline scene. It is a ~1 MB runtime pulling a scene file from a
 *     third-party CDN, in the LCP region, and it is a generic galaxy rather than
 *     this brand. The mark here is built from the logo's own measured geometry
 *     and keeps its pointer interaction, which is the point of the hero.
 *   - Its navbar. This site already has one: RTL, Hebrew, keyboard accessible,
 *     with the magnetic CTA and the mobile overlay. A second one would be a
 *     regression on every count.
 *   - Its screenshot band. There is no product screenshot to show; the sections
 *     below already carry the story.
 */
export async function Hero() {
  const hero = await getContent('home.hero');
  const [firstLine, ...restLine] = hero.title.split(' שמייצרת ');
  const hasSplit = restLine.length > 0;

  return (
    // Pulled up under the fixed navbar so the visual runs behind it while it is
    // still transparent.
    <section
      className="hero-diagonal relative -mt-(--nav-height) flex min-h-svh flex-col justify-center overflow-hidden"
    >
      {/*
        The mark, mobile only.

        On desktop it is no longer the hero's to own: it lives on the sticky
        stage that spans this section and the two after it, so it survives the
        hero instead of dying with it. Below the breakpoint there is no stage,
        no canvas and no scroll re-framing, so the hero keeps its own band with
        the still image in it.

        Two earlier attempts are worth recording. A fixed 50/50 split broke at
        375x667, where the copy alone is taller than half the viewport and grew
        back up into the mark. Giving the band `flex-1` and the image
        `max-h-full` looked correct but is not: a percentage max-height against
        a flex item sized by flex-grow does not reliably constrain, so the image
        kept its intrinsic height and pushed the second button off the bottom of
        the screen. A definite height is the version that holds.
      */}
      <div
        className="relative h-[42svh] w-full shrink-0 pt-(--nav-height) pb-3 lg:hidden"
        aria-hidden
      >
        <MarkStill />
      </div>

      {/*
        The seam.

        A hairline along the same 45deg the mask is cut on, so the edge reads as
        a deliberate cut rather than as an image that happens to end. It is the
        one place on the page where the brand gradient is a line and not a fill,
        which is the point: every chamfer in this design system is 45deg, and
        this is that angle at the scale of the whole screen.

        Desktop only. Below the breakpoint the mark has its own band and there
        is no diagonal to draw.
      */}
      <div aria-hidden className="hero-diagonal-seam pointer-events-none absolute inset-0" />

      {/*
        Vignette. Symmetrical left-to-right on purpose: a CSS gradient does not
        flip with `dir`, and a one-sided version would darken the wrong edge the
        moment anything is ever rendered LTR. The horizontal pass is lighter
        than it was, because the mark no longer runs under the copy on desktop -
        the diagonal keeps them apart, so the darkening only has to soften the
        outer edges rather than rescue readability. The vertical pass hands the
        section off to the band below without a seam.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(to right, rgb(8 6 14 / 0.8), rgb(8 6 14 / 0.22) 24%, transparent 46%, rgb(8 6 14 / 0.22) 76%, rgb(8 6 14 / 0.8)),
            linear-gradient(to bottom, rgb(8 6 14 / 0.55), transparent 22%, transparent 52%, rgb(8 6 14 / 0.96))
          `,
        }}
      />

      <Container className="relative z-10 shrink-0 pb-14 sm:pb-20 lg:pt-[calc(var(--nav-height)+3rem)] lg:pb-32">
        <HeroScrollFade>
          <div className="flex max-w-2xl flex-col items-start gap-7">
            <p className="text-label font-latin text-muted border-line rounded-btn glass border px-3 py-2 uppercase">
              {hero.services_line}
            </p>

            {/* The only element on the site that starts hidden. It is the LCP
                element, so the reveal is short and the safety net in globals.css
                shows it at 900ms regardless of whether the engine arrives. */}
            <TextReveal as="h1" className="text-h1 text-fg" hideUntilReady duration={0.9}>
              {hasSplit ? (
                <>
                  {firstLine}{' '}
                  <span className="text-brand-gradient">שמייצרת {restLine.join(' שמייצרת ')}</span>
                </>
              ) : (
                hero.title
              )}
            </TextReveal>

            <p className="text-muted max-w-xl text-[1.125rem] leading-relaxed">{hero.subtitle}</p>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <Button href="/contact" size="lg">
                {hero.cta_primary}
                <Icon name="arrow" className="h-5 w-5" />
              </Button>
              <Button href="/portfolio" size="lg" variant="secondary">
                {hero.cta_secondary}
              </Button>
            </div>
          </div>
        </HeroScrollFade>
      </Container>
    </section>
  );
}
