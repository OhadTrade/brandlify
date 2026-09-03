import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * shadcn's Label, without Radix.
 *
 * The published version wraps `@radix-ui/react-label`, whose only additions
 * over a native <label> are forwarding a click to the control and the
 * `peer-disabled` styling hook. A native label already does the first, and the
 * second is one Tailwind class — so this keeps the API and drops a runtime
 * dependency that would ship on every page carrying a form.
 */
const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-fg text-sm leading-none font-semibold',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = 'Label';

export { Label };
