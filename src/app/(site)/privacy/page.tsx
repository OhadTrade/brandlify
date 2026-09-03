import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { Container } from '@/components/ui/Container';
import { Prose } from '@/components/ui/Prose';
import { contact, site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'מדיניות פרטיות',
  description: 'איזה מידע Brandlify אוספת, למה, כמה זמן הוא נשמר ומה הזכויות שלך לגביו.',
  alternates: { canonical: '/privacy' },
};

/**
 * DRAFT — pending review by a lawyer (Appendix A).
 *
 * Written to describe what this site actually does, not from a template: the
 * data listed here is exactly the columns in the `leads` table, the third
 * parties are exactly the services the code calls, and the retention and rights
 * sections follow the Privacy Protection Law as amended by Amendment 13 (in
 * force August 2025). It still needs legal sign-off before launch.
 */
export default function PrivacyPage() {
  const updated = '2 בספטמבר 2026';

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="מדיניות פרטיות"
        lead={`עודכן לאחרונה: ${updated}`}
        crumbs={[{ href: '/privacy', label: 'מדיניות פרטיות' }]}
      />

      <section className="section-y">
        <Container>
          <div className="border-line rounded-card mb-10 border border-dashed p-5">
            <p className="text-muted text-sm leading-relaxed">
              <strong className="text-fg">טיוטה לאישור.</strong> המסמך מתאר במדויק את מה שהאתר
              עושה בפועל, אך טרם עבר בדיקה משפטית. יש לאשר אותו מול עורך דין לפני ההשקה.
            </p>
          </div>

          <Prose>
            <h2>מי אנחנו</h2>
            <p>
              {site.name} (להלן &quot;אנחנו&quot;) מפעילה את האתר{' '}
              <span dir="ltr">{site.url}</span>. לכל פנייה בנושא פרטיות אפשר לכתוב אלינו לכתובת{' '}
              <a href={`mailto:${contact.email}`} dir="ltr">
                {contact.email}
              </a>{' '}
              או להתקשר ל־
              <a href={`tel:${contact.phoneE164}`} dir="ltr">
                {contact.phoneDisplay}
              </a>
              .
            </p>

            <h2>איזה מידע אנחנו אוספים</h2>
            <p>אנחנו אוספים שני סוגי מידע בלבד:</p>

            <h3>1. מידע שאתה מוסר לנו ביוזמתך</h3>
            <p>
              כשאתה שולח טופס יצירת קשר באתר, נשמרים אצלנו: השם, מספר הטלפון, כתובת האימייל (אם
              מילאת), סוג העסק, השירותים שסימנת שמעניינים אותך, תיאור הפרויקט שכתבת, וכן העמוד שממנו
              הגעת ופרטי הקמפיין שהביא אותך (UTM), אם קיימים. בנוסף נשמר תיעוד של מתן ההסכמה שלך
              ומועדה.
            </p>
            <p>
              <strong>מסירת המידע היא מרצון.</strong> אינך חייב למסור אותו, אך בלעדיו לא נוכל לחזור
              אליך.
            </p>

            <h3>2. מידע סטטיסטי על השימוש באתר</h3>
            <p>
              אנחנו משתמשים ב־Google Analytics כדי להבין אילו עמודים נצפים וכמה זמן. מידע זה מצטבר
              ואינו מיועד לזהות אותך אישית. אפשר לחסום אותו בהגדרות הדפדפן או באמצעות תוסף החסימה
              הרשמי של גוגל.
            </p>
            <p>
              <strong>איננו שומרים את כתובת ה־IP שלך</strong> יחד עם הפנייה. ההגנה מפני שליחות
              אוטומטיות נעשית באמצעות Cloudflare Turnstile, שירות שנועד להבחין בין אדם לרובוט בלי
              לעקוב אחריך בין אתרים.
            </p>

            <h2>למה אנחנו משתמשים במידע</h2>
            <ul>
              <li>כדי לחזור אליך בעקבות הפנייה, ולהכין הצעת מחיר.</li>
              <li>כדי לנהל את הקשר העסקי איתך אם החלטנו לעבוד יחד.</li>
              <li>כדי לשפר את האתר ואת השירות, על בסיס נתונים מצטברים.</li>
            </ul>
            <p>
              איננו מוכרים מידע, איננו משכירים אותו ואיננו מעבירים אותו לצדדים שלישיים לצורכי שיווק
              שלהם.
            </p>

            <h2>מי עוד רואה את המידע</h2>
            <p>המידע מאוחסן ומעובד אצל ספקי התשתית הבאים, ורק לצורך הפעלת האתר:</p>
            <ul>
              <li>
                <strong>Supabase</strong> — בסיס הנתונים שבו נשמרות הפניות. השרתים באיחוד האירופי.
              </li>
              <li>
                <strong>Vercel</strong> — אחסון והרצה של האתר.
              </li>
              <li>
                <strong>Resend</strong> — שליחת מיילי ההתראה והאישור.
              </li>
              <li>
                <strong>Google Analytics</strong> — מדידה סטטיסטית.
              </li>
              <li>
                <strong>Cloudflare</strong> — הגנה מפני שליחות אוטומטיות.
              </li>
            </ul>
            <p>
              חלק מהספקים מאחסנים מידע מחוץ לישראל. ההעברה נעשית לצורך מתן השירות בלבד ובכפוף למנגנוני
              ההגנה של אותם ספקים.
            </p>

            <h2>כמה זמן המידע נשמר</h2>
            <p>
              פנייה שלא הבשילה להתקשרות נשמרת עד 24 חודשים ולאחר מכן נמחקת. אם נעשתה התקשרות עסקית,
              המידע נשמר כל עוד נדרש לצורך אותה התקשרות ולתקופות שמחייב הדין (בעיקר דיני מס וחשבונאות).
            </p>

            <h2>אבטחת מידע</h2>
            <p>
              הגישה לפניות מוגבלת למשתמשים מזוהים בלבד. ברמת בסיס הנתונים מוגדרות הרשאות שמונעות קריאה
              של פניות ללא הזדהות, והתעבורה לאתר מוצפנת ב־HTTPS.
            </p>

            <h2>הזכויות שלך</h2>
            <p>לפי חוק הגנת הפרטיות, התשמ&quot;א-1981, עומדות לך הזכויות הבאות:</p>
            <ul>
              <li>לעיין במידע שנשמר עליך.</li>
              <li>לבקש לתקן מידע שאינו נכון, שלם או מעודכן.</li>
              <li>לבקש למחוק את המידע.</li>
              <li>לבקש שלא ייעשה במידע שימוש לצורך פנייה שיווקית.</li>
            </ul>
            <p>
              לממש כל אחת מהזכויות אפשר בפנייה לכתובת{' '}
              <a href={`mailto:${contact.email}`} dir="ltr">
                {contact.email}
              </a>
              . נשיב בתוך 30 יום.
            </p>

            <h2>עוגיות</h2>
            <p>
              האתר עצמו אינו משתמש בעוגיות לצורכי פרסום. עוגיות שנוצרות בדפדפן שלך שייכות לשירותי
              המדידה וההגנה שפורטו לעיל, וניתן לחסום אותן בהגדרות הדפדפן.
            </p>

            <h2>שינויים במדיניות</h2>
            <p>
              נעדכן את המסמך הזה אם ישתנה אופן השימוש במידע. תאריך העדכון האחרון מופיע בראש העמוד.
            </p>
          </Prose>
        </Container>
      </section>
    </>
  );
}
