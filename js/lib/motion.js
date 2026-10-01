// Bewegung: Einmal-Animationen, die das Neuzeichnen überleben.
// render() ersetzt bei jeder Änderung das ganze innerHTML. Deshalb laufen Wirkungen über eine Queue:
// ctx.fx(selector, name) merkt sich die Wirkung, render() ruft am Ende flush(root) auf.
// Wird ein Element während der Animation neu gezeichnet, läuft sie am neuen Element weiter
// (negative Verzögerung über --fx-skip) statt von vorn zu beginnen.
const KEY = 'cr-motion';
const LIFETIME = 1500; // so lange wartet ein Eintrag auf sein Element (z. B. Firestore-Antwort)
const FALLBACK = 1200; // spätestens dann wird die Klasse wieder entfernt (× Tempo)

let pending = [];
const timers = new WeakMap();

// Aktuelles Tempo (--motion-scale), damit Zeitlupe und Labor auch die Zeitgrenzen strecken.
export function motionScale() {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion-scale'));
  return v > 0 ? v : 1;
}

function lifespan() { return FALLBACK * Math.max(1, motionScale()); }

// Klasse fx-<name> setzen und die Animation neu starten. skip = bereits gelaufene ms.
export function play(el, name, skip = 0) {
  if (!el) return;
  const cls = 'fx-' + name;
  let t = timers.get(el);
  if (!t) timers.set(el, (t = {}));
  clearTimeout(t[cls]);
  el.classList.remove(cls);
  if (skip > 0) el.style.setProperty('--fx-skip', `-${Math.round(skip)}ms`);
  else el.style.removeProperty('--fx-skip');
  void el.offsetWidth; // Reflow: Animation startet sicher neu
  el.classList.add(cls);
  const done = (e) => {
    if (e && e.target !== el) return;
    el.removeEventListener('animationend', done);
    clearTimeout(t[cls]);
    el.classList.remove(cls);
    el.style.removeProperty('--fx-skip');
  };
  el.addEventListener('animationend', done);
  t[cls] = setTimeout(done, Math.max(0, lifespan() - skip));
}

export function queue(sel, name) {
  pending.push({ sel, name, at: Date.now(), started: 0 });
}

// Am Ende von render(): Wirkungen auf die (neu gezeichneten) Elemente legen.
export function flush(root) {
  const now = Date.now();
  const span = lifespan();
  pending = pending.filter((e) => (e.started ? now - e.started < span : now - e.at < LIFETIME));
  pending.forEach((e) => {
    let els;
    try { els = root.querySelectorAll(e.sel); } catch (err) { els = []; }
    if (!els.length) return;
    if (!e.started) {
      e.started = now;
      els.forEach((el) => play(el, e.name));
    } else {
      els.forEach((el) => { if (!el.classList.contains('fx-' + e.name)) play(el, e.name, now - e.started); });
    }
  });
}

// Eindeutiger Selektor aus den data-Attributen eines Elements (für data-fx).
export function selectorFor(el) {
  if (el.id) return '#' + CSS.escape(el.id);
  const parts = Object.entries(el.dataset)
    .filter(([k]) => k !== 'fx')
    .map(([k, v]) => `[data-${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}="${String(v).replace(/["\\]/g, '\\$&')}"]`);
  return el.tagName.toLowerCase() + parts.join('');
}

// data-fx="pop" oder data-fx="pop:.box" → Eintrag in die Queue.
export function queueFromElement(el) {
  const [name, sub] = String(el.dataset.fx || '').split(':');
  if (!name) return;
  queue(selectorFor(el) + (sub ? ' ' + sub : ''), name);
}

// Wertwechsel: true, wenn value sich seit dem letzten Neuzeichnen geändert hat (nicht beim ersten Mal).
export function changed(ui, key, value) {
  ui._seen = ui._seen || {};
  const had = Object.prototype.hasOwnProperty.call(ui._seen, key);
  const prev = ui._seen[key];
  ui._seen[key] = value;
  return had && prev !== value;
}

// Kurzes Vibrieren (nur Android; iOS ignoriert das).
export function buzz(ms = 10) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
}

// Zeitlupe pro Gerät ('normal' | 'slow'). Das Frühskript in index.html setzt sie schon vor dem Zeichnen.
export function getMotion() {
  try { return localStorage.getItem(KEY) === 'slow' ? 'slow' : 'normal'; } catch (e) { return 'normal'; }
}

export function applyMotion() {
  if (getMotion() === 'slow') document.documentElement.dataset.motion = 'slow';
  else delete document.documentElement.dataset.motion;
}

export function setMotion(mode) {
  try {
    if (mode === 'slow') localStorage.setItem(KEY, 'slow');
    else localStorage.removeItem(KEY);
  } catch (e) {}
  applyMotion();
}
