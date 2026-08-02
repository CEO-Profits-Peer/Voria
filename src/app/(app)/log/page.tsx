import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { ladeReisen, type Reise } from '@/features/log/queries';
import { Karte, Seitenkopf, Trenner } from '@/ui/Bausteine';
import { LeererBereich } from '@/ui/LeererBereich';
import { BeitragStarten } from '@/features/social/BeitragStarten';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Log · Voria' };

export default async function LogSeite() {
  const [reisen, { t, locale }] = await Promise.all([ladeReisen(), texte()]);

  if (reisen.length === 0) {
    return (
      <LeererBereich
        titel={t.log.keineReise}
        zeile={t.log.keineReiseZeile}
        aktion={
          <Link href="/log/neu" className="anlegen">
            <Plus size={18} strokeWidth={1.5} aria-hidden /> {t.log.ersteReiseAnlegen}
          </Link>
        }
      />
    );
  }

  const f = (s: string) =>
    new Date(s).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

  const jahre = nachJahren(reisen);

  return (
    <div className="seite">
      <Seitenkopf
        titel={t.log.deineReisen}
        aktion={
          <span className="kopf-aktionen">
            <Link href="/suche" className="rund" aria-label={t.nav.suchen}>
              <Search size={20} strokeWidth={1.5} aria-hidden />
            </Link>
            {/* Zwei Wege, und der Unterschied steht in den Worten:
                eine REISE anlegen ist das Große, ein BEITRAG ist der
                einzelne Tag von heute.

                `erklaerung`: das Fragezeichen daneben, das sagt, was
                dabei entsteht. Hier ja, im Feed nicht — dort will man
                los, hier hat man Ruhe. */}
            <BeitragStarten kompakt erklaerung />
            <Link href="/log/neu" className="anlegen">
              <Plus size={18} strokeWidth={1.5} aria-hidden /> {t.log.neueReise}
            </Link>
          </span>
        }
      />

      {jahre.map(({ jahr, reisen: gruppe }, g) => (
        <section key={jahr ?? 'ohne'} className="jahr">
          {/* Bei nur einer Gruppe wäre die Überschrift reine Zierde —
              der Halt beim Scrollen entsteht erst, wenn es mehrere gibt. */}
          {jahre.length > 1 && <Trenner beschriftung={jahr ?? t.log.ohneDatum} />}
          <div className="raster">
            {gruppe.map((r, k) => (
              <Karte
                key={r.id}
                reihe={g === 0 ? k : 0}
                href={`/log/${r.id}`}
                region={r.region}
                meta={r.von ? (r.bis ? `${f(r.von)} – ${f(r.bis)}` : f(r.von)) : t.log.ohneDatum}
                titel={r.titel}
                auszug={`${r.tage} ${r.tage === 1 ? t.log.tag : t.log.tage}${
                  r.region !== 'neutral' ? ` · ${t.regionen[r.region]}` : ''
                }`}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * Reisen nach Jahr bündeln. Die Liste kommt bereits absteigend nach
 * Startdatum, Reisen ohne Datum am Ende — die Reihenfolge bleibt also
 * erhalten, und das Jahr ohne Datum landet von selbst hinten.
 *
 * Das Jahr wird aus der Zeichenkette geschnitten, nicht über `Date`
 * gelesen: `new Date('2026-01-01')` ist UTC-Mitternacht und liefert in
 * westlichen Zeitzonen den 31.12. des Vorjahres. Eine Reise wäre dann
 * im falschen Jahr einsortiert.
 */
function nachJahren(reisen: Reise[]): { jahr: string | null; reisen: Reise[] }[] {
  const gruppen: { jahr: string | null; reisen: Reise[] }[] = [];

  for (const r of reisen) {
    const jahr = r.von ? r.von.slice(0, 4) : null;
    const letzte = gruppen[gruppen.length - 1];
    if (letzte && letzte.jahr === jahr) letzte.reisen.push(r);
    else gruppen.push({ jahr, reisen: [r] });
  }

  return gruppen;
}
