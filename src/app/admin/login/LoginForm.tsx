'use client';

import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { signIn } from '../actions';

const field =
  'w-full rounded-btn border border-line bg-elevated px-4 py-3 text-fg transition-colors ' +
  'duration-200 focus:border-magenta focus:outline-none';

export function LoginForm() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={params.get('next') ?? '/admin'} />

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-fg text-sm font-semibold">
          אימייל
        </label>
        <input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          required
          autoComplete="username"
          className={`${field} text-start`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-fg text-sm font-semibold">
          סיסמה
        </label>
        <input
          id="password"
          name="password"
          type="password"
          dir="ltr"
          required
          autoComplete="current-password"
          className={`${field} text-start`}
        />
      </div>

      {state?.error ? (
        <p role="alert" className="border-magenta text-pink rounded-btn border p-3 text-sm">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-cta rounded-btn font-heading mt-2 flex h-12 items-center justify-center font-bold text-white disabled:opacity-60"
      >
        {pending ? 'מתחבר…' : 'כניסה'}
      </button>
    </form>
  );
}
