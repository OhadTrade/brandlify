import { MarkStill } from '@/components/hero/MarkStill';
import styles from '@/components/home/home.module.css';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { getContent } from '@/lib/queries';

export async function HomeHero() {
  const hero = await getContent('home.hero');
  const [firstLine, ...restLine] = hero.title.split(' שמייצרת ');

  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroLight} aria-hidden />
      <Container className={styles.heroLayout}>
        <div className={styles.heroCopy}>
          <p className={styles.servicesLine}>{hero.services_line}</p>
          {/* Keep the LCP heading visible in server HTML and during hydration. */}
          <h1 id="home-title" className={styles.heroTitle}>
            {restLine.length > 0 ? (
              <>
                {firstLine}{' '}
                <span>שמייצרת {restLine.join(' שמייצרת ')}</span>
              </>
            ) : hero.title}
          </h1>
          <p className={styles.heroSubtitle}>{hero.subtitle}</p>
          <div className={styles.heroActions}>
            <Button href="/contact" size="lg" className={styles.primaryAction}>
              {hero.cta_primary}
              <Icon name="arrow" className="h-5 w-5" />
            </Button>
            <Button href="/portfolio" size="lg" variant="secondary" className={styles.secondaryAction}>
              {hero.cta_secondary}
            </Button>
          </div>
        </div>
        <div className={styles.mobileMark} aria-hidden>
          <MarkStill />
        </div>
      </Container>
    </section>
  );
}
