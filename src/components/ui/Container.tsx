import type { ReactNode } from 'react';
import { asElement, type HtmlTag } from '@/lib/polymorphic';
import { cn } from '@/lib/utils';

type ContainerProps = {
  as?: HtmlTag;
  className?: string;
  children: ReactNode;
};

/** 1280px max width, 16px gutters on mobile and 24px from md up. */
export function Container({ as: tag = 'div', className, children }: ContainerProps) {
  const Tag = asElement(tag);
  return (
    <Tag className={cn('mx-auto w-full max-w-(--container-page) px-4 md:px-6', className)}>
      {children}
    </Tag>
  );
}
