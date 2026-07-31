import type { Metadata, Viewport } from 'next';
import { fontVariables } from './fonts';
import { OfflineWaechter } from '@/ui/OfflineWaechter';
import { Sprachraum } from '@/i18n/Sprachraum';
import { aktuelleSprache } from '@/i18n/server';
import { proAussehen } from '@/lib/plan';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Voria',
  description: 'Dein Reisetagebuch.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Voria',
  appleWebApp: { capable: true, title: 'Voria', statusBarStyle: 'default' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF7F2' },
    { media: '(prefers-color-scheme: dark)', color: '#191613' },
  ],
  width: 'device-width',
  initialScale: 1,
  // Kein maximumScale — Zoom darf nie unterbunden werden.
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [sprache, aussehen] = await Promise.all([aktuelleSprache(), proAussehen()]);

  /*
   * Design und Material stehen am <html>, weil ein PRO-Design die
   * Region überall ersetzt — auch dort, wo gar keine steht. Gesetzt
   * werden sie nur, wenn `istPro()` wahr ist; `proAussehen()` prüft
   * das und gibt sonst nichts zurück.
   *
   * `undefined` statt `false`: ein Attribut, das gar nicht im
   * Markup steht, kann auch nichts auslösen.
   */
  return (
    <html
      lang={sprache}
      className={fontVariables}
      data-pro-design={aussehen.design ?? undefined}
      data-pro-material={aussehen.material ? 'an' : undefined}
      data-pro-bewegung={aussehen.bewegung ? 'an' : undefined}
      suppressHydrationWarning
    >
      <head>
        {/*
          Theme vor dem ersten Malen setzen, sonst blitzt beim Laden
          die helle Fassung auf. Bewusst inline und ohne Abhängigkeiten.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              var g=localStorage.getItem('voria-theme');
              var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
              document.documentElement.dataset.theme = g || (d?'dark':'light');
            }catch(e){document.documentElement.dataset.theme='light'}})()`,
          }}
        />
      </head>
      <body>
        <Sprachraum sprache={sprache}>
          <OfflineWaechter />
          {children}
        </Sprachraum>
      </body>
    </html>
  );
}
