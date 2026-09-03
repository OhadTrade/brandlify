import Image from 'next/image';
import { cn } from '@/lib/utils';

type Variant = 'horizontal' | 'stacked' | 'mark';

type LogoProps = {
  variant?: Variant;
  /**
   * Use the tone-mapped artwork built for the dark canvas. The supplied lockups
   * are rendered for light backgrounds — their wordmark is 1.28:1 against
   * --color-base and effectively invisible. Default is `true` because every
   * surface on this site is dark.
   */
  onDark?: boolean;
  /** Rendered width in CSS pixels; height follows the artwork's aspect ratio. */
  width?: number;
  priority?: boolean;
  className?: string;
};

const ART: Record<Variant, { light: string; dark: string; w: number; h: number }> = {
  horizontal: {
    light: '/brand/lockup-horizontal.png',
    dark: '/brand/lockup-horizontal-ondark.png',
    w: 800,
    h: 184,
  },
  stacked: {
    light: '/brand/lockup-stacked.png',
    dark: '/brand/lockup-stacked-ondark.png',
    w: 257,
    h: 285,
  },
  // The mark keeps its magenta identity on either background.
  mark: { light: '/brand/mark.png', dark: '/brand/mark.png', w: 318, h: 412 },
};

export function Logo({
  variant = 'horizontal',
  onDark = true,
  width = 160,
  priority = false,
  className,
}: LogoProps) {
  const art = ART[variant];
  return (
    <Image
      src={onDark ? art.dark : art.light}
      alt="Brandlify"
      width={art.w}
      height={art.h}
      priority={priority}
      sizes={`${width}px`}
      style={{ width, height: 'auto' }}
      className={cn('select-none', className)}
    />
  );
}
