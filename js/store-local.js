// Demo-Modus: alle Daten nur in diesem Browser (localStorage).
// Mehrere Tabs im selben Browser bleiben trotzdem synchron.
import { uid } from './lib/format.js';
import { EXAMPLES } from './examples.js';

const KEY = 'cr-demo-data';
const COLLS = ['recipes', 'shopping', 'plan'];

export function createLocalStore() {
  let data = read();
  if (!data) {
    data = { recipes: {}, shopping: {}, plan: {} };
    const now = Date.now();
    EXAMPLES.forEach((r, i) => { data.recipes['bsp' + i] = { ...r, beispiel: true, erstelltVon: 'Demo', geaendertAm: now - i }; });
    write(data);
  }
  const subs = { recipes: new Set(), shopping: new Set(), plan: new Set() };
  const user = { uid: 'demo', name: 'Du', email: '' };

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function write(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
  }
  function arr(coll) {
    return Object.entries(data[coll] || {}).map(([id, v]) => ({ id, ...v }));
  }
  function emit(coll) { subs[coll].forEach((fn) => fn(arr(coll))); }
  function commit(coll) { write(data); emit(coll); }

  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    data = read() || data;
    COLLS.forEach(emit);
  });

  return {
    mode: 'demo',
    user,
    onAuth(fn) { setTimeout(() => fn(user), 0); return () => {}; },
    onDenied() { return () => {}; },
    subscribe(coll, fn) {
      subs[coll].add(fn);
      setTimeout(() => fn(arr(coll)), 0);
      return () => subs[coll].delete(fn);
    },
    async add(coll, value) {
      const id = uid();
      data[coll][id] = value;
      commit(coll);
      return id;
    },
    async set(coll, id, value) {
      data[coll][id] = value;
      commit(coll);
    },
    async update(coll, id, patch) {
      if (!data[coll][id]) return;
      data[coll][id] = { ...data[coll][id], ...patch };
      commit(coll);
    },
    async remove(coll, id) {
      delete data[coll][id];
      commit(coll);
    },
    async batch(ops) {
      const touched = new Set();
      for (const op of ops) {
        touched.add(op.coll);
        if (op.type === 'add') data[op.coll][uid()] = op.value;
        else if (op.type === 'set') data[op.coll][op.id] = op.value;
        else if (op.type === 'update' && data[op.coll][op.id]) data[op.coll][op.id] = { ...data[op.coll][op.id], ...op.patch };
        else if (op.type === 'remove') delete data[op.coll][op.id];
      }
      write(data);
      touched.forEach(emit);
    },
    async signOut() {},
    resetDemo() {
      try { localStorage.removeItem(KEY); } catch (e) {}
      location.reload();
    }
  };
}
