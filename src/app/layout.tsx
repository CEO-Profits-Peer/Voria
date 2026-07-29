import type { Metadata, Viewport } from 'next';
import { fontVariables } from './fonts';
import { OfflineWaechter } from '@/ui/OfflineWaechter';
import { Sprachraum } from '@/i18n/Sprachraum';
import { aktuelleSprache } from '@/i18n/server';
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
  const sprache = await aktuelleSprache();

  return (
    <html lang={sprache} className={fontVariables} suppressHydrationWarning>
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
