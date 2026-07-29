/**
 * Jahresrückblick.
 *
 * Der virale Anstoß, der ohne Feed funktioniert: etwas, das man
 * herzeigen will, entstanden aus dem, was ohnehin da ist. Polarsteps
 * und Spotify machen damit ihr bestes Marketing — und es kostet
 * niemanden eine Verhaltensänderung.
 *
 * Bewusst ohne Bewertung: keine Bestenliste, kein „mehr als letztes
 * Jahr", kein Vergleich mit anderen. Nur, was war.
 */

import { createServerClient } from '@/lib/supabase-server';
import { regionForCountry, type RegionOrNeutral } from '@/themes/regions';

export interface Rueckblick {
  jahr: number;
  tage: number;
  worte: number;
  fotos: number;
  laender: string[];
  regionen: RegionOrNeutral[];
  ersterTag: string | null;
  laengsteReise: { titel: string; tage: number; region: RegionOrNeutral } | null;
  laengsterTag: { datum: string; titel: string | null; ort: string | null; worte: number } | null;
  verfuegbareJahre: number[];
}

/** Ohne Sitzung gibt es nichts zu zeigen — aber die Form muss stimmen. */
function leererRueckblick(jahr: number): Rueckblick {
  return {
    jahr,
    tage: 0,
    worte: 0,
    fotos: 0,
    laender: [],
    regionen: [],
    ersterTag: null,
    laengsteReise: null,
    laengsterTag: null,
    verfuegbareJahre: [new Date().getFullYear()],
  };
}

export async function ladeRueckblick(jahr: number): Promise<Rueckblick> {
  const supabase = await createServerClient();
  const von = `${jahr}-01-01`;
  const bis = `${jahr}-12-31`;

  /*
   * Überall .eq('user_id', …) — auch wenn RLS greift.
   *
   * entries_read erlaubt zusätzlich fremde öffentliche Einträge,
   * trips_read fremde öffentliche Reisen. Für den Feed ist das richtig.
   * Für DEIN Jahr wäre es falsch: die Wortzahl, die Fotos und der
   * „längste Tag" hätten fremde Einträge mitgezählt.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return leererRueckblick(jahr);

  const [{ data: eintraege }, { data: reisen }, { data: alleJahre }] = await Promise.all([
    supabase
      .from('entries')
      .select('id, entry_date, title, place_name, such_text, blocks(kind)')
      .eq('user_id', user.id)
      .gte('entry_date', von)
      .lte('entry_date', bis)
      .order('entry_date', { ascending: true }),
    supabase
      .from('trips')
      .select('id, title, region_override, trip_countries(country_code, days), entries(entry_date)')
      .eq('user_id', user.id)
      .or(`started_on.gte.${von},ended_on.lte.${bis}`),
    supabase.from('entries').select('entry_date').eq('user_id', user.id),
  ]);

  const jahre = [
    ...new Set((alleJahre ?? []).map((e) => new Date(e.entry_date).getFullYear())),
  ].sort((a, b) => b - a);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const liste = (eintraege ?? []) as any[];

  let worte = 0;
  let fotos = 0;
  let laengsterTag: Rueckblick['laengsterTag'] = null;

  for (const e of liste) {
    const anzahl = zaehleWorte(e.such_text ?? '');
    worte += anzahl;
    fotos += (e.blocks ?? []).filter((b: any) => b.kind === 'photo').length;

    if (!laengsterTag || anzahl > laengsterTag.worte) {
      laengsterTag = { datum: e.entry_date, titel: e.title, ort: e.place_name, worte: anzahl };
    }
  }

  const laender = new Set<string>();
  const regionen = new Set<RegionOrNeutral>();
  let laengsteReise: Rueckblick['laengsteReise'] = null;

  for (const r of (reisen ?? []) as any[]) {
    const tageImJahr = (r.entries ?? []).filter((e: any) =>
      String(e.entry_date).startsWith(String(jahr)),
    ).length;
    if (tageImJahr === 0) continue;

    const codes = (r.trip_countries ?? []) as { country_code: string; days: number }[];
    for (const c of codes) {
      laender.add(c.country_code.toUpperCase());
      regionen.add(regionForCountry(c.country_code));
    }

    const region =
      (r.region_override as RegionOrNeutral | null) ??
      regionForCountry([...codes].sort((a, b) => b.days - a.days)[0]?.country_code);

    if (!laengsteReise || tageImJahr > laengsteReise.tage) {
      laengsteReise = { titel: r.title || '—', tage: tageImJahr, region };
    }
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  regionen.delete('neutral');

  return {
    jahr,
    tage: liste.length,
    worte,
    fotos,
    laender: [...laender],
    regionen: [...regionen],
    ersterTag: liste[0]?.entry_date ?? null,
    laengsteReise,
    laengsterTag,
    verfuegbareJahre: jahre.length ? jahre : [new Date().getFullYear()],
  };
}

function zaehleWorte(text: string): number {
  const sauber = text.trim();
  return sauber ? sauber.split(/\s+/).length : 0;
}
