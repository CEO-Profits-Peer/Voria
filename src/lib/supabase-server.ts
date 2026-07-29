/**
 * Supabase auf dem Server.
 *
 * Zwei Clients, streng getrennt:
 *
 *   createServerClient()  — im Namen des angemeldeten Nutzers.
 *                           Row Level Security greift. Standardfall.
 *
 *   createServiceClient() — mit dem service_role-Schlüssel.
 *                           UMGEHT ALLE ZUGRIFFSREGELN.
 *                           Nur für Aufgaben, die kein Nutzer auslöst
 *                           (signierte Upload-URLs, Aufräumjobs).
 *                           Niemals in einer Route verwenden, die
 *                           Nutzerdaten ausliefert.
 */

import { createServerClient as createSSRClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRClient(URL, ANON, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(items: { name: string; value: string; options: CookieOptions }[]) {
        try {
          items.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // In Server Components ist Schreiben nicht erlaubt.
          // Die Middleware erneuert die Sitzung, deshalb unkritisch.
        }
      },
    },
  });
}

export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local');

  return createClient(URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
