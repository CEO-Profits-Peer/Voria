/**
 * Erneuert die Supabase-Sitzung bei jedem Aufruf und schützt die
 * App-Bereiche. Server Components können keine Cookies schreiben —
 * deshalb muss die Erneuerung hier passieren.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Bereiche, die eine Anmeldung verlangen. */
const GESCHUETZT = ['/log', '/karte', '/feed', '/du'];

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

  // Angemeldet auf der Startseite oder den Auth-Seiten → direkt in den Log.
  // /passwort/neu ist ausgenommen: dorthin führt der Link aus der E-Mail,
  // und da ist man bereits angemeldet.
  if (user && (pfad === '/' || pfad === '/anmelden' || pfad === '/registrieren')) {
    const ziel = request.nextUrl.clone();
    ziel.pathname = '/log';
    ziel.search = '';
    return NextResponse.redirect(ziel);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)'],
};
