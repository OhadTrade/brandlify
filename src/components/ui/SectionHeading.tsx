import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The shared section opener: an optional Latin eyebrow label, an H2, and an
 * optional lead paragraph. Keeps heading rhythm identical across the page.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'start',
  className,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: 'start' | 'center';
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start',
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-label font-latin text-magenta flex items-center gap-3 uppercase">
          <span aria-hidden className="bg-brand h-px w-8" />
          {eyebrow}
        </p>
      ) : null}
      <h2 id={id} className="text-h2 text-fg max-w-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className={cn('text-muted max-w-2xl text-[1.0625rem]', align === 'center' && 'mx-auto')}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
