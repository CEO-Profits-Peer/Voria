import { PasswortFormular } from '@/features/auth/PasswortFormular';

export const metadata = { title: 'Neues Passwort · Voria' };

export default function NeuesPasswortSeite() {
  return <PasswortFormular schritt="neu" />;
}
