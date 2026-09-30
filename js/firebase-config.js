// Hier kommt die Web-Konfiguration aus deinem Firebase-Projekt hinein
// (Firebase-Konsole → Projekteinstellungen → Deine Apps → Web-App → „Konfiguration").
// Diese Werte sind nicht geheim; geschützt werden die Daten durch firestore.rules.
// Solange apiKey leer ist, läuft die App im Demo-Modus (Daten nur auf diesem Gerät).

export default {
  apiKey: '',
  authDomain: '',
  projectId: '',
  appId: '',
  messagingSenderId: '',
  storageBucket: '',
  // Alle Familienmitglieder teilen sich diese eine Sammlung.
  familyId: 'familie'
};
