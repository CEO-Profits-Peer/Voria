/**
 * „Neue Reise" — das Formular.
 *
 * Eigene Client-Komponente, weil ein Schreibfehler sichtbar sein muss.
 * Vorher war das ein reines Server-Formular ohne Rückkanal: schlug das
 * Insert fehl, kam die Seite unverändert zurück und sagte nichts.
 *
 * Zu den Stilen: `.fehler` steht auf einem <p>, also einem echten
 * DOM-Element — styled-jsx greift hier. Bei einem <Link> wäre das
 * anders, siehe src/styles/huelle.css.
 */

'use client';

import { useActionState } from 'react';
import { Feld } from '@/ui/Feld';
import { Knopf } from '@/ui/Knopf';
import { useT } from '@/i18n/Sprachraum';
import { reiseAnlegen, type ReiseErgebnis } from './actions';

const LEER: ReiseErgebnis = {};

export function NeueReiseFormular() {
  const { t } = useT();
  const [zustand, absenden, laeuft] = useActionState(reiseAnlegen, LEER);

  return (
    <form action={absenden} className="formular">
      <h1>{t.log.wohinGehtEs}</h1>
      <p>{t.log.allesAenderbar}</p>

      {zustand.fehler && (
        <p className="fehler" role="alert">
          {zustand.fehler}
        </p>
      )}

      <Feld
        name="titel"
        beschriftung={t.log.nameDerReise}
        placeholder="Vier Wochen Marokko"
        required
        autoFocus
      />
      <Feld name="von" type="date" beschriftung={t.log.ersterTag} />
      <Feld
        name="land"
        beschriftung={t.log.land}
        placeholder="MA"
        maxLength={2}
        hilfe={t.log.landHilfe}
        autoCapitalize="characters"
      />

      <Knopf type="submit" art="primaer" groesse="gross" breit disabled={laeuft}>
        {laeuft ? t.auth.einenMoment : t.log.reiseAnlegen}
      </Knopf>

      <style jsx>{`
        .fehler {
          margin: 0;
          padding: var(--space-12) var(--space-16);
          border-left: 2px solid var(--state-danger);
          background: var(--surface-sunken);
          font-family: var(--font-ui);
          font-size: var(--size-14);
          line-height: var(--leading-normal);
          color: var(--content-primary);
        }
      `}</style>
    </form>
  );
}
