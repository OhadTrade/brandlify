import s from './editorial.module.css';

export function ServiceArtwork({ slug }: { slug: string }) {
  return <div className={s.art} data-kind={slug} aria-hidden="true"><i /><i /></div>;
}
