'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { useMagnetic } from '@/lib/animations/useMagnetic';
import { contact, navItems, primaryNavItems, whatsappUrl } from '@/lib/site';
import { cn } from '@/lib/utils';

const SCROLLED_AT = 80;

/**
 * The header.
 *
 * Two decisions distinguish it from the bar every Israeli business site ships,
 * which is what it used to be:
 *
 * 1. Three links, not seven. The bar carries the three a visitor evaluating an
 *    agency actually wants, and a trigger opens the rest at display size. Seven
 *    links laid flat is the shape of a template; it also gave every item the
 *    same weight, which is another way of saying none of them had any.
 *
 * 2. On scroll the bar contracts into a floating panel with 45deg corners
 *    rather than turning into a full-width slab. The chamfer is the same angle
 *    as the hero's cut and as every card icon on the site. A pill was the
 *    obvious modern shape and it was wrong here: this brand has no round
 *    corners anywhere.
 */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const ctaRef = useMagnetic<HTMLAnchorElement>({ radius: 80, strength: 0.3 });

  /*
   * Whether the page has scrolled past the hero's first 80px, observed rather
   * than polled. A scroll listener ran a React state update on every frame for
   * a value that changes exactly twice; an IntersectionObserver on a sentinel
   * at the top of the document fires only on the two crossings.
   */
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry?.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Close on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Lock the page behind the menu, and let Escape dismiss it.
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

  const ease = [0.23, 1, 0.32, 1] as const;

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
          'fixed inset-x-0 top-0 z-50 transition-[padding] duration-300',
          scrolled ? 'pt-3' : 'pt-0',
        )}
      >
        <Container>
          <div
            className={cn(
              // backdrop-filter is deliberately not in the transition list.
              // Transitioning it makes the browser re-blur everything behind
              // the header on every frame, and this fires from scroll. The blur
              // switches on instantly; the background fading up underneath it
              // is what the eye reads, and that costs nothing.
              'ease-snap flex h-(--nav-height) items-center justify-between transition-[background-color,border-color,padding] duration-300',
              scrolled || open
                ? 'chamfer border-line border bg-[rgb(8_6_14/0.72)] px-5 backdrop-blur-[20px]'
                : 'border border-transparent bg-transparent px-0',
            )}
          >
            <Link href="/" aria-label="Brandlify — לדף הבית" className="shrink-0">
              <Logo variant="horizontal" width={148} priority />
            </Link>

            <nav aria-label="ניווט ראשי" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {primaryNavItems.map((item) => {
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

            <div className="flex items-center gap-2">
              <Link
                ref={ctaRef}
                href="/contact"
                className="bg-cta rounded-btn font-heading shadow-glow-violet hover:shadow-glow-magenta ease-snap hidden h-10 items-center gap-2 px-5 text-[0.9375rem] font-bold text-white transition-[box-shadow,scale] duration-200 active:scale-[0.97] active:duration-75 motion-reduce:transition-none motion-reduce:active:scale-100 sm:inline-flex"
              >
                בואו נדבר
                <Icon name="arrow" className="h-4 w-4" />
              </Link>

              {/*
                The trigger is present at every width now, not just on mobile.
                It is the only way to the pages the bar no longer lists, and a
                control that appears and disappears across a breakpoint teaches
                nobody where anything is.
              */}
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="site-menu"
                aria-label={open ? 'סגירת התפריט' : 'פתיחת התפריט'}
                className="text-fg -me-2 flex h-11 w-11 items-center justify-center"
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
            </div>
          </div>
        </Container>
      </header>

      {/*
        The menu is a SIBLING of <header>, not a child. The bar carries
        backdrop-filter and a clip-path when scrolled, and either one makes it
        the containing block for a position:fixed descendant — nesting the menu
        inside collapsed it to the bar's own 72px box.
      */}
      <AnimatePresence>
        {open ? (
          <motion.div
            id="site-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2, ease }}
            className="bg-base fixed inset-0 top-(--nav-height) z-40 overflow-y-auto"
          >
            {/* The same 45deg cut as the hero, at the scale of the menu. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, transparent calc(64% - 1px), rgb(230 53 240 / 0.5) 64%, transparent calc(64% + 1px)), linear-gradient(135deg, transparent calc(64% - 90px), rgb(131 47 240 / 0.1) 64%, transparent calc(64% + 90px))',
              }}
            />

            <nav aria-label="ניווט מלא" className="relative">
              <Container className="flex flex-col gap-10 py-10 lg:py-16">
                <ul className="flex flex-col">
                  {navItems.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, transform: 'translateY(18px)' }}
                      animate={{ opacity: 1, transform: 'translateY(0px)' }}
                      transition={
                        reduce ? { duration: 0 } : { duration: 0.32, ease, delay: i * 0.045 }
                      }
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                        className={cn(
                          'border-line hover:text-fg group flex items-baseline gap-4 border-b py-5 text-3xl font-extrabold transition-colors duration-200 sm:text-4xl lg:text-5xl',
                          isActive(item.href) ? 'text-brand-gradient' : 'text-fg',
                        )}
                      >
                        <span
                          aria-hidden
                          className="font-latin text-muted text-label"
                          dir="ltr"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                {/*
                  The menu is a whole screen, so it can carry the thing a
                  visitor came for. Someone who opened it because they could not
                  find the phone number should not have to close it again.
                */}
                <motion.div
                  initial={{ opacity: 0, transform: 'translateY(18px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.32, ease, delay: navItems.length * 0.045 }
                  }
                  className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <a
                      href={`tel:${contact.phoneE164}`}
                      dir="ltr"
                      // w-fit, because dir="ltr" also flips the text alignment
                      // inside the box: stretched to the column's width the
                      // number sat hard against the left edge while every other
                      // line in the menu was against the right one. Shrunk to
                      // its content it lands at the inline start like the rest.
                      className="text-fg w-fit text-xl font-bold"
                    >
                      {contact.phoneDisplay}
                    </a>
                    <a
                      href={whatsappUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink text-sm font-semibold"
                    >
                      או בוואטסאפ
                    </a>
                  </div>

                  <Link
                    href="/contact"
                    className="bg-cta rounded-btn font-heading flex h-14 items-center justify-center gap-2 px-8 text-lg font-bold text-white sm:w-auto"
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
