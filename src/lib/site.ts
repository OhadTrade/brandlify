/**
 * Single source of truth for everything that appears in the chrome of the site:
 * navigation, contact details, legal links. Nothing here is invented — the
 * placeholders are marked and listed in README "מה עוד צריך מהבעלים".
 */

export const site = {
  name: 'Brandlify',
  tagline: 'נוכחות דיגיטלית שמייצרת תוצאות',
  description:
    'Brandlify היא סוכנות דיגיטל ישראלית — בניית אתרים, מיתוג, שיווק דיגיטלי, SEO ואוטומציות. כל מה שהעסק שלך צריך, במקום אחד.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://brandlify.co.il',
  locale: 'he_IL',
} as const;

export const contact = {
  /** Display form, Hebrew copy wraps it in dir="ltr". */
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE ?? '052-217-4188',
  /** E.164 for tel: links. */
  phoneE164: '+972522174188',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? '972522174188',
  /** TODO(owner): confirm the final business address for the mailbox. */
  email: 'hello@brandlify.co.il',
} as const;

export const whatsappUrl = (
  message = 'היי, הגעתי מהאתר של Brandlify ואשמח לשמוע פרטים.',
) => `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;

export type NavItem = { href: string; label: string };

export const navItems: NavItem[] = [
  { href: '/', label: 'דף הבית' },
  { href: '/services', label: 'שירותים' },
  { href: '/portfolio', label: 'עבודות' },
  { href: '/about', label: 'אודות' },
  { href: '/blog', label: 'מאמרים' },
  { href: '/contact', label: 'צור קשר' },
];

/**
 * The five services. Slugs are the URL contract; the copy here is the short
 * label used in navigation and the footer. Full content lives in Supabase.
 */
export const services = [
  { slug: 'websites', label: 'בניית אתרים' },
  { slug: 'branding', label: 'מיתוג ועיצוב' },
  { slug: 'marketing', label: 'שיווק דיגיטלי' },
  { slug: 'seo', label: 'קידום אורגני SEO' },
  { slug: 'automations', label: 'אוטומציות' },
] as const;

export const legalItems: NavItem[] = [
  { href: '/privacy', label: 'מדיניות פרטיות' },
  { href: '/terms', label: 'תנאי שימוש' },
  { href: '/accessibility', label: 'הצהרת נגישות' },
];

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok';

/**
 * Social profiles, confirmed by the owner. The footer hides the whole block if
 * this is empty, so removing an entry is safe.
 */
export const socialLinks: { platform: SocialPlatform; label: string; href: string }[] = [
  {
    platform: 'instagram',
    label: 'Brandlify באינסטגרם',
    href: 'https://www.instagram.com/brandlifyofficial/',
  },
  {
    platform: 'facebook',
    label: 'Brandlify בפייסבוק',
    href: 'https://www.facebook.com/profile.php?id=61574691075196',
  },
  {
    platform: 'tiktok',
    label: 'Brandlify בטיקטוק',
    href: 'https://www.tiktok.com/@ohadkienan0',
  },
];
