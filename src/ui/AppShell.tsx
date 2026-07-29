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
import { BookOpen, Map, Users, UserRound, Search, Sparkles, Plus } from 'lucide-react';
import { useT } from '@/i18n/Sprachraum';

export function AppShell({
  children,
  nutzer,
}: {
  children: React.ReactNode;
  nutzer?: { name: string; kuerzel: string } | null;
}) {
  const pfad = usePathname();
  const { t } = useT();
  const aktiv = (href: string) => pfad === href || pfad.startsWith(href + '/');

  const haupt = [
    { href: '/log', label: t.nav.log, Icon: BookOpen },
    { href: '/karte', label: t.nav.karte, Icon: Map },
    { href: '/feed', label: t.nav.feed, Icon: Users },
  ];

  const weiteres = [
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
            </Link>
          ))}
        </div>

        <Link href="/du" className="vo-chip" data-aktiv={aktiv('/du')}>
          <span className="vo-avatar" aria-hidden>
            {nutzer?.kuerzel ?? '?'}
          </span>
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
