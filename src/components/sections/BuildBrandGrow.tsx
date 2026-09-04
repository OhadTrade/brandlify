import type { ReactNode } from "react";
import { PinnedStages } from "@/components/motion/PinnedStages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { getContent } from "@/lib/queries";

/**
 * BUILD · BRAND · GROW — the five stages, as cards.
 *
 * Layout follows the shadcn features card: a decorator holding the icon, then
 * the title, then the copy, all centred. Two departures:
 *
 *   - No grid in the decorator. The reference draws a 24px line grid behind the
 *     icon; that was removed here for the same reason it was removed from the
 *     hero — it competes with the mark's own geometry.
 *   - The cards ride the pinned horizontal track rather than a static 3-column
 *     grid. There are five stages, which a 3-column grid breaks into 3 + 2, and
 *     the sideways scrub is what makes this section the one people remember.
 *
 * Below 1024px it is a plain vertical stack of the same cards.
 */

const STAGE_ICONS: Record<string, string> = {
  BUILD: "layers",
  DESIGN: "palette",
  RANK: "trending",
  PROMOTE: "megaphone",
  AUTOMATE: "workflow",
};

/**
 * The icon plate.
 *
 * Keeps the reference's radial mask — it is what stops the decoration having a
 * hard edge — but fills it with a brand glow instead of grid lines, and puts
 * the icon in the same 45deg chamfered plate the service cards use.
 */
function CardDecorator({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden
      className="relative mx-auto size-28 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgb(131 47 240 / 0.28), rgb(230 53 240 / 0.08) 55%, transparent 75%)",
        }}
      />
      <div className="border-line chamfer text-violet bg-base absolute inset-0 m-auto flex size-14 items-center justify-center border">
        {children}
      </div>
    </div>
  );
}

export async function BuildBrandGrow() {
  const data = await getContent("home.build_brand_grow");

  return (
    <section
      data-flow="fade"
      className="relative flex flex-col justify-center overflow-hidden py-20 md:py-28 lg:min-h-svh lg:py-0"
      aria-labelledby="bbg-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[500px] -translate-y-1/2 opacity-40 blur-[130px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgb(83 19 176 / 0.5), transparent 65%)",
        }}
      />

      <Container className="relative flex flex-col gap-10 lg:gap-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <p
            className="font-latin text-brand-gradient text-2xl font-extrabold tracking-[0.12em] sm:text-3xl md:text-4xl"
            dir="ltr"
          >
            {data.eyebrow}
          </p>
          <h2 id="bbg-heading" className="text-h2 text-fg text-balance">
            {data.title}
          </h2>
        </div>

        <PinnedStages
          className="relative"
          trackClassName="mx-auto grid max-w-sm gap-6 lg:mx-0 lg:flex lg:w-max lg:max-w-none lg:gap-6 lg:pe-[12vw] lg:will-change-transform"
        >
          {data.stages.map((stage) => (
            <li
              key={stage.key}
              data-stage
              className="will-change-transform lg:w-[clamp(280px,24vw,340px)] lg:shrink-0"
            >
              <Card className="relative h-full overflow-hidden text-center">
                {/*
                  The glow for the active stage. A separate layer whose opacity
                  the timeline animates, rather than animating box-shadow or
                  border-color on the card itself — opacity is composited, those
                  are not, and this runs on five elements during a scrub.
                */}
                <span
                  aria-hidden
                  data-stage-glow
                  className="pointer-events-none absolute inset-0 opacity-0"
                >
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 70% 45% at 50% 0%, rgb(131 47 240 / 0.30), transparent 70%)",
                    }}
                  />
                  <span className="bg-brand absolute inset-x-0 top-0 h-px" />
                  <span
                    className="rounded-card absolute inset-0"
                    style={{
                      boxShadow: "inset 0 0 0 1px rgb(230 53 240 / 0.45)",
                    }}
                  />
                </span>

                <div className="relative">
                  <CardHeader className="pb-3">
                    <CardDecorator>
                      <Icon
                        name={STAGE_ICONS[stage.key] ?? "layers"}
                        className="size-6"
                      />
                    </CardDecorator>

                    {/* The stage name only. It used to carry an "01 ·" prefix;
                        the cards are already in order and already numbered by
                        their position on the track, so the counter was
                        decoration that made every card read the same. */}
                    <p className="font-latin text-muted text-label mt-5 uppercase">
                      <span dir="ltr">{stage.key}</span>
                    </p>

                    <CardTitle className="mt-1">{stage.title}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted text-sm leading-relaxed text-balance">
                      {stage.description}
                    </p>
                  </CardContent>
                </div>
              </Card>
            </li>
          ))}
        </PinnedStages>
      </Container>
    </section>
  );
}
