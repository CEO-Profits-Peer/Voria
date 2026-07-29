'use client';

import { useActionState } from 'react';
import { Feld, Textfeld } from '@/ui/Feld';
import { Knopf } from '@/ui/Knopf';
import { useT } from '@/i18n/Sprachraum';
import { profilSpeichern, type ProfilErgebnis } from './actions';

const LEER: ProfilErgebnis = {};

export function ProfilFormular({
  benutzername,
  anzeigename,
  beschreibung,
  privat,
}: {
  benutzername: string;
  anzeigename: string;
  beschreibung: string;
  privat: boolean;
}) {
  const { t } = useT();
  const [zustand, absenden, laeuft] = useActionState(profilSpeichern, LEER);

  return (
    <form action={absenden} className="wrap">
      <Feld
        name="anzeigename"
        beschriftung={t.profil.anzeigename}
        defaultValue={anzeigename}
        placeholder={benutzername}
        maxLength={60}
      />

      <Feld
        name="benutzername"
        beschriftung={t.auth.benutzername}
        defaultValue={benutzername}
        hilfe={`voria.app/u/${benutzername}`}
        required
      />

      <div className="feld">
        <span className="beschriftung">{t.profil.beschreibung}</span>
        <Textfeld
          name="beschreibung"
          rows={3}
          defaultValue={beschreibung}
          maxLength={280}
          placeholder={t.profil.beschreibungHilfe}
        />
      </div>

      <label className="schalter">
        <input type="checkbox" name="privat" defaultChecked={privat} />
        <span>
          <strong>{t.profil.privatesProfil}</strong>
          {t.profil.privatesProfilHilfe}
        </span>
      </label>

      {zustand.fehler && (
        <p className="fehler" role="alert">
          {zustand.fehler}
        </p>
      )}
      {zustand.gesichert && (
        <p className="gesichert" role="status">
          {t.profil.gesichert}
        </p>
      )}

      <div className="fuss">
        <Knopf type="submit" art="primaer" groesse="gross" disabled={laeuft}>
          {laeuft ? t.auth.einenMoment : t.log.uebernehmen}
        </Knopf>
      </div>

      <style jsx>{`
        .wrap {
          display: flex;
          flex-direction: column;
          gap: 18px;
          max-width: 440px;
        }
        .feld {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .beschriftung {
          font-family: var(--font-ui);
          font-size: 12px;
          font-weight: var(--weight-medium);
          color: var(--content-secondary);
        }
        .schalter {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          background: var(--surface-raised);
          cursor: pointer;
        }
        .schalter input {
          margin-top: 2px;
          width: 16px;
          height: 16px;
          accent-color: var(--accent-primary);
          flex: none;
        }
        .schalter span {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-family: var(--font-ui);
          font-size: 12px;
          line-height: 1.5;
          color: var(--content-muted);
        }
        .schalter strong {
          font-size: 13px;
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        .fehler,
        .gesichert {
          margin: 0;
          padding: 10px 14px;
          border-left: 2px solid var(--state-danger);
          background: var(--surface-sunken);
          font-family: var(--font-ui);
          font-size: 13px;
          line-height: var(--leading-normal);
          color: var(--content-primary);
        }
        .gesichert {
          border-left-color: var(--state-success);
          color: var(--content-secondary);
        }
        .fuss {
          display: flex;
          margin-top: 4px;
        }
      `}</style>
    </form>
  );
}
