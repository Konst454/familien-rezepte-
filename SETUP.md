# Einrichtung: Creative Recipes für die Familie

Dauer: etwa 15 Minuten, einmalig. Danach öffnet jedes Familienmitglied nur noch einen Link.

Was du brauchst: ein Google-Konto (für Firebase) und dieses GitHub-Repository.
Kosten: keine. Der kostenlose Firebase-Tarif „Spark" reicht für eine Familie bei Weitem.

---

## 1. Firebase-Projekt anlegen

1. Öffne <https://console.firebase.google.com> und melde dich mit deinem Google-Konto an.
2. **Projekt erstellen** → Name z. B. `familien-rezepte` → Google Analytics kannst du **ausschalten** → **Projekt erstellen**.
3. Auf der Projektseite auf das Symbol **`</>`** („Web") tippen, um eine Web-App hinzuzufügen.
   - Spitzname: `Rezepte-App`
   - „Firebase Hosting" **nicht** anhaken
   - **App registrieren**
4. Firebase zeigt jetzt einen Block `const firebaseConfig = { apiKey: "...", authDomain: "...", ... }`.
   **Diese Werte brauchst du in Schritt 4.** (Sie sind nicht geheim; geschützt wird alles durch die Regeln aus Schritt 3.)

## 2. Anmeldung einschalten

1. Links im Menü: **Build → Authentication → Jetzt starten**.
2. Reiter **Anmeldemethode**:
   - **Google** → aktivieren → Support-E-Mail auswählen → **Speichern**.
   - **E-Mail-Adresse/Passwort** → aktivieren (nur die erste Option) → **Speichern**.
     (Für Familienmitglieder ohne Google-Konto.)
3. Reiter **Einstellungen → Autorisierte Domains → Domain hinzufügen**:
   `konst454.github.io`

## 3. Datenbank anlegen und schützen

1. Links: **Build → Firestore Database → Datenbank erstellen**.
2. Standort: **`europe-west3 (Frankfurt)`** → Weiter.
3. **Im Produktionsmodus starten** → Erstellen.
4. Reiter **Regeln**: den gesamten Inhalt ersetzen durch den Inhalt der Datei [`firestore.rules`](firestore.rules) aus diesem Repository.
5. In der Liste die Beispiel-Adressen durch **eure echten E-Mail-Adressen** ersetzen (klein geschrieben, jede in `'...'`, durch Komma getrennt), z. B.:

   ```
   && request.auth.token.email.lower() in [
     'mama.mustermann@gmail.com',
     'papa@web.de',
     'lena.mustermann@gmail.com'
   ];
   ```
6. **Veröffentlichen**.

Neues Familienmitglied später? Einfach hier eine Zeile ergänzen und wieder **Veröffentlichen**.

## 4. Konfiguration in die App eintragen

Öffne im GitHub-Repository die Datei `js/firebase-config.js`, tippe auf den Stift („Edit") und trage die Werte aus Schritt 1 ein:

```js
export default {
  apiKey: 'AIza…',
  authDomain: 'familien-rezepte-xxxx.firebaseapp.com',
  projectId: 'familien-rezepte-xxxx',
  appId: '1:123…:web:abc…',
  messagingSenderId: '123…',
  storageBucket: 'familien-rezepte-xxxx.firebasestorage.app',
  familyId: 'familie'
};
```

Dann **Commit changes**. (Alternativ: schick mir die Werte, dann trage ich sie ein.)

## 5. GitHub Pages einschalten (einmal)

Im Repository: **Settings → Pages → Build and deployment → Source: „GitHub Actions"**.
Nach 1–2 Minuten ist die App online unter:

**https://konst454.github.io/familien-rezepte/**

Jede Änderung an `main` wird automatisch neu veröffentlicht.

## 6. Auf jedes Handy bringen

Link an die Familie schicken. Jede Person:

1. Link öffnen
   - **iPhone/iPad: in Safari** (nicht in der WhatsApp-Vorschau)
   - **Android: in Chrome**
2. **Mit Google anmelden** oder **Konto erstellen** (E-Mail + Passwort).
   Bei E-Mail-Konten kommt ein Bestätigungslink per Mail: antippen, dann in der App „Ich habe bestätigt".
3. Als App speichern:
   - **iPhone:** Teilen-Symbol (Quadrat mit Pfeil) → **Zum Home-Bildschirm**
   - **Android:** Menü ⋮ → **App installieren** / **Zum Startbildschirm hinzufügen**

Wer „Noch nicht freigeschaltet" sieht, dessen E-Mail steht noch nicht in den Regeln (Schritt 3.5).

---

## Gut zu wissen

- **Offline:** Die App startet auch ohne Netz. Änderungen (z. B. im Supermarkt abgehakt) werden hochgeladen, sobald wieder Empfang da ist.
- **Timer** laufen auf dem jeweiligen Gerät und klingeln, solange die App geöffnet ist.
- **Demo-Modus:** Solange `apiKey` leer ist, läuft die App nur lokal auf einem Gerät, zum Ausprobieren.
- **Updates an der App:** Nach einer Änderung in `sw.js` die Zeile `const VERSION = 'v1'` hochzählen (`v2`, `v3` …), damit alle Geräte die neue Version laden.
