/**
 * Eine Liste von Kategorien, jede mit einem Wort darunter.
 *
 * WARUM ÜBERHAUPT
 *
 * Die Einstellungen waren eine einzige Seite mit sieben Abschnitten
 * untereinander — Erscheinungsbild, Sprache, Rückmeldung, Startbereich,
 * Hinweise, zwölf Welten, PRO, Konto. Wer den Schalter für die
 * Hinweise suchte, scrollte an einem Schaufenster mit zwölf Themes
 * vorbei. Ein langer Scroll ist keine Übersicht.
 *
 * Server-Komponente: Die Liste kennt keinen Zustand, sie führt nur
 * weiter. Damit landet nichts davon im Browser-Bündel.
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface Kategorie {
  href: string;
  titel: string;
  zeile: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

export function Kategorien({ eintraege }: { eintraege: Kategorie[] }) {
  return (
    <nav className="kategorien">
      {eintraege.map(({ href, titel, zeile, Icon }) => (
        <Link key={href} href={href} className="kategorie">
          <span className="kat-zeichen" aria-hidden>
            <Icon size={18} strokeWidth={1.75} />
          </span>
          <span className="kat-worte">
            <span className="kat-titel">{titel}</span>
            <span className="kat-zeile">{zeile}</span>
          </span>
          <span className="kat-pfeil" aria-hidden>
            <ChevronRight size={18} strokeWidth={1.75} />
          </span>
        </Link>
      ))}
    </nav>
  );
}
