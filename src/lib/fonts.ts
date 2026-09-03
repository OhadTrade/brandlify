import { Assistant, Heebo, Montserrat } from 'next/font/google';

/** Hebrew headings. */
export const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['700', '800', '900'],
  variable: '--font-heebo',
  display: 'swap',
});

/** Hebrew body copy. */
export const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '600'],
  variable: '--font-assistant',
  display: 'swap',
});

/**
 * Latin only — BUILD / BRAND / GROW, technical labels, oversized numerals.
 * Montserrat has no Hebrew coverage; never set Hebrew copy in it.
 */
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const fontVariables = `${heebo.variable} ${assistant.variable} ${montserrat.variable}`;
