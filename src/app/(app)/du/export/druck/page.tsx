import { notFound } from 'next/navigation';
import { ladeAllesZumMitnehmen } from '@/features/export/queries';
import { DruckStart } from '@/features/export/DruckStart';
import { istPro } from '@/lib/plan';
import { texte } from '@/i18n/server';
import { bildUrl } from '@/lib/bild-url';

export const metadata = { title: 'Gesetzter Bogen · Voria' };

/**
 * Das Tagebuch als gesetzter Bogen — zum Drucken oder als PDF.
 *
 * WARUM KEINE PDF-BIBLIOTHEK
 *
 * Jeder Browser kann seit Jahren „Als PDF speichern", und er tut es
 * besser als eine Bibliothek: Er kennt die Schriften, die Silben-
 * trennung und das Papierformat des Nutzers. Eine PDF-Bibliothek im
 * Bündel wöge mehrere hundert Kilobyte, könnte kein Literata, und
 * müsste den Seitenumbruch selbst erfinden.
 *
 * Also ist der „PDF-Export" eine Seite mit einem sorgfältigen
 * Druck-Stylesheet. Das Ergebnis ist ein echtes, durchsuchbares
 * Dokument statt eines Stapels Bilder — und es ist die Vorstufe zum
 * gedruckten Fotobuch, weil dieselbe Vorlage an eine Druckerei gehen
 * kann.
 *
 * PRO-MERKMAL: Der Export als Daten (`/du/export`) bleibt frei — das
 * ist die Vertrauensarbeit. Der GESETZTE Satz gehört zu PRO.
 */
export default async function DruckSeite() {
  const [daten, { t, locale }, hatPro] = await Promise.all([
    ladeAllesZumMitnehmen(),
    texte(),
    istPro(),
  ]);

  if (!daten) notFound();
  if (!hatPro) {
    return (
      <div className="seite">
        <h1 className="gross">{t.pro.pdfTitel}</h1>
        <p className="unterseite-zeile">{t.pro.pdfText}</p>
        <a href="/pro" className="konto-weg">
          {t.pro.wasKostet}
        </a>
      </div>
    );
  }

  const lang = (iso: string) =>
    iso
      ? new Date(iso).toLocaleDateString(locale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '';

  return (
    <div className="druck">
      <DruckStart hinweis={t.export.druckHinweis} knopf={t.export.drucken} />

      <header className="druck-titelblatt">
        <p className="druck-marke">{t.marke}</p>
        <h1>{daten.profil.anzeigename || daten.profil.benutzername}</h1>
        <p className="druck-spanne">
          {daten.reisen.length} {daten.reisen.length === 1 ? t.log.land : t.log.tage} ·{' '}
          {lang(daten.erstellt.slice(0, 10))}
        </p>
      </header>

      {daten.reisen.map((reise) => (
        <section key={reise.id} className="druck-reise">
          <h2>{reise.titel}</h2>
          {reise.von && (
            <p className="druck-spanne">
              {lang(reise.von)}
              {reise.bis && reise.bis !== reise.von ? ` – ${lang(reise.bis)}` : ''}
            </p>
          )}

          {reise.tage.map((tag) => (
            <article key={`${reise.id}-${tag.datum}`} className="druck-tag">
              <h3>{tag.titel || lang(tag.datum)}</h3>
              <p className="druck-meta">
                {lang(tag.datum)}
                {tag.ort ? ` · ${tag.ort}` : ''}
              </p>

              {tag.bloecke.map((block, i) =>
                block.art === 'text' && block.text?.trim() ? (
                  <p key={i} className="druck-text">
                    {block.text}
                  </p>
                ) : block.foto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={i}
                    className="druck-bild"
                    src={bildUrl(
                      daten.fotos.find((f) => f.datei === block.foto)?.schluessel ?? '',
                    )}
                    alt=""
                  />
                ) : null,
              )}
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
