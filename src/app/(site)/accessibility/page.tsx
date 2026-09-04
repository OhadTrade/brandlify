import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { Container } from '@/components/ui/Container';
import { Prose } from '@/components/ui/Prose';
import { contact, site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'הצהרת נגישות',
  description: 'מצב הנגישות של אתר Brandlify, ההתאמות שבוצעו ודרכי הפנייה לרכז הנגישות.',
  alternates: { canonical: '/accessibility' },
};

/**
 * Accessibility statement, required of an Israeli business site alongside
 * conformance with IS 5568 at level AA.
 *
 * Every item listed here is something actually implemented in this codebase —
 * the contrast figures come from `npm run contrast`, the reduced-motion
 * behaviour from the animation engine's tier rules.
 *
 * The coordinator is the owner. In a one-person business that is the honest
 * answer, and the regulations ask for a named person with contact details, not
 * for a dedicated role.
 */
export default function AccessibilityPage() {
  const updated = '2 בספטמבר 2026';

  return (
    <>
      <PageHero
        eyebrow="Accessibility"
        title="הצהרת נגישות"
        lead={`עודכן לאחרונה: ${updated}`}
        crumbs={[{ href: '/accessibility', label: 'הצהרת נגישות' }]}
      />

      <section className="section-y">
        <Container>
          <Prose>
            <h2>המחויבות שלנו</h2>
            <p>
              ב־{site.name} אנחנו רואים בנגישות חלק מהמקצוע ולא תוספת. אנחנו פועלים כדי שכל אדם, לרבות
              אנשים עם מוגבלות, יוכל להשתמש באתר הזה באופן עצמאי ונוח.
            </p>

            <h2>רמת הנגישות</h2>
            <p>
              האתר נבנה בהתאם לתקן הישראלי <strong>ת&quot;י 5568</strong> ברמה{' '}
              <strong>AA</strong>, המבוסס על הנחיות <span dir="ltr">WCAG 2.1</span>, ובהתאם לתקנות
              שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע&quot;ג-2013.
            </p>

            <h2>מה בוצע בפועל</h2>
            <ul>
              <li>
                <strong>ניגודיות.</strong> כל שילובי הטקסט והרקע נבדקים אוטומטית בכל בנייה של האתר
                ועומדים ביחס של 4.5:1 לפחות. הטקסט המשני עומד על 6.6:1 ומעלה.
              </li>
              <li>
                <strong>ניווט מלא במקלדת.</strong> אפשר להגיע לכל רכיב פעיל בעזרת מקש Tab, עם סימון
                מיקוד ברור ובולט. בראש כל עמוד קיים קישור &quot;דילוג לתוכן המרכזי&quot;.
              </li>
              <li>
                <strong>הפחתת תנועה.</strong> אם הגדרת במערכת ההפעלה בקשה לצמצום אנימציות, כל
                האנימציות באתר — כולל אפקטי הגלילה והאלמנט התלת־ממדי — מושבתות לחלוטין. שום תוכן לא
                מוסתר בהמתנה לאנימציה.
              </li>
              <li>
                <strong>מבנה סמנטי.</strong> כותרות בהיררכיה תקינה, אזורי ניווט מסומנים, וטפסים עם
                תוויות מקושרות.
              </li>
              <li>
                <strong>טקסט חלופי</strong> לכל תמונה נושאת מידע. תמונות דקורטיביות מסומנות ככאלה כדי
                שלא יקראו לשווא.
              </li>
              <li>
                <strong>שינוי גודל.</strong> אפשר להגדיל את הטקסט עד 200% בלי אובדן תוכן או פונקציונליות.
              </li>
              <li>
                <strong>עברית ו־RTL.</strong> האתר מוגדר כעברי מימין לשמאל, ומספרי טלפון וכתובות מייל
                מסומנים בכיוון הנכון לקריאה תקינה בקורא מסך.
              </li>
            </ul>

            <h2>מגבלות ידועות</h2>
            <p>
              האתר כולל אלמנט תלת־ממדי בראש עמוד הבית. הוא דקורטיבי בלבד, מסומן ככזה ואינו נקרא על ידי
              קוראי מסך, ואינו נטען כלל במכשירים ניידים או כאשר התבקשה הפחתת תנועה — במקומו מוצגת תמונה
              סטטית.
            </p>
            <p>
              תוכן שמקורו בצד שלישי (למשל מפות או סרטונים מוטמעים, אם וכאשר יתווספו) עשוי שלא להיות
              נגיש במלואו, ואיננו שולטים בו.
            </p>

            <h2>נתקלת בבעיה?</h2>
            <p>
              אם נתקלת בקושי בשימוש באתר, נשמח לדעת. נטפל בפנייה ונחזור אליך בהקדם, ולכל המאוחר בתוך
              30 יום.
            </p>

            <h2>רכז הנגישות</h2>
            <ul>
              <li>
                <strong>שם:</strong> אוהד קינן
              </li>
              <li>
                <strong>טלפון:</strong>{' '}
                <a href={`tel:${contact.phoneE164}`} dir="ltr">
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <strong>דואר אלקטרוני:</strong>{' '}
                <a href={`mailto:${contact.email}`} dir="ltr">
                  {contact.email}
                </a>
              </li>
            </ul>

            <h2>מועד ההצהרה ואופן הבדיקה</h2>
            <p>
              הצהרה זו נערכה ביום {updated}. הנגישות נבנתה לתוך האתר במהלך הפיתוח ונבדקה בבדיקה
              פנימית: ניגודיות הצבעים נמדדה מול הערכים שבתקן, הניווט נבדק במקלדת בלבד, וההתנהגות
              תחת העדפת צמצום תנועה נבדקה בדפדפן. <strong>טרם בוצע סקר נגישות חיצוני</strong> על ידי
              מורשה נגישות. אם וכאשר ייערך, נעדכן כאן את מועדו ואת שם עורכו.
            </p>

            <h2>הסדרי נגישות בשירות</h2>
            <p>
              השירות שלנו ניתן מרחוק — בטלפון, בדואר אלקטרוני ובווידאו. אנחנו נערכים להתאמות לפי צורך,
              ואפשר לבקש אותן מראש בכל אחת מדרכי ההתקשרות שלמעלה.
            </p>
          </Prose>
        </Container>
      </section>
    </>
  );
}
