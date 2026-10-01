# Creative Recipes – Hinweise für Claude

Familien-Web-App (PWA) für Rezepte, Wochenplan, gemeinsame Einkaufsliste und Kochmodus.
**Vollständige Beschreibung, Architektur, Datenmodell, Designsystem und Regeln: [KONTEXT.md](KONTEXT.md). Vor jeder Änderung lesen.**

Kurzfassung der Regeln:
- Vanilla HTML/CSS/JS-Module, **kein Build-Schritt, keine Abhängigkeiten**.
- Jeder Bildschirm ist ein Modul in `js/views/` mit `render(ctx)` (HTML-String) und `actions`; Ereignisse über `data-act` / `data-input` / `data-submit`; Routen in `ROUTES` in `js/app.js`.
- Nutzertext immer durch `esc()`; Texte auf Deutsch (Du-Form).
- Speichern über `ctx.save(ctx.store.…)`; Demo-Modus (`store-local.js`) muss alles mitkönnen.
- Design über Tokens in `css/app.css` (`:root`), Thema „Tomato & Basil", 2px-Konturen, Pillen, Sticker, Touch-Ziele ≥ 44 px.
- Hell/Dunkel: Text auf Farbflächen `var(--on-color)`, auf `--bg`/`--card` `var(--ink)`. Dunkel-Tokens stehen zweimal in `css/app.css` und müssen gleich bleiben. Neue Ansichten in beiden Modi prüfen.
- Nach Änderungen an App-Dateien `VERSION` in `sw.js` hochzählen; neue Dateien in `FILES` eintragen.
- Neue Firestore-Sammlung ⇒ `firestore.rules` anpassen und Nutzer bitten, die Regeln in der Firebase-Konsole zu veröffentlichen. Echte E-Mails nie ins Repo.
- Lokal testen: `python3 -m http.server 8000` (Demo-Modus). Push auf `main` veröffentlicht automatisch auf GitHub Pages.
