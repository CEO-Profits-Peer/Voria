import { AppShell } from '@/ui/AppShell';
import { createServerClient } from '@/lib/supabase-server';
import { ungeleseneHinweise } from '@/features/hinweise/queries';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profil }, ungelesen] = await Promise.all([
    user
      ? supabase
          .from('profiles')
          .select('username, display_name, avatar_url')
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
    </AppShell>
  );
}
