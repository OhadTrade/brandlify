import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Long-form typography for legal pages and articles.
 *
 * Written as descendant rules rather than a plugin so the scale stays tied to
 * the design tokens and nothing drifts from the rest of the site.
 */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'text-muted max-w-3xl text-[1.0625rem] leading-relaxed',
        '[&_h2]:text-h3 [&_h2]:text-fg [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-extrabold',
        '[&_h3]:text-fg [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-bold',
        '[&_p]:mb-5',
        '[&_ul]:mb-5 [&_ul]:space-y-2 [&_ul]:ps-5',
        '[&_ol]:mb-5 [&_ol]:space-y-2 [&_ol]:ps-5',
        '[&_li]:list-disc [&_li]:marker:text-violet',
        '[&_ol>li]:list-decimal',
        '[&_a]:text-pink [&_a]:underline-offset-4 hover:[&_a]:underline',
        '[&_strong]:text-fg [&_strong]:font-bold',
        '[&_hr]:border-line [&_hr]:my-10',
        '[&_table]:w-full [&_table]:text-sm [&_th]:text-fg [&_th]:text-start [&_th]:py-2',
        '[&_td]:border-line [&_td]:border-t [&_td]:py-2 [&_td]:align-top',
        className,
      )}
    >
      {children}
    </div>
  );
}
