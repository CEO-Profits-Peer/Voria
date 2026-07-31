-- ============================================================
-- Abonnements
--
-- Eine Zeile je Nutzer. Wer nie bezahlt hat, hat keine — das ist
-- billiger als eine Zeile „frei" für jeden.
--
-- WER HIER SCHREIBEN DARF: NIEMAND AUS DER ANWENDUNG.
-- Es gibt bewusst keine insert-, update- oder delete-Regel. Der
-- Zahlungsanbieter meldet sich über einen Webhook, und der schreibt
-- mit dem service_role-Schlüssel, der Row Level Security umgeht.
--
-- Der Grund ist der offensichtliche: Gäbe es eine Schreibregel für
-- `authenticated`, könnte sich jeder Nutzer selbst ein Abo eintragen.
-- Bei Geld ist die Frage „wer darf schreiben" die einzige, die zählt.
--
-- WIEDERHOLBAR — siehe Kopf von 0009_start_und_rueckmeldung.sql.
-- ============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'abo_status') then
    /*
     * Die Namen kommen vom Anbieter, damit beim Webhook nichts
     * übersetzt werden muss — eine Übersetzungstabelle wäre genau die
     * Stelle, an der später ein Status durchrutscht und niemand es
     * merkt.
     */
    create type abo_status as enum (
      'active',    -- bezahlt und läuft
      'trialing',  -- Probezeit, zählt als bezahlt
      'past_due',  -- Zahlung fehlgeschlagen, Anbieter versucht es erneut
      'paused',
      'canceled'
    );
  end if;
end;
$$;

create table if not exists subscriptions (
  user_id      uuid primary key references profiles on delete cascade,
  -- Welcher Anbieter. Heute nur einer, aber ein Wechsel ist keine
  -- Fantasie, und dann steht hier, woher eine Zeile stammt.
  anbieter     text not null default 'paddle',
  -- Die Kennung beim Anbieter. Ohne sie lässt sich eine Meldung
  -- keinem Abo zuordnen.
  abo_id       text not null,
  status       abo_status not null,
  /*
   * Bis wann bezahlt ist. WICHTIGER ALS DER STATUS: Wer heute kündigt,
   * hat bis zum Ende der Periode bezahlt und behält PRO bis dahin.
   * Ein gekündigtes Abo sofort abzuschalten wäre Diebstahl.
   */
  laeuft_bis   timestamptz,
  aktualisiert timestamptz not null default now(),
  angelegt     timestamptz not null default now()
);

-- Für den Webhook: er kennt nur die Abo-Kennung, nicht den Nutzer.
create unique index if not exists subscriptions_abo_idx on subscriptions (abo_id);

alter table subscriptions enable row level security;

/*
 * Lesen darf man das eigene. Das ist keine Notwendigkeit — `istPro()`
 * läuft serverseitig —, aber es erlaubt später eine Seite „dein Abo"
 * ohne neue Regel. Und es kostet nichts.
 */
drop policy if exists subscriptions_read on subscriptions;
create policy subscriptions_read on subscriptions for select
  using (user_id = auth.uid());

-- KEINE insert-, update- oder delete-Regel. Siehe Kopf.

-- ------------------------------------------------------------
-- Nachweis
-- ------------------------------------------------------------

do $$
declare
  schreibend text[];
begin
  if not exists (select 1 from pg_tables where tablename = 'subscriptions') then
    raise exception 'Tabelle subscriptions wurde nicht angelegt';
  end if;

  select array_agg(cmd::text) into schreibend
  from pg_policies
  where tablename = 'subscriptions' and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL');

  if schreibend is not null then
    raise exception
      'subscriptions hat Schreibregeln (%) — dann kann sich jeder selbst ein Abo eintragen',
      schreibend;
  end if;
end;
$$;
