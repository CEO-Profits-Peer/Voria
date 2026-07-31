/**
 * Der Webhook des Zahlungsanbieters.
 *
 * DIE EINZIGE STELLE, DIE EIN ABO ANLEGEN DARF. Die Tabelle
 * `subscriptions` hat keine Schreibregel für angemeldete Nutzer —
 * geschrieben wird hier, mit dem service_role-Schlüssel.
 *
 * DESHALB IST DIE SIGNATURPRÜFUNG NICHT OPTIONAL. Ohne sie ist diese
 * Route ein offenes Formular, in das jeder „ich habe bezahlt"
 * schreiben kann. Sie steht deshalb ganz vorne, vor jedem Blick in
 * den Inhalt, und bei jedem Zweifel wird abgelehnt.
 *
 * NOCH ZU PRÜFEN, BEVOR ECHTES GELD FLIESST:
 * Das Signaturverfahren unten folgt der Beschreibung von Paddle
 * Billing (Kopfzeile `Paddle-Signature`, Inhalt `ts=…;h1=…`, signiert
 * wird `<ts>:<roher Rumpf>` als HMAC-SHA256). Ich konnte es nicht
 * gegen einen echten Aufruf testen. Vor dem Scharfschalten mit einer
 * Testmeldung aus dem Paddle-Dashboard nachstellen — und dabei auch
 * einen ABSICHTLICH falsch signierten Aufruf schicken. Wenn der
 * durchgeht, ist alles andere egal.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

/** Ältere Meldungen als das hier sind Wiedereinspielungen. */
const HOECHSTALTER_SEKUNDEN = 60 * 5;

export async function POST(anfrage: Request) {
  const geheim = process.env.PADDLE_WEBHOOK_SECRET;
  if (!geheim) {
    console.error('[paddle] PADDLE_WEBHOOK_SECRET fehlt — Meldung abgelehnt');
    return NextResponse.json({ fehler: 'nicht eingerichtet' }, { status: 500 });
  }

  /*
   * DER ROHE RUMPF, nicht das geparste JSON. Signiert wurde der Text
   * Zeichen für Zeichen; einmal durch `JSON.parse` und wieder zurück
   * stimmt die Signatur nicht mehr — andere Reihenfolge, andere
   * Leerzeichen.
   */
  const rumpf = await anfrage.text();
  const kopf = anfrage.headers.get('paddle-signature') ?? '';

  const teile = new Map(
    kopf.split(';').map((s) => {
      const i = s.indexOf('=');
      return [s.slice(0, i).trim(), s.slice(i + 1).trim()] as [string, string];
    }),
  );

  const ts = teile.get('ts');
  const h1 = teile.get('h1');
  if (!ts || !h1) {
    console.error('[paddle] Signatur fehlt oder ist unvollständig');
    return NextResponse.json({ fehler: 'ungültig' }, { status: 401 });
  }

  /*
   * Alter prüfen. Ohne das ließe sich eine einmal abgefangene, gültig
   * signierte Meldung beliebig oft erneut schicken.
   */
  const alter = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(alter) || alter > HOECHSTALTER_SEKUNDEN) {
    console.error('[paddle] Meldung zu alt oder Zeitstempel unlesbar:', ts);
    return NextResponse.json({ fehler: 'ungültig' }, { status: 401 });
  }

  const erwartet = createHmac('sha256', geheim).update(`${ts}:${rumpf}`).digest('hex');

  /*
   * `timingSafeEqual`, nicht `===`. Ein normaler Vergleich bricht beim
   * ersten abweichenden Zeichen ab; aus der Antwortzeit lässt sich die
   * gültige Signatur Zeichen für Zeichen erraten. Vorher die Länge
   * prüfen, sonst wirft die Funktion.
   */
  const a = Buffer.from(erwartet, 'utf8');
  const b = Buffer.from(h1, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    console.error('[paddle] Signatur stimmt nicht');
    return NextResponse.json({ fehler: 'ungültig' }, { status: 401 });
  }

  /* ---- Ab hier ist die Meldung echt ---- */

  let meldung: PaddleMeldung;
  try {
    meldung = JSON.parse(rumpf);
  } catch {
    return NextResponse.json({ fehler: 'kein JSON' }, { status: 400 });
  }

  const art = meldung.event_type ?? '';
  if (!art.startsWith('subscription.')) {
    /* Rechnungen, Zahlungen, Preisänderungen — nichts davon ändert,
       ob jemand PRO hat. Mit 200 antworten, sonst versucht Paddle es
       tagelang erneut. */
    return NextResponse.json({ ok: true, ignoriert: art });
  }

  const abo = meldung.data;
  /*
   * Wer ist das? Beim Kauf wird die Voria-Nutzerkennung als
   * `custom_data.user_id` mitgegeben — das ist die einzige Brücke
   * zwischen einem Paddle-Kunden und einem Konto hier.
   */
  const nutzerId = abo?.custom_data?.user_id;
  if (!abo?.id || !abo.status || !nutzerId) {
    console.error('[paddle] Meldung ohne id, status oder custom_data.user_id:', art);
    /* 200, weil ein erneuter Versuch nichts ändern würde — der Fehler
       liegt in der Kaufstrecke, nicht in der Zustellung. */
    return NextResponse.json({ ok: true, unbrauchbar: true });
  }

  const dienst = createServiceClient();
  const { error } = await dienst.from('subscriptions').upsert(
    {
      user_id: nutzerId,
      anbieter: 'paddle',
      abo_id: abo.id,
      status: abo.status,
      laeuft_bis: abo.current_billing_period?.ends_at ?? null,
      aktualisiert: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.error('[paddle] Abo nicht gespeichert:', error);
    /* 500, damit Paddle es erneut versucht — hier hilft ein zweiter
       Anlauf tatsächlich. */
    return NextResponse.json({ fehler: 'nicht gespeichert' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

interface PaddleMeldung {
  event_type?: string;
  data?: {
    id?: string;
    status?: string;
    custom_data?: { user_id?: string };
    current_billing_period?: { ends_at?: string };
  };
}
