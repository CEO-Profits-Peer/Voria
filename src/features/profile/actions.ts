'use server';

/**
 * Profil bearbeiten.
 *
 * Der Benutzername ist auch die öffentliche Adresse (/u/name), deshalb
 * dieselben Regeln wie bei der Registrierung und eine Prüfung auf
 * Eindeutigkeit vor dem Schreiben.
 */

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase-server';

const BENUTZERNAME = /^[a-z0-9_]{3,24}$/;

export interface ProfilErgebnis {
  fehler?: string;
  gesichert?: boolean;
}

export async function profilSpeichern(
  _prev: ProfilErgebnis,
  formular: FormData,
): Promise<ProfilErgebnis> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: 'Nicht angemeldet.' };

  const benutzername = String(formular.get('benutzername') ?? '').trim().toLowerCase();
  const anzeigename = String(formular.get('anzeigename') ?? '').trim();
  const beschreibung = String(formular.get('beschreibung') ?? '').trim();
  const privat = formular.get('privat') === 'on';

  if (!BENUTZERNAME.test(benutzername)) {
    return {
      fehler:
        'Der Benutzername darf drei bis vierundzwanzig Zeichen haben, nur Kleinbuchstaben, Ziffern und Unterstriche.',
    };
  }

  if (anzeigename.length > 60) {
    return { fehler: 'Der Anzeigename ist zu lang. Sechzig Zeichen sind das Maximum.' };
  }

  if (beschreibung.length > 280) {
    return { fehler: 'Die Beschreibung ist zu lang. Zweihundertachtzig Zeichen sind das Maximum.' };
  }

  const { data: belegt } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', benutzername)
    .neq('id', user.id)
    .maybeSingle();

  if (belegt) return { fehler: 'Dieser Benutzername ist schon vergeben.' };

  const { error } = await supabase
    .from('profiles')
    .update({
      username: benutzername,
      display_name: anzeigename,
      bio: beschreibung,
      is_private: privat,
    })
    .eq('id', user.id);

  if (error) return { fehler: 'Das ließ sich nicht speichern. Versuch es später noch einmal.' };

  revalidatePath('/du');
  revalidatePath('/', 'layout');
  return { gesichert: true };
}
