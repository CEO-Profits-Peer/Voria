import { AppShell } from '@/ui/AppShell';
import { createServerClient } from '@/lib/supabase-server';
import { ungeleseneHinweise } from '@/features/hinweise/queries';
import { Tutorial } from '@/features/tutorial/Tutorial';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profil }, ungelesen] = await Promise.all([
    user
      ? supabase
          .from('profiles')
          // prettier-ignore
          .select('username, display_name, avatar_url, tutorial_schritt, tutorial_fertig')
          .eq('id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    /*
     * Läuft bei jedem Seitenaufruf mit, deshalb nur die Anzahl und
     * keine Zeilen. Beides parallel — nacheinander würde die ganze
     * Hülle auf zwei Abfragen warten statt auf eine.
     */
    ungeleseneHinweise(),
  ]);

  const name = profil?.display_name || profil?.username || null;

  return (
    <AppShell
      nutzer={name ? { name, kuerzel: name.slice(0, 2), bild: profil?.avatar_url ?? null } : null}
      ungelesen={ungelesen}
    >
      {children}

      {/*
        Die Führung liegt in der Hülle, nicht auf einer Seite: Sie
        soll über der ganzen App liegen können und beim Wechsel der
        Seite nicht neu anfangen.

        `profil === null` heißt hier NICHT „neuer Nutzer" — es heißt
        auch „Migration 0015 fehlt" oder „Abfrage schiefgegangen". In
        beiden Fällen wäre es falsch, jemandem ungefragt eine Führung
        vor die Nase zu setzen. Deshalb nur, wenn das Profil wirklich
        gelesen wurde und `tutorial_fertig` ausdrücklich falsch ist.
      */}
      {profil && profil.tutorial_fertig === false && (
        <Tutorial startSchritt={profil.tutorial_schritt ?? 0} />
      )}
    </AppShell>
  );
}
