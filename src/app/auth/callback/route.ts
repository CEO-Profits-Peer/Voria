import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/** Ziel des Bestätigungslinks aus der Registrierungs-E-Mail. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const weiter = searchParams.get('weiter') ?? '/log';

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${weiter}`);
  }

  return NextResponse.redirect(`${origin}/anmelden?fehler=bestaetigung`);
}
