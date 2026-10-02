// Hier kommt die Web-Konfiguration aus deinem Firebase-Projekt hinein
// (Firebase-Konsole → Projekteinstellungen → Deine Apps → Web-App → „Konfiguration").
// Diese Werte sind nicht geheim; geschützt werden die Daten durch firestore.rules.
// Solange apiKey leer ist, läuft die App im Demo-Modus (Daten nur auf diesem Gerät).

export default {
  apiKey: 'AIzaSyCoeTp3xuEcoUQ6UBLMgO3O-SY3R0-DUZw',
  authDomain: 'familienrezepte-824af.firebaseapp.com',
  projectId: 'familienrezepte-824af',
  appId: '1:497828693030:web:74795d28f80d8815dd92e7',
  messagingSenderId: '497828693030',
  storageBucket: 'familienrezepte-824af.firebasestorage.app',
  // Alle Familienmitglieder teilen sich diese eine Sammlung.
  familyId: 'familie'
};
