import * as React from 'react';
import { cn } from '@/lib/utils';

/** shadcn's Textarea on this project's tokens. API unchanged. */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'rounded-btn border-line bg-elevated text-fg placeholder:text-muted/70 min-h-24 w-full resize-y border px-4 py-3 text-sm',
      'ease-snap transition-colors duration-200 hover:border-line-strong focus:border-magenta focus:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-invalid:border-magenta',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { Textarea };
