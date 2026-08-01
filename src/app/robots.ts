import type { MetadataRoute } from 'next';
import { seitenUrl } from '@/lib/site-url';

/**
 * Was Suchmaschinen ansehen dürfen.
 *
 * ERLAUBT ist, was ohnehin öffentlich ist: die Startseite, die
 * Preisseite, die Rechtsseiten und die geteilten Beiträge unter
 * `/b/`.
 *
 * VERBOTEN ist alles, was hinter der Anmeldung liegt. Das ist keine
 * Sicherheitsmaßnahme — die liegt in Postgres, und ein Crawler kommt
 * dort ohnehin nicht hinein. Es geht um etwas anderes: Ohne diese
 * Zeilen versucht jede Suchmaschine, `/log` und `/du` zu lesen,
 * landet auf der Anmeldeseite und nimmt die als Inhalt. Man findet
 * Voria dann über „Anmelden" statt über einen Reisetag.
 *
 * `/api/` ebenfalls gesperrt: Der Paddle-Webhook hat in keinem Index
 * etwas verloren.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/log', '/karte', '/feed', '/du', '/suche', '/hinweise', '/rueckblick', '/api/'],
    },
    sitemap: `${seitenUrl()}/sitemap.xml`,
  };
}
