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

      {/*
        DAS BILD IST SELBST EIN VERWEIS.
        Wer auf eine Anzeige klickt, meint sie — egal ob er das Bild
        oder den Knopf trifft. Zwei Verweise auf dasselbe Ziel sind
        für Screenreader lästig, deshalb trägt dieser hier
        `aria-hidden` und `tabIndex={-1}`: Mit der Tastatur führt
        weiterhin genau ein Weg hin, nämlich der Knopf unten.

        Bilder liegen unter /public/werbung/ und werden mitgeliefert.
        Sie von einem fremden Server zu holen hieße, jedem
        Werbetreibenden zu erlauben, die Aufrufe seiner Anzeige zu
        zählen — und genau das soll Voria nicht möglich machen.
      */}
      {anzeige.bild && (
        <a
          className="vo-anzeige-bild"
          href={anzeige.ziel}
          target="_blank"
          rel="sponsored nofollow noopener"
          aria-hidden
          tabIndex={-1}
        >
          {/* Kein next/image: die Datei liegt lokal und hat feste
              Maße, der Umweg über den Bilddienst bringt hier nichts. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={anzeige.bild} alt="" width={1200} height={628} loading="lazy" />
        </a>
      )}

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
