import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Pencil } from 'lucide-react';
import { ladeReise } from '@/features/log/queries';
import { Trenner } from '@/ui/Bausteine';
import { heuteAlsDatum } from '@/features/log/datum';
import { TagWaehlen } from '@/features/log/TagWaehlen';
import { texte } from '@/i18n/server';

export default async function ReiseSeite({ params }: { params: Promise<{ reiseId: string }> }) {
  const { reiseId } = await params;
  const [reise, { t, locale }] = await Promise.all([ladeReise(reiseId), texte()]);
  if (!reise) notFound();

  return (
    <div className="region-surface reise" data-region={reise.region}>
      <header>
        <Link href="/log" aria-label={t.log.zurueckZuAllen}>
          <ChevronLeft size={22} strokeWidth={1.5} aria-hidden />
        </Link>
        <span className="kopf-rechts-reise">
          <span className="ornament-corner" aria-hidden />
          <Link href={`/log/${reise.id}/bearbeiten`} aria-label={t.log.reiseBearbeiten}>
            <Pencil size={18} strokeWidth={1.5} aria-hidden />
          </Link>
        </span>
      </header>

      <div className="inhalt">
        <p className="meta">{reise.region !== 'neutral' ? t.regionen[reise.region] : t.log.ohneLand}</p>
        <h1>{reise.titel}</h1>

        <Trenner
          beschriftung={`${reise.tage.length} ${reise.tage.length === 1 ? t.log.tag : t.log.tage}`}
        />

        <ol>
          {reise.tage.map((tag) => (
            <li key={tag.id}>
              <Link href={`/log/${reise.id}/${tag.datum}`}>
                <span className="tag-datum">
                  {new Date(tag.datum).toLocaleDateString(locale, { day: '2-digit', month: 'short' })}
                </span>
                <span className="tag-titel">{tag.titel ?? tag.ort ?? t.log.ohneTitel}</span>
              </Link>
            </li>
          ))}
          {/*
            „Heute schreiben" nur, wenn es für heute noch keinen Tag
            gibt. Vorher stand die Zeile IMMER da — hatte man heute
            schon geschrieben, erschien der Tag zweimal in der Liste:
            einmal mit seinem Titel, einmal als Einladung, ihn
            anzulegen. Beide führten an dieselbe Stelle.
          */}
          {!reise.tage.some((tag) => tag.datum === heuteAlsDatum()) && (
            <li>
              <Link href={`/log/${reise.id}/${heuteAlsDatum()}`} className="neu">
                {t.log.heuteSchreiben}
              </Link>
            </li>
          )}
          <li>
            <TagWaehlen reiseId={reise.id} von={reise.von} bis={reise.bis} />
          </li>
        </ol>
      </div>
    </div>
  );
}
