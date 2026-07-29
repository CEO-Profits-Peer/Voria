import { Suspense } from 'react';
import { AuthFormular } from '@/features/auth/AuthFormular';

export const metadata = { title: 'Konto anlegen · Voria' };

export default function RegistrierenSeite() {
  return (
    <Suspense>
      <AuthFormular modus="registrieren" />
    </Suspense>
  );
}
