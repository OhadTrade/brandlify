'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { useMagnetic } from '@/lib/animations/useMagnetic';
import { navItems } from '@/lib/site';
import { cn } from '@/lib/utils';

const SCROLLED_AT = 80;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const ctaRef = useMagnetic<HTMLAnchorElement>({ radius: 80, strength: 0.3 });

  /*
   * Whether the page has scrolled past the hero's first 80px, observed rather
   * than polled.
   *
   * This used to be a scroll listener calling setScrolled on every event. It
   * worked, but it ran a React state update on every frame of every scroll for
   * a value that changes exactly twice, and under Lenis that is a lot of
   * frames. An IntersectionObserver watching a sentinel at the top of the
   * document fires only on the two crossings, off the main thread's scroll
   * path entirely.
   */
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry?.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Close on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Lock the page behind the mobile overlay, and let Escape dismiss it.
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      {/*
        The scroll sentinel: a zero-width strip occupying the first SCROLLED_AT
        pixels of the document. `absolute` with no positioned ancestor resolves
        against the initial containing block, so it is pinned to the top of the
        page rather than to the viewport, and scrolls out of view on cue.
      */}
      <div
        ref={sentinel}
        aria-hidden
        className="pointer-events-none absolute top-0 start-0 w-px"
        style={{ height: SCROLLED_AT }}
      />

      <header
        data-chrome
        className={cn(
          // backdrop-filter is deliberately NOT in this list. Transitioning it
          // makes the browser re-blur everything behind the header on every
          // frame, and this transition fires from scroll. The blur switches on
          // instantly; the background fading up underneath it is what the eye
          // actually reads, and that costs nothing.
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-200 ease-snap',
          scrolled || open
            ? 'border-line border-b bg-[rgb(8_6_14/0.72)] backdrop-blur-[20px]'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <Container className="flex h-(--nav-height) items-center justify-between">
          <Link href="/" aria-label="Brandlify — לדף הבית" className="shrink-0">
            <Logo variant="horizontal" width={148} priority />
          </Link>

          <nav aria-label="ניווט ראשי" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative block px-4 py-2 text-[0.9375rem] font-semibold transition-colors duration-200',
                        active ? 'text-fg' : 'text-muted hover:text-fg',
                      )}
                    >
                      {item.label}
                    </Link>
                    {active ? (
                      <motion.span
                        layoutId="nav-active"
                        aria-hidden
                        className="bg-brand absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full"
                        transition={
                          reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }
                        }
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link
            ref={ctaRef}
            href="/contact"
            className="bg-cta rounded-btn font-heading shadow-glow-violet hover:shadow-glow-magenta ease-snap hidden h-10 items-center gap-2 px-5 text-[0.9375rem] font-bold text-white transition-[box-shadow,scale] duration-200 active:scale-[0.97] active:duration-75 motion-reduce:transition-none motion-reduce:active:scale-100 lg:inline-flex"
          >
            בואו נדבר
            <Icon name="arrow" className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'סגירת התפריט' : 'פתיחת התפריט'}
            className="text-fg -me-2 flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <span className="relative block h-4 w-6">
              <span
                className={cn(
                  'absolute inset-x-0 top-0 h-0.5 rounded-full bg-current transition-transform duration-200 ease-snap',
                  open && 'translate-y-[7px] rotate-45',
                )}
              />
              <span
                className={cn(
                  'absolute inset-x-0 top-[7px] h-0.5 rounded-full bg-current transition-opacity duration-200 ease-snap',
                  open && 'opacity-0',
                )}
              />
              <span
                className={cn(
                  'absolute inset-x-0 top-[14px] h-0.5 rounded-full bg-current transition-transform duration-200 ease-snap',
                  open && '-translate-y-[7px] -rotate-45',
                )}
              />
            </span>
          </button>
        </Container>
      </header>

      {/*
        The overlay is a SIBLING of <header>, not a child. When the header is
        scrolled it carries backdrop-filter, which makes it the containing block
        for any position:fixed descendant — nesting the overlay inside collapsed
        it to the header's own 72px box (height 0).
      */}
      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="bg-base fixed inset-0 top-(--nav-height) z-40 lg:hidden"
          >
            <nav aria-label="ניווט ראשי (מובייל)" className="h-full overflow-y-auto">
              <Container className="flex flex-col gap-1 py-8">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, transform: 'translateY(16px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    transition={
                      reduce ? { duration: 0 } : { duration: 0.28, ease: [0.23, 1, 0.32, 1], delay: i * 0.045 }
                    }
                  >
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'border-line block border-b py-4 text-2xl font-extrabold',
                        isActive(item.href) ? 'text-brand-gradient' : 'text-fg',
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, transform: 'translateY(16px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.28, ease: [0.23, 1, 0.32, 1], delay: navItems.length * 0.045 }
                  }
                  className="pt-6"
                >
                  <Link
                    href="/contact"
                    className="bg-cta rounded-btn font-heading flex h-14 items-center justify-center gap-2 text-lg font-bold text-white"
                  >
                    בואו נדבר
                    <Icon name="arrow" className="h-5 w-5" />
                  </Link>
                </motion.div>
              </Container>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
