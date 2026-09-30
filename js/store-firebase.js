// Familien-Version: Firestore-Datenbank + Anmeldung über Firebase.
// Alle Änderungen erscheinen sofort auf allen Geräten (onSnapshot).

const SDK_VERSION = '11.10.0';

export async function createFirebaseStore(config) {
  const base = window.__FIREBASE_SDK_BASE || `https://www.gstatic.com/firebasejs/${SDK_VERSION}/`;
  const appMod = await import(base + 'firebase-app.js');
  const fs = await import(base + 'firebase-firestore.js');
  const au = await import(base + 'firebase-auth.js');

  const app = appMod.initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    appId: config.appId,
    messagingSenderId: config.messagingSenderId,
    storageBucket: config.storageBucket
  });

  let db;
  try {
    db = fs.initializeFirestore(app, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) });
  } catch (e) {
    db = fs.getFirestore(app);
  }
  const auth = au.getAuth(app);
  if (config.emulator) {
    fs.connectFirestoreEmulator(db, config.emulator.host || '127.0.0.1', config.emulator.firestorePort || 8080);
    au.connectAuthEmulator(auth, 'http://' + (config.emulator.host || '127.0.0.1') + ':' + (config.emulator.authPort || 9099), { disableWarnings: true });
  }
  try { await au.setPersistence(auth, au.browserLocalPersistence); } catch (e) {}

  const family = config.familyId || 'familie';
  const path = (coll) => fs.collection(db, 'families', family, coll);
  const ref = (coll, id) => fs.doc(db, 'families', family, coll, id);
  const deniedHandlers = new Set();
  const store = { mode: 'firebase', user: null };

  function toUser(u) {
    if (!u) return null;
    return { uid: u.uid, name: u.displayName || (u.email ? u.email.split('@')[0] : 'Jemand'), email: u.email || '', verified: !!u.emailVerified };
  }

  // Ergebnis eines Redirect-Logins (Fallback, wenn Pop-ups blockiert sind) abholen.
  au.getRedirectResult(auth).catch(() => {});

  Object.assign(store, {
    onAuth(fn) {
      return au.onAuthStateChanged(auth, (u) => { store.user = toUser(u); fn(store.user); });
    },
    onDenied(fn) { deniedHandlers.add(fn); return () => deniedHandlers.delete(fn); },
    subscribe(coll, fn) {
      return fs.onSnapshot(path(coll), (snap) => {
        fn(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }, (err) => {
        if (err && err.code === 'permission-denied') deniedHandlers.forEach((h) => h(err));
        else console.error('Firestore', err);
      });
    },
    async add(coll, value) {
      const r = await fs.addDoc(path(coll), value);
      return r.id;
    },
    async set(coll, id, value) { await fs.setDoc(ref(coll, id), value); },
    async update(coll, id, patch) { await fs.updateDoc(ref(coll, id), patch); },
    async remove(coll, id) { await fs.deleteDoc(ref(coll, id)); },
    async batch(ops) {
      for (let i = 0; i < ops.length; i += 450) {
        const b = fs.writeBatch(db);
        for (const op of ops.slice(i, i + 450)) {
          if (op.type === 'add') b.set(fs.doc(path(op.coll)), op.value);
          else if (op.type === 'set') b.set(ref(op.coll, op.id), op.value);
          else if (op.type === 'update') b.update(ref(op.coll, op.id), op.patch);
          else if (op.type === 'remove') b.delete(ref(op.coll, op.id));
        }
        await b.commit();
      }
    },
    async signInGoogle() {
      const provider = new au.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await au.signInWithPopup(auth, provider);
      } catch (e) {
        if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
          await au.signInWithRedirect(auth, provider);
        } else throw e;
      }
    },
    async signInEmail(email, password) { await au.signInWithEmailAndPassword(auth, email, password); },
    async registerEmail(name, email, password) {
      const cred = await au.createUserWithEmailAndPassword(auth, email, password);
      if (name) await au.updateProfile(cred.user, { displayName: name });
      try { await au.sendEmailVerification(cred.user); } catch (e) {}
      store.user = toUser(auth.currentUser);
    },
    async sendVerification() { if (auth.currentUser) await au.sendEmailVerification(auth.currentUser); },
    // Nach dem Bestätigen der E-Mail: neues Token holen, damit die Regeln es sehen.
    async refreshUser() {
      if (!auth.currentUser) return;
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
      store.user = toUser(auth.currentUser);
    },
    async resetPassword(email) { await au.sendPasswordResetEmail(auth, email); },
    async signOut() { await au.signOut(auth); }
  });
  return store;
}
