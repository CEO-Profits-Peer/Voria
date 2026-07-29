import { notFound, redirect } from 'next/navigation';
import { ladeReise, ladeTag } from '@/features/log/queries';
import { tagSichern } from '@/features/log/actions';
import { Tagesansicht } from '@/features/log/Tagesansicht';

export default async function TagSeite({
  params,
}: {
  params: Promise<{ reiseId: string; datum: string }>;
}) {
  const { reiseId, datum } = await params;

  const reise = await ladeReise(reiseId);
  if (!reise) notFound();

  let tag = await ladeTag(reiseId, datum);

  // Den Tag gibt es noch nicht — er entsteht beim ersten Öffnen.
  if (!tag) {
    const id = await tagSichern(reiseId, datum);
    if (!id) redirect(`/log/${reiseId}`);
    tag = await ladeTag(reiseId, datum);
    if (!tag) redirect(`/log/${reiseId}`);
  }

  return (
    <Tagesansicht
      tag={tag}
      reiseId={reiseId}
      region={reise.region}
      istErsterTag={reise.tage.length <= 1}
    />
  );
}
