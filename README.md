# Creative Recipes – Familien-Version

Rezepte, Wochenplan, gemeinsame Einkaufsliste und Kochmodus mit Timern.
Eine Web-App (PWA): im Browser öffnen, anmelden, „Zum Home-Bildschirm" – fertig. Kein App Store nötig.

**Einrichtung:** siehe [SETUP.md](SETUP.md).

## Funktionen

- **Rezepte** eintragen, bearbeiten, löschen; Portionen umrechnen; Rezepttext einfügen und automatisch erkennen lassen.
- **Einkaufsliste** für alle, live synchronisiert, nach Supermarkt-Gängen sortiert; gleiche Artikel werden zusammengelegt.
- **Wochenplan** mit Frühstück, Mittag, Abend; „Füllen" plant freie Abende; ganze Woche auf die Liste.
- **Kochmodus** Schritt für Schritt, Bildschirm bleibt an, Zeiten im Text werden zu Timern.

## Technik

Reines HTML, CSS und JavaScript (ES-Module), kein Build-Schritt.
Daten und Anmeldung: Firebase (Firestore + Authentication). Hosting: GitHub Pages.

```
index.html, manifest.webmanifest, sw.js   App-Hülle, Installierbarkeit, Offline
css/app.css                               Design (Farbthema „Tomato & Basil")
js/app.js                                 Navigation, Live-Daten, Timer
js/store-firebase.js / store-local.js     Firebase bzw. Demo-Modus (localStorage)
js/views/                                 Die einzelnen Bildschirme
js/lib/                                   Mengen, Parser, Gänge, Symbole
firestore.rules                           Zugriffsschutz (Familien-E-Mails)
```

Lokal ausprobieren (Demo-Modus): `python3 -m http.server 8000` und <http://localhost:8000> öffnen.
