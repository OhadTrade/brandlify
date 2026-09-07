import Link from 'next/link';
import styles from '@/components/home/home.module.css';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getServices } from '@/lib/queries';

export async function HomeServices() {
  const services = await getServices();
  if (services.length === 0) return null;

  return (
    <section className="section-y" aria-labelledby="services-heading">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          id="services-heading"
          title="חמישה שירותים, ספק אחד."
          subtitle="במקום לתאם בין מעצב, מפתח ומשווק. הכול יושב במקום אחד, ומדבר אותה שפה."
        />
        <ul className={styles.servicesGrid}>
          {services.map((service) => (
            <li key={service.slug} data-home-service>
              <Link href={`/services/${service.slug}`} className={styles.serviceCard}>
                <span className={styles.serviceIcon} aria-hidden>
                  <Icon name={service.icon ?? 'globe'} className="h-6 w-6" />
                </span>
                <h3 className="text-h3 text-fg">{service.title}</h3>
                <p className={styles.serviceDescription}>{service.short_desc}</p>
                <span className={styles.serviceLink}>
                  לפרטים
                  <Icon name="arrow" className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
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
