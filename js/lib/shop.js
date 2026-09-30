// Zutaten auf die gemeinsame Einkaufsliste setzen; gleiche Artikel werden zusammengelegt.
import { guessAisle } from './aisles.js';

const keyOf = (name, einheit) => String(name || '').toLowerCase().trim() + '|' + String(einheit || '').toLowerCase().trim();
const round = (n) => (n === null || n === undefined ? null : Math.round(n * 100) / 100);

function mergeTitles(a, b) {
  const set = new Set(String(a || '').split(', ').filter(Boolean));
  if (b) set.add(b);
  return Array.from(set).join(', ');
}

export function addToList(ctx, items) {
  const open = new Map();
  ctx.state.shopping.filter((i) => !i.erledigt).forEach((i) => open.set(keyOf(i.name, i.einheit), { ...i }));
  const updates = new Map();
  const adds = new Map();
  let n = 0;
  items.forEach((it, idx) => {
    if (!it || !it.name) return;
    n += 1;
    const k = keyOf(it.name, it.einheit);
    const ex = open.get(k);
    if (ex) {
      ex.menge = ex.menge === null || ex.menge === undefined || it.menge === null || it.menge === undefined
        ? (ex.menge ?? it.menge ?? null) : round(ex.menge + it.menge);
      ex.rezeptTitel = mergeTitles(ex.rezeptTitel, it.rezeptTitel);
      updates.set(ex.id, { menge: ex.menge ?? null, rezeptTitel: ex.rezeptTitel || '' });
      return;
    }
    const add = adds.get(k);
    if (add) {
      if (add.menge !== null && it.menge !== null && it.menge !== undefined) add.menge = round(add.menge + it.menge);
      add.rezeptTitel = mergeTitles(add.rezeptTitel, it.rezeptTitel);
      return;
    }
    adds.set(k, {
      name: it.name,
      menge: it.menge === undefined ? null : round(it.menge),
      einheit: it.einheit || '',
      gang: guessAisle(it.name, it.einheit),
      erledigt: false,
      rezeptTitel: it.rezeptTitel || '',
      hinzugefuegtVon: ctx.userName(),
      erstelltAm: Date.now() + idx
    });
  });
  const ops = [];
  updates.forEach((patch, id) => ops.push({ type: 'update', coll: 'shopping', id, patch }));
  adds.forEach((value) => ops.push({ type: 'add', coll: 'shopping', value }));
  if (ops.length) ctx.save(ctx.store.batch(ops));
  return n;
}

export function recipeItems(r, faktor = 1) {
  return (r.zutaten || []).map((z) => ({
    name: z.name,
    menge: z.menge === null || z.menge === undefined ? null : z.menge * faktor,
    einheit: z.einheit || '',
    rezeptTitel: r.titel
  }));
}
