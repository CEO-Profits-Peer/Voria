import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { texte } from '@/i18n/server';

export const metadata = {
  title: 'Voria PRO',
  description: 'Ohne Werbung, ohne Fotogrenze, mit einem Material, das man sieht.',
};

/**
 * Die Preisseite. Fassung A aus dem Entwurf: zuerst das Papier, dann
 * der Preis.
 *
 * WARUM KEIN VERGLEICHSRASTER MIT HÄKCHEN
 *
 * Der Wettbewerb macht genau das, und es funktioniert dort schlecht:
 * zwölf Häkchen, von denen die Hälfte Gratisfunktionen sind, und zwei
 * Spalten, die sich in einer Zeile unterscheiden. Wer rechnen muss,
 * um zu verstehen, was er kauft, bricht ab.
 *
 * Hier steht stattdessen ein echtes Blatt, danach der Preis in einem
 * Satz, danach fünf Absätze in ganzen Sätzen. Zeigen schlägt
 * aufzählen.
 *
 * ÖFFENTLICH, nicht unter (app): Wer wissen will, was Voria kostet,
 * soll das ohne Konto erfahren können.
 */
export default async function ProSeite() {
  const { t } = await texte();

  const merkmale = [
    { titel: t.pro.werbungTitel, text: t.pro.werbungText },
    { titel: t.pro.fotosTitel, text: t.pro.fotosText },
    { titel: t.pro.materialTitel, text: t.pro.materialText },
    { titel: t.pro.pdfTitel, text: t.pro.pdfText },
  ];

  return (
    <div className="pro-seite">
      <Link href="/du/einstellungen" className="zurueck-zeile">
        <ChevronLeft size={18} strokeWidth={1.5} aria-hidden /> {t.einstellungen.titel}
      </Link>

      <h1 className="gross">{t.pro.titel}</h1>
      <p className="pro-lead">{t.pro.lead}</p>

      {/* Das Blatt. Dasselbe Muster wie die Vorschau in den
          Einstellungen, nur ohne Schalter — hier wird gezeigt, nicht
          eingestellt. */}
      <div
        className="pro-blatt-gross region-surface"
        data-region="neutral"
        data-pro-design="nordlicht"
        data-pro-material="an"
      >
        <span className="ornament-corner" aria-hidden />
        <div className="pro-blatt-inhalt">
          <span className="pro-meta">{t.pro.blattMeta}</span>
          <h2>{t.pro.blattTitel}</h2>
          <p>{t.pro.blattText}</p>
          <div className="ornament-divider" />
        </div>
      </div>
      <p className="pro-blatt-zeile">{t.pro.blattZeile}</p>

      <div className="pro-preis">
        <span className="pro-zahl">{t.pro.preisMonat}</span>
        <span className="pro-zusatz">{t.pro.preisMonatZusatz}</span>
      </div>
      <p className="pro-jahr">{t.pro.preisJahr}</p>
      <p className="pro-ruhe">{t.pro.preisRuhe}</p>

      {/*
        Noch kein Kauf möglich: Es gibt kein Konto beim
        Zahlungsanbieter. Statt eines Knopfes, der nichts tut, steht
        hier ein ehrlicher Satz. Ein toter Knopf wäre die schlechtere
        Wahl — man drückt ihn, und nichts passiert.
      */}
      <p className="pro-bald">{t.pro.baldVerfuegbar}</p>

      <div className="pro-merkmale">
        {merkmale.map((m, i) => (
          <section key={m.titel}>
            {i > 0 && <div className="ornament-divider" />}
            <h2>{m.titel}</h2>
            <p>{m.text}</p>
          </section>
        ))}
      </div>

      <p className="pro-grenze">{t.pro.grenze}</p>
    </div>
  );
}
