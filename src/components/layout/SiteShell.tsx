import type { ReactNode } from 'react';
import { Analytics } from '@/components/layout/Analytics';
import { StudioChrome } from '@/components/layout/StudioChrome';
import { OrganizationSchema } from '@/components/layout/OrganizationSchema';
import { SkipLink } from '@/components/layout/SkipLink';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';
import { SmoothScroll } from '@/components/motion/SmoothScroll';

/**
 * The public site's chrome.
 *
 * Lives in a component rather than the root layout so /admin can opt out of it
 * entirely — an admin screen has no business rendering the marketing navbar,
 * the smooth-scroll engine or a floating WhatsApp button. Used by the (site)
 * route group and by the 404, which sits outside that group but still wants the
 * full site around it.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <SmoothScroll />
      <StudioChrome />
      <main id="main" className="pt-(--nav-height)">
        {children}
      </main>
      <StudioChrome footer />
      <WhatsAppFab />
      <OrganizationSchema />
      <Analytics />
    </>
  );
}
