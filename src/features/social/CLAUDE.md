# features/social

Feed, Beiträge, Upvotes, Folgen. Vollständig optional — der Log
funktioniert ohne diesen Bereich.

| Datei | Zweck |
|---|---|
| `queries.ts` | Feed laden, inklusive Kaltstart-Regel |
| `actions.ts` | Voten und Folgen |
| `BeitragKarte.tsx` | Ein Beitrag, im Theme seiner Region |

## Regeln hier

**Kaltstart:** Unter 200 Beiträgen wird chronologisch sortiert. Ein
Algorithmus ohne Datenmenge ist schlechter als keiner.

**Jeder Beitrag trägt sein Regionen-Theme.** Deshalb sieht der Feed aus wie
ein Stapel Postkarten und nicht wie eine Tabelle. Das ist der sichtbarste
Unterschied zu Instagram — nicht wegwerfen.

**Motion ist hier schneller:** `motion-feed`, 200 ms. Im Log sind es 400.

**Ein Beitrag braucht immer einen Eintrag.** `posts.entry_id` ist unique.
