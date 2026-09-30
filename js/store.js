// Wählt die Datenquelle: Firebase, wenn konfiguriert, sonst Demo-Modus.
import config from './firebase-config.js';

export async function createStore() {
  const cfg = window.__CR_CONFIG || config;
  if (cfg && cfg.apiKey) {
    const m = await import('./store-firebase.js');
    return m.createFirebaseStore(cfg);
  }
  const m = await import('./store-local.js');
  return m.createLocalStore();
}
