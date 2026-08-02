'use client';

/**
 * Teilen — pro Tag, nicht pro Konto.
 *
 * Das ist der Kern des Privatsphäre-Versprechens: Sichtbarkeit ist eine
 * Entscheidung für diesen einen Eintrag. Wer nichts teilt, verliert nichts,
 * und die Voreinstellung bleibt immer privat.
 *
 * Der Dialog nennt beim Namen, was passiert — kein „Öffentlich" als
 * Schalter ohne Erklärung.
 */

import { useState, useTransition } from 'react';
import { Lock, Users, Globe, X, ImagePlus } from 'lucide-react';
import { Knopf } from '@/ui/Knopf';
import { Schalterzeile } from '@/ui/Schalterzeile';
import { useT } from '@/i18n/Sprachraum';
import { sichtbarkeitSetzen, titelSpeichern } from './actions';
import { bildUrl } from '@/lib/bild-url';

type Stufe = 'private' | 'followers' | 'public';



export function TeilenDialog({
  eintragId,
  jetzt,
  aufSchliessen,
  region = 'neutral',
  verfasser,
  titel,
  ort,
  auszug,
  bilder,
  aufFotoWaehlen,
}: {
  eintragId: string;
  jetzt: Stufe;
  aufSchliessen: () => void;
  /** Damit die Vorschau dasselbe Material trägt wie später im Feed. */
  region?: string;
  verfasser: string;
  titel: string | null;
  ort: string | null;
  /** Der Anfang des Tagestextes — steht in der Vorschau, wenn kein
      Begleitsatz getippt ist. */
  auszug: string | null;
  /** Die Bilder des Tages, in der Reihenfolge des Eintrags. */
  bilder: { id: string; pfad: string }[];
  aufFotoWaehlen: () => void;
}) {
  const { t } = useT();
  const [stufe, setStufe] = useState<Stufe>(jetzt);
  const [kommentare, setKommentare] = useState(true);
  const [titelJetzt, setTitelJetzt] = useState(titel ?? '');

  const stufen = [
    { wert: 'private' as Stufe, Icon: Lock, name: t.teilen.privat, erklaerung: t.teilen.privatErklaerung },
    { wert: 'followers' as Stufe, Icon: Users, name: t.teilen.folgende, erklaerung: t.teilen.folgendeErklaerung },
    { wert: 'public' as Stufe, Icon: Globe, name: t.teilen.oeffentlich, erklaerung: t.teilen.oeffentlichErklaerung },
  ];
  const [text, setText] = useState('');
  const [laeuft, starten] = useTransition();
  const [fehler, setFehler] = useState<string | null>(null);

  /*
   * Der Dialog schloss sich früher immer — auch wenn das Veröffentlichen
   * fehlschlug. Der Tag sah danach geteilt aus, im Feed stand aber
   * nichts, und niemand konnte sehen warum. Jetzt bleibt der Dialog im
   * Fehlerfall offen und sagt, was los ist.
   */
  const sichern = () =>
    starten(async () => {
      setFehler(null);
      const ergebnis = await sichtbarkeitSetzen(
        eintragId,
        stufe,
        stufe === 'public' ? text : '',
        kommentare,
      );
      if (ergebnis?.fehler) {
        setFehler(ergebnis.fehler);
        return;
      }
      aufSchliessen();
    });

  return (
    <div className="grund dialog-grund" onClick={aufSchliessen}>
      <div
        className="blatt dialog-blatt beitrag-blatt"
        /* Zweispaltig erst, wenn es etwas zu zeigen gibt. Bei „nur für
           dich" wäre die zweite Spalte leer, und ein breiter Kasten
           mit einer leeren Hälfte sieht kaputt aus. */
        data-weit={stufe === 'public'}
        role="dialog"
        aria-label={t.beitrag.knopf}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="zu" onClick={aufSchliessen} aria-label={t.zustand.schliessen}>
          <X size={20} strokeWidth={1.5} aria-hidden />
        </button>

        <h2>{t.beitrag.knopf}</h2>

        <div className="beitrag-spalten">
          <div className="beitrag-links">
            <span className="feld-etikett">{t.beitrag.werSieht}</span>

            <div className="stufen" role="radiogroup" aria-label={t.teilen.titel}>
              {stufen.map(({ wert, Icon, name, erklaerung }) => (
                <button
                  key={wert}
                  type="button"
                  role="radio"
                  aria-checked={stufe === wert}
                  data-aktiv={stufe === wert}
                  onClick={() => setStufe(wert)}
                >
                  <Icon size={20} strokeWidth={1.5} aria-hidden />
                  <span className="text">
                    <span className="name">{name}</span>
                    <span className="erklaerung">{erklaerung}</span>
                  </span>
                </button>
              ))}
            </div>

            {stufe === 'public' && (
              <>
                {/* Der Titel des Tages, hier bearbeitbar — man soll den
                    Dialog nicht schließen müssen, um dem Beitrag eine
                    Überschrift zu geben. Gesichert wird über dieselbe
                    Action wie im Tagesblatt, beim Verlassen des Feldes. */}
                <label className="dazu">
                  <span>{t.beitrag.titelFeld}</span>
                  <input
                    value={titelJetzt}
                    onChange={(e) => setTitelJetzt(e.target.value)}
                    onBlur={() => titelSpeichern(eintragId, titelJetzt)}
                    placeholder={t.log.titelPlatzhalter}
                  />
                </label>

                {/* Die Bilder des Tages, gezeigt statt auswählbar.
                    Welches oben steht, entscheidet die Reihenfolge im
                    Eintrag — ein zweites Ordnungssystem daneben wäre
                    genau die Doppelung, die dieses Projekt vermeidet. */}
                <div className="beitrag-bilder">
                  <span className="feld-etikett">{t.beitrag.bilder}</span>

                  {bilder.length === 0 ? (
                    <p className="beitrag-leer">{t.beitrag.keineBilder}</p>
                  ) : (
                    <>
                      <div className="beitrag-streifen">
                        {bilder.map((b, i) => (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img key={b.id} src={bildUrl(b.pfad)} alt="" data-erstes={i === 0} />
                        ))}
                      </div>
                      <span className="beitrag-fein">{t.beitrag.bilderZeile}</span>
                    </>
                  )}

                  <button type="button" className="beitrag-bild-knopf" onClick={aufFotoWaehlen}>
                    <ImagePlus size={15} strokeWidth={1.75} aria-hidden />
                    {t.beitrag.bildDazu}
                  </button>
                </div>

                <label className="dazu">
                  <span>{t.teilen.einSatzDazu}</span>
                  <textarea
                    rows={3}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t.teilen.optional}
                  />
                </label>

                {/*
                  KOMMENTARE JE BEITRAG, nicht je Konto. Dieselbe
                  Begründung wie bei der Sichtbarkeit: Ein Tag über
                  einen gestorbenen Großvater und ein Tag über einen
                  verpassten Bus sind nicht dieselbe Sache.
                */}
                <Schalterzeile
                  wort={t.teilen.kommentareOffen}
                  zeile={t.teilen.kommentareOffenZeile}
                  an={kommentare}
                  beimUmlegen={setKommentare}
                />
              </>
            )}
          </div>

          {/*
            DIE VORSCHAU, rechts am Rechner und unten am Handy.

            Vorher stand hier nur eine Erklärung in Worten. Wer zum
            ersten Mal etwas teilt, will vor allem eines wissen: wie
            sieht das aus, wenn Fremde es sehen? Zeigen schlägt
            aufzählen — dieselbe Antwort wie bei PRO.
          */}
          {stufe === 'public' && (
            <div className="beitrag-rechts">
              <span className="vorschau-etikett">{t.teilen.soSiehtEsAus}</span>

              <div className="region-surface vorschau-karte" data-region={region}>
                <div className="vorschau-kopf">
                  <span className="vorschau-avatar" aria-hidden />
                  <span className="vorschau-wer">
                    <strong>{verfasser}</strong>
                    <span>
                      {ort ?? t.feed.irgendwo} · {t.teilen.heute}
                    </span>
                  </span>
                </div>

                {bilder[0] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img className="vorschau-bild" src={bildUrl(bilder[0].pfad)} alt="" />
                )}

                {titelJetzt.trim() && <h3>{titelJetzt}</h3>}
                <p>{text.trim() || auszug || t.teilen.vorschauLeer}</p>
                <div className="ornament-divider" />
                <span className="vorschau-fuss">
                  {t.feed.zustimmen}
                  {kommentare ? ` · ${t.kommentar.knopf}` : ''}
                  {` · ${t.feed.teilen}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {fehler && (
          <p className="teilen-fehler" role="alert">
            {fehler}
          </p>
        )}

        <Knopf art="primaer" groesse="gross" breit onClick={sichern} disabled={laeuft}>
          {laeuft
            ? t.auth.einenMoment
            : stufe === 'public'
              ? t.beitrag.veroeffentlichen
              : t.beitrag.aktualisieren}
        </Knopf>
      </div>

      <style jsx>{`
        /* ---- Zwei Spalten am Rechner, gestapelt am Handy ----

           Am Handy ist die Vorschau UNTER dem Formular: Wer tippt,
           schaut aufs Feld — und sieht beim Blick nach unten sofort,
           was daraus wird. Am Rechner steht sie daneben, weil dort
           die Breite ohnehin ungenutzt herumliegt. */
        .beitrag-spalten {
          display: flex;
          flex-direction: column;
          gap: var(--space-24);
        }
        .beitrag-links,
        .beitrag-rechts {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
          min-width: 0;
        }
        @media (min-width: 860px) {
          .beitrag-spalten {
            flex-direction: row;
            align-items: flex-start;
            gap: var(--space-32);
          }
          .beitrag-links {
            flex: 1 1 58%;
          }
          .beitrag-rechts {
            flex: 1 1 42%;
            /* Bleibt stehen, während links gescrollt wird. */
            position: sticky;
            top: 0;
          }
        }

        .feld-etikett {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-semi);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--content-muted);
        }

        /* ---- Bilderstreifen ---- */
        .beitrag-bilder {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .beitrag-streifen {
          display: flex;
          gap: var(--space-8);
          overflow-x: auto;
          /* Der Streifen scrollt für sich, die Seite nicht seitwärts. */
          padding-bottom: var(--space-4);
        }
        .beitrag-streifen img {
          width: 84px;
          height: 84px;
          flex: none;
          object-fit: cover;
          border-radius: var(--radius-8);
          border: 1px solid var(--border-subtle);
        }
        /* Das erste Bild steht im Feed oben — das darf man sehen. */
        .beitrag-streifen img[data-erstes='true'] {
          border-color: var(--accent-primary);
          border-width: 2px;
        }
        .beitrag-leer,
        .beitrag-fein {
          margin: 0;
          font-family: var(--font-ui);
          font-size: 12px;
          color: var(--content-muted);
        }
        .beitrag-bild-knopf {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 40px;
          padding: 0 var(--space-16);
          border: 1px solid var(--border-default);
          border-radius: 7px;
          background: transparent;
          color: var(--content-secondary);
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: var(--weight-medium);
          cursor: pointer;
        }
        .beitrag-bild-knopf:hover {
          border-color: var(--border-strong);
          color: var(--content-primary);
        }

        .dazu input {
          height: 44px;
          padding: 0 var(--space-12);
          border: 1px solid var(--border-default);
          border-radius: 7px;
          background: var(--surface-raised);
          color: var(--content-primary);
          font-family: var(--font-ui);
          font-size: var(--size-16);
        }
        .dazu input:focus {
          outline: none;
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .vorschau-bild {
          width: 100%;
          height: auto;
          max-height: 240px;
          object-fit: cover;
          border-radius: var(--radius-8);
        }

        /* ---- Die Vorschau ---- */
        .vorschau {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .vorschau-etikett {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-semi);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--content-muted);
        }
        .vorschau-karte {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
          padding: var(--space-16);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-14);
          background: var(--raised-tint, var(--surface-raised));
        }
        .vorschau-kopf {
          display: flex;
          align-items: center;
          gap: var(--space-8);
        }
        .vorschau-avatar {
          width: 28px;
          height: 28px;
          flex: none;
          border-radius: var(--radius-full);
          background: var(--accent-soft);
        }
        .vorschau-wer {
          display: flex;
          flex-direction: column;
          min-width: 0;
          font-family: var(--font-ui);
          font-size: 11px;
          color: var(--content-muted);
        }
        .vorschau-wer strong {
          font-size: 13px;
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        .vorschau-karte h3 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--size-20);
          line-height: var(--leading-snug);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        .vorschau-karte p {
          margin: 0;
          font-size: var(--size-14);
          line-height: var(--leading-normal);
          color: var(--content-secondary);
          text-wrap: pretty;
          /* Drei Zeilen genügen: Es ist eine Vorschau, kein Abzug. */
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .vorschau-fuss {
          font-family: var(--font-ui);
          font-size: 11px;
          color: var(--content-muted);
        }
        .teilen-fehler {
          margin: 0;
          padding: var(--space-12) var(--space-16);
          border-left: 2px solid var(--state-danger);
          background: var(--surface-sunken);
          font-family: var(--font-ui);
          font-size: var(--size-14);
          line-height: var(--leading-normal);
          color: var(--content-primary);
        }
        .grund {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          background: var(--surface-scrim);
        }
        .blatt {
          position: relative;
          width: 100%;
          max-width: 440px;
          padding: var(--space-32);
          border-radius: var(--radius-14) var(--radius-14) 0 0;
          background: var(--surface-overlay);
          display: flex;
          flex-direction: column;
          gap: var(--space-20);
          box-shadow: 0 -24px 64px rgb(21 19 17 / 0.18);
        }
        .zu {
          position: absolute;
          top: var(--space-12);
          right: var(--space-12);
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: var(--content-muted);
          cursor: pointer;
        }
        h2 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--size-24);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
        }
        .stufen {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .stufen button {
          display: flex;
          align-items: flex-start;
          gap: var(--space-12);
          padding: var(--space-16);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-8);
          background: transparent;
          color: var(--content-muted);
          text-align: left;
          cursor: pointer;
          transition: border-color var(--motion-feed), background var(--motion-feed);
        }
        .stufen button[data-aktiv='true'] {
          border-color: var(--accent-primary);
          background: var(--accent-soft);
          color: var(--content-accent);
        }
        .text {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .name {
          font-family: var(--font-ui);
          font-size: var(--size-16);
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        .erklaerung {
          font-size: var(--size-14);
          line-height: var(--leading-snug);
          color: var(--content-secondary);
        }
        .dazu {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .dazu span {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-semi);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--content-muted);
        }
        textarea {
          padding: var(--space-12) var(--space-16);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
          color: var(--content-primary);
          font-family: var(--font-ui);
          font-size: var(--size-16);
          line-height: var(--leading-normal);
          resize: vertical;
          outline: none;
        }
        textarea:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        @media (min-width: 900px) {
          .grund {
            align-items: center;
          }
          .blatt {
            border-radius: var(--radius-14);
          }
        }
      `}</style>
    </div>
  );
}
