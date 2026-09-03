import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * shadcn's Input on this project's tokens.
 *
 * The published file styles itself with `border-input`, `bg-background`,
 * `ring-ring` and `ring-offset-background`, none of which exist here. The API
 * is unchanged; only the colours are ours.
 *
 * The focus treatment is a border colour rather than a ring, because the site
 * already has one global focus-visible ring in globals.css and two overlapping
 * indicators read as a rendering fault.
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'rounded-btn border-line bg-elevated text-fg placeholder:text-muted/70 h-11 w-full border px-4 text-sm',
        'ease-snap transition-colors duration-200 hover:border-line-strong focus:border-magenta focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-magenta',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
