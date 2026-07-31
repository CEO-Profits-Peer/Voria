'use server';

/**
 * Merken, dass der Streifen gezeigt oder weggewischt wurde.
 *
 * Beides schreibt in `profiles`, beides nur die eigene Zeile — die
 * Regel `profiles_write` sorgt dafür.
 */

import { createServerClient } from '@/lib/supabase-server';
import { STREIFEN_REGELN } from './streifen';

/** Der Streifen war zu sehen. Startet den Abstand von dreieinhalb Tagen. */
export async function streifenGezeigt() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ pro_streifen_zuletzt: new Date().toISOString() })
    .eq('id', user.id);

  if (error) console.error('[streifenGezeigt]', error);
}

/**
 * Weggewischt.
 *
 * Beim dritten Mal beginnt die Ruhe. Der Zähler wird dabei NICHT
 * zurückgesetzt: Dreimal nein ist dreimal nein, auch über Monate
 * verteilt. Wer nach der Ruhe wieder ablehnt, hat sofort wieder Ruhe.
 */
export async function streifenWeggewischt() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from('profiles')
    .select('pro_streifen_weg')
    .eq('id', user.id)
    .maybeSingle();

  const weg = (data?.pro_streifen_weg ?? 0) + 1;

  const ruhe =
    weg >= STREIFEN_REGELN.GENUG
      ? new Date(Date.now() + STREIFEN_REGELN.RUHE_TAGE * 86_400_000).toISOString()
      : null;

  const { error } = await supabase
    .from('profiles')
    .update({
      pro_streifen_weg: weg,
      pro_streifen_zuletzt: new Date().toISOString(),
      ...(ruhe ? { pro_streifen_ruhe_bis: ruhe } : {}),
    })
    .eq('id', user.id);

  if (error) console.error('[streifenWeggewischt]', error);
}
