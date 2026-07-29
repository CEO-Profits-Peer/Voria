/**
 * Supabase im Browser.
 *
 * Benutzt ausschließlich den öffentlichen Schlüssel. Was ein Nutzer
 * sehen darf, entscheidet Row Level Security in Postgres — nicht dieser
 * Client und nicht die Oberfläche.
 */

'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
