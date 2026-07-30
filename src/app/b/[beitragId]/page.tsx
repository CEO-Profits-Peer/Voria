/**
 * Ein geteilter Beitrag — öffentlich, ohne Anmeldung.
 *
 * WARUM DIESE ROUTE EXISTIERT
 *
 * `/feed/[beitragId]` gibt es schon, ist aber über die Middleware
 * geschützt: `GESCHUETZT = ['/log', '/karte', '/feed', '/du']`. Wer
 * einen solchen Link außerhalb von Voria weitergibt, schickt den
 * Empfänger auf die Anmeldeseite. Ein Teilen-Knopf, dessen Links nur
 * für Angemeldete funktionieren, ist kein Teilen.
 *
 * Diese Route liegt bewusst außerhalb von `(app)`: kein App-Layout,
 * keine Seitenleiste, keine Navigation ins Innere. Sie ist eine
 * Visitenkarte, keine halbe App.
 *
 * SICHERHEIT liegt nicht an dieser Datei, sondern in der Datenbank.
 * `posts_read` ist `using (true)`, und `entries_read` gibt fremde
 * Einträge nur her, wenn `visibility = 'public'` UND ein Beitrag
 * existiert. Ein privater Tag ist hier also nicht erreichbar, selbst
 * wenn jemand die ID errät — nicht weil diese Seite ihn versteckt,
 * sondern weil Postgres ihn nicht ausliefert.
 *
 * Bekannte Einschränkung: `trip_countries_all` verlangt
 * `t.user_id = auth.uid()`. Nichtangemeldete bekommen die Länder einer
 * Reise deshalb nicht, und der Beitrag erscheint hier ohne
 * Regionen-Theme. Steht als offener Punkt in QUEUE.md.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ladeBeitrag } from '@/features/social/profilQueries';
import { Avatar } from '@/ui/Avatar';
import { FotoBild } from '@/features/log/FotoBild';
import { seitenUrl } from '@/lib/site-url';
import { bildUrl } from '@/lib/bild-url';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ beitragId: string }>;
}): Promise<Metadata> {
  const { beitragId } = await params;
  const beitrag = await ladeBeitrag(beitragId);
  if (!beitrag) return { title: 'Voria' };

  const titel = beitrag.tag.titel || beitrag.tag.ort || 'Ein Tag';
  const beschreibung = beitrag.text || `Ein Reisetag von ${beitrag.verfasser.name}.`;

  return {
    title: `${titel} · Voria`,
    description: beschreibung,
    /*
     * Open Graph, damit der Link in WhatsApp, Signal, Slack und auf X
     * als Karte mit Bild erscheint statt als nackte Adresse. Ohne das
     * sieht ein geteilter Beitrag aus wie Spam.
     */
    openGraph: {
      title: titel,
      description: beschreibung,
      type: 'article',
      siteName: 'Voria',
      url: `${seitenUrl()}/b/${beitragId}`,
      images: beitrag.foto ? [{ url: bildUrl(beitrag.foto.pfad) }] : undefined,
    },
    twitter: {
      card: beitrag.foto ? 'summary_large_image' : 'summary',
      title: titel,
      description: beschreibung,
    },
  };
}

export default async function GeteilterBeitrag({
  params,
}: {
  params: Promise<{ beitragId: string }>;
}) {
  const { beitragId } = await params;
  const beitrag = await ladeBeitrag(beitragId);
  if (!beitrag) notFound();

  const datum = new Date(beitrag.tag.datum).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="b-seite">
      <article className="b-karte">
        <header className="b-kopf">
          <Avatar bild={beitrag.verfasser.bild} name={beitrag.verfasser.name} groesse={40} />
          <span className="b-wer">
            <strong>{beitrag.verfasser.name}</strong>
            <span className="b-wo">
              {beitrag.tag.ort ? `${beitrag.tag.ort} · ${datum}` : datum}
            </span>
          </span>
        </header>

        {beitrag.foto && (
          <div className="b-bild">
            <FotoBild foto={beitrag.foto} prioritaet />
          </div>
        )}

        {beitrag.tag.titel && <h1 className="b-titel">{beitrag.tag.titel}</h1>}
        {beitrag.text && <p className="b-text">{beitrag.text}</p>}
      </article>

      {/*
        Kein „Jetzt anmelden", kein Zähler, kein Banner. Eine Zeile, die
        sagt, woher das kommt — wer mehr will, klickt.
      */}
      <footer className="b-fuss">
        <Link href="/">
          Geschrieben in <strong>Voria</strong> — einem Reisetagebuch.
        </Link>
      </footer>
    </main>
  );
}
