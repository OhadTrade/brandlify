import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { Container } from '@/components/ui/Container';
import { Prose } from '@/components/ui/Prose';
import { contact, site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'תנאי שימוש',
  description: 'התנאים לשימוש באתר Brandlify.',
  alternates: { canonical: '/terms' },
};

/**
 * DRAFT — pending review by a lawyer (Appendix A).
 *
 * Scoped to using the website. It deliberately does NOT try to be the client
 * services agreement: that is a signed contract per project, and conflating the
 * two would create an argument about which document governs the work.
 */
export default function TermsPage() {
  const updated = '2 בספטמבר 2026';

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="תנאי שימוש"
        lead={`עודכן לאחרונה: ${updated}`}
        crumbs={[{ href: '/terms', label: 'תנאי שימוש' }]}
      />

      <section className="section-y">
        <Container>
          <div className="border-line rounded-card mb-10 border border-dashed p-5">
            <p className="text-muted text-sm leading-relaxed">
              <strong className="text-fg">טיוטה לאישור.</strong> טרם עברה בדיקה משפטית. יש לאשר מול
              עורך דין לפני ההשקה.
            </p>
          </div>

          <Prose>
            <h2>1. כללי</h2>
            <p>
              התנאים האלה חלים על השימוש באתר <span dir="ltr">{site.url}</span> המופעל על ידי{' '}
              {site.name}. שימוש באתר מהווה הסכמה להם. אם אינך מסכים — אנא הימנע משימוש באתר.
            </p>
            <p>
              המסמך מנוסח בלשון זכר מטעמי נוחות בלבד, ומתייחס לכל המגדרים.
            </p>

            <h2>2. מה המסמך הזה לא</h2>
            <p>
              <strong>
                תנאים אלה חלים על השימוש באתר בלבד ואינם הסכם ההתקשרות לשירותים.
              </strong>{' '}
              כל פרויקט מעוגן בהסכם נפרד וחתום, שבו נקבעים ההיקף, לוח הזמנים, התמורה, האחריות ותנאי
              הביטול. במקרה של סתירה — ההסכם החתום גובר.
            </p>

            <h2>3. תוכן האתר</h2>
            <p>
              המידע באתר, לרבות תיאורי שירותים ומאמרים, הוא מידע כללי בלבד ואינו מהווה ייעוץ מקצועי
              המותאם לעסק מסוים. אנחנו משתדלים לשמור על מידע מדויק ומעודכן, אך איננו מתחייבים לכך.
            </p>

            <h2>4. פנייה דרך האתר</h2>
            <p>
              משלוח טופס באתר אינו יוצר התקשרות ואינו מחייב אף צד. הוא בקשה ליצירת קשר בלבד. אנחנו
              מתחייבים להשיב לכל פנייה בתוך 24-48 שעות בימי עסקים, גם אם התשובה היא שאיננו הספק
              המתאים.
            </p>
            <p>
              עליך למסור פרטים נכונים ולא להזין פרטים של אדם אחר ללא הרשאתו.
            </p>

            <h2>5. קניין רוחני</h2>
            <p>
              כל הזכויות בעיצוב האתר, בקוד, בלוגו, בשם {site.name} ובתכנים המקוריים שבו שמורות לנו.
              אין להעתיק, לשכפל, להפיץ או לעשות שימוש מסחרי בהם ללא אישור בכתב.
            </p>
            <p>
              עבודות המוצגות בתיק העבודות מוצגות באישור הלקוחות. הזכויות בנכסים של כל לקוח שייכות
              לאותו לקוח.
            </p>

            <h2>6. שימוש אסור</h2>
            <ul>
              <li>ניסיון לפגוע באבטחת האתר, לחדור אליו או לשבש את פעילותו.</li>
              <li>שליחה אוטומטית או המונית של טפסים.</li>
              <li>איסוף מידע מהאתר באמצעים אוטומטיים ללא רשות.</li>
              <li>שימוש באתר לכל מטרה בלתי חוקית.</li>
            </ul>

            <h2>7. קישורים לאתרים אחרים</h2>
            <p>
              האתר עשוי לכלול קישורים לאתרים חיצוניים. איננו אחראים לתוכנם, למדיניות הפרטיות שלהם או
              לזמינותם.
            </p>

            <h2>8. אחריות</h2>
            <p>
              האתר מוצע כמות שהוא. איננו אחראים לנזק שייגרם משימוש באתר או מהסתמכות על מידע כללי
              המופיע בו. אין באמור כדי לגרוע מהאחריות שאנחנו נוטלים על עצמנו בהסכם ההתקשרות החתום.
            </p>

            <h2>9. פרטיות ונגישות</h2>
            <p>
              הטיפול במידע אישי מפורט ב<a href="/privacy">מדיניות הפרטיות</a>. מצב הנגישות של האתר
              מפורט ב<a href="/accessibility">הצהרת הנגישות</a>.
            </p>

            <h2>10. שינויים</h2>
            <p>
              אנחנו רשאים לעדכן את התנאים מעת לעת. הנוסח המחייב הוא זה המפורסם באתר, ותאריך העדכון
              מופיע בראש העמוד.
            </p>

            <h2>11. דין וסמכות שיפוט</h2>
            <p>
              על תנאים אלה יחולו דיני מדינת ישראל. סמכות השיפוט הבלעדית נתונה לבתי המשפט המוסמכים
              במחוז תל אביב.
            </p>

            <h2>12. יצירת קשר</h2>
            <p>
              לשאלות בנוגע לתנאים:{' '}
              <a href={`mailto:${contact.email}`} dir="ltr">
                {contact.email}
              </a>{' '}
              ·{' '}
              <a href={`tel:${contact.phoneE164}`} dir="ltr">
                {contact.phoneDisplay}
              </a>
            </p>
          </Prose>
        </Container>
      </section>
    </>
  );
}
