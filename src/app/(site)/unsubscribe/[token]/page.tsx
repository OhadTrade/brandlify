import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Prose } from '@/components/ui/Prose';
import { unsubscribeByToken } from '@/lib/marketing';
import { contact } from '@/lib/site';

/**
 * The page an advertising email's opt-out link points at.
 *
 * It asks for one click rather than acting on arrival. That is not friction for
 * its own sake: mail clients and security scanners fetch every link in a
 * message, so a page that unsubscribed on GET would remove people who never
 * touched it. The confirmation is a POST, which nothing prefetches.
 *
 * Mail clients that offer their own unsubscribe button do not come here at all.
 * They POST to /api/unsubscribe/[token], which removes the recipient with no
 * page in between.
 */

export const metadata: Metadata = {
  title: 'הסרה מרשימת התפוצה',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function UnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ done?: string }>;
}) {
  const { token } = await params;
  const { done } = await searchParams;

  async function confirm() {
    'use server';
    const { redirect } = await import('next/navigation');
    await unsubscribeByToken(token);
    // Redirect either way. Whether a token matched is not something an
    // unauthenticated visitor needs told, and the outcome they care about —
    // "stop emailing me" — is true in both cases.
    redirect(`/unsubscribe/${token}?done=1`);
  }

  const removed = done === '1';

  return (
    <>
      <PageHero
        eyebrow="Email"
        title={removed ? 'הוסרת מרשימת התפוצה' : 'הסרה מרשימת התפוצה'}
        lead={
          removed
            ? 'לא נשלח אליך יותר דיוור פרסומי.'
            : 'לחיצה אחת ואנחנו מפסיקים לשלוח לך דיוור פרסומי.'
        }
        crumbs={[{ href: '/', label: 'דף הבית' }]}
      />

      <section className="section-y">
        <Container>
          <Prose>
            {removed ? (
              <>
                <p>
                  ההסרה נרשמה. מכאן והלאה לא תקבל מאיתנו טיפים, מדריכים או מבצעים.
                </p>
                <p>
                  זה לא משפיע על תשובה לפנייה שאתה שולח לנו, ולא על התכתבות בנוגע לעבודה קיימת. אם
                  תרצה לחזור לרשימה בעתיד, אפשר פשוט לכתוב לנו לכתובת{' '}
                  <a href={`mailto:${contact.email}`} dir="ltr">
                    {contact.email}
                  </a>
                  .
                </p>
              </>
            ) : (
              <>
                <p>
                  אנחנו שולחים דיוור פרסומי רק למי שאישר את זה בטופס באתר. אם זה כבר לא מעניין אותך,
                  הכפתור למטה מסיר אותך מיד.
                </p>
                <p>
                  שים לב: ההסרה חלה על דיוור פרסומי בלבד. תשובות לפניות שאתה שולח לנו, והתכתבות
                  בנוגע לעבודה קיימת, ימשיכו להגיע כרגיל.
                </p>
              </>
            )}
          </Prose>

          {removed ? (
            <div className="mt-10">
              <Button href="/" variant="secondary" size="lg">
                חזרה לאתר
              </Button>
            </div>
          ) : (
            <form action={confirm} className="mt-10">
              <button
                type="submit"
                className="bg-cta rounded-btn font-heading ease-snap inline-flex h-12 items-center px-7 text-base font-bold text-white transition-[box-shadow,scale] duration-200 active:scale-[0.97] active:duration-75 motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                הסר אותי מרשימת התפוצה
              </button>
            </form>
          )}
        </Container>
      </section>
    </>
  );
}
