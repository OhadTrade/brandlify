import { Reveal } from "@/components/motion/Reveal";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getServices } from "@/lib/queries";

export async function ServicesGrid() {
  const services = await getServices();
  if (services.length === 0) return null;

  return (
    <section
      data-flow="lift"
      className="section-y"
      aria-labelledby="services-heading"
    >
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="What we do"
          id="services-heading"
          title="חמישה שירותים, ספק אחד."
          subtitle="במקום לתאם בין מעצב, מפתח ומשווק. הכול יושב במקום אחד, ומדבר אותה שפה."
        />

        <Reveal as="ul" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.slug} className="group">
              <Link
                href={`/services/${service.slug}`}
                className="border-line bg-surface rounded-card hover:border-line-strong hover:shadow-lift relative flex h-full flex-col gap-4 border p-7 transition-[translate,scale,border-color,box-shadow] duration-200 ease-snap active:scale-[0.99] active:duration-75 motion-reduce:active:scale-100 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
              >
                {/* Gradient edge on hover. */}
                <span
                  aria-hidden
                  className="bg-brand pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                <span
                  aria-hidden
                  className="border-line chamfer text-violet group-hover:text-magenta flex h-12 w-12 items-center justify-center border bg-[rgb(131_47_240/0.08)] transition-colors duration-300"
                >
                  <Icon name={service.icon ?? "globe"} className="h-6 w-6" />
                </span>

                <h3 className="text-h3 text-fg">{service.title}</h3>
                <p className="text-muted flex-1 text-[0.9375rem] leading-relaxed">
                  {service.short_desc}
                </p>

                <span className="text-pink flex items-center gap-2 text-sm font-semibold">
                  לפרטים
                  <Icon
                    name="arrow"
                    className="h-4 w-4 transition-transform duration-200 ease-snap group-hover:-translate-x-1 motion-reduce:transform-none"
                  />
                </span>
              </Link>
            </li>
          ))}
        </Reveal>

        <div>
          <Button href="/services" variant="secondary" size="lg">
            לכל השירותים שלנו
            <Icon name="arrow" className="h-5 w-5" />
          </Button>
        </div>
      </Container>
    </section>
  );
}
