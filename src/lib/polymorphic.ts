import type { ReactNode, Ref } from 'react';

/**
 * Tags a component may render as.
 *
 * Kept to a deliberate list rather than `ElementType` because
 * @react-three/fiber augments the global JSX namespace with every three.js
 * object. An unconstrained tag then has to satisfy the props of all of them at
 * once — TypeScript first resolves that intersection to `never`, and once the
 * list grows gives up with "union type that is too complex to represent".
 */
export type HtmlTag =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'nav'
  | 'main'
  | 'ul'
  | 'ol'
  | 'li'
  | 'p'
  | 'span'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4';

type PolymorphicProps = {
  className?: string;
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
  'data-reveal'?: string;
};

/**
 * Present a chosen tag as one simple component signature.
 *
 * The runtime element is exactly the tag that was passed; this only stops
 * TypeScript from having to reconcile every member of the union above (and
 * everything R3F added alongside them) on each use site.
 */
export function asElement(tag: HtmlTag): (props: PolymorphicProps) => ReactNode {
  return tag as unknown as (props: PolymorphicProps) => ReactNode;
}
