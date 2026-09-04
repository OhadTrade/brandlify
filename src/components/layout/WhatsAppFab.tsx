'use client';

import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { whatsappUrl } from '@/lib/site';

/**
 * Floating WhatsApp button, mobile only (§9).
 *
 * Hidden on /contact, where the form and every channel are already on screen —
 * a floating shortcut to the thing you are looking at is just an obstruction.
 */
export function WhatsAppFab() {
  const pathname = usePathname();
  if (pathname?.startsWith('/contact') || pathname?.startsWith('/admin')) return null;

  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="שליחת הודעה בוואטסאפ"
      className="bg-cta shadow-glow-magenta fixed bottom-5 end-5 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white ease-snap transition-transform duration-200 hover:scale-105 active:scale-95 active:duration-75 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 lg:hidden"
    >
      <Icon name="whatsapp" className="h-7 w-7" />
    </a>
  );
}
