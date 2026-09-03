import Link from 'next/link';
import { BrokenMark } from '@/components/hero/BrokenMark';
import { SiteShell } from '@/components/layout/SiteShell';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { navItems } from '@/lib/site';

export const metadata = {
  title: '404 — הדף לא נמצא',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <SiteShell>
    <section className="relative flex min-h-[70vh] items-center overflow-hidden py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgb(131 47 240 / 0.35), transparent 70%)',
        }}
      />

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <p className="font-latin text-brand-gradient text-7xl font-extrabold md:text-8xl" dir="ltr">
              404
            </p>
            <h1 className="text-h2 text-fg">הדף הזה התפרק לרסיסים.</h1>
            <p className="text-muted max-w-md text-[1.0625rem] leading-relaxed">
              הקישור שגוי, או שהעמוד הוסר. אלה הדפים שכן קיימים:
            </p>

            <ul className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="border-line text-fg rounded-btn hover:border-magenta hover:shadow-glow-magenta flex items-center gap-2 border px-4 py-2 text-sm font-semibold transition-[border-color,box-shadow] duration-200 ease-snap"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Button href="/" size="lg">
                חזרה לדף הבית
                <Icon name="arrow" className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <BrokenMark />
        </div>
      </Container>
    </section>
    </SiteShell>
  );
}
