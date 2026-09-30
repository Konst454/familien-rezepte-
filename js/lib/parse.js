// Zutaten, Einkaufsartikel, Zeiten und ganze Rezepttexte aus Freitext lesen.

const UNITS = [
  'kg', 'g', 'mg', 'l', 'ml', 'cl', 'dl', 'cm',
  'EL', 'TL', 'Msp.', 'Msp', 'Prise', 'Prisen', 'Stück', 'Stk.', 'Stk',
  'Bund', 'Zehe', 'Zehen', 'Dose', 'Dosen', 'Packung', 'Packungen', 'Pck.', 'Pck', 'Päckchen',
  'Becher', 'Scheibe', 'Scheiben', 'Tasse', 'Tassen', 'Glas', 'Gläser', 'Handvoll',
  'Zweig', 'Zweige', 'Blatt', 'Blätter', 'Kopf', 'Knolle', 'Stange', 'Stangen', 'Tube', 'Flasche', 'Flaschen', 'Beutel', 'Netz', 'Schale'
];
const UNIT_MAP = new Map(UNITS.map((u) => [u.toLowerCase(), u]));

const UNICODE_FRAC = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 };

function num(token) {
  if (!token) return null;
  token = token.trim();
  if (UNICODE_FRAC[token] !== undefined) return UNICODE_FRAC[token];
  const mixedUni = token.match(/^(\d+)([½¼¾⅓⅔⅛])$/);
  if (mixedUni) return Number(mixedUni[1]) + UNICODE_FRAC[mixedUni[2]];
  const frac = token.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const n = Number(token.replace(',', '.'));
  return isNaN(n) ? null : n;
}

const QTY = String.raw`(\d+\s+\d+\/\d+|\d+[½¼¾⅓⅔⅛]|\d+(?:[.,]\d+)?(?:\/\d+)?|[½¼¾⅓⅔⅛])`;
const QTY_RE = new RegExp('^' + QTY + String.raw`(?:\s*(?:-|–|bis)\s*` + QTY + ')?\\s*(.*)$');

export function parseZutat(line) {
  let text = String(line || '').trim().replace(/^[-•*·]\s*/, '');
  if (!text) return null;
  const m = text.match(QTY_RE);
  if (!m) return { menge: null, einheit: '', name: text };
  let menge;
  const first = m[1];
  if (/\s/.test(first)) {
    const [w, f] = first.split(/\s+/);
    menge = Number(w) + num(f);
  } else {
    menge = num(first);
  }
  let rest = m[3].trim();
  let einheit = '';
  // "200g Mehl" und "200 g Mehl"
  const um = rest.match(/^([A-Za-zÄÖÜäöüß.]+)\s*(.*)$/);
  if (um && UNIT_MAP.has(um[1].toLowerCase()) && (um[2] || /^[A-Za-z]+\.?$/.test(um[1]))) {
    einheit = UNIT_MAP.get(um[1].toLowerCase());
    rest = um[2].trim();
  }
  if (!rest && einheit) { rest = einheit; einheit = ''; }
  return { menge, einheit, name: rest || text };
}

export function parseZutatenText(text) {
  return String(text || '').split('\n').map(parseZutat).filter(Boolean);
}

export function zutatZeile(z) {
  if (z.menge === null || z.menge === undefined) return z.name;
  const m = String(Math.round(z.menge * 100) / 100).replace('.', ',');
  return (m + ' ' + (z.einheit ? z.einheit + ' ' : '') + z.name).trim();
}

export function parseSchritteText(text) {
  const raw = String(text || '').replace(/\r/g, '');
  let parts = raw.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
  if (parts.length <= 1) parts = raw.split('\n').map((p) => p.trim()).filter(Boolean);
  return parts.map((p) => ({ text: p.replace(/^(\d+[.)]|Schritt\s*\d+:?)\s*/i, '') }));
}

// "2 Limetten", "500 g Hackfleisch", "Milch"
export function parseItem(input) {
  const z = parseZutat(input);
  if (!z) return null;
  const name = z.name.charAt(0).toUpperCase() + z.name.slice(1);
  return { menge: z.menge, einheit: z.einheit, name };
}

const TIME_RE = /(\d+(?:[.,]\d+)?)(?:\s*(?:-|–|bis)\s*(\d+(?:[.,]\d+)?))?\s*(Sekunden|Sekunde|Sek\.?|Minuten|Minute|Min\.?|Stunden|Stunde|Std\.?)(?![a-zäöü])/gi;

export function detectTimes(text) {
  const out = [];
  let m;
  TIME_RE.lastIndex = 0;
  while ((m = TIME_RE.exec(String(text || '')))) {
    const a = Number(m[1].replace(',', '.'));
    const b = m[2] ? Number(m[2].replace(',', '.')) : a;
    const unit = m[3].toLowerCase();
    const factor = unit.startsWith('s') && !unit.startsWith('st') ? 1 : unit.startsWith('st') ? 3600 : 60;
    const sek = Math.round(Math.max(a, b) * factor);
    if (sek > 0 && sek <= 24 * 3600) out.push({ sek, text: m[0] });
  }
  return out;
}

// Ganzen Rezepttext (z. B. aus einer Webseite kopiert) grob zerlegen.
export function parseRecipeText(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n').map((l) => l.trim());
  let titel = '';
  let portionen = null;
  const zutaten = [];
  const schritte = [];
  let mode = null;
  let stepBuf = [];
  const flush = () => { if (stepBuf.length) { schritte.push({ text: stepBuf.join(' ') }); stepBuf = []; } };
  for (const line of lines) {
    if (!line) { if (mode === 'steps') flush(); continue; }
    const low = line.toLowerCase().replace(/[:：]$/, '');
    const pm = line.match(/(?:für|portionen|personen|serviert)\D{0,12}(\d+)|(\d+)\s*(?:portionen|personen)/i);
    if (pm && line.length < 40) { portionen = Number(pm[1] || pm[2]); continue; }
    if (/^(zutaten|einkaufsliste|du brauchst|ingredients)\b/.test(low)) { mode = 'ing'; continue; }
    if (/^(zubereitung|anleitung|so geht'?s|schritte|arbeitsschritte|instructions|method)\b/.test(low)) { mode = 'steps'; continue; }
    if (!titel && !mode) { titel = line.replace(/[:：]$/, ''); continue; }
    const looksLikeIngredient = QTY_RE.test(line) && line.length < 60 && !/[.!]$/.test(line);
    if (mode === 'ing' || (!mode && looksLikeIngredient)) {
      if (mode === 'ing' && line.length > 80) { mode = 'steps'; stepBuf.push(line.replace(/^\d+[.)]\s*/, '')); continue; }
      const z = parseZutat(line);
      if (z) zutaten.push(z);
      continue;
    }
    if (/^(\d+[.)]|schritt\s*\d+)/i.test(line)) flush();
    stepBuf.push(line.replace(/^(\d+[.)]|schritt\s*\d+:?)\s*/i, ''));
    mode = 'steps';
  }
  flush();
  return { titel, portionen, zutaten, schritte };
}

// Welche Zutaten kommen in einem Schritt vor? Wortweise, damit „Salz" nicht in „Salzwasser" steckt.
const words = (t) => String(t || '').toLowerCase().split(/[^\p{L}]+/u).filter((w) => w.length > 3);

export function zutatenImSchritt(text, zutaten) {
  const stepWords = words(text);
  return zutaten.filter((z) => words(z.name).some((w) => {
    const stem = w.slice(0, Math.max(4, w.length - 2));
    return stepWords.some((s) => (s.startsWith(stem) && s.length <= w.length + 3) || (s.length >= 5 && w.startsWith(s)));
  }));
}
