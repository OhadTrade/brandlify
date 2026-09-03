# מה חסר לפני השקה

הרשימה הזו היא מה שאני **לא** יכולתי להשלים, לא רשימת משאלות. כל פריט חוסם או
משפיע ישירות על משהו שהאתר מבטיח.

---

## 1. חוסמים

### Supabase — פרויקט חדש

הפרויקט הקיים (`vbygwvgxljgvwelpltnv`) יושב בארגון שחרג ממכסת ה-egress, וכל קריאת
REST מוחזרת ב-**HTTP 402**. הסכמה, ה-RLS וה-seed הוחלו שם בהצלחה דרך ה-Management
API ואומתו — אבל האתר לא יכול לדבר איתו.

בחשבון החדש:

1. הרץ את 4 המיגרציות לפי הסדר, ואז את `seed.sql` — [`supabase/README.md`](./supabase/README.md).
2. `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `.env.local`.
3. `SUPABASE_SERVICE_ROLE_KEY` → `.env.local`. **בלי זה טופס הלידים מחזיר 503.**
4. `npm run rls` — חייב לעבור 20/20.
5. צור משתמש ניהול: Authentication → Users → Add user (עם סיסמה). זה החשבון
   שנכנס ל-`/admin`.

### Resend

`RESEND_API_KEY` + אימות הדומיין. בלי זה הליד **נשמר** אבל אף מייל לא נשלח —
בכוונה: הכתיבה ל-DB קודמת למיילים, כך שתקלת דואר לא מאבדת פנייה.

### Turnstile

`NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`. בלי אלה הווידג׳ט לא
מוצג והאימות מדולג — ה-honeypot וה-rate limit עדיין פעילים, אבל זו הגנה חלשה יותר.

---

## 2. תוכן שאסור לי להמציא

| מה | איפה | מה קורה בלעדיו |
| --- | --- | --- |
| **סיפור "אודות"** | `site_content` בשורה `about.story` (JSON: `{title?, body}`) | המקטע פשוט לא מרונדר |
| **פרויקט Urban Fit** | `/admin/projects` | מקטע העבודות ועמוד תיק העבודות ריקים |
| **ביקורות אמיתיות** | `/admin/testimonials` | מוצג במקום מקטע ההתחייבויות |
| **אימייל עסקי סופי** | `src/lib/site.ts` → `contact.email` | כרגע `hello@brandlify.co.il` |
| **רכז נגישות** | `/accessibility` | כתוב שם במפורש "להשלמה" — **חובה חוקית** |

---

## 3. אישור משפטי

`/privacy` ו-`/terms` מסומנים בעמוד עצמו כטיוטה. הם **לא** תבניות גנריות — הם
מתארים בדיוק את מה שהאתר עושה: העמודות שנשמרות בפועל, הספקים שהקוד באמת קורא
אליהם, ואי-שמירת IP. עדיין צריך עורך דין לפני השקה.

---

## 4. נכסי מותג — שתי מגבלות במקור

1. **הלוקאפים בנויים לרקע בהיר.** צבע החציון של ה-wordmark הוא `#280C66` —
   **1.28:1** מול הרקע הכהה. יצרתי וריאנטים `-ondark` שממפים את הבהירות לרמפה
   סגולה־בהירה (6.94:1). **עדיף שתספק לוקאפים רשמיים לרקע כהה.**
2. **רזולוציית ה-mark היא 318×412.** `mark-1024w.png` הוא הגדלה. זה ה-fallback
   של ה-Hero. רנדר ברזולוציה גבוהה או SVG ישפר גם את ה-favicons.

שניהם מתועדים ב-[`public/brand/README.md`](./public/brand/README.md).

---

## 5. מה לא אימתתי בפועל

אני מעדיף לומר את זה במפורש מאשר להשאיר אותך להניח שנבדק.

- **reduced-motion בזמן ריצה.** כלי הדפדפן כאן לא יודע לאמלץ את ה-media feature,
  וניסיון לתקן את `matchMedia` אחרי שהמנוע עלה נכשל כי GSAP מקאשר את אובייקטי
  ה-MediaQueryList. מה שכן אימתתי: מבנה תנאי ה-MQ, ושבגיליון ה-CSS המהודר הכלל
  היחיד שמסתיר משהו יושב בתוך `(prefers-reduced-motion: no-preference)`.
  **לבדוק ידנית** — DevTools → Rendering → Emulate `prefers-reduced-motion`.
- **Lighthouse.** אין לי דפדפן headless להרצה. התקציב נשמר במדידות עקיפות:
  First Load JS 115KB בדף הבית (תקציב 250), אפס overflow אופקי, DPR מוגבל,
  `frameloop` נעצר מחוץ למסך. **להריץ Lighthouse mobile אחרי הפריסה.**
- **מסירת מיילים בפועל** — אין מפתח Resend.
- **הטיית העכבר של ה-B (±12°)** — הקבוע בקוד, לא מדדתי סיבוב בפועל.

---

## 6. Checklist להשקה

```
[ ] פרויקט Supabase חדש: 4 מיגרציות + seed
[ ] npm run rls — 20/20
[ ] משתמש ניהול נוצר, כניסה ל-/admin עובדת
[ ] SUPABASE_SERVICE_ROLE_KEY מוגדר ב-Vercel (Production + Preview)
[ ] Resend: מפתח + אימות דומיין
[ ] טופס מקצה לקצה: ליד נשמר + מייל לבעלים + מייל ללקוח + אירוע generate_lead
[ ] Turnstile מוגדר
[ ] NEXT_PUBLIC_SITE_URL = הדומיין האמיתי
[ ] NEXT_PUBLIC_GA_ID מוגדר
[ ] אימייל עסקי סופי ב-src/lib/site.ts
[ ] רכז נגישות ב-/accessibility
[ ] מדיניות פרטיות ותנאי שימוש מאושרים משפטית
[ ] Lighthouse mobile: Performance ≥90, Accessibility ≥95, SEO 100
[ ] reduced-motion נבדק ידנית
[ ] sitemap.xml הוגש ל-Search Console
[ ] npm run verify נקי
```

---

## 7. תחזוקה שוטפת

- **הוספת שירות** → `src/content/services.ts`, ואז `npm run seed:sql` והרצת ה-SQL.
  הראוט, ה-sitemap וה-fallback מתעדכנים לבד.
- **שינוי צבע** → `src/app/globals.css` בלבד, ואז `npm run contrast`.
- **לוגו חדש** → `assets/source/`, ואז `npm run brand`.
- **לפני כל push** → `npm run verify`.
