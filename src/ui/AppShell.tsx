/**
 * Die Hülle um alle Bereiche.
 *
 * Unter 900 px: Navigation unten.
 * Ab 900 px:    Seitenleiste, 240 px.
 *
 * Die Stile stehen in src/styles/huelle.css und NICHT hier in einem
 * <style jsx>-Block. Der Grund steht oben in jener Datei und ist
 * wichtig: styled-jsx scopet <Link> nicht, deshalb hat die halbe
 * Navigation vorher ungestaltet dagestanden — lautlos, ohne Fehler.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Map, Users, UserRound, Search, Sparkles, Plus, Bell } from 'lucide-react';
import { useT } from '@/i18n/Sprachraum';
import { Avatar } from '@/ui/Avatar';

export function AppShell({
  children,
  nutzer,
  ungelesen = 0,
}: {
  children: React.ReactNode;
  nutzer?: { name: string; kuerzel: string; bild: string | null } | null;
  /** Zahl am Glockensymbol. 0 heißt: gar kein Punkt. */
  ungelesen?: number;
}) {
  const pfad = usePathname();
  const { t } = useT();
  const aktiv = (href: string) => pfad === href || pfad.startsWith(href + '/');

  const haupt = [
    { href: '/log', label: t.nav.log, Icon: BookOpen },
    { href: '/karte', label: t.nav.karte, Icon: Map },
    { href: '/feed', label: t.nav.feed, Icon: Users },
  ];

  /*
   * Hinweise stehen unter „Mehr", nicht in der Hauptnavigation. Die
   * vier Hauptbereiche sind gesetzt, und ein fünfter würde die
   * Reihenfolge brechen, die am Handy und am Rechner identisch ist.
   */
  const weiteres = [
    { href: '/hinweise', label: t.hinweise.titel, Icon: Bell },
    { href: '/rueckblick', label: t.rueckblick.titel, Icon: Sparkles },
    { href: '/suche', label: t.nav.suchen, Icon: Search },
  ];

  return (
    <div className="vo-shell">
      <nav className="vo-leiste" aria-label={t.marke}>
        <span className="vo-wortmarke">{t.marke}</span>

        <Link href="/log/neu" className="vo-neu">
          <Plus size={15} strokeWidth={2} aria-hidden />
          <span>{t.log.neueReise}</span>
        </Link>

        <div className="vo-gruppe">
          {haupt.map(({ href, label, Icon }) => (
            <Link key={href} href={href} data-aktiv={aktiv(href)} className="vo-ziel">
              <Icon size={16} strokeWidth={1.75} aria-hidden />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <div className="vo-gruppe">
          <span className="vo-gruppen-titel">{t.nav.mehr}</span>
          {weiteres.map(({ href, label, Icon }) => (
            <Link key={href} href={href} data-aktiv={aktiv(href)} className="vo-ziel">
              <Icon size={16} strokeWidth={1.75} aria-hidden />
              <span>{label}</span>
              {/* Ein Punkt, keine Zahl. Wie viele es genau sind, ändert
                  nichts an dem, was man tut — und eine Zahl, die
                  wächst, drängt. */}
              {href === '/hinweise' && ungelesen > 0 && (
                <span className="vo-punkt" aria-label={`${ungelesen} ${t.hinweise.ungelesen}`} />
              )}
            </Link>
          ))}
        </div>

        <Link href="/du" className="vo-chip" data-aktiv={aktiv('/du')}>
          <Avatar bild={nutzer?.bild ?? null} name={nutzer?.kuerzel ?? '?'} groesse={28} />
          <span className="vo-chip-worte">
            <span className="vo-chip-name">{nutzer?.name ?? t.profil.du}</span>
            <span className="vo-chip-zeile">{t.nav.dasBistDu}</span>
          </span>
        </Link>
      </nav>

      <main className="vo-inhalt" key={pfad}>
        {children}
      </main>

      <nav className="vo-unten" aria-label={t.marke}>
        {[...haupt, { href: '/du', label: t.nav.du, Icon: UserRound }].map(
          ({ href, label, Icon }) => (
            <Link key={href} href={href} data-aktiv={aktiv(href)} className="vo-unten-ziel">
              <Icon size={20} strokeWidth={1.75} aria-hidden />
              <span>{label}</span>
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
