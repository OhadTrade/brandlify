import { Parallax } from "@/components/motion/Parallax";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { getContent } from "@/lib/queries";

/** One phone in the fanned set. */
function Phone({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`border-line-strong bg-elevated shadow-lift w-40 shrink-0 overflow-hidden rounded-[20px] border-2 sm:w-44 ${className ?? ""}`}
    >
      <div className="flex justify-center py-2.5">
        <span className="h-1 w-12 rounded-full bg-[rgb(250_250_252/0.2)]" />
      </div>
      <div className="flex flex-col gap-2.5 px-3.5 pb-5">{children}</div>
    </div>
  );
}

/** A chat/notification bubble inside a phone. */
function Bubble({
  tone = "muted",
  width,
}: {
  tone?: "muted" | "brand";
  width: string;
}) {
  return (
    <span
      className={`block h-7 rounded-[8px] ${
        tone === "brand"
          ? "bg-cta ms-auto"
          : "border-line border bg-[rgb(250_250_252/0.05)]"
      }`}
      style={{ width }}
    />
  );
}

/**
 * Automations.
 *
 * Three fanned phones. Stage 6 gives them staggered parallax and loops the
 * notification bubbles in; the static arrangement is the mobile tier.
 */
export async function Automations() {
  const data = await getContent("home.automations");

  return (
    <section
      data-flow="lift"
      className="section-y bg-surface border-line border-y"
      aria-labelledby="automations-heading"
    >
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-7">
            <p className="text-label font-latin text-magenta flex items-center gap-3 uppercase">
              <span aria-hidden className="bg-brand h-px w-8" />
              Automations
            </p>
            <h2 id="automations-heading" className="text-h2 text-fg">
              {data.title}
            </h2>
            <p className="text-muted text-[1.0625rem] leading-relaxed">
              {data.body}
            </p>

            <ul className="flex flex-wrap gap-2.5">
              {data.items.map((item) => (
                <li
                  key={item}
                  className="border-line text-fg rounded-btn glass border px-4 py-2 text-sm font-semibold"
                >
                  {item}
                </li>
              ))}
            </ul>

            <div>
              <Button
                href="/services/automations"
                size="lg"
                variant="secondary"
              >
                איך זה עובד אצלנו
                <Icon name="arrow" className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="relative" aria-hidden>
            <div
              className="pointer-events-none absolute inset-0 m-auto h-[70%] w-[80%] rounded-full opacity-60 blur-[90px]"
              style={{
                background:
                  "radial-gradient(circle, rgb(230 53 240 / 0.3), rgb(131 47 240 / 0.22) 50%, transparent 72%)",
              }}
            />
            {/* Three speeds, so the fan separates as the section passes.
                Desktop only — below 1024px this is a static arrangement. */}
            <div className="relative flex items-center justify-center gap-3 sm:gap-4">
              <Parallax yPercent={14} className="hidden sm:block">
                <Phone className="-rotate-6">
                  <Bubble width="70%" />
                  <Bubble tone="brand" width="55%" />
                  <Bubble width="80%" />
                </Phone>
              </Parallax>

              <Parallax yPercent={-10} className="z-10">
                <Phone className="-translate-y-4">
                  <Bubble width="85%" />
                  <Bubble tone="brand" width="60%" />
                  <Bubble width="70%" />
                  <Bubble tone="brand" width="45%" />
                </Phone>
              </Parallax>

              <Parallax yPercent={18} className="hidden lg:block">
                <Phone className="rotate-6">
                  <Bubble width="60%" />
                  <Bubble width="80%" />
                  <Bubble tone="brand" width="50%" />
                </Phone>
              </Parallax>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
