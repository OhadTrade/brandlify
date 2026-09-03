import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

/**
 * Two things here are deliberate and easy to lose in a refactor.
 *
 * `active:scale-[0.97]` is press feedback. Every pressable thing should give
 * some, and 0.95–0.98 is the range where it registers without looking like a
 * bug. It also propagates: `scale` scales the label and icon with the button,
 * which is what makes it feel like the whole control was pushed.
 *
 * The transition list names `translate` and `scale`, not `transform`, because
 * Tailwind v4 emits those utilities as the standalone CSS properties of the
 * same name. A list saying `transform` matches nothing they set, so the lift
 * and the press would both snap while the shadow eased — which is exactly what
 * was happening here.
 */
const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-btn font-heading font-bold ' +
  'whitespace-nowrap transition-[translate,scale,box-shadow,background-color,border-color] ' +
  'duration-200 ease-snap active:scale-[0.97] active:duration-75 ' +
  'will-change-transform motion-reduce:transition-none motion-reduce:active:scale-100';

const variants: Record<Variant, string> = {
  // White on --gradient-cta stays >= 5:1 across the whole ramp.
  primary: 'bg-cta text-white shadow-glow-violet hover:shadow-glow-magenta hover:-translate-y-0.5',
  secondary:
    'border border-line-strong text-fg hover:border-magenta hover:shadow-glow-magenta hover:-translate-y-0.5',
  ghost: 'text-fg hover:text-pink',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[0.9375rem]',
  lg: 'h-14 px-8 text-base md:text-lg',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsLink = CommonProps & { href: string } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'href' | 'className' | 'children'
  >;
type ButtonAsButton = CommonProps & { href?: undefined } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'className' | 'children'
  >;

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = 'primary', size = 'md', className, children, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (typeof rest.href === 'string') {
    const { href, ...anchorProps } = rest as ButtonAsLink;
    const external = /^(https?:|tel:|mailto:)/.test(href);
    if (external) {
      return (
        <a className={classes} href={href} {...anchorProps}>
          {children}
        </a>
      );
    }
    return (
      <Link className={classes} href={href} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { ...buttonProps } = rest as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
