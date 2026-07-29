import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ladeBeitrag } from '@/features/social/profilQueries';
import { BeitragKarte } from '@/features/social/BeitragKarte';

export default async function BeitragSeite({
  params,
}: {
  params: Promise<{ beitragId: string }>;
}) {
  const { beitragId } = await params;
  const beitrag = await ladeBeitrag(beitragId);
  if (!beitrag) notFound();

  return (
    <div className="seite">
      <Link href="/feed" className="zurueck-zeile">
        <ChevronLeft size={18} strokeWidth={1.5} aria-hidden /> Feed
      </Link>
      <div className="strom">
        <BeitragKarte beitrag={beitrag} />
        <p className="still">
          Geschrieben von{' '}
          <Link href={`/u/${beitrag.verfasser.benutzername}`}>{beitrag.verfasser.name}</Link>.
        </p>
      </div>
    </div>
  );
}
