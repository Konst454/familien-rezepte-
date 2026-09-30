// Kleine Helfer für Text, Mengen und Datumsangaben.

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const FRACTIONS = [[0, ''], [0.25, '¼'], [0.333, '⅓'], [0.5, '½'], [0.667, '⅔'], [0.75, '¾'], [1, '']];

export function fracStr(n) {
  const whole = Math.floor(n);
  const rest = n - whole;
  let best = FRACTIONS[0];
  for (const f of FRACTIONS) if (Math.abs(f[0] - rest) < Math.abs(best[0] - rest)) best = f;
  const w = best[0] === 1 ? whole + 1 : whole;
  const s = (w > 0 ? String(w) : '') + best[1];
  return s || '¼';
}

function decimal(n, digits) {
  const f = Math.pow(10, digits);
  return String(Math.round(n * f) / f).replace('.', ',');
}

// Einheiten, die man abwiegt oder abmisst: Dezimalzahlen. Alles andere: Brüche.
const MEASURED = ['g', 'kg', 'mg', 'ml', 'l', 'cl', 'dl', 'cm'];
const WHOLE = ['zehe', 'zehen', 'blatt', 'blätter', 'scheibe', 'scheiben', 'ei', 'eier', 'zweig', 'zweige'];

export function fmtMenge(menge, einheit = '', name = '') {
  if (menge === null || menge === undefined || menge === '' || isNaN(menge)) return '';
  const u = (einheit || '').toLowerCase();
  if (MEASURED.includes(u)) {
    if (u === 'g' || u === 'ml' || u === 'mg') {
      if (menge >= 100) return String(Math.round(menge / 5) * 5);
      if (menge >= 10) return String(Math.round(menge));
      return decimal(menge, 1);
    }
    return decimal(menge, menge >= 10 ? 0 : 1);
  }
  const firstWord = (u || String(name).toLowerCase().split(/\s+/)[0] || '');
  if (WHOLE.includes(firstWord)) return String(Math.max(1, Math.round(menge)));
  return fracStr(menge);
}

export function mengeText(z, faktor = 1) {
  if (z.menge === null || z.menge === undefined) return (z.einheit || '').trim();
  const m = fmtMenge(z.menge * faktor, z.einheit, z.name);
  return (m + ' ' + (z.einheit || '')).trim();
}

export function formatTime(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = String(sec % 60).padStart(2, '0');
  return h > 0 ? h + ':' + String(m).padStart(2, '0') + ':' + s : m + ':' + s;
}

export function minutesText(min) {
  if (!min) return '';
  if (min < 60) return min + ' Min.';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h + ' Std.' + (m ? ' ' + m + ' Min.' : '');
}

// ---- Datum ----
export const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
export const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];

export function isoDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function fromIso(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfWeek(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const wd = (x.getDay() + 6) % 7; // Montag = 0
  x.setDate(x.getDate() - wd);
  return x;
}

export function addDays(d, n) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

export function shortDate(d) {
  return d.getDate() + '. ' + MONTHS[d.getMonth()];
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
