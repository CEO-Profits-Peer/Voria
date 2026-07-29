/**
 * Signierte Upload-Ziele ausstellen.
 *
 * Der Browser lädt direkt zum Speicher hoch — der Server sieht die
 * Bilddaten nie und ist kein Nadelöhr. Der service_role-Client wird
 * hier bewusst benutzt, weil das Ausstellen einer Upload-URL kein
 * Nutzerrecht braucht — die Prüfung, ob der Nutzer angemeldet ist,
 * passiert vorher.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { storage, photoKey, thumbKey } from '@/lib/storage';

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ fehler: 'Nicht angemeldet' }, { status: 401 });

  const { endung } = (await request.json()) as { endung: 'avif' | 'webp' | 'jpg' };
  const id = crypto.randomUUID();

  const anzeige = photoKey(user.id, id, endung);
  const vorschau = thumbKey(user.id, id);

  try {
    const [zielAnzeige, zielVorschau] = await Promise.all([
      storage.createUploadTarget(anzeige, `image/${endung === 'jpg' ? 'jpeg' : endung}`),
      storage.createUploadTarget(vorschau, `image/${endung === 'jpg' ? 'jpeg' : endung}`),
    ]);

    return NextResponse.json({ id, anzeige: zielAnzeige, vorschau: zielVorschau });
  } catch (e) {
    return NextResponse.json(
      { fehler: e instanceof Error ? e.message : 'Upload-Ziel fehlgeschlagen' },
      { status: 500 },
    );
  }
}
