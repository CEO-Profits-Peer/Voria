import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { ladeReisen } from '@/features/log/queries';
import { Karte, Seitenkopf } from '@/ui/Bausteine';
import { LeererBereich } from '@/ui/LeererBereich';
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

  return (
    <div className="seite">
      <Seitenkopf
        titel={t.log.deineReisen}
        aktion={
          <span className="kopf-aktionen">
            <Link href="/suche" className="rund" aria-label={t.nav.suchen}>
              <Search size={20} strokeWidth={1.5} aria-hidden />
            </Link>
            <Link href="/log/neu" className="anlegen">
              <Plus size={18} strokeWidth={1.5} aria-hidden /> {t.log.neueReise}
            </Link>
          </span>
        }
      />

      <div className="raster">
        {reisen.map((r, k) => (
          <Karte
            key={r.id}
            reihe={k}
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
    </div>
  );
}
