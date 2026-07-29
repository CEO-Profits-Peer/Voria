import { Suspense } from 'react';
import { AuthFormular } from '@/features/auth/AuthFormular';

export const metadata = { title: 'Anmelden · Voria' };

export default function AnmeldenSeite() {
  return (
    <Suspense>
      <AuthFormular modus="anmelden" />
    </Suspense>
  );
}
