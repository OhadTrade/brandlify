# Brandlify

אתר תדמית ולידים לסוכנות דיגיטל ישראלית. עברית מלאה, RTL, כהה, עתיר אנימציות —
אתר סטטי/ISR מהיר עם מערכת ניהול תוכן מינימלית מעל Supabase.

```bash
npm install
cp .env.example .env.local   # ומלא את המפתחות
npm run dev                  # http://localhost:3000
```

---

## פקודות

| פקודה | מה היא עושה |
| --- | --- |
| `npm run dev` | שרת פיתוח |
| `npm run verify` | **שער האיכות**: types · lint · ניגודיות · סכמת לידים · build |
| `npm run build` | build לפרודקשן |
| `npm run contrast` | בדיקת ניגודיות WCAG על טוקני העיצוב |
| `npm run rls` | אימות חוזה ה-RLS מול ה-anon key האמיתי |
| `npm run seed:sql` | מייצר את `supabase/seed.sql` מתוך `src/content/` |
| `npm run brand` | מייצר את כל נכסי המותג מ-`assets/source/` |

> `npm run verify` בונה לתיקייה נפרדת (`.next-verify`) כדי שאפשר יהיה להריץ אותו
> בזמן ש-`npm run dev` רץ. הרצת `next build` רגיל במקביל ל-`next dev` הורסת את
> `.next` של שניהם.

---

## ארכיטקטורה

```
src/
  app/
    (site)/        כל העמודים הציבוריים — עוטפים ב-SiteShell
    admin/         ניהול. מחוץ ל-(site) בכוונה: בלי navbar שיווקי, בלי smooth scroll
    api/leads/     קליטת פניות
  components/
    sections/      מקטעי דף הבית (Server Components — אפס JS)
    motion/        עטיפות קליינט דקות שמפעילות את מנוע האנימציות
    hero/          ה-B התלת־ממדי + הגיאומטריה שלו
    admin/ ui/ layout/
  content/         מקור האמת לתוכן: שירותים, FAQ, קופי הבית
  lib/
    animations/    מנוע GSAP + matchMedia + primitives
    supabase/      שלושה קליינטים: public (ללא cookies), server (session), admin (service role)
    queries.ts     קריאה מהאתר — לא זורק, לא קורא cookies, ממותג לפי tag
supabase/          מיגרציות + seed (מיוצר)
scripts/           כלי בנייה ובדיקה
```

### שלושה קליינטים של Supabase, בכוונה

| קליינט | מי | למה |
| --- | --- | --- |
| `public.ts` | anon, **בלי cookies** | קריאת תוכן ציבורי. קריאת cookies הייתה הופכת כל עמוד לדינמי ומבטלת ISR |
| `server.ts` | anon + session | `/admin` והמידלוור. כתיבות רצות כמשתמש, כך ש-RLS עדיין אוכף |
| `admin.ts` | service_role | **רק** ב-API של הלידים, שם אין משתמש. מוגן ב-`server-only` |

### התוכן חי במקום אחד

הקופי חייב להתקיים פעמיים — ב-DB (כדי שתוכל לערוך) ובבאנדל (כדי שהאתר ייראה גם
כש-Supabase לא זמין). לכתוב אותו פעמיים ביד מבטיח דריפט, ולכן הוא נכתב פעם אחת
ב-`src/content/` ו-`npm run seed:sql` מייצר את ה-SQL.

**פרויקטים, מאמרים וביקורות הם היוצא מן הכלל** — אין להם fallback. תיק עבודות ריק
חייב להיראות ריק, אף פעם לא מומצא.

---

## מנוע האנימציות

כל אנימציה נרשמת בתוך `gsap.matchMedia()`, אף פעם ב-`if` בקומפוננטה:

| שכבה | תנאי | מה רץ |
| --- | --- | --- |
| `MQ.desktop` | `≥1024px` **וגם** `no-preference` | pin, scrub, parallax, WebGL |
| `MQ.motionOk` | כל רוחב, `no-preference` | fade + slide בלבד |
| reduced-motion | — | **אף תנאי לא מתקיים** |

**reduced-motion מטופל בהיעדר, לא בכיבוי.** מי שביקש פחות תנועה לא נכנס לשום תנאי,
ולכן `opacity: 0` אף פעם לא מוחל — שום דבר לא מוסתר ממנו מלכתחילה.

GSAP (~40KB) לא נמצא ב-bundle הראשוני: `useGsapEffect` מייבא את המנוע דינמית.
Three.js נטען רק כשארבעת התנאים ב-`HeroVisual` מתקיימים.

**Lenis ולא ScrollSmoother.** המפרט ביקש את שניהם; להריץ את שניהם זה באג — הם שני
מימושים לאותה עבודה שיריבו על מיקום הגלילה. ScrollSmoother גם דורש wrapper
מטורנספם ששובר `position: fixed` (ה-navbar ותפריט המובייל).

---

## אבטחה

- **`leads` לא ניתן לקריאה בלי אימות** — ההרשאה נשללה (`revoke`) *וגם* אין policy.
  שתי שכבות, כדי ש-policy מתירני שיתווסף בטעות לא יפתח את הטבלה. `npm run rls` בודק.
- **הסכמה נאכפת ב-DB** (`check (consent)`), לא רק בטופס.
- **תיבת ההסכמה אף פעם לא מסומנת מראש** — זו לא הסכמה.
- **המידלוור הוא נוחות, לא הגבול.** הגבול הוא RLS: גם עם cookie מזויף אי אפשר
  לקרוא או לכתוב כלום.
- **כתובות IP לא נשמרות.** ההגבלה לפי IP עובדת על hash בזיכרון בלבד.
- **מפתח ה-service_role** מוגן ב-`server-only` — ייבוא שלו מקומפוננטת קליינט הוא
  שגיאת build.

---

## פריסה ל-Vercel

1. `vercel link` (או ייבוא הריפו בלוח הבקרה).
2. הגדר את משתני הסביבה מ-`.env.example` ל-Production ול-Preview.
   **`SUPABASE_SERVICE_ROLE_KEY` בלי `NEXT_PUBLIC_`.**
3. `NEXT_PUBLIC_SITE_URL` חייב להיות הדומיין האמיתי — הוא מזין canonical,
   sitemap, Open Graph ו-schema.
4. חבר את הדומיין `brandlify.co.il` והפעל HTTPS.
5. אחרי הפריסה: הגש את `/sitemap.xml` ב-Search Console.

### התראה על עלייה בעלויות

`revalidate` הוא 300 שניות. אם התנועה גדלה משמעותית, זה חלון סביר; אין צורך
להוריד אותו כדי "לרענן מהר" — ה-admin קורא ל-`revalidateTag` בכל פרסום, אז שינוי
מופיע מיד.

---

## מה עדיין חסר לפני השקה

ראה [`LAUNCH.md`](./LAUNCH.md).
