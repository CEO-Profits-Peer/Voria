'use client';

/**
 * Passwort zurücksetzen — zwei Schritte.
 *
 * `anfordern`: E-Mail eingeben, Link kommt per Post.
 * `neu`:       nach Klick auf den Link, neues Passwort setzen.
 *
 * Wichtig beim Anfordern: Die Antwort ist immer dieselbe, egal ob die
 * Adresse existiert. Sonst verrät das Formular, wer ein Konto hat.
 */

import { useActionState } from 'react';
import Link from 'next/link';
import { Feld } from '@/ui/Feld';
import { Knopf } from '@/ui/Knopf';
import { useT } from '@/i18n/Sprachraum';
import { passwortAnfordern, passwortSetzen, type AuthErgebnis } from './actions';

const LEER: AuthErgebnis = {};

export function PasswortFormular({ schritt }: { schritt: 'anfordern' | 'neu' }) {
  const { t } = useT();
  const [zustand, absenden, laeuft] = useActionState(
    schritt === 'anfordern' ? passwortAnfordern : passwortSetzen,
    LEER,
  );

  return (
    <form action={absenden}>
      <h1>{schritt === 'anfordern' ? t.auth.passwortVergessen : t.auth.neuesPasswort}</h1>
      <p className="unterzeile">
        {schritt === 'anfordern' ? t.auth.passwortVergessenZeile : t.auth.neuesPasswortZeile}
      </p>

      {schritt === 'anfordern' ? (
        <Feld
          name="email"
          type="email"
          beschriftung={t.auth.email}
          placeholder="du@beispiel.de"
          autoComplete="email"
          required
        />
      ) : (
        <Feld
          name="passwort"
          type="password"
          beschriftung={t.auth.passwort}
          autoComplete="new-password"
          hilfe={t.auth.passwortHilfe}
          required
        />
      )}

      {zustand.fehler && (
        <p className="hinweis" role="alert">
          {zustand.fehler}
        </p>
      )}

      <Knopf type="submit" art="primaer" groesse="gross" breit disabled={laeuft}>
        {laeuft
          ? t.auth.einenMoment
          : schritt === 'anfordern'
            ? t.auth.linkSchicken
            : t.auth.passwortSpeichern}
      </Knopf>

      <p className="wechsel">
        <Link href="/anmelden">{t.auth.anmelden}</Link>
      </p>

      <style jsx>{`
        form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          width: 100%;
          max-width: 380px;
        }
        h1 {
          margin: 0;
          font-family: var(--font-display);
          font-size: 28px;
          line-height: 1.2;
          letter-spacing: -0.02em;
          font-weight: var(--weight-regular);
        }
        .unterzeile {
          margin: -14px 0 0;
          font-family: var(--font-ui);
          font-size: 13px;
          line-height: 1.6;
          color: var(--content-muted);
          text-wrap: pretty;
        }
        .hinweis {
          margin: 0;
          padding: 10px 14px;
          border-left: 2px solid var(--border-strong);
          background: var(--surface-sunken);
          font-family: var(--font-ui);
          font-size: 13px;
          line-height: var(--leading-normal);
          color: var(--content-primary);
        }
        .wechsel {
          margin: 0;
          font-family: var(--font-ui);
          font-size: 13px;
          color: var(--content-muted);
          text-align: center;
        }
      `}</style>
    </form>
  );
}
