// Timer laufen pro Gerät und überstehen ein Neuladen (Endzeit wird gespeichert).
import { uid } from './lib/format.js';

const KEY = 'cr-timers';
let timers = load();
const listeners = new Set();
let onDone = () => {};

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(timers)); } catch (e) {}
  listeners.forEach((fn) => fn());
}

export function leftOf(t) {
  if (t.running) return Math.max(0, Math.ceil((t.endsAt - Date.now()) / 1000));
  return t.remaining;
}

export function list() {
  return timers.map((t) => ({ ...t, left: leftOf(t) }));
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function setOnDone(fn) { onDone = fn; }

export function start(label, sec, source = '') {
  const t = { id: uid(), label, source, total: sec, remaining: sec, running: true, endsAt: Date.now() + sec * 1000, done: false };
  timers.push(t);
  save();
  return t.id;
}

export function findBySource(source) {
  return list().find((t) => t.source === source && !t.done);
}

export function toggle(id) {
  timers = timers.map((t) => {
    if (t.id !== id) return t;
    if (t.running) return { ...t, running: false, remaining: leftOf(t) };
    const rem = t.remaining > 0 ? t.remaining : t.total;
    return { ...t, running: true, done: false, remaining: rem, endsAt: Date.now() + rem * 1000 };
  });
  save();
}

export function addMinute(id) {
  timers = timers.map((t) => {
    if (t.id !== id) return t;
    const left = leftOf(t) + 60;
    return { ...t, done: false, total: Math.max(t.total, left), remaining: left, endsAt: Date.now() + left * 1000 };
  });
  save();
}

export function remove(id) {
  timers = timers.filter((t) => t.id !== id);
  save();
}

// Für die kleine Anzeige unten: fertige zuerst, dann laufende, dann angehaltene.
export function running() {
  const rank = (t) => (t.done ? 0 : t.running ? 1 : 2);
  return list().sort((a, b) => rank(a) - rank(b) || a.left - b.left);
}

// Einmal pro Sekunde: fertige Timer melden.
export function tick() {
  let changed = false;
  timers = timers.map((t) => {
    if (t.running && leftOf(t) <= 0) {
      changed = true;
      onDone(t);
      return { ...t, running: false, remaining: 0, done: true };
    }
    return t;
  });
  if (changed) save();
}

// ---- Wecker-Ton ----
let audio = null;
export function unlockAudio() {
  try {
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
  } catch (e) {}
}

export function ring() {
  try {
    unlockAudio();
    if (audio) {
      const now = audio.currentTime;
      for (let i = 0; i < 6; i++) {
        const o = audio.createOscillator();
        const g = audio.createGain();
        o.type = 'sine';
        o.frequency.value = i % 2 ? 660 : 880;
        g.gain.setValueAtTime(0.0001, now + i * 0.35);
        g.gain.exponentialRampToValueAtTime(0.4, now + i * 0.35 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.35 + 0.3);
        o.connect(g); g.connect(audio.destination);
        o.start(now + i * 0.35); o.stop(now + i * 0.35 + 0.32);
      }
    }
  } catch (e) {}
  try { if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) {}
}
