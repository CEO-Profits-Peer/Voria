import Link from 'next/link';
import { ChevronLeft, FileText } from 'lucide-react';
import { ExportKnopf } from '@/features/export/ExportKnopf';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Export · Voria' };

export default async function ExportSeite() {
  const { t } = await texte();

  return (
    <div className="seite">
      <Link href="/du/einstellungen" className="zurueck-zeile">
        <ChevronLeft size={18} strokeWidth={1.5} aria-hidden /> {t.einstellungen.titel}
      </Link>
      <h1 className="gross">{t.export.titel}</h1>

      <div className="export-text">
        <p>{t.export.warum}</p>
        <p>{t.export.wasDrin}</p>
      </div>

      <ExportKnopf />

      <p className="export-fein">{t.export.hinweisFotos}</p>

      {/* Der gesetzte Bogen ist das PRO-Merkmal, die Daten oben sind
          frei. Der Verweis steht trotzdem für alle da — wer ihn
          öffnet, sieht dort, was er bekäme. */}
      <div className="abschnitte" style={{ marginTop: 'var(--space-48)' }}>
        <section>
          <h2>{t.pro.pdfTitel}</h2>
          <p className="unterseite-zeile">{t.pro.pdfText}</p>
          <Link href="/du/export/druck" className="konto-weg">
            <FileText size={16} strokeWidth={1.75} aria-hidden />
            {t.export.druckVerweis}
          </Link>
        </section>
      </div>
    </div>
  );
}
