'use client';

/**
 * Wörterbuch für Client-Komponenten.
 *
 * Der Server bestimmt die Sprache und reicht sie einmal herunter.
 * `useT()` gibt Texte und Gebietsschema, ohne dass jede Komponente
 * das Cookie selbst lesen muss.
 */

import { createContext, useContext } from 'react';
import { woerterbuch, gebietsschema, type Sprache, type Woerterbuch } from './index';

interface Raum {
  sprache: Sprache;
  t: Woerterbuch;
  locale: string;
}

const Kontext = createContext<Raum | null>(null);

export function Sprachraum({ sprache, children }: { sprache: Sprache; children: React.ReactNode }) {
  const wert: Raum = {
    sprache,
    t: woerterbuch(sprache),
    locale: gebietsschema(sprache),
  };
  return <Kontext.Provider value={wert}>{children}</Kontext.Provider>;
}

export function useT(): Raum {
  const wert = useContext(Kontext);
  if (!wert) {
    // Fällt auf Deutsch zurück, statt die Anwendung abstürzen zu lassen.
    return { sprache: 'de', t: woerterbuch('de'), locale: gebietsschema('de') };
  }
  return wert;
}
