import { ladeFeed } from '@/features/social/queries';
import { FeedFlaeche } from '@/features/social/FeedFlaeche';
import { FeedStrom } from '@/features/social/FeedStrom';
import { OhneScrollleiste } from '@/features/social/OhneScrollleiste';
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
   * `zeigtWerbung()` fragt src/lib/plan.ts — heute immer `true`, weil
   * es PRO noch nicht gibt. Sobald es das gibt, verschwindet die
   * Werbung für zahlende Nutzer, ohne dass diese Datei sich ändert.
   *
   * Gemischt wird die Werbung in `FeedStrom`, nicht hier: der Feed lädt
   * nach, und die Regeln „nie die erste, nie die letzte Karte" gelten
   * für die ganze Liste, nicht für einen Stapel. Die Entscheidung, OB
   * Werbung kommt, bleibt aber serverseitig — der Browser soll den Plan
   * des Nutzers nicht bestimmen können.
   */
  return (
    <div className="seite">
      <OhneScrollleiste />
      <Seitenkopf titel={t.feed.titel} />
      <FeedFlaeche>
        <FeedStrom start={beitraege} werbung={werbung} kennzeichen={t.feed.anzeige} />
      </FeedFlaeche>
    </div>
  );
}
