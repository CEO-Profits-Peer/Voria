/**
 * Erneuert die Supabase-Sitzung bei jedem Aufruf und schützt die
 * App-Bereiche. Server Components können keine Cookies schreiben —
 * deshalb muss die Erneuerung hier passieren.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Bereiche, die eine Anmeldung verlangen. */
const GESCHUETZT = ['/log', '/karte', '/feed', '/du'];

/**
 * Wohin ein Angemeldeter geschickt wird, der auf „/" landet.
 *
 * Voreinstellung ist der Feed — wer die App öffnet, soll etwas
 * vorfinden. Der Stille Modus überschreibt das auf den Log, ohne die
 * Einstellung umzuschreiben: Beim Ausschalten startet man wieder dort,
 * wo man vorher gestartet ist.
 *
 * Die Abfrage kostet nur hier etwas. Sie läuft ausschließlich, wenn
 * tatsächlich umgeleitet wird — also auf „/" und den Anmeldeseiten,
 * nicht bei jedem Aufruf innerhalb der App.
 *
 * Fällt sie aus, geht es in den Log. Ein Tagebuch, das im Zweifel das
 * Tagebuch zeigt, liegt nie ganz falsch.
 */
async function startbereichVon(
  supabase: ReturnType<typeof createServerClient>,
  nutzerId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('startbereich, stiller_modus')
    .eq('id', nutzerId)
    .maybeSingle();

  if (error) {
    console.error('[middleware] Startbereich nicht lesbar:', error);
    return '/log';
  }
  if (!data || data.stiller_modus) return '/log';
  return data.startbereich === 'log' ? '/log' : '/feed';
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items: { name: string; value: string; options: CookieOptions }[]) => {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pfad = request.nextUrl.pathname;
  const brauchtAnmeldung = GESCHUETZT.some((p) => pfad === p || pfad.startsWith(p + '/'));

  if (!user && brauchtAnmeldung) {
    const ziel = request.nextUrl.clone();
    ziel.pathname = '/anmelden';
    ziel.searchParams.set('weiter', pfad);
    return NextResponse.redirect(ziel);
  }

  // Angemeldet auf der Startseite oder den Auth-Seiten → in den eigenen
  // Startbereich. /passwort/neu ist ausgenommen: dorthin führt der Link
  // aus der E-Mail, und da ist man bereits angemeldet.
  if (user && (pfad === '/' || pfad === '/anmelden' || pfad === '/registrieren')) {
    const ziel = request.nextUrl.clone();
    ziel.pathname = await startbereichVon(supabase, user.id);
    ziel.search = '';
    return NextResponse.redirect(ziel);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)'],
};
