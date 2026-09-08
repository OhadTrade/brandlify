import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { contact, whatsappUrl } from '@/lib/site';
import { getContent } from '@/lib/queries';
import s from './editorial.module.css';

export async function FinalCta() {
  const cta = await getContent('home.cta_final');
  return <section className={s.closing} aria-labelledby="cta-heading">
    <Container className={s.closingLayout}>
      <div>
        <p className="font-latin text-muted mb-6 text-xs tracking-widest" dir="ltr">YOUR NEXT CHAPTER</p>
        <h2 id="cta-heading" className="text-h2 text-fg">{cta.title}</h2>
        <p className="text-muted mt-6 max-w-xl text-lg leading-relaxed">{cta.body}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/contact" size="lg">{cta.cta_primary}<Icon name="arrow" className="h-5 w-5" /></Button>
          <Button href={whatsappUrl()} size="lg" variant="secondary"><Icon name="whatsapp" className="h-5 w-5" />{cta.cta_secondary}</Button>
        </div>
        <p className="text-muted mt-6 text-sm">או פשוט להתקשר: <a href={`tel:${contact.phoneE164}`} className="underline underline-offset-4"><span dir="ltr">{contact.phoneDisplay}</span></a></p>
      </div>
      <Image src="/brand/flowing-b.webp" alt="" width={420} height={420} sizes="(max-width:900px) 180px, 35vw" />
    </Container>
  </section>;
}
