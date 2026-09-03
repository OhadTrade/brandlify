import { Suspense } from 'react';
import { LoginForm } from './LoginForm';
import { Logo } from '@/components/ui/Logo';

export const metadata = { title: 'כניסה' };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Logo variant="stacked" width={140} />
        </div>

        <div className="border-line bg-surface rounded-card border p-8">
          <h1 className="text-h3 text-fg mb-2">כניסה לניהול</h1>
          <p className="text-muted mb-7 text-sm">האזור הזה מיועד לצוות Brandlify בלבד.</p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
