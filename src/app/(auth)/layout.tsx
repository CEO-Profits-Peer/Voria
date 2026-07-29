/**
 * Hülle für Anmeldung und Registrierung.
 * Kein Navigationsgerüst — hier gibt es genau eine Aufgabe.
 */
import Link from 'next/link';
import stile from './layout.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={stile.wrap}>
      <Link href="/" className={stile.marke}>
        Voria
      </Link>
      <div className={stile.mitte}>{children}</div>
    </div>
  );
}
