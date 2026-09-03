import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Inline stroke icons (Lucide geometry, ISC). Inlined rather than pulled from a
 * package: the site needs about a dozen glyphs, and an icon dependency would
 * cost more than the markup it replaces.
 *
 * Every icon is decorative — the accessible name belongs on the element that
 * wraps it.
 */

const GLYPHS: Record<string, ReactNode> = {
  // --- service glyphs, keyed by services.icon ---
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 3.6 9 14 14 0 0 1-3.6 9 14 14 0 0 1-3.6-9A14 14 0 0 1 12 3Z" />
    </>
  ),
  palette: (
    <>
      <path d="M12 21a9 9 0 1 1 9-9c0 2-1.6 3.2-3.5 3.2H16a2 2 0 0 0-1.5 3.3A1.8 1.8 0 0 1 12 21Z" />
      <circle cx="7.5" cy="12" r="1.1" />
      <circle cx="10" cy="8" r="1.1" />
      <circle cx="15" cy="8.5" r="1.1" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 10.5 19 6v12L4 13.5Z" />
      <path d="M4 10.5H3.5A1.5 1.5 0 0 0 2 12a1.5 1.5 0 0 0 1.5 1.5H4" />
      <path d="M8 14.4v2.1a2.5 2.5 0 0 0 4.8.9" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  workflow: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <path d="M6.5 10v4.5a2 2 0 0 0 2 2H14" />
    </>
  ),

  /** BUILD — stacked planes. */
  layers: (
    <>
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5" />
      <path d="m3.5 16.5 8.5 4.5 8.5-4.5" />
    </>
  ),
  /** RANK — a rising line. */
  trending: (
    <>
      <path d="M3 17.5 9.5 11l3.5 3.5L21 6.5" />
      <path d="M15 6.5h6v6" />
    </>
  ),

  // --- ui glyphs ---
  check: <path d="m4 12.5 5 5L20 6.5" />,
  /** Points right-to-left: the "forward" direction in Hebrew. */
  arrow: (
    <>
      <path d="M20 12H4" />
      <path d="m10 6-6 6 6 6" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  whatsapp: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.5.1l-.7.9c-.2.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4 5.3 5.3 0 0 0 3.2.7 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"
    />
  ),
};

export type IconName = keyof typeof GLYPHS;

export function Icon({
  name,
  className,
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const glyph = GLYPHS[name];
  if (!glyph) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={cn('shrink-0', className)}
    >
      {glyph}
    </svg>
  );
}
