import type { Metadata } from 'next';
import Link from 'next/link';
import { signOut } from './actions';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { createServerSupabase } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: { default: 'ניהול', template: '%s | ניהול Brandlify' },
  robots: { index: false, follow: false },
};

const tabs = [
  { href: '/admin', label: 'לידים' },
  { href: '/admin/projects', label: 'פרויקטים' },
  { href: '/admin/posts', label: 'מאמרים' },
  { href: '/admin/testimonials', label: 'ביקורות' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  // The login page renders its own shell; everything else needs a user. The
  // middleware normally handles this — the check is repeated because a layout
  // that trusts middleware alone breaks the moment the matcher changes.
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <header className="border-line bg-surface sticky top-0 z-30 border-b">
        <Container className="flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/" aria-label="לאתר" className="shrink-0">
              <Logo variant="horizontal" width={112} />
            </Link>
            <nav aria-label="ניווט ניהול">
              <ul className="flex items-center gap-1">
                {tabs.map((tab) => (
                  <li key={tab.href}>
                    <Link
                      href={tab.href}
                      className="text-muted hover:text-fg rounded-btn px-3 py-2 text-sm font-semibold transition-colors"
                    >
                      {tab.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <form action={signOut} className="flex items-center gap-3">
            <span className="text-muted hidden text-xs sm:inline" dir="ltr">
              {user.email}
            </span>
            <button
              type="submit"
              className="border-line text-muted hover:text-fg hover:border-magenta rounded-btn border px-4 py-2 text-sm transition-colors"
            >
              יציאה
            </button>
          </form>
        </Container>
      </header>

      <main className="py-10">{children}</main>
    </div>
  );
}

