import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createServerClient } from '@/lib/supabase-server';
import { ReiseBearbeiten } from '@/features/log/ReiseBearbeiten';

export const metadata = { title: 'Reise bearbeiten · Voria' };

export default async function BearbeitenSeite({
  params,
}: {
  params: Promise<{ reiseId: string }>;
}) {
  const { reiseId } = await params;
  const supabase = await createServerClient();

  const { data } = await supabase
    .from('trips')
    .select('id, title, started_on, ended_on, region_override, trip_countries(country_code, days)')
    .eq('id', reiseId)
    .maybeSingle();

  if (!data) notFound();

  const laender = (data.trip_countries ?? []) as { country_code: string; days: number }[];

  return (
    <div className="formular">
      <Link href={`/log/${reiseId}`} className="zurueck-zeile">
        <ChevronLeft size={18} strokeWidth={1.5} aria-hidden /> Zurück
      </Link>
      <h1>Reise bearbeiten</h1>
      <ReiseBearbeiten
        reiseId={data.id}
        titel={data.title ?? ''}
        von={data.started_on}
        bis={data.ended_on}
        laender={laender.map((l) => ({ code: l.country_code, tage: l.days }))}
        regionUeberschrieben={data.region_override}
      />
    </div>
  );
}
