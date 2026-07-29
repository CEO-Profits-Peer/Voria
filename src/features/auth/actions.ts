'use server';

/**
 * Anmeldung, Registrierung, Abmeldung.
 *
 * Fehlertexte sind ganze Sätze auf Deutsch, ohne Ausrufezeichen —
 * und sie verraten nicht, ob eine Adresse existiert.
 */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase-server';
import { seitenUrl } from '@/lib/site-url';

export type AuthErgebnis = { fehler?: string };

const BENUTZERNAME = /^[a-z0-9_]{3,24}$/;

export async function anmelden(_prev: AuthErgebnis, formular: FormData): Promise<AuthErgebnis> {
  const email = String(formular.get('email') ?? '').trim();
  const passwort = String(formular.get('passwort') ?? '');

  if (!email || !passwort) return { fehler: 'Bitte trage E-Mail und Passwort ein.' };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: passwort });

  if (error) return { fehler: 'Diese Kombination aus E-Mail und Passwort passt nicht.' };

  const weiter = String(formular.get('weiter') ?? '/log');
  revalidatePath('/', 'layout');
  redirect(weiter.startsWith('/') ? weiter : '/log');
}

export async function registrieren(_prev: AuthErgebnis, formular: FormData): Promise<AuthErgebnis> {
  const email = String(formular.get('email') ?? '').trim();
  const passwort = String(formular.get('passwort') ?? '');
  const benutzername = String(formular.get('benutzername') ?? '').trim().toLowerCase();

  if (!BENUTZERNAME.test(benutzername)) {
    return {
      fehler:
        'Der Benutzername darf drei bis vierundzwanzig Zeichen haben, nur Kleinbuchstaben, Ziffern und Unterstriche.',
    };
  }
  if (passwort.length < 10) {
    return { fehler: 'Das Passwort braucht mindestens zehn Zeichen.' };
  }

  const supabase = await createServerClient();

  // Benutzername vorab prüfen, damit der Fehler vor dem Konto kommt.
  const { data: belegt } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', benutzername)
    .maybeSingle();

  if (belegt) return { fehler: 'Dieser Benutzername ist schon vergeben.' };

  const { data, error } = await supabase.auth.signUp({
    email,
    password: passwort,
    options: { data: { username: benutzername } },
  });

  if (error) return { fehler: 'Das Konto konnte nicht angelegt werden. Versuch es später noch einmal.' };

  /*
   * Das Profil legt ein Trigger auf auth.users an — siehe
   * supabase/migrations/0004_profil_trigger.sql.
   *
   * Vorher stand hier ein Insert in `profiles`. Der konnte bei
   * aktivierter E-Mail-Bestätigung NIE gelingen: signUp() gibt dann
   * noch keine Sitzung zurück, der Insert läuft als `anon`,
   * auth.uid() ist NULL, und `profiles_write` weist ihn ab. Der
   * Rückgabewert wurde nicht geprüft, also fiel es nicht auf — bis
   * „Neue Reise" am Fremdschlüssel scheiterte.
   *
   * Der Benutzername reist über options.data.username in
   * raw_user_meta_data mit und wird dort vom Trigger gelesen.
   */

  // Bei aktivierter E-Mail-Bestätigung gibt es noch keine Sitzung.
  if (!data.session) return { fehler: 'Fast geschafft — bestätige die E-Mail, die wir dir geschickt haben.' };

  revalidatePath('/', 'layout');
  redirect('/log');
}

export async function abmelden() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

/**
 * Zurücksetzen anfordern.
 *
 * Die Antwort ist immer dieselbe, egal ob die Adresse existiert —
 * sonst verrät das Formular, wer ein Konto hat.
 */
export async function passwortAnfordern(
  _prev: AuthErgebnis,
  formular: FormData,
): Promise<AuthErgebnis> {
  const email = String(formular.get('email') ?? '').trim();
  if (!email) return { fehler: 'Bitte trage deine E-Mail-Adresse ein.' };

  const supabase = await createServerClient();
  const herkunft = seitenUrl();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${herkunft}/auth/callback?weiter=/passwort/neu`,
  });

  return {
    fehler:
      'Wenn es zu dieser Adresse ein Konto gibt, ist die E-Mail unterwegs. Sieh auch im Spam nach.',
  };
}

/** Neues Passwort setzen. Verlangt eine gültige Sitzung aus dem Link. */
export async function passwortSetzen(
  _prev: AuthErgebnis,
  formular: FormData,
): Promise<AuthErgebnis> {
  const passwort = String(formular.get('passwort') ?? '');
  if (passwort.length < 10) return { fehler: 'Das Passwort braucht mindestens zehn Zeichen.' };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.updateUser({ password: passwort });

  if (error) {
    return { fehler: 'Der Link ist abgelaufen. Fordere einen neuen an.' };
  }

  revalidatePath('/', 'layout');
  redirect('/log');
}
