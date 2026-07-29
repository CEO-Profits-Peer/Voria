import { PasswortFormular } from '@/features/auth/PasswortFormular';

export const metadata = { title: 'Passwort vergessen · Voria' };

export default function PasswortSeite() {
  return <PasswortFormular schritt="anfordern" />;
}
