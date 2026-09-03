import type { ReactNode } from 'react';

/** Shared admin form controls. Plain HTML — these are server-rendered forms. */

const base =
  'w-full rounded-btn border border-line bg-elevated px-4 py-2.5 text-fg text-sm ' +
  'transition-colors duration-200 focus:border-magenta focus:outline-none';

export function Field({
  label,
  name,
  hint,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-fg text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint ? <p className="text-muted text-xs">{hint}</p> : null}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { name: string }) {
  return <input id={props.name} {...props} className={`${base} ${props.className ?? ''}`} />;
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { name: string },
) {
  return (
    <textarea id={props.name} {...props} className={`${base} resize-y ${props.className ?? ''}`} />
  );
}

export function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input
        id={name}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="accent-magenta h-4 w-4"
      />
      <span className="text-fg text-sm font-semibold">{label}</span>
    </label>
  );
}

export function SubmitBar({ cancelHref }: { cancelHref: string }) {
  return (
    <div className="border-line flex items-center gap-3 border-t pt-6">
      <button
        type="submit"
        className="bg-cta rounded-btn font-heading flex h-11 items-center px-6 font-bold text-white"
      >
        שמירה
      </button>
      <a
        href={cancelHref}
        className="text-muted hover:text-fg rounded-btn px-4 py-2 text-sm transition-colors"
      >
        ביטול
      </a>
    </div>
  );
}
