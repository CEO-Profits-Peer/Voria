import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { seitenUrl } from '@/lib/site-url';
import { texte } from '@/i18n/server';
import type { OeffentlicherRueckblick } from '@/features/rueckblick/teilenActions';

/**
 * Ein geteilter Jahresrückblick — öffentlich, ohne Anmeldung.
 *
 * Die Rolle steht in der Gesamtbeschreibung: „etwas, das man herzeigen
 * will, entstanden aus dem, was ohnehin da ist". Bei einem
 * Nebenprodukt ohne Marketing ist das neben dem geteilten Tag der
 * einzige Weg, auf dem Voria neue Leute erreicht.
 *
 * WAS HIER STEHT, IST BEWUSST WENIG: Zahlen und Länder. Keine Titel,
 * keine Orte, keine Texte, keine Fotos. Der Grund steht in
 * `teilenActions.ts` — der Rückblick in der App enthält
 * selbstgeschriebenen Text aus möglicherweise privaten Tagen, und der
 * darf nie hierher gelangen. Deshalb liest diese Seite eine erstarrte
 * Kopie und nicht die Abfrage von drinnen.
 *
 * Die Kennung IST das Geheimnis. Sie lässt sich nicht auflisten: Es
 * gibt keine öffentliche Leseregel auf der Tabelle, nur die Funktion
 * `rueckblick_oeffentlich`, die ausschließlich bei genauer
 * Übereinstimmung antwortet.
 */

interface Zeile {
  jahr: number;
  anzeigename: string;
  daten: OeffentlicherRueckblick;
}

async function holen(token: string): Promise<Zeile | null> {
  /*
   * Eine unbrauchbare Kennung erst gar nicht an die Datenbank geben —
   * Postgres würde bei einer Zeichenkette, die keine UUID ist, mit
   * einem Fehler antworten statt mit „nichts gefunden".
   */
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;

  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc('rueckblick_oeffentlich', { kennung: token });

  if (error) {
    console.error('[rueckblick oeffentlich]', error);
    return null;
  }

  const zeile = (data as Zeile[] | null)?.[0];
  return zeile ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const zeile = await holen(token);
  if (!zeile) return { title: 'Voria' };

  const titel = `${zeile.jahr} in ${zeile.daten.laender.length} ${
    zeile.daten.laender.length === 1 ? 'Land' : 'Ländern'
  }`;

  return {
    title: `${titel} · Voria`,
    description: `${zeile.daten.tage} Tage, ${zeile.daten.fotos} Fotos — ein Jahresrückblick aus Voria.`,
    openGraph: {
      title: titel,
      description: `${zeile.daten.tage} Tage, ${zeile.daten.fotos} Fotos.`,
      url: `${seitenUrl()}/r/${token}`,
      type: 'article',
    },
  };
}

export default async function GeteilterRueckblick({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [zeile, { t, locale }] = await Promise.all([holen(token), texte()]);
  if (!zeile) notFound();

  const d = zeile.daten;
  const zahl = (n: number) => n.toLocaleString(locale);
  const hauptregion = d.regionen[0];

  return (
    <main className="r-seite">
      <article className="region-surface r-blatt" data-region={hauptregion ?? 'neutral'}>
        <span className="ornament-corner" aria-hidden />

        <span className="r-klein">{zeile.anzeigename || t.marke}</span>
        <h1>{zeile.jahr}</h1>
        <div className="ornament-divider" />

        <dl className="r-zahlen">
          <div>
            <dt>{d.tage === 1 ? t.log.tag : t.log.tage}</dt>
            <dd>{zahl(d.tage)}</dd>
          </div>
          <div>
            <dt>{t.rueckblick.worte}</dt>
            <dd>{zahl(d.worte)}</dd>
          </div>
          <div>
            <dt>{t.rueckblick.fotos}</dt>
            <dd>{zahl(d.fotos)}</dd>
          </div>
          <div>
            <dt>{d.laender.length === 1 ? t.log.land : t.log.laender}</dt>
            <dd>{zahl(d.laender.length)}</dd>
          </div>
        </dl>

        {d.regionen.length > 0 && (
          <div className="r-regionen">
            {d.regionen.map((r) => (
              <span key={r} className="region-surface r-region" data-region={r}>
                {t.regionen[r]}
              </span>
            ))}
          </div>
        )}
      </article>

      {/*
        Zurückhaltend, wie auf der Beitragsseite: eine Zeile, die sagt,
        woher das kommt. Wer mehr will, klickt.
      */}
      <footer className="r-fuss">
        <Link href="/">
          {t.rueckblick.ausVoria} <strong>{t.marke}</strong>
        </Link>
      </footer>
    </main>
  );
}
