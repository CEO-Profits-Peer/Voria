'use server';

/**
 * Schreibzugriffe auf den Log.
 *
 * Automatisches Speichern: Es gibt keinen Speichern-Knopf. Der Entwurf
 * bleibt liegen, die Oberfläche schickt Änderungen mit Verzögerung.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';

export type ReiseErgebnis = { fehler?: string };

/**
 * Neue Reise anlegen.
 *
 * Vorher stand hier `if (error || !data) return;` — ein stiller Abbruch.
 * Das Formular kam mit Status 200 zurück, sah unverändert aus und sagte
 * nichts. Genau daran ist „Neue Reise" gescheitert, ohne jede Spur:
 * der Fremdschlüssel trips.user_id → profiles griff, weil dem Konto das
 * Profil fehlte (siehe 0004_profil_trigger.sql).
 *
 * Ein Schreibfehler muss sichtbar sein. Deshalb gibt diese Action jetzt
 * einen Text zurück, den das Formular anzeigt.
 */
export async function reiseAnlegen(
  _prev: ReiseErgebnis,
  formular: FormData,
): Promise<ReiseErgebnis> {
  const titel = String(formular.get('titel') ?? '').trim();
  const von = String(formular.get('von') ?? '') || null;
  const land = String(formular.get('land') ?? '').trim().toUpperCase() || null;

  if (land && !/^[A-Z]{2}$/.test(land)) {
    return { fehler: 'Das Land braucht genau zwei Buchstaben, zum Beispiel MA für Marokko.' };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/anmelden');

  const { data, error } = await supabase
    .from('trips')
    .insert({ user_id: user.id, title: titel || 'Neue Reise', started_on: von })
    .select('id')
    .single();

  if (error || !data) {
    console.error('[reiseAnlegen] Reise konnte nicht angelegt werden:', error);

    // 23503 = Fremdschlüssel verletzt. Heißt hier praktisch immer:
    // zu diesem Konto gibt es keine Zeile in profiles.
    if (error?.code === '23503') {
      return {
        fehler:
          'Zu deinem Konto fehlt das Profil. Führe die Migration 0004_profil_trigger.sql in Supabase aus, dann geht es.',
      };
    }

    return { fehler: 'Die Reise konnte nicht angelegt werden. Versuch es noch einmal.' };
  }

  if (land) {
    const { error: landFehler } = await supabase
      .from('trip_countries')
      .insert({ trip_id: data.id, country_code: land, days: 1 });

    // Die Reise steht schon. Ein fehlendes Land ist kein Grund,
    // den Nutzer zurückzuwerfen — es lässt sich nachtragen.
    if (landFehler) console.error('[reiseAnlegen] Land nicht gespeichert:', landFehler);
  }

  revalidatePath('/log');
  redirect(`/log/${data.id}`);
}

export async function reiseSpeichern(
  reiseId: string,
  daten: { titel: string; von: string | null; bis: string | null; region: string | null },
) {
  const supabase = await createServerClient();
  await supabase
    .from('trips')
    .update({
      title: daten.titel || 'Ohne Titel',
      started_on: daten.von,
      ended_on: daten.bis,
      region_override: daten.region,
    })
    .eq('id', reiseId);

  revalidatePath('/log', 'layout');
  revalidatePath('/karte');
}

export async function landHinzufuegen(reiseId: string, code: string) {
  const supabase = await createServerClient();
  await supabase
    .from('trip_countries')
    .upsert({ trip_id: reiseId, country_code: code.toUpperCase(), days: 1 }, { onConflict: 'trip_id,country_code' });

  revalidatePath('/log', 'layout');
  revalidatePath('/karte');
}

export async function landEntfernen(reiseId: string, code: string) {
  const supabase = await createServerClient();
  await supabase
    .from('trip_countries')
    .delete()
    .eq('trip_id', reiseId)
    .eq('country_code', code.toUpperCase());

  revalidatePath('/log', 'layout');
  revalidatePath('/karte');
}

/** Legt den Tag an, falls es ihn noch nicht gibt, und gibt die ID zurück. */
export async function tagSichern(reiseId: string, datum: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/anmelden');

  const { data: vorhanden } = await supabase
    .from('entries')
    .select('id')
    .eq('trip_id', reiseId)
    .eq('entry_date', datum)
    .maybeSingle();

  if (vorhanden) return vorhanden.id;

  const { data } = await supabase
    .from('entries')
    .insert({ trip_id: reiseId, user_id: user.id, entry_date: datum })
    .select('id')
    .single();

  return data?.id ?? null;
}

export async function textSpeichern(eintragId: string, blockId: string | null, text: string) {
  const supabase = await createServerClient();

  if (blockId) {
    await supabase.from('blocks').update({ text }).eq('id', blockId);
    return blockId;
  }

  const { data: letzte } = await supabase
    .from('blocks')
    .select('position')
    .eq('entry_id', eintragId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data } = await supabase
    .from('blocks')
    .insert({
      entry_id: eintragId,
      kind: 'text',
      text,
      position: (letzte?.position ?? -1) + 1,
    })
    .select('id')
    .single();

  return data?.id ?? null;
}

export async function modusWechseln(eintragId: string, modus: 'quiet' | 'free') {
  const supabase = await createServerClient();
  await supabase.from('entries').update({ mode: modus }).eq('id', eintragId);
  revalidatePath('/log', 'layout');
}

/*
 * Titel und Ort eines Tages.
 *
 * Das revalidatePath() fehlte hier. Gespeichert wurde, aber die
 * Tagesliste der Reise und der Rückblick lasen weiter aus dem Cache —
 * der neue Titel tauchte also nirgends auf und es sah aus, als hätte
 * das Betiteln nichts getan.
 */
export async function titelSpeichern(eintragId: string, titel: string) {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('entries')
    .update({ title: titel || null })
    .eq('id', eintragId);

  if (error) {
    console.error('[titelSpeichern]', error);
    return;
  }

  revalidatePath('/log', 'layout');
}

export async function ortSpeichern(eintragId: string, ort: string) {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('entries')
    .update({ place_name: ort || null })
    .eq('id', eintragId);

  if (error) {
    console.error('[ortSpeichern]', error);
    return;
  }

  revalidatePath('/log', 'layout');
}

/** Layout eines Blocks im Open Space. */
export async function layoutSpeichern(
  blockId: string,
  layout: { x: number; y: number; w: number; h: number; rotation: number; z: number },
) {
  const supabase = await createServerClient();
  await supabase.from('blocks').update(layout).eq('id', blockId);
}

export async function blockLoeschen(blockId: string) {
  const supabase = await createServerClient();
  await supabase.from('blocks').delete().eq('id', blockId);
  revalidatePath('/log', 'layout');
}

/**
 * Sichtbarkeit eines Tages setzen.
 *
 * Nur bei „public" entsteht ein Beitrag im Feed. Wird zurückgenommen,
 * verschwindet der Beitrag wieder — der Eintrag selbst bleibt unberührt.
 * Teilen ist eine Entscheidung pro Tag, nicht pro Konto.
 */
export async function sichtbarkeitSetzen(
  eintragId: string,
  stufe: 'private' | 'followers' | 'public',
  text: string,
) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('entries').update({ visibility: stufe }).eq('id', eintragId);

  if (stufe === 'public') {
    await supabase
      .from('posts')
      .upsert({ entry_id: eintragId, user_id: user.id, caption: text }, { onConflict: 'entry_id' });
  } else {
    await supabase.from('posts').delete().eq('entry_id', eintragId);
  }

  revalidatePath('/feed');
  revalidatePath('/log', 'layout');
}
