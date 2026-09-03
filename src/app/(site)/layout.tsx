import { SiteShell } from '@/components/layout/SiteShell';

/** Everything public. /admin deliberately sits outside this group. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
