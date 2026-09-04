import { Parallax } from "@/components/motion/Parallax";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { getContent } from "@/lib/queries";

/**
 * "A site that doesn't just look good."
 *
 * The two device layers drift at different speeds as the section passes — the
 * screen lags the scroll, the phone leads it — which is what reads as depth.
 * Desktop only, by the engine's tier rule; below 1024px and under reduced
 * motion the composition is simply static, which is how it was designed.
 */
export async function Split() {
  const split = await getContent("home.split");

  return (
    <section
      data-flow="lift"
      className="section-y bg-surface border-line border-y"
      aria-labelledby="split-heading"
    >
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-7">
            <h2 id="split-heading" className="text-h2 text-fg">
              אתר שלא רק נראה טוב.{" "}
              <span className="text-brand-gradient">אתר שמביא לקוחות.</span>
            </h2>
            <p className="text-muted text-[1.0625rem] leading-relaxed">
              {split.body}
            </p>

            <ul className="grid gap-4 sm:grid-cols-2">
              {split.points.map((point) => (
                <li key={point.title} className="flex gap-3">
                  <span
                    aria-hidden
                    className="bg-cta mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                  >
                    <Icon
                      name="check"
                      className="h-3.5 w-3.5"
                      strokeWidth={3}
                    />
                  </span>
                  <span>
                    <span className="text-fg block font-semibold">
                      {point.title}
                    </span>
                    <span className="text-muted block text-sm leading-relaxed">
                      {point.description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div>
              <Button href="/contact" size="lg">
                בואו נבנה לך אחד
                <Icon name="arrow" className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Layered device mock, built from CSS — no image weight. */}
          <div className="relative mx-auto w-full max-w-lg" aria-hidden>
            <div
              className="pointer-events-none absolute inset-0 m-auto h-[70%] w-[70%] rounded-full opacity-60 blur-[90px]"
              style={{
                background:
                  "radial-gradient(circle, rgb(131 47 240 / 0.4), rgb(230 53 240 / 0.15) 50%, transparent 72%)",
              }}
            />

            {/* Browser. Forced LTR: browser chrome reads left-to-right in every
                locale, so the traffic lights belong on the left. */}
            <Parallax yPercent={7}>
              <div
                dir="ltr"
                className="border-line bg-elevated rounded-card shadow-float relative overflow-hidden border"
              >
                <div className="border-line flex items-center gap-1.5 border-b bg-[rgb(8_6_14/0.6)] px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgb(250_250_252/0.16)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgb(250_250_252/0.16)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgb(250_250_252/0.16)]" />
                  <span className="border-line ms-3 h-4 flex-1 rounded-full border bg-[rgb(250_250_252/0.04)]" />
                </div>
                <div className="flex flex-col gap-3 p-6">
                  <span className="bg-brand h-3 w-2/5 rounded-full opacity-80" />
                  <span className="h-2 w-4/5 rounded-full bg-[rgb(250_250_252/0.12)]" />
                  <span className="h-2 w-3/5 rounded-full bg-[rgb(250_250_252/0.12)]" />
                  <span className="bg-cta mt-2 h-8 w-32 rounded-[4px]" />
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <span className="border-line h-16 rounded-[4px] border bg-[rgb(250_250_252/0.03)]" />
                    <span className="border-line h-16 rounded-[4px] border bg-[rgb(250_250_252/0.03)]" />
                    <span className="border-line h-16 rounded-[4px] border bg-[rgb(250_250_252/0.03)]" />
                  </div>
                </div>
              </div>
            </Parallax>

            {/* Phone — moves against the screen, not with it. */}
            <Parallax
              yPercent={-18}
              className="absolute -bottom-8 end-4 z-10 w-32 sm:w-36"
            >
              <div className="border-line-strong bg-elevated shadow-lift w-full overflow-hidden rounded-[18px] border-2">
                <div className="flex justify-center py-2">
                  <span className="h-1 w-10 rounded-full bg-[rgb(250_250_252/0.2)]" />
                </div>
                <div className="flex flex-col gap-2 px-3 pb-4">
                  <span className="bg-brand h-2.5 w-3/5 rounded-full opacity-80" />
                  <span className="h-1.5 w-full rounded-full bg-[rgb(250_250_252/0.12)]" />
                  <span className="h-1.5 w-4/5 rounded-full bg-[rgb(250_250_252/0.12)]" />
                  <span className="bg-cta mt-1 h-6 w-full rounded-[3px]" />
                  <span className="border-line h-10 rounded-[3px] border bg-[rgb(250_250_252/0.03)]" />
                </div>
              </div>
            </Parallax>
          </div>
        </div>
      </Container>
    </section>
  );
}
