import { ladeFeed } from '@/features/social/queries';
import { BeitragKarte } from '@/features/social/BeitragKarte';
import { LeererBereich } from '@/ui/LeererBereich';
import { Seitenkopf } from '@/ui/Bausteine';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Feed · Voria' };

export default async function FeedSeite() {
  const [beitraege, { t }] = await Promise.all([ladeFeed(), texte()]);

  if (beitraege.length === 0) {
    return <LeererBereich titel={t.feed.stillHier} zeile={t.feed.stillZeile} />;
  }

  return (
    <div className="seite">
      <Seitenkopf titel={t.feed.titel} />
      <div className="strom">
        {beitraege.map((b) => (
          <BeitragKarte key={b.id} beitrag={b} />
        ))}
      </div>
    </div>
  );
}
