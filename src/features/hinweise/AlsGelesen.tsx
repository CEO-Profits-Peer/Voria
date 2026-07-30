'use client';

/**
 * Hakt die Hinweise ab, nachdem die Seite steht.
 *
 * WARUM DAS NICHT IN DER SEITE SELBST PASSIERT
 *
 * `hinweiseGelesen()` ist eine Server-Action und schreibt in die
 * Datenbank. Ruft man sie direkt im Rendern der Server-Komponente auf,
 * lehnt Next.js das ab — Schreibvorgänge während des Renderns sind
 * nicht erlaubt, und `revalidatePath` dort erst recht nicht. Der Build
 * merkt davon nichts, weil die Seite dynamisch ist und beim Bauen gar
 * nicht ausgeführt wird. Es hätte erst den ersten echten Aufruf
 * getroffen.
 *
 * Nach dem Einhängen ist es außerdem das ehrlichere Verhalten:
 * abgehakt wird, was tatsächlich auf dem Schirm stand.
 */

import { useEffect } from 'react';
import { hinweiseGelesen } from './actions';

export function AlsGelesen() {
  useEffect(() => {
    hinweiseGelesen();
  }, []);

  return null;
}
