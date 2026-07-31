import { ladeFeed } from '@/features/social/queries';
import { alsReiter } from '@/features/social/konstanten';
import { FeedFlaeche } from '@/features/social/FeedFlaeche';
import { FeedStrom } from '@/features/social/FeedStrom';
import { FeedReiter } from '@/features/social/FeedReiter';
import { FeedScrollen } from '@/features/social/FeedScrollen';
import { LeererBereich } from '@/ui/LeererBereich';
import { Seitenkopf } from '@/ui/Bausteine';
import { texte } from '@/i18n/server';
import { zeigtWerbung } from '@/lib/plan';

export const metadata = { title: 'Feed · Voria' };

export default async function FeedSeite({
  searchParams,
}: {
  searchParams: Promise<{ reiter?: string }>;
}) {
  const { reiter: roh } = await searchParams;
  const reiter = alsReiter(roh);

  const [beitraege, { t }, werbung] = await Promise.all([
    ladeFeed(0, undefined, reiter),
    texte(),
    zeigtWerbung(),
  ]);

  const kopf = (
    <>
      <FeedScrollen />
      <Seitenkopf titel={t.feed.titel} />
      <FeedReiter
        aktiv={reiter}
        fuerDich={t.feed.fuerDich}
        folgeIch={t.feed.folgeIch}
        entdecken={t.feed.entdecken}
      />
    </>
  );

  if (beitraege.length === 0) {
    /*
     * Die Reiter bleiben stehen. Ohne sie käme man aus dem leeren
     * „Folge ich" nicht mehr heraus, ohne die Adresse zu ändern.
     */
    return (
      <div className="seite">
        {kopf}
        <LeererBereich
          titel={
            reiter === 'folgeich'
              ? t.feed.niemandGefolgt
              : reiter === 'entdecken'
                ? t.feed.nichtsNeues
                : t.feed.stillHier
          }
          zeile={
            reiter === 'folgeich'
              ? t.feed.niemandGefolgtZeile
              : reiter === 'entdecken'
                ? t.feed.nichtsNeuesZeile
                : t.feed.stillZeile
          }
        />
      </div>
    );
  }

  /*
   * `zeigtWerbung()` fragt src/lib/plan.ts — heute immer `true`, weil
   * es PRO noch nicht gibt. Sobald es das gibt, verschwindet die
   * Werbung für zahlende Nutzer, ohne dass diese Datei sich ändert.
   *
   * Gemischt wird die Werbung in `FeedStrom`, nicht hier: der Feed lädt
   * nach, und die Regeln „nie die erste, nie die letzte Karte" gelten
   * für die ganze Liste, nicht für einen Stapel. Die Entscheidung, OB
   * Werbung kommt, bleibt serverseitig — der Browser soll den Plan des
   * Nutzers nicht bestimmen können.
   */
  return (
    <div className="seite">
      {kopf}
      <FeedFlaeche>
        {/*
          `key`: ohne ihn behält FeedStrom beim Reiterwechsel seinen
          alten Zustand. React sieht dieselbe Stelle im Baum und lässt
          `useState(start)` unberührt — im neuen Reiter stünden dann
          die Beiträge des alten.
        */}
        <FeedStrom
          key={reiter}
          start={beitraege}
          werbung={werbung}
          kennzeichen={t.feed.anzeige}
          reiter={reiter}
        />
      </FeedFlaeche>
    </div>
  );
}
