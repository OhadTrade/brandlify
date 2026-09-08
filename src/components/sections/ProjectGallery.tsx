'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import s from './gallery.module.css';

export function ProjectGallery({ images, name, cover = false }: { images: string[]; name: string; cover?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = previous; };
  }, [open]);
  if (images.length === 0) return null;
  const move = (direction: number) => setActive(index => (index + direction + images.length) % images.length);

  return <>
    <ul className={cover ? s.cover : s.grid}>
      {images.map((src, index) => <li key={`${src}-${index}`}>
        <button type="button" className={s.thumbnail} onClick={() => {
          setActive(index);
          dialog.current?.showModal();
          setOpen(true);
        }} aria-label={`הגדלת תמונה ${index + 1} של ${name}`}>
          <Image src={src} alt={`${name} - תמונה ${index + 1}`} fill priority={cover && index === 0}
            sizes={cover ? '95vw' : '(max-width:700px) 95vw, 50vw'} />
          <span className={s.hint}>הגדלה ↗</span>
        </button>
      </li>)}
    </ul>
    <dialog ref={dialog} className={s.dialog} aria-label={`גלריית ${name}`} data-lenis-prevent onClose={() => setOpen(false)}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      onKeyDown={event => {
        if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      }}>
      <div className={s.viewer}>
        <button type="button" className={s.close} onClick={() => dialog.current?.close()} aria-label="סגירת התמונה">סגירה ×</button>
        <div className={s.image}><Image src={images[active]!} alt={`${name} - תמונה ${active + 1}`} fill sizes="95vw" /></div>
        <div className={s.controls}>
          {images.length > 1 && <button type="button" onClick={() => move(-1)}>→ הקודמת</button>}
          <span aria-live="polite">{active + 1} / {images.length}</span>
          {images.length > 1 && <button type="button" onClick={() => move(1)}>הבאה ←</button>}
        </div>
      </div>
    </dialog>
  </>;
}
