/**
 * Editable site copy — canonical values.
 *
 * Source of truth for the `site_content` rows in supabase/seed.sql AND the
 * fallback the site renders when a row is missing, malformed, or the database
 * is unreachable. `src/lib/content.ts` layers Zod validation on top.
 *
 * Dependency-free so the seed generator can import it directly.
 */

export type Titled = { title: string; description: string };
export type Stat = { value: string; unit: string; label: string };

export const siteContent = {
  'home.hero': {
    title: 'נוכחות דיגיטלית שמייצרת תוצאות.',
    services_line: 'בניית אתרים • מיתוג • שיווק דיגיטלי • SEO • אוטומציות',
    subtitle: 'כל מה שהעסק שלך צריך — במקום אחד.',
    cta_primary: 'בואו נבנה משהו גדול',
    cta_secondary: 'עם עבודות שלנו',
  },
  'home.stats': {
    items: [
      { value: '24-48', unit: 'שעות', label: 'זמן תגובה לפנייה' },
      { value: '100', unit: '/100', label: 'ציון ביצועים שאנחנו מכוונים אליו' },
      { value: '12', unit: 'חודשים', label: 'אחריות על כל אתר' },
      { value: 'עברית', unit: '', label: 'תמיכה מלאה, מול בן אדם' },
    ] as Stat[],
  },
  'home.split': {
    title: 'אתר שלא רק נראה טוב. אתר שמביא לקוחות.',
    body: 'אתר יפה שאף אחד לא מוצא, או שנטען לאט מדי מכדי לחכות לו, לא עשה כלום. אנחנו בונים את שני הצדדים: את מה שרואים ואת מה שגורם לזה לעבוד.',
    points: [
      { title: 'אתר מהיר', description: 'מהירות טעינה נמדדת, לא מובטחת.' },
      { title: 'מותאם מובייל', description: 'רוב המבקרים שלך בטלפון. שם מתחילים.' },
      { title: 'חוויית משתמש', description: 'מסלול ברור מהכניסה ועד הפנייה.' },
      { title: 'מותאם SEO', description: 'מבנה שגוגל יודע לקרוא מהיום הראשון.' },
    ] as Titled[],
  },
  'home.build_brand_grow': {
    eyebrow: 'BUILD · BRAND · GROW',
    title: 'מהרעיון עד הצמיחה',
    stages: [
      {
        key: 'BUILD',
        title: 'בונים',
        description: 'אתר מהיר, נגיש ומותאם מובייל — התשתית שהכול יושב עליה.',
      },
      {
        key: 'DESIGN',
        title: 'מעצבים',
        description: 'שפה ויזואלית שגורמת לעסק להיראות כמו עסק שסומכים עליו.',
      },
      {
        key: 'RANK',
        title: 'מדרגים',
        description: 'קידום אורגני שמביא אותך למקום שבו מחפשים אותך.',
      },
      {
        key: 'PROMOTE',
        title: 'מפרסמים',
        description: 'קמפיינים שנמדדים בפניות, עם תקציב שמנוהל לפי נתונים.',
      },
      {
        key: 'AUTOMATE',
        title: 'מאטמים',
        description: 'אוטומציות שסוגרות את הצינור כדי שאף פנייה לא תאבד.',
      },
    ],
  },
  'home.process': {
    title: 'איך זה עובד',
    subtitle: 'שישה שלבים, בלי הפתעות באמצע.',
    steps: [
      { title: 'שיחה', description: 'שיחה קצרה בלי עלות: מה העסק, מה חסר, ולאן רוצים להגיע.' },
      { title: 'אפיון', description: 'מגדירים מטרות, מבנה, לוח זמנים והצעת מחיר סגורה.' },
      { title: 'עיצוב', description: 'מסכים מלאים לאישור — לפני שכותבים שורת קוד.' },
      { title: 'פיתוח', description: 'בנייה, אינטגרציות ובדיקות במכשירים אמיתיים.' },
      { title: 'השקה', description: 'עלייה לאוויר, חיבור מדידה והדרכה על ניהול התוכן.' },
      { title: 'צמיחה', description: 'קידום, קמפיינים ואוטומציות — לפי מה שהעסק צריך.' },
    ] as Titled[],
  },
  'home.automations': {
    title: 'אוטומציות שחוסכות זמן ומביאות לידים',
    body: 'כל פנייה שנופלת בין הכיסאות היא לקוח שהלך למתחרה. אנחנו מחברים את הצינור מקצה לקצה.',
    items: [
      'טפסי לידים מחוברים',
      'מענה אוטומטי בוואטסאפ',
      'חיבור ל-CRM',
      'חיבור סליקה',
      'אינטגרציות למערכות קיימות',
    ],
  },
  'home.why': {
    title: 'למה Brandlify',
    cards: [
      {
        title: 'חשיבה עסקית',
        description: 'לפני שמעצבים, שואלים מאיפה מגיע הכסף. האתר משרת את המטרה, לא להפך.',
      },
      {
        title: 'עיצוב ברמה גבוהה',
        description: 'עיצוב שנראה כמו העסקים הגדולים בענף שלך — בלי להיראות כמו תבנית.',
      },
      {
        title: 'טכנולוגיה מתקדמת',
        description: 'אותן טכנולוגיות שמריצות אתרים של חברות גדולות, מותאמות לגודל שלך.',
      },
      {
        title: 'יחס אישי',
        description: 'מדברים איתך בעברית, עונים תוך 24-48 שעות, ואומרים גם כשמשהו לא כדאי.',
      },
    ] as Titled[],
  },
  'home.promises': {
    title: 'מה אנחנו מבטיחים',
    subtitle: 'עוד אין לנו מספיק ביקורות כדי להציג — אז במקום זה, הנה ההתחייבויות שלנו בכתב.',
    items: [
      {
        title: 'מענה תוך 24-48 שעות',
        description: 'לכל פנייה, גם אם התשובה היא שאנחנו לא הספק הנכון עבורך.',
      },
      {
        title: '12 חודשי אחריות',
        description: 'על כל אתר שאנחנו בונים. תקלה שנובעת מהבנייה — מטופלת.',
      },
      {
        title: 'בעלות מלאה שלך',
        description: 'דומיין, קוד וחשבונות רשומים על שמך מהיום הראשון.',
      },
      {
        title: 'הצעת מחיר סגורה',
        description: 'מה שסוכם הוא מה שמשלמים. אין תוספות שצצות באמצע.',
      },
    ] as Titled[],
  },
  'home.cta_final': {
    title: 'מוכנים לקחת את העסק שלכם לשלב הבא?',
    body: 'שיחה קצרה, בלי התחייבות. נבין מה אתה צריך ונגיד לך בכנות אם ואיך אנחנו יכולים לעזור.',
    cta_primary: 'לשיחת אפיון ללא עלות',
    cta_secondary: 'דברו איתנו בוואטסאפ',
  },
  'home.faq': {
    title: 'שאלות נפוצות',
    subtitle: 'ואם לא מצאת את השאלה שלך — פשוט תשאל אותנו.',
  },
};
