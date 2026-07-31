-- ============================================================
-- Zwanzig Testbeiträge für den Feed
-- ------------------------------------------------------------
-- KEINE MIGRATION. Liegt bewusst unter supabase/seed/ und nicht
-- unter migrations/, weil das Testdaten sind und kein Schema.
--
-- Mehrfach ausführbar: alles hängt an Reisen mit dem Titelpräfix
-- „[Test] ", und die werden am Anfang gelöscht. Kaskaden räumen
-- Einträge, Blöcke, Fotos und Beiträge mit weg.
--
-- WEM GEHÖREN DIE BEITRÄGE?
-- Den Konten, die es schon gibt. Ich lege KEINE Nutzer an: `profiles.id`
-- verweist auf `auth.users`, und dort etwas von Hand einzufügen bricht
-- Supabase-Auth an Stellen, die man erst Wochen später merkt. Die
-- zwanzig Beiträge verteilen sich rundum auf alle vorhandenen Profile.
-- Bei zwei Konten also zehn und zehn.
--
-- ACHTUNG: Diese Datei braucht picsum.photos in `next.config.ts`.
-- Der Eintrag ist dort am 30.07. ENTFERNT worden (Sicherheitsgrund
-- steht im Kommentar). Wer diese Testdaten benutzen will, setzt ihn
-- lokal wieder ein und nimmt ihn danach wieder heraus. Ohne den
-- Eintrag bleiben die Bilder der Beispielbeiträge leer — der Rest
-- funktioniert.
--
-- BILDER kommen von picsum.photos. `photos.r2_key` nimmt vollständige
-- Adressen an — `bildUrl()` lässt alles durch, was mit http beginnt.
-- Dafür muss picsum in next.config.ts als Bildquelle erlaubt sein;
-- das ist eingetragen und dort als „nur für Testdaten" markiert.
--
-- WIEDER WEGRÄUMEN:
--   delete from trips where title like '[Test] %';
-- ============================================================

begin;

-- ---------- Alten Testbestand entfernen ---------------------
delete from trips where title like '[Test] %';

do $$
declare
  konten  uuid[];
  anzahl  int;
  reise   uuid;
  besitzer uuid;
  eintrag uuid;
  foto    uuid;

  -- Reise je Region: Titel, Ländercode, Startdatum
  reisen text[][] := array[
    array['[Test] Marokko im Frühling',      'MA', '2026-03-08'],
    array['[Test] Norwegen mit dem Zug',     'NO', '2026-05-02'],
    array['[Test] Vietnam von Nord nach Süd','VN', '2026-01-14'],
    array['[Test] Peru, drei Wochen',        'PE', '2025-11-05'],
    array['[Test] Japan im Herbst',          'JP', '2025-10-11']
  ];

  -- Tage: Reisenummer, Tagesversatz, Uhrzeit, Ort, Titel, Text, Bildnummer
  tage text[][] := array[
    array['1','0','07:12','Marrakesch','Erster Morgen','Der Muezzin war vor der Sonne da. Ich habe im Dunkeln Tee getrunken und zugehört, bis es hell wurde.','1015'],
    array['1','2','19:40','Aït-Ben-Haddou','Lehm und Licht','Die ganze Stadt ist aus dem Boden gebaut, auf dem sie steht. Abends wird sie genau so orange wie der Berg dahinter.','1016'],
    array['1','5','13:05','Merzouga','Mittag in der Wüste','Vierzig Grad und kein Geräusch. Der Sand ist so fein, dass er wie Wasser durch die Finger läuft.','1018'],
    array['1','8','21:30','Essaouira','Wind','Hier weht es immer. Die Möwen stehen in der Luft, ohne zu schlagen.','1019'],

    array['2','1','04:55','Bergen','Zu früh für alles','Der Zug ging um halb sechs. Am Bahnsteig war außer mir nur ein Mann mit einem Cellokasten.','1021'],
    array['2','2','16:20','Finse','Höchster Punkt','Anfang Mai und der See ist noch zu. Vom Fenster aus Schnee bis zum Horizont, im Wagen dreiundzwanzig Grad.','1022'],
    array['2','4','23:10','Tromsø','Es wird nicht dunkel','Halb zwölf und ich sitze ohne Licht auf der Treppe. Man verliert völlig das Gefühl, wann Schlafenszeit ist.','1023'],
    array['2','7','11:45','Lofoten','Zwischen zwei Regen','Zwanzig Minuten Sonne, dann wieder grau. Genau in diesen zwanzig Minuten war das Wasser türkis.','1024'],

    array['3','0','06:30','Hanoi','Frühstück auf dem Hocker','Pho um halb sieben, im Sitzen dreißig Zentimeter über dem Boden. Die Straße war schon voll wach.','1025'],
    array['3','3','18:15','Ha Long','Boot ohne Motor','Die letzte halbe Stunde sind wir gerudert. Der Fels stand plötzlich sehr nah und sehr still.','1026'],
    array['3','6','12:00','Hue','Regenzeit, mittags','Der Regen kommt hier nicht von oben, sondern von überall. Nach zehn Minuten ist das egal.','1027'],
    array['3','9','20:50','Hoi An','Lampions','Am Fluss brennen tausend Papierlampen. Kitschig, und ich habe trotzdem eine Stunde nur geschaut.','1028'],
    array['3','13','15:30','Mekongdelta','Schwimmender Markt','Alles wird von Boot zu Boot verkauft, auch der Kaffee. Bezahlt wird über zwei Bordwände hinweg.','1029'],

    array['4','2','05:40','Cusco','Höhe','Dreitausendvierhundert Meter. Treppen steigen fühlt sich an wie Laufen, Laufen wie Rennen.','1031'],
    array['4','5','07:05','Machu Picchu','Vor den Bussen','Um sieben ist man fast allein oben. Um neun sind es tausend Leute. Die zwei Stunden waren jedes Aufstehen wert.','1032'],
    array['4','9','17:25','Arequipa','Weißer Stein','Die ganze Altstadt ist aus Vulkangestein gebaut. Bei tiefer Sonne wird sie rosa.','1033'],
    array['4','14','09:15','Titicacasee','Schilfinseln','Der Boden schwankt beim Gehen. Die Familie, die dort lebt, baut jedes Jahr eine neue Schicht darauf.','1035'],

    array['5','1','08:00','Tokio','Bahnhof Shinjuku','Drei Millionen Menschen am Tag, und niemand rennt. Ich habe zwanzig Minuten nur die Ordnung angeschaut.','1036'],
    array['5','4','14:40','Kyoto','Ahorn','Die Blätter sind nicht rot, sie sind mehrere Rot gleichzeitig. Fotos werden dem nicht gerecht.','1037'],
    array['5','8','19:20','Kanazawa','Abends im Garten','Nach Sonnenuntergang werden die Kiefern von unten angestrahlt. Der Garten ist dann leer und deutlich schöner.','1039']
  ];

  i      int;
  nummer int;
begin
  -- Vorhandene Profile einsammeln, in stabiler Reihenfolge.
  select array_agg(id order by created_at) into konten from profiles;
  anzahl := coalesce(array_length(konten, 1), 0);

  if anzahl = 0 then
    raise exception
      'Es gibt kein Profil. Erst ein Konto anlegen, dann diese Datei ausführen.';
  end if;

  -- ---------- Reisen anlegen -----------------------------------
  -- Reihum verteilt, damit nicht alles einem Konto gehört.
  for i in 1 .. array_length(reisen, 1) loop
    insert into trips (user_id, title, started_on, visibility)
    values (
      konten[((i - 1) % anzahl) + 1],
      reisen[i][1],
      reisen[i][3]::date,
      'private'   -- die REISE bleibt privat; geteilt werden einzelne Tage
    );
  end loop;

  -- ---------- Länder ------------------------------------------
  for i in 1 .. array_length(reisen, 1) loop
    select id into reise from trips where title = reisen[i][1];
    insert into trip_countries (trip_id, country_code, days)
    values (reise, reisen[i][2], 7)
    on conflict do nothing;
  end loop;

  -- ---------- Tage, Text, Foto, Beitrag -----------------------
  for i in 1 .. array_length(tage, 1) loop
    /*
     * Direkter Zugriff tage[i][n]. Vorher stand hier ein Slice
     * `tage[i:i][1:7]` in eine text[]-Variable — das behält bei
     * Postgres ZWEI Dimensionen, `z[1]` wäre also NULL gewesen und die
     * ganze Schleife hätte leise Unsinn eingefügt.
     */
    nummer := tage[i][1]::int;

    select t.id, t.user_id into reise, besitzer
    from trips t
    where t.title = reisen[nummer][1];

    insert into entries (trip_id, user_id, entry_date, title, place_name, visibility, mode)
    values (
      reise,
      besitzer,
      (reisen[nummer][3]::date + tage[i][2]::int),
      tage[i][5],
      tage[i][4],
      'public',
      'quiet'
    )
    returning id into eintrag;

    -- Text als Block. Der Trigger aus 0003 pflegt den Suchtext mit.
    insert into blocks (entry_id, kind, text, position)
    values (eintrag, 'text', tage[i][6], 0);

    -- Foto mit vollständiger Adresse statt Speicherschlüssel.
    insert into photos (user_id, entry_id, r2_key, r2_key_thumb, width, height, bytes, blurhash)
    values (
      besitzer,
      eintrag,
      'https://picsum.photos/id/' || tage[i][7] || '/1200/800',
      'https://picsum.photos/id/' || tage[i][7] || '/320/213',
      1200, 800, 240000, null
    )
    returning id into foto;

    insert into blocks (entry_id, kind, photo_id, position)
    values (eintrag, 'photo', foto, 1);

    /*
     * published_at trägt die Uhrzeit aus der Tabelle, damit der Feed
     * nicht zwanzig Mal dieselbe Minute zeigt — und damit die
     * chronologische Sortierung überhaupt etwas zu sortieren hat.
     */
    insert into posts (entry_id, user_id, caption, published_at)
    values (
      eintrag,
      besitzer,
      '',
      ((reisen[nummer][3]::date + tage[i][2]::int)::text || ' ' || tage[i][3])::timestamptz
    );
  end loop;
end;
$$;

-- ---------- Nachweis ----------------------------------------
do $$
declare
  n int;
begin
  select count(*) into n
  from posts p
  join entries e on e.id = p.entry_id
  join trips  t on t.id = e.trip_id
  where t.title like '[Test] %';

  if n <> 20 then
    raise exception 'Erwartet waren 20 Testbeiträge, angelegt wurden %.', n;
  end if;

  raise notice 'Zwanzig Testbeiträge angelegt.';
end;
$$;

commit;
