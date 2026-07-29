/**
 * Lesezugriffe auf den Log.
 *
 * Alle Abfragen laufen über den normalen Client — Row Level Security
 * entscheidet, was zurückkommt. Kein service_role hier, niemals.
 */

import { createServerClient } from '@/lib/supabase-server';
import { regionForTrip, type RegionOrNeutral } from '@/themes/regions';

export interface Reise {
  id: string;
  titel: string;
  von: string | null;
  bis: string | null;
  region: RegionOrNeutral;
  laender: string[];
  tage: number;
}

export interface Block {
  id: string;
  art: 'text' | 'photo' | 'object';
  position: number;
  text: string | null;
  foto: { id: string; pfad: string; breite: number; hoehe: number; blurhash: string | null } | null;
  x: number | null;
  y: number | null;
  w: number | null;
  h: number | null;
  drehung: number;
  z: number;
}

export interface Tag {
  id: string;
  datum: string;
  titel: string | null;
  ort: string | null;
  modus: 'quiet' | 'free';
  sichtbarkeit: 'private' | 'followers' | 'public';
  bloecke: Block[];
}

/**
 * Die eigenen Reisen für /log.
 *
 * Der Filter auf user_id ist NICHT überflüssig, obwohl RLS greift.
 * Die Regel lautet
 *
 *     trips_read ... using (user_id = auth.uid() or visibility = 'public')
 *
 * — sie lässt also auch fremde öffentliche Reisen durch. Das ist für
 * /feed und /u/[name] richtig, für „Deine Reisen" falsch: dort wären
 * plötzlich die öffentlichen Reisen aller anderen aufgetaucht.
 *
 * RLS schützt davor, dass jemand Fremdes zu SEHEN bekommt, was er
 * nicht darf. Was auf DIESER Seite stehen soll, ist eine Frage der
 * Abfrage, nicht der Zugriffsregel.
 */
export async function ladeReisen(): Promise<Reise[]> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('trips')
    .select('id, title, started_on, ended_on, region_override, trip_countries(country_code, days), entries(id)')
    .eq('user_id', user.id)
    .order('started_on', { ascending: false, nullsFirst: false });

  if (!data) return [];

  return data.map((t) => {
    const laender = (t.trip_countries ?? []) as { country_code: string; days: number }[];
    return {
      id: t.id,
      titel: t.title || 'Ohne Titel',
      von: t.started_on,
      bis: t.ended_on,
      region: regionForTrip(
        laender.map((l) => ({ code: l.country_code, days: l.days })),
        t.region_override as RegionOrNeutral | null,
      ),
      laender: laender.map((l) => l.country_code),
      tage: (t.entries ?? []).length,
    };
  });
}

export async function ladeReise(reiseId: string) {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from('trips')
    .select('id, title, started_on, ended_on, region_override, trip_countries(country_code, days)')
    .eq('id', reiseId)
    .maybeSingle();

  if (!data) return null;

  const laender = (data.trip_countries ?? []) as { country_code: string; days: number }[];

  const { data: tage } = await supabase
    .from('entries')
    .select('id, entry_date, title, place_name')
    .eq('trip_id', reiseId)
    .order('entry_date', { ascending: true });

  return {
    id: data.id,
    titel: data.title || 'Ohne Titel',
    von: data.started_on,
    bis: data.ended_on,
    region: regionForTrip(
      laender.map((l) => ({ code: l.country_code, days: l.days })),
      data.region_override as RegionOrNeutral | null,
    ),
    tage: (tage ?? []).map((e) => ({
      id: e.id,
      datum: e.entry_date,
      titel: e.title,
      ort: e.place_name,
    })),
  };
}

export async function ladeTag(reiseId: string, datum: string): Promise<Tag | null> {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from('entries')
    .select(
      `id, entry_date, title, place_name, mode, visibility,
       blocks(id, kind, position, text, x, y, w, h, rotation, z,
              photos(id, r2_key, width, height, blurhash))`,
    )
    .eq('trip_id', reiseId)
    .eq('entry_date', datum)
    .maybeSingle();

  if (!data) return null;

  type RohBlock = {
    id: string;
    kind: 'text' | 'photo' | 'object';
    position: number;
    text: string | null;
    x: number | null;
    y: number | null;
    w: number | null;
    h: number | null;
    rotation: number;
    z: number;
    photos: { id: string; r2_key: string; width: number; height: number; blurhash: string | null } | null;
  };

  const bloecke = ((data.blocks ?? []) as unknown as RohBlock[])
    .sort((a, b) => a.position - b.position)
    .map((b) => ({
      id: b.id,
      art: b.kind,
      position: b.position,
      text: b.text,
      foto: b.photos
        ? {
            id: b.photos.id,
            pfad: b.photos.r2_key,
            breite: b.photos.width,
            hoehe: b.photos.height,
            blurhash: b.photos.blurhash,
          }
        : null,
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      drehung: b.rotation,
      z: b.z,
    }));

  return {
    id: data.id,
    datum: data.entry_date,
    titel: data.title,
    ort: data.place_name,
    modus: data.mode,
    sichtbarkeit: data.visibility,
    bloecke,
  };
}
