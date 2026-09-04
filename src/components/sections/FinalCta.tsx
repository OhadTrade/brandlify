import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { contact, whatsappUrl } from '@/lib/site';
import { getContent } from '@/lib/queries';

export async function FinalCta() {
  const cta = await getContent('home.cta_final');

  return (
    <section
      data-flow="lift" className="relative overflow-hidden py-24 md:py-32" aria-labelledby="cta-heading">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 100%, rgb(131 47 240 / 0.35), rgb(230 53 240 / 0.12) 45%, transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(230 53 240 / 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgb(230 53 240 / 0.6) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'linear-gradient(to top, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
        }}
      />

      <Container className="relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center">
          <h2 id="cta-heading" className="text-h2 text-fg">
            {cta.title}
          </h2>
          <p className="text-muted text-[1.0625rem] leading-relaxed">{cta.body}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button href="/contact" size="lg">
              {cta.cta_primary}
              <Icon name="arrow" className="h-5 w-5" />
            </Button>
            <Button
              href={whatsappUrl()}
              size="lg"
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" className="h-5 w-5" />
              {cta.cta_secondary}
            </Button>
          </div>

          <p className="text-muted text-sm">
            או פשוט להתקשר:{' '}
            <a
              href={`tel:${contact.phoneE164}`}
              className="text-pink font-semibold underline-offset-4 hover:underline"
            >
              <span dir="ltr">{contact.phoneDisplay}</span>
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
