# KONTEXT: Creative Recipes (Familien-Rezepte-App)

> **Für KI-Assistenten:** Dieses Dokument erklärt die App vollständig: was sie kann, wie der Code aufgebaut ist, welches Designsystem gilt und welche Regeln bei Änderungen einzuhalten sind. Lies es ganz, bevor du Code änderst oder Prompts formulierst. Am Ende stehen Prompt-Vorlagen.

---

## 1. Was die App ist

| | |
|---|---|
| **Name** | Creative Recipes (auf dem Home-Bildschirm: „Rezepte") |
| **Zweck** | Rezepte, Wochenplan und Einkaufsliste für **eine Familie**, gemeinsam genutzt |
| **Nutzer** | 2–6 Familienmitglieder, vor allem auf dem **Smartphone** (iPhone/Android) |
| **Art** | **Web-App (PWA)**: im Browser öffnen, „Zum Home-Bildschirm" → startet wie eine App. Kein App Store. |
| **Live** | https://konst454.github.io/familien-rezepte-/ |
| **Code** | https://github.com/Konst454/familien-rezepte- (Branch `main`) |
| **Sprache** | Deutsch, Du-Form |
| **Kosten** | 0 € (GitHub Pages + Firebase-Gratistarif „Spark") |
| **Vorbild** | Funktionsumfang angelehnt an die iOS-App „Crouton"; Gestaltung im Sticker-Stil (angelehnt an Slush), Farbthema „Tomato & Basil" |

**Zwei Betriebsarten:**
- **Demo-Modus**: solange `js/firebase-config.js` keinen `apiKey` hat. Daten nur im Browser (localStorage), keine Anmeldung, 3 Beispielrezepte vorbelegt.
- **Familien-Modus**: mit Firebase-Konfiguration. Anmeldung (Google oder E-Mail/Passwort), Daten in Firestore, **live auf allen Geräten** synchron, offline nutzbar.

---

## 2. Funktionen je Bildschirm

Navigation per Hash-Route. Untere Tab-Leiste: **Rezepte · Plan · Liste** + roter **Plus-Knopf** (neues Rezept). Die Liste zeigt ein Zähler-Badge der offenen Artikel.

| Route | Datei | Inhalt |
|---|---|---|
| `#/rezepte` (Start) | `js/views/library.js` | Oben rechts **Hell/Dunkel-Schalter** (`.mode-switch`, role=switch) und Konto-Knopf; Titel „Rezepte", Suche (Titel, Stichworte, Zutaten), Chips: Alle / Favoriten / alle Stichworte; Karte „Heute · Abend" aus dem Wochenplan; Raster der Rezeptkarten (Farbe + Illustration). Leer: „Rezept eintragen" + „Beispiele laden". |
| `#/rezept/:id` | `js/views/recipe.js` | Kopfbild (Farbe + Illustration + Sticker), Titel, „Eingetragen von", Stichworte, 3 Kacheln (Vorb., Kochen, Portionen); **Kochen starten**, **Einplanen** (→ `#/plan?add=:id`), **Auf die Liste** (skaliert); Portionen-Stepper (1–40) rechnet alle Mengen um; Zutaten zum Abhaken (nur lokal); Zubereitung mit **Zeit-Chips** („4 Minuten" → startet Timer); Notizen; Löschen mit zweitem Tippen zur Bestätigung. |
| `#/neu`, `#/bearbeiten/:id` | `js/views/editor.js` | Formular: Titel*, Portionen, Vorb./Kochzeit (Min.), Zutaten (Textfeld, eine pro Zeile „200 g Mehl"), Zubereitung (ein Schritt pro Absatz), Stichworte (Komma), Notizen, Farbe (6), Bild (8 Illustrationen), Vorschau. **„Rezepttext einfügen und erkennen"**: kopierter Text → Titel, Portionen, Zutaten, Schritte. |
| `#/kochen/:id` | `js/views/cook.js` | Dunkler Vollbild-Kochmodus: Fortschrittsbalken, große Schrittnummer, Schritttext, „In diesem Schritt"-Zutaten (passend skaliert), Timer-Karte je erkannter Zeit (Start/Pause), Zurück/Weiter, **Wischen** links/rechts, Bildschirm bleibt an (Wake Lock). |
| `#/timer` | `js/views/timers.js` | Alle Timer des Geräts: Ring-Fortschritt, Start/Pause, +1:00, Löschen; Schnellstart 1/5/10/15 Min.; eigener Timer (Name + Minuten). |
| `#/plan` | `js/views/planner.js` | Woche (Mo–So) mit Punkten für geplante Tage, Wochen blättern; je Tag **Frühstück/Mittag/Abend**: Rezept wählen (Auswahl-Blatt mit Suche) oder Notiz; entfernen; **Füllen** (freie Abende automatisch, Favoriten zuerst, mit „Rückgängig"); **Woche auf die Einkaufsliste**. Mit `?add=:id`: Banner, Tipp auf einen Platz plant das Rezept ein. |
| `#/liste` | `js/views/shopping.js` | „N offen"; Eingabe „2 Limetten" (Menge/Einheit erkannt); Artikel nach **Gängen** gruppiert (Obst & Gemüse, Brot & Backwaren, Kühlregal, Fleisch & Fisch, Vorrat, Tiefkühl, Getränke, Haushalt, Sonstiges); Zeile zeigt „für <Rezept> · von <Person>" und Menge; Abhaken → Bereich „Erledigt"; „Erledigte entfernen" mit Bestätigung. Gleiche Artikel (Name + Einheit) werden **zusammengelegt** und Mengen addiert. |
| `#/konto` | `js/views/account.js` | Name/E-Mail bzw. „Demo-Modus", **Darstellung** (Automatisch / Hell / Dunkel, pro Gerät), Anleitung „Zum Home-Bildschirm" (nur wenn nicht installiert), Timer-Link, Abmelden bzw. „Demo zurücksetzen". |
| (Anmeldung) | `js/views/login.js` | Nur im Familien-Modus ohne Anmeldung: Google-Knopf, E-Mail anmelden/Konto erstellen, Passwort vergessen. Danach ggf. **„Bitte E-Mail bestätigen"** oder **„Noch nicht freigeschaltet"** (E-Mail nicht in den Regeln). |

**Global:** Meldungen oben (Toasts, optional mit Aktionsknopf); kleine **Timer-Leiste** über der Tab-Leiste, wenn ein Timer existiert; fertiger Timer → Ton + Vibration + rote Meldung „Timer „X" ist fertig" mit „Aus".

---

## 3. Technik und Architektur

- **Kein Build-Schritt, keine Abhängigkeiten.** Reines HTML/CSS/JavaScript mit ES-Modulen. Firebase-SDK 11.10.0 wird zur Laufzeit von `https://www.gstatic.com/firebasejs/…` geladen (nur im Familien-Modus).
- **Hosting:** GitHub Pages. Jeder Push auf `main` startet `.github/workflows/pages.yml`, das `index.html manifest.webmanifest sw.js css js icons` veröffentlicht.
- **Offline:** `sw.js` (Service Worker, „erst Netz, sonst Zwischenspeicher") + Firestore-Offline-Speicher.

### Dateien

```
index.html               App-Hülle: <div id="app">, <div id="toasts">, Meta-Tags für iOS, lädt js/app.js
manifest.webmanifest     PWA-Manifest (Name, Icons, Farben, standalone)
sw.js                    Service Worker; VERSION + Liste FILES (alle App-Dateien)
css/app.css              Gesamtes Design: Tokens in :root + alle Komponentenklassen
js/app.js                Kern: Routen, Zustand, render(), Ereignis-Verteilung, Toasts, Timer-Takt, Start
js/store.js              Wählt Datenquelle (Firebase wenn apiKey, sonst Demo)
js/store-firebase.js     Firestore + Firebase Auth
js/store-local.js        Demo-Modus (localStorage, Tabs synchron über 'storage'-Ereignis)
js/firebase-config.js    Firebase-Web-Konfiguration (leer = Demo-Modus) + familyId
js/examples.js           3 Beispielrezepte
js/timers.js             Timer-Logik (pro Gerät, localStorage 'cr-timers'), Wecker-Ton
js/theme.js              Hell/Dunkel: getTheme(), setTheme(mode), toggleTheme(), effectiveTheme(), applyTheme()
                         (localStorage 'cr-theme'; sendet Ereignis 'cr-themechange' → app.js zeichnet neu)
js/lib/format.js         esc(), Mengen formatieren, Zeiten, Datum (deutsch)
js/lib/parse.js          Zutaten/Artikel/Zeiten/Rezepttext aus Freitext lesen
js/lib/aisles.js         Supermarkt-Gänge + Stichwort-Zuordnung
js/lib/shop.js           addToList() (zusammenlegen), recipeItems()
js/lib/symbols.js        Rezeptfarben (6) und Illustrationen (8, SVG)
js/lib/icons.js          Linien-Icons icon(name), PLAY/PAUSE, ribbon()
js/views/*.js            Ein Modul pro Bildschirm (siehe Abschnitt 2)
firestore.rules          Zugriffsregeln (Vorlage; echte E-Mails nur in der Firebase-Konsole!)
firebase.json            Nur für den lokalen Firebase-Emulator (Tests)
SETUP.md                 Einrichtungsanleitung (Firebase, Pages, Home-Bildschirm)
icons/                   App-Icons 180/192/512 + maskable
```

### Datenfluss

1. `start()` in `app.js` erzeugt den Store (`createStore()`), wartet auf Anmeldung (`onAuth`), abonniert dann `recipes`, `shopping`, `plan`.
2. Jede Datenänderung (auch von anderen Geräten) → `state.*` aktualisiert → `render()`.
3. `render()` bestimmt die View aus der Route, ruft beim Wechsel `unmount()`/`mount()`, dann `root.innerHTML = view.render(ctx)` + Tab-Leiste + Timer-Leiste.
4. **Eingaben bleiben erhalten:** Vor dem Neuzeichnen derselben Route werden Werte aller `input/textarea/select` **mit `id`** sowie Fokus, Cursor und Scrollposition gemerkt und danach wiederhergestellt. → Jedes Eingabefeld braucht eine **stabile `id`**.
5. Schreibzugriffe gehen über `ctx.save(store.xyz(...))`: **nicht warten**, die Anzeige aktualisiert sich sofort über das Abo (Firestore liefert lokale Änderungen sofort, auch offline). Fehler → Toast.

### View-Vertrag (so ist jeder Bildschirm gebaut)

```js
export const id = 'meinScreen';        // Name, u. a. für die aktive Tab-Markierung
export const tabs = false;             // optional: Tab-Leiste ausblenden
export function mount(ctx) {}          // optional: beim Betreten (z. B. UI-Zustand anlegen)
export function unmount(ctx) {}        // optional: beim Verlassen (Listener entfernen)
export function render(ctx) { return `<main class="screen">…</main>`; } // HTML-String
export const actions = {               // Ereignis-Handler
  speichern(ctx, el, ev) { … }
};
```

Ereignisse werden **zentral delegiert** über Datenattribute:
- `data-act="name"`: Klick → `actions.name(ctx, el, ev)`
- `data-input="name"`: Eingabe (jede Taste)
- `data-change="name"`: Änderung
- `data-submit="name"`: Formular abschicken (`preventDefault` automatisch)
- Weitere Daten über `data-*` am Element (`el.dataset.id`).

**Neuer Bildschirm:** Datei in `js/views/`, Import + Eintrag in `ROUTES` in `js/app.js`, Datei in `FILES` in `sw.js`, `VERSION` in `sw.js` hochzählen.

### ctx (wird an render/actions übergeben)

| Eigenschaft | Bedeutung |
|---|---|
| `ctx.state` | `{ recipes[], shopping[], plan{datum: doc}, loaded{recipes,shopping,plan}, user, store, denied, ui }` |
| `ctx.store` | Datenquelle (Abschnitt 4) |
| `ctx.ui` | Flüchtiger UI-Zustand (Suche, gewählter Tag, Portionen je Rezept, Kochschritt …), geht beim Neuladen verloren |
| `ctx.route` | `{ name, params[], query{} }` z. B. `#/plan?add=abc` → `{name:'plan', params:[], query:{add:'abc'}}` |
| `ctx.go(hash)` | Navigieren, z. B. `ctx.go('#/liste')` |
| `ctx.rerender()` | Neu zeichnen |
| `ctx.toast(text, opts)` | Meldung; `opts`: `{ action:{label, fn}, timeout, sticky, alarm }` |
| `ctx.save(promise)` | Speichern ohne zu blockieren, Fehler als Toast |
| `ctx.recipe(id)` | Rezept nach id |
| `ctx.userName()` | Anzeigename der angemeldeten Person (Demo: „Du") |
| `ctx.T` | Timer-Modul: `start(label, sek, source)`, `toggle(id)`, `addMinute(id)`, `remove(id)`, `list()`, `findBySource(source)` |

Live-Anzeigen: Elemente mit `data-tleft="<timerId>"` (Restzeit-Text) und `data-tring="<timerId>"` (SVG-Ring) werden jede Sekunde ohne Neuzeichnen aktualisiert.

---

## 4. Daten

### Store-Schnittstelle (Demo und Firebase identisch)

```js
store.mode                         // 'demo' | 'firebase'
store.subscribe(coll, rows => {})  // coll: 'recipes' | 'shopping' | 'plan'; liefert Array mit id
store.add(coll, value) → id
store.set(coll, id, value)
store.update(coll, id, patch)
store.remove(coll, id)
store.batch([{ type:'add'|'set'|'update'|'remove', coll, id?, value?, patch? }])
store.onAuth(user => {}), store.onDenied(err => {})
// nur Firebase: signInGoogle(), signInEmail(), registerEmail(name,email,pw), resetPassword(),
//               sendVerification(), refreshUser(), signOut()
// nur Demo: resetDemo()
```

### Firestore-Pfad und Felder

Alles liegt unter `families/{familyId}/…` (`familyId` aus `firebase-config.js`, Standard `familie`).

**`recipes/{id}`**
```js
{ titel: string, portionen: number, vorbereitungMin: number, kochMin: number,
  tags: string[], zutaten: [{ menge: number|null, einheit: string, name: string }],
  schritte: [{ text: string }], notizen: string,
  farbe: 'tomate'|'basilikum'|'pfirsich'|'paprika'|'butter'|'salbei',
  symbol: 'schuessel'|'fisch'|'pfannkuchen'|'pfanne'|'brot'|'salat'|'kuchen'|'topf',
  favorit: boolean, erstelltVon: string, geaendertAm: number /*ms*/ }
```

**`shopping/{id}`**
```js
{ name: string, menge: number|null, einheit: string,
  gang: 'obst'|'brot'|'kuehl'|'fleisch'|'vorrat'|'tk'|'getraenke'|'haushalt'|'sonst',
  erledigt: boolean, rezeptTitel: string /*kommagetrennt bei mehreren*/,
  hinzugefuegtVon: string, erstelltAm: number }
```

**`plan/{JJJJ-MM-TT}`** (ein Dokument pro Tag; wird gelöscht, wenn leer)
```js
{ mahlzeiten: [{ slot: 'Frühstück'|'Mittag'|'Abend', titel: string, rezeptId?: string, von?: string }] }
```
Einträge ohne `rezeptId` sind Notizen.

**Timer** liegen **nicht** in Firestore, sondern pro Gerät in `localStorage['cr-timers']`.

### Zugriffsschutz (`firestore.rules`)
Lesen/Schreiben nur, wenn angemeldet, **E-Mail bestätigt** und E-Mail in der Liste steht, und nur für die Sammlungen `recipes`, `shopping`, `plan`.
**Neue Sammlung** (z. B. `wunschliste`) ⇒ in den Regeln ergänzen **und** in der Firebase-Konsole veröffentlichen, sonst „permission-denied". Die echten Familien-E-Mails stehen nur in der Konsole, nie im Repo.

---

## 5. Hilfsfunktionen (wiederverwenden statt neu schreiben)

| Funktion | Datei | Zweck |
|---|---|---|
| `esc(text)` | format.js | **HTML-Escaping, für jeden Nutzertext Pflicht** |
| `mengeText(zutat, faktor)` | format.js | „625 g", „2 Zehen", „½" (Dezimal bei g/ml/kg/l, sonst Brüche, ganze Zahlen bei Zehen/Eiern/Blättern) |
| `fmtMenge`, `fracStr`, `formatTime(sek)`, `minutesText(min)` | format.js | Zahlen/Zeiten deutsch |
| `isoDate`, `startOfWeek` (Montag), `addDays`, `shortDate`, `WEEKDAYS`, `uid()` | format.js | Datum, IDs |
| `parseZutat("2-3 Zehen Knoblauch")` → `{menge:2, einheit:'Zehen', name:'Knoblauch'}` | parse.js | versteht ½, 1/2, 1 1/2, 1,5, „200g" |
| `parseZutatenText`, `parseSchritteText`, `zutatZeile` | parse.js | Textfeld ↔ Daten |
| `parseRecipeText(text)` | parse.js | ganzer Rezepttext → `{titel, portionen, zutaten, schritte}` |
| `detectTimes(text)` → `[{sek, text}]` | parse.js | „4 Minuten", „2–3 Min.", „1 Std.", „30 Sekunden" |
| `zutatenImSchritt(text, zutaten)` | parse.js | wortweiser Abgleich („Salz" ≠ „Salzwasser") |
| `parseItem("2 limetten")` | parse.js | Einkaufsartikel, Großschreibung |
| `AISLES`, `guessAisle(name, einheit)`, `aisleName(key)` | aisles.js | Gänge und Stichwortlisten (erweiterbar) |
| `addToList(ctx, items)`, `recipeItems(rezept, faktor)` | shop.js | Artikel hinzufügen mit Zusammenlegen |
| `COLORS`, `colorValue(key)`, `SYMBOLS`, `symbolSvg(key, size)` | symbols.js | Rezeptfarben und Illustrationen |
| `icon(name, size, strichstärke)`, `PLAY`, `PAUSE`, `ribbon(d, w, h, style, color)` | icons.js | Icons: book, calendar, cart, plus, minus, search, back, next, x, heart, edit, check, clock, user, sparkle, trash, text, share, sun, fork, logout, list |

---

## 6. Designsystem

### Farb-Tokens (`css/app.css`, `:root`) – Thema „Tomato & Basil"

| Token | Wert | Rolle |
|---|---|---|
| `--bg` | `#FFF6EC` | Hintergrund („Mehl") |
| `--card` | `#FFFFFF` | Karten, Felder |
| `--ink` / `--line` | `#1C1A17` | Text, **alle Konturen**, Hauptknöpfe |
| `--on-ink` | `#FFF6EC` | Text auf `--ink` |
| `--muted` | `#5C544B` | Nebentext |
| `--soft` | `#F6EADB` | Trennlinien, Mengen-Chips |
| `--accent` | `#FF5A3C` | Tomate: Bänder/Ribbons, Plus-Knopf, Schrittnummern, „Weiter" |
| `--done` | `#6CC58A` | Basilikum: erledigt/aktiv, „Heute"-Karte |
| `--note` | `#FFC9B5` | Pfirsich: Notizen |
| `--fav` | `#FF8A3D` | Paprika: Favorit |
| `--timer` | `#FFD66B` | Butter: Timer, Sticker |
| `--smart` / `--on-smart` | `#2E6B4A` / `#FFF` | Kräutergrün: automatische Funktionen („Füllen") |
| `--sky`, `--sage` | `#CFE3F2`, `#B9D8B0` | Zusatzflächen (Gänge, Einfügen-Box) |
| `--cook-bg`, `--cook-fg`, `--track`, `--cook-muted` | dunkel | Kochmodus |
| `--danger` | `#B3261E` | Löschen |

| `--on-color` / `--on-color-muted` | `#1C1A17` / `#5C544B` | **Text auf Farbflächen**, in Hell und Dunkel gleich |
| `--on-danger` | `#FFF` (dunkel: `#1C1A17`) | Text auf `--danger` |
| `--plate` | `#FFF` (dunkel: `#F5F3EE`) | Grund hinter Rezept-Illustrationen (Bild-Auswahl) |
| `--scrim` | `rgba(28,26,23,.45)` (dunkel: `rgba(0,0,0,.62)`) | Schleier hinter dem Auswahl-Blatt |

**Textfarben-Regel:** Text auf `--bg` und `--card` = `var(--ink)`. Text auf Farbflächen (`--accent`, `--done`, `--note`, `--fav`, `--timer`, `--sky`, `--sage`, Rezeptfarben, `--cook-fg`) = `var(--on-color)`. Nie `--ink` auf Farbflächen verwenden: `--ink` wird im Dunkelmodus hell. Weißer Text nur auf `--smart` (`--on-smart`).

### Dunkelmodus „Night Kitchen"
- Umschaltung pro Gerät: **Schalter auf der Startseite** (Hell ↔ Dunkel) und im Konto (Automatisch / Hell / Dunkel). Logik in `js/theme.js`. Ein Frühskript in `index.html` setzt den Modus vor dem ersten Zeichnen (kein Aufblitzen).
- `css/app.css` überschreibt im Dunkeln nur diese Tokens: `--bg #111214`, `--card #1D1F24`, `--ink`/`--line #F5F3EE`, `--on-ink #111214`, `--muted #A8A39A`, `--soft #2A2D33`, `--danger #FF8A80`, `--on-danger`, `--plate`, `--scrim`. Farbflächen und Kochmodus bleiben gleich.
- Die Dunkel-Tokens stehen **zweimal** (System-Media-Query und `[data-theme="dark"]`). **Beide Blöcke müssen gleich bleiben.**
- Neue Farben deshalb immer als Token anlegen und in beiden Dunkel-Blöcken prüfen. Keine festen Hex-Farben in Views (Ausnahme: Illustrationen in `symbols.js`, die stehen immer auf Farbflächen).
- Bekannte Grenze: Das Startbild der installierten App (Manifest) ist hell.

### Schrift
- **Display:** Bricolage Grotesque 800, eng (`letter-spacing -0.035…-0.05em`, `line-height .8–.9`). Klassen `.display` (große Seitentitel, 60–88 px), `.h1` (46), `.h2` (30), `.h3` (21).
- **Text:** Hanken Grotesk 400–700, Grundgröße 16 px; Labels `.label` (12 px, Großbuchstaben, gesperrt).

### Gestaltungsregeln
- **2 px Konturen** in `--line` um Karten, Knöpfe, Felder, Sticker.
- **Pillenform** (`border-radius: 999px`) für Knöpfe, Chips, Suche, Tab-Leiste; Karten 22–36 px Radius.
- **Sticker** (`.stk`): kleine Pillen mit Kontur, leicht gedreht (`.tilt-l` −3°, `.tilt-r` +4°).
- **Ribbon** (dickes geschwungenes Band, `ribbon()`): nur Deko hinter großen Titeln, nie interaktiv.
- **Hauptaktion = schwarzer Knopf** (`.btn.primary`), Nebenaktionen weiß mit Kontur (`.btn`).
- Touch-Ziele **≥ 44 px**. Keine Emojis, Icons nur als Linien-SVG (`icon()`).
- Seitenränder 20 px; Inhalt max. 480 px breit; Tab-Leiste schwebt unten (Safe-Area beachtet).
- Barrierearm: echte `<button>`/`<a href>`, `aria-label` an Icon-Knöpfen, `aria-pressed` für Umschalter.

### Komponenten-Klassen (Auswahl)
`.screen` (Seitencontainer; `.no-tabs` ohne Tab-Leiste) · `.row`, `.between`, `.grow` · `.btn` + `.primary`, `.accent`, `.smart`, `.done`, `.small`, `.block`, `.dashed`, `.danger`(`.confirm`) · `.btns` (gleich breite Knopfreihe) · `.icon-btn` (44er Rundknopf, `.on`) · `.stk` · `.card` · `.empty` (gestrichelter Leerzustand) · `.search` · `.chips` + `.chip[aria-pressed]` · `.field` + `.input` (`.pill`), `.textarea`, `.hint` · `.checklist` + `.checkrow[aria-pressed]` (+ `.box`, `.txt`, `.meta`, `.qty`) · `.rcard` (Rezeptkarte) · `.grid2` · `.tonight` · `.hero` · `.stats`/`.stat` · `.stepper` · `.steps` · `.tchip` (Zeit-Chip) · `.note-card` · `.seg` · `.swatches`/`.swatch` · `.symbols`/`.symbol` · `.paste-box` · `.cook` (+ `.prog`, `.bignum`, `.steptext`, `.uses`, `.tcard`, `.round`) · `.timer-card` (+ `.ring`) · `.quick` · `.week`/`.day` · `.slot`/`.meal` (`.note`) · `.banner` · `.sheet-bg`/`.sheet`/`.pick` · `.aisle`/`.aisle-head` · `.tabbar`/`.fab` · `.mini-timer` · `.toast` (`.alarm`) · `.error` · `.login-card`

**Design-Anpassungen** möglichst über die Tokens in `:root` lösen (ein Farbthema = nur Token-Werte ändern). Inline-`style` in den Views nur für Einzelfälle.

---

## 7. Regeln für Änderungen (Checkliste für die KI)

1. **Jeder Nutzertext** in HTML-Strings durch `esc()`.
1b. **Farben nur über Tokens**; Text auf Farbflächen `var(--on-color)`, auf `--bg`/`--card` `var(--ink)`. Neue Ansichten in Hell **und** Dunkel prüfen.
2. **Deutsch**, Du-Form, kurze klare Sätze. Knöpfe sagen, was passiert („Speichern", „Auf die Liste").
3. **Keine neuen Abhängigkeiten, kein Build-Schritt, kein Framework.** Nur Vanilla-JS-Module.
4. **Mobil zuerst** (390 px Breite), Touch-Ziele ≥ 44 px.
5. **Demo-Modus muss weiter funktionieren** (store-local.js kann alles, was store-firebase.js kann).
6. Schreiben über `ctx.save(ctx.store.…)`, nicht `await` vor UI-Updates.
7. Eingabefelder mit **stabiler `id`**, Ereignisse über `data-act`/`data-input`/`data-submit`, keine `addEventListener` in `render`.
8. Nach jeder Änderung an App-Dateien: **`VERSION` in `sw.js` hochzählen** (`v1` → `v2` …); neue Dateien in `FILES` eintragen.
9. Neue Firestore-Sammlung ⇒ `firestore.rules` anpassen und den Nutzer erinnern, die Regeln in der Firebase-Konsole zu veröffentlichen.
10. Neue Felder an bestehenden Dokumenten **optional** behandeln (`r.feld ?? standard`), alte Daten haben sie nicht.
11. Antwortformat: **vollständige geänderte Dateien** oder eindeutige „Suchen → Ersetzen"-Blöcke mit Dateipfad.

---

## 8. Testen und Veröffentlichen

- **Lokal (Demo-Modus):** im Projektordner `python3 -m http.server 8000`, dann http://localhost:8000. Demo-Daten zurücksetzen: Konto → „Demo zurücksetzen".
- **Mehrere Personen simulieren:** zwei Tabs im selben Browser bleiben im Demo-Modus synchron.
- **Veröffentlichen:** Änderung auf `main` committen (auch direkt in der GitHub-Weboberfläche über den Stift) → GitHub Action „Auf GitHub Pages veröffentlichen" → nach 1–2 Min. live. Handys laden die neue Version beim nächsten Öffnen (dank `VERSION`).
- **Firebase-Einrichtung:** siehe `SETUP.md`.

---

## 9. Grenzen und Ideen

**Bewusste Grenzen (v1):**
- Kein Import per Link (Rezeptseiten abrufen braucht einen Server wegen CORS) → „Rezepttext einfügen".
- Keine Fotos (Firebase Storage nur im Bezahltarif „Blaze").
- Timer klingeln nur bei geöffneter App (Push auf iOS bräuchte Server).
- Keine Sprachsteuerung im Kochmodus.

**Ideen-Backlog** (mit betroffenen Stellen):
| Idee | Betrifft |
|---|---|
| Gang eines Artikels ändern / Menge bearbeiten | `shopping.js` (Auswahl-Blatt wie in `planner.js`), `store.update` |
| Rezept teilen (Text in Zwischenablage / `navigator.share`) | `recipe.js` |
| Mehrere Listen (z. B. Drogerie) | neues Feld `liste` in `shopping`, Chips in `shopping.js` |
| Nährwerte, Bewertung, „zuletzt gekocht" | neue optionale Felder in `recipes`, `editor.js`, `recipe.js` |
| Import aus Paprika/Mela-Datei | neue Funktion in `parse.js`, Datei-Input in `editor.js` |
| Einkaufsliste nach Laden-Reihenfolge sortierbar | Reihenfolge der `AISLES` pro Familie speichern |
| Wochenplan-Vorlagen / Lieblingswoche | `planner.js`, neue Sammlung (Regeln!) |

---

## 10. Prompt-Vorlagen

### Neue Funktion
```
Kontext: Creative Recipes (siehe KONTEXT.md + Code). Halte dich an Abschnitt 7.

Ziel: <Was soll die Familie neu tun können? 1–2 Sätze>
Bildschirm(e): <z. B. #/liste (js/views/shopping.js)>
Verhalten:
- <Schritt für Schritt, was passiert, wenn man tippt>
- <Sonderfälle: leer, offline, Demo-Modus>
Daten: <neue/geänderte Felder oder Sammlungen; „keine">
Design: <Platzierung, welche vorhandenen Klassen/Tokens; Texte auf Deutsch>
Fertig, wenn:
- <prüfbares Kriterium 1>
- <prüfbares Kriterium 2>
Liefere: vollständige geänderte Dateien mit Pfad, VERSION in sw.js erhöht, kurze Liste, was ich in Firebase ändern muss (falls nötig).
```

### Design-Anpassung
```
Kontext: Creative Recipes, Designsystem in KONTEXT.md Abschnitt 6.

Ändern: <z. B. „Rezeptkarten größer, Titel in Display-Schrift">
Wo: <Bildschirm/Komponente/Klasse, z. B. .rcard in css/app.css>
Nicht ändern: Layout der anderen Bildschirme, Funktionen, Texte.
Stilregeln beibehalten: 2px-Konturen, Pillenformen, Sticker, Touch-Ziele ≥44px, Lesbarkeit (Text auf Farbflächen dunkel).
Bevorzugt über Tokens in :root lösen.
Liefere: geänderte Dateien vollständig + VERSION in sw.js erhöht.
```

### Fehler melden
```
Kontext: Creative Recipes (KONTEXT.md + Code).
Gerät/Browser: <z. B. iPhone 13, Safari, als Home-Bildschirm-App>
Modus: <Demo / Familie (Firebase)>
Schritte: 1. … 2. … 3. …
Erwartet: …   Passiert: …   (Screenshot/Fehlermeldung, falls vorhanden)
Finde die Ursache im Code, erkläre sie in 2 Sätzen, liefere die minimale Korrektur.
```

### Beispiele
- *Funktion:* „Auf der Einkaufsliste soll man durch langes Drücken oder einen Stift-Knopf Menge, Einheit und Gang eines Artikels ändern können. Bildschirm `#/liste`. Bearbeiten in einem Auswahl-Blatt wie im Wochenplan (`.sheet`). Daten: nur `update` auf `shopping`. Fertig, wenn Änderungen sofort auf allen Geräten erscheinen und im Demo-Modus funktionieren."
- *Design:* „Mach die Rezeptkarten auf der Startseite größer (eine Spalte, Bild 160 px hoch) und den Titel in der Display-Schrift. Nur `.rcard` in css/app.css und library.js; in Hell und Dunkel prüfen."
- *Fehler (erfundenes Beispiel):* „Wenn ich im Kochmodus den Timer starte und zur Liste wechsle, zeigt die Timer-Leiste 0:00. iPhone, Safari, Familien-Modus. Erwartet: Restzeit läuft weiter."

---

## 11. Startnachricht für einen neuen Chat (zum Kopieren)

```
Du hilfst mir, meine Familien-Web-App „Creative Recipes" weiterzuentwickeln.
Im Anhang ist kontext-paket.md: zuerst KONTEXT.md (Beschreibung, Architektur,
Designsystem, Regeln), danach der komplette Quellcode.

Bitte:
1. Lies alles und bestätige in 5 Stichpunkten, wie die App aufgebaut ist.
2. Halte dich bei jeder Änderung an „Regeln für Änderungen" (Abschnitt 7).
3. Wenn ich einen Wunsch nenne, stelle zuerst Rückfragen, falls etwas unklar ist,
   und formuliere dann einen präzisen Umsetzungs-Prompt nach Vorlage (Abschnitt 10),
   oder liefere direkt vollständige geänderte Dateien, wenn ich das sage.
4. Sprich mit mir Deutsch, einfach und ohne Fachchinesisch.
```
