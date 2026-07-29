import { AppShell } from '@/ui/AppShell';
import { createServerClient } from '@/lib/supabase-server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profil } = user
    ? await supabase.from('profiles').select('username, display_name').eq('id', user.id).maybeSingle()
    : { data: null };

  const name = profil?.display_name || profil?.username || null;

  return (
    <AppShell nutzer={name ? { name, kuerzel: name.slice(0, 2) } : null}>{children}</AppShell>
  );
}
