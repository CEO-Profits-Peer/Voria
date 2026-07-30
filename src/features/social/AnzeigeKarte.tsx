/**
 * Eine Anzeige im Feed.
 *
 * Bewusst NICHT wie eine Beitragskarte gebaut:
 *
 *   * kein Regionen-Theme — eine Anzeige, die sich wie ein Beitrag
 *     einfärbt, gibt sich als einer aus
 *   * kein Avatar, kein Stimmen-Knopf, kein Teilen — nichts, was so
 *     aussieht, als hätte ein Mensch das geschrieben
 *   * flacher Grund, dünnerer Rahmen, kleinere Schrift
 *   * die Kennzeichnung „Anzeige" steht OBEN und zuerst, nicht klein
 *     unten rechts
 *
 * Der Verweis nach außen trägt `rel="sponsored nofollow noopener"`.
 * `sponsored` ist die Angabe, die Suchmaschinen dafür erwarten;
 * `noopener` verhindert, dass die geöffnete Seite auf das Fenster
 * zurückgreifen kann.
 *
 * Keine Server-Komponente mit Zustand nötig, deshalb kein 'use client'
 * — und deshalb liegen die Stile in verweise.css statt in einem
 * <style jsx>-Block, der hier ohnehin nicht am <a> greifen würde.
 */

import { ExternalLink } from 'lucide-react';
import type { Anzeige } from './werbung';

export function AnzeigeKarte({ anzeige, kennzeichen }: { anzeige: Anzeige; kennzeichen: string }) {
  return (
    <aside className="vo-anzeige" aria-label={kennzeichen}>
      <div className="vo-anzeige-kopf">
        <span className="vo-anzeige-marke">{kennzeichen}</span>
        <span className="vo-anzeige-absender">{anzeige.absender}</span>
      </div>

      <p className="vo-anzeige-titel">{anzeige.titel}</p>
      <p className="vo-anzeige-text">{anzeige.text}</p>

      <a
        className="vo-anzeige-ruf"
        href={anzeige.ziel}
        target="_blank"
        rel="sponsored nofollow noopener"
      >
        {anzeige.ruf}
        <ExternalLink size={14} strokeWidth={1.75} aria-hidden />
      </a>
    </aside>
  );
}
