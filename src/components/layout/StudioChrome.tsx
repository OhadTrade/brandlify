'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';
import s from './studio-chrome.module.css';

const links = [
  ['/services', 'שירותים'], ['/portfolio', 'עבודות'], ['/about', 'עלינו'],
  ['/blog', 'מאמרים'], ['/contact', 'קשר'],
] as const;

function Brand() {
  return <Link href="/" className={s.brand} data-header-brand aria-label="Brandlify - לעמוד הבית">
    <Image src="/brand/flowing-b.webp" width={40} height={40} alt="" />
    <span>BRANDLIFY</span>
  </Link>;
}

export function StudioChrome({ footer = false }: { footer?: boolean }) {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const ref = useGsapEffect<HTMLDivElement>((engine, mm, root) => {
    if (footer) return;
    mm.add('all', () => {
      const updateScrolled = () => {
        const next = window.scrollY > 48 ? 'true' : 'false';
        if (root.dataset.scrolled !== next) root.dataset.scrolled = next;
      };
      engine.ScrollTrigger.create({ start: 48, end: 'max', onUpdate: updateScrolled, onRefresh: updateScrolled });
      updateScrolled();
    });
    const progress = root.querySelector('[data-page-progress]');
    mm.add(engine.MQ_MOTION_OK, () => {
      engine.gsap.fromTo(progress, { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: true, invalidateOnRefresh: true },
      });
    });
  }, [pathname, footer]);

  useEffect(() => { if (menu.current) menu.current.open = false; }, [pathname]);

  const navigation = links.map(([href, label]) => (
    <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>
  ));

  if (footer) return <footer className={s.footer}>
    <Brand />
    <nav aria-label="ניווט תחתון">{navigation}</nav>
    <div><span>© {new Date().getFullYear()} Brandlify</span><Link href="/privacy">פרטיות</Link><Link href="/terms">תנאי שימוש</Link><Link href="/accessibility">נגישות</Link><a href="#main">חזרה למעלה ↑</a></div>
  </footer>;

  return <div ref={ref} className={s.headerWrap}>
    <header className={s.header}>
      <Brand />
      <nav aria-label="ניווט ראשי">{navigation}</nav>
      <Link className={s.cta} href="/contact">בואו נדבר <span aria-hidden="true">←</span></Link>
      <details ref={menu} className={s.menu} onKeyDown={(event) => {
        if (event.key === 'Escape' && menu.current?.open) {
          menu.current.open = false;
          menu.current.querySelector('summary')?.focus();
        }
      }}>
        <summary>תפריט</summary>
        <nav aria-label="ניווט בנייד">{navigation}</nav>
      </details>
    </header>
    <span className={s.progress} data-page-progress aria-hidden />
  </div>;
}
