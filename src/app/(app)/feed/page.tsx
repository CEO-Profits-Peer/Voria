import { ladeFeed } from '@/features/social/queries';
import { BeitragKarte } from '@/features/social/BeitragKarte';
import { AnzeigeKarte } from '@/features/social/AnzeigeKarte';
import { FeedFlaeche } from '@/features/social/FeedFlaeche';
import { mitAnzeigen } from '@/features/social/werbung';
import { LeererBereich } from '@/ui/LeererBereich';
import { Seitenkopf } from '@/ui/Bausteine';
import { texte } from '@/i18n/server';
import { zeigtWerbung } from '@/lib/plan';

export const metadata = { title: 'Feed · Voria' };

export default async function FeedSeite() {
  const [beitraege, { t }, werbung] = await Promise.all([ladeFeed(), texte(), zeigtWerbung()]);

  if (beitraege.length === 0) {
    return <LeererBereich titel={t.feed.stillHier} zeile={t.feed.stillZeile} />;
  }

  /*
   * Anzeigen werden HIER eingemischt, nicht in der Darstellung.
   *
   * `zeigtWerbung()` fragt src/lib/plan.ts — heute immer `true`, weil
   * es PRO noch nicht gibt. Sobald es das gibt, verschwindet die
   * Werbung für zahlende Nutzer, ohne dass diese Datei sich ändert.
   *
   * Die Regeln der Dichte stehen in werbung.ts: jede sechste Karte,
   * nie die erste, nie die letzte, nie zwei hintereinander, und gar
   * keine, solange der Feed kürzer als der Abstand ist.
   */
  const karten = werbung
    ? mitAnzeigen(beitraege)
    : beitraege.map((b) => ({ art: 'beitrag' as const, wert: b }));

  return (
    <div className="seite">
      <Seitenkopf titel={t.feed.titel} />
      <FeedFlaeche>
        {karten.map((k) =>
          k.art === 'beitrag' ? (
            <BeitragKarte key={k.wert.id} beitrag={k.wert} />
          ) : (
            <AnzeigeKarte key={k.wert.id} anzeige={k.wert} kennzeichen={t.feed.anzeige} />
          ),
        )}
      </FeedFlaeche>
    </div>
  );
}
