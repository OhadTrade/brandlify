import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mirror a horizontal offset for the current writing direction.
 *
 * Every animation that moves along X must run its value through this — marquees,
 * slide-ins, the pinned horizontal scroll. Hard-coded X values look correct in
 * LTR and travel the wrong way in RTL.
 *
 * Falls back to RTL during SSR because the document is `dir="rtl"`.
 */
export function dirX(value: number): number {
  if (typeof document === 'undefined') return -value;
  return document.dir === 'rtl' ? -value : value;
}

/** True when the document is right-to-left. */
export function isRtl(): boolean {
  if (typeof document === 'undefined') return true;
  return document.dir === 'rtl';
}

/** Israeli local format (052-217-4188) -> E.164 (+972522174188). */
export function toE164(local: string): string {
  const digits = local.replace(/\D/g, '');
  return digits.startsWith('0') ? `+972${digits.slice(1)}` : `+${digits}`;
}
