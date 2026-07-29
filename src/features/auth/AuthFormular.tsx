'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Feld } from '@/ui/Feld';
import { Knopf } from '@/ui/Knopf';
import { useT } from '@/i18n/Sprachraum';
import { anmelden, registrieren, type AuthErgebnis } from './actions';

const LEER: AuthErgebnis = {};

export function AuthFormular({ modus }: { modus: 'anmelden' | 'registrieren' }) {
  const { t } = useT();
  const istNeu = modus === 'registrieren';
  const [zustand, absenden, laeuft] = useActionState(istNeu ? registrieren : anmelden, LEER);
  const weiter = useSearchParams().get('weiter') ?? '/log';

  return (
    <form action={absenden}>
      <input type="hidden" name="weiter" value={weiter} />

      <h1>{istNeu ? t.auth.tagebuchAnfangen : t.auth.willkommenZurueck}</h1>
      <p className="unterzeile">
        {istNeu ? t.auth.bleibtPrivat : t.auth.wartetAufDich}
      </p>

      <div className="felder">
        {istNeu && (
          <Feld
            name="benutzername"
            beschriftung={t.auth.benutzername}
            placeholder="anna_unterwegs"
            autoComplete="username"
            hilfe={t.auth.benutzernameHilfe}
            required
          />
        )}
        <Feld
          name="email"
          type="email"
          beschriftung={t.auth.email}
          placeholder="du@beispiel.de"
          autoComplete="email"
          required
        />
        <Feld
          name="passwort"
          type="password"
          beschriftung={t.auth.passwort}
          autoComplete={istNeu ? 'new-password' : 'current-password'}
          hilfe={istNeu ? t.auth.passwortHilfe : undefined}
          required
        />
      </div>

      {zustand.fehler && (
        <p className="fehler" role="alert">
          {zustand.fehler}
        </p>
      )}

      {!istNeu && (
        <Link href="/passwort" className="vergessen">
          {t.auth.passwortVergessenLink}
        </Link>
      )}

      <Knopf type="submit" art="primaer" groesse="gross" breit disabled={laeuft}>
        {laeuft ? t.auth.einenMoment : istNeu ? t.auth.registrieren : t.auth.anmelden}
      </Knopf>

      <p className="wechsel">
        {istNeu ? (
          <>
            {t.auth.schonKonto} <Link href="/anmelden">{t.auth.anmelden}</Link>
          </>
        ) : (
          <>
            {t.auth.nochKeinKonto} <Link href="/registrieren">{t.auth.einesAnlegen}</Link>
          </>
        )}
      </p>

      <style jsx>{`
        form {
          display: flex;
          flex-direction: column;
          gap: var(--space-24);
          width: 100%;
          max-width: 400px;
        }
        h1 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--size-38);
          line-height: var(--leading-tight);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-regular);
        }
        .unterzeile {
          margin: calc(var(--space-24) * -1) 0 0;
          font-size: var(--size-16);
          line-height: var(--leading-normal);
          color: var(--content-secondary);
          text-wrap: pretty;
        }
        .felder {
          display: flex;
          flex-direction: column;
          gap: var(--space-20);
        }
        .fehler {
          margin: 0;
          padding: var(--space-12) var(--space-16);
          border-left: 2px solid var(--state-danger);
          background: var(--surface-sunken);
          font-size: var(--size-14);
          line-height: var(--leading-normal);
          color: var(--content-primary);
        }
        /* :global(), weil styled-jsx <Link> nicht scopet.
           Gescopet bleibt es durch das <form> davor. */
        form :global(a.vergessen) {
          margin-top: -8px;
          align-self: flex-start;
          font-family: var(--font-ui);
          font-size: 12px;
          color: var(--content-muted);
        }
        .wechsel {
          margin: 0;
          font-size: var(--size-14);
          color: var(--content-muted);
          text-align: center;
        }
      `}</style>
    </form>
  );
}
