// Animations-Labor (#/labor): Bewegungs-Tokens live regeln und jede Animation einzeln abspielen.
// Versteckt: im Konto 5× auf die Versionszeile tippen. Regler gelten nur bis zum Neuladen.
import { icon } from '../lib/icons.js';
import { getMotion, motionScale } from '../lib/motion.js';

export const id = 'lab';
export const tabs = false;

const num = (v, d = 2) => String(Math.round(v * 10 ** d) / 10 ** d).replace('.', ',');

const SLIDERS = [
  { id: 'lab-tempo', token: '--motion-scale', label: 'Tempo', min: 0.5, max: 8, step: 0.5,
    def: () => (getMotion() === 'slow' ? 4 : 1), out: (v) => `Dauer × ${num(v)}` },
  { id: 'lab-spring', token: '--spring', label: 'Federung', min: 1, max: 2.4, step: 0.02,
    def: () => 1.56, out: (v) => num(v) },
  { id: 'lab-move', token: '--move', label: 'Bewegung', min: 0, max: 1.5, step: 0.05,
    def: () => 1, out: (v) => `${Math.round(v * 100)} %` }
];

function current(s) {
  const v = parseFloat(document.documentElement.style.getPropertyValue(s.token));
  return Number.isFinite(v) ? v : s.def();
}

function sliderHtml(s) {
  const v = current(s);
  return `<label class="lab-range" for="${s.id}">
    <span class="top"><span>${s.label}</span><output id="${s.id}-out">${s.out(v)}</output></span>
    <input id="${s.id}" type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${v}" data-input="slide" data-token="${s.token}" data-keep="no">
  </label>`;
}

// Eine Karte pro Animation: Name, Erklärung, Vorschau, „Abspielen".
function demoCard(key, title, hint, preview) {
  return `<section class="card lab-card" aria-labelledby="lab-${key}-h">
    <div class="lab-head"><h2 class="h3" id="lab-${key}-h">${title}</h2>
      <button type="button" class="btn small" style="height:44px" data-act="play" data-k="${key}">${icon('sparkle', 16)}Abspielen</button></div>
    <p class="hint" style="margin:0">${hint}</p>
    <div class="lab-demo" id="lab-${key}">${preview}</div>
  </section>`;
}

export function render() {
  const tuned = SLIDERS.some((s) => document.documentElement.style.getPropertyValue(s.token));
  return `<main class="screen no-tabs lab">
    <div class="row"><button type="button" class="icon-btn" data-act="back" aria-label="Zurück">${icon('back', 20, 2.4)}</button></div>
    <h1 class="display md">Labor</h1>
    <section class="card lab-card" aria-label="Regler">
      ${SLIDERS.map(sliderHtml).join('')}
      <button type="button" class="btn block" data-act="reset" ${tuned ? '' : 'disabled'}>Zurücksetzen</button>
      <p class="hint" style="margin:0">Die Regler gelten sofort für die ganze App, bis du zurücksetzt oder neu lädst.${getMotion() === 'slow' ? ' Zeitlupe ist an (Konto → Bewegung).' : ''}</p>
    </section>
    ${demoCard('press', 'Druck-Gefühl', 'Drück die Knöpfe oder tipp auf „Abspielen". Knöpfe werden kleiner, Karten nur ein bisschen.', `
      <button type="button" class="btn press">Normal</button>
      <button type="button" class="btn primary press">Gefüllt</button>
      <button type="button" class="icon-btn press" aria-label="Herz">${icon('heart')}</button>
      <button type="button" class="chip press">Chip</button>
      <button type="button" class="card press press-soft lab-cardbox">Karte</button>`)}
  </main>`;
}

// Kurz „gedrückt" halten, dann loslassen (zeigt Drücken und Zurückfedern).
function pressDemo() {
  const els = document.querySelectorAll('#lab-press .press');
  els.forEach((el) => el.classList.add('is-pressed'));
  setTimeout(() => els.forEach((el) => el.classList.remove('is-pressed')), 80 * motionScale() + 220);
}

export const actions = {
  back(ctx) { ctx.back('#/konto'); },
  // Kein Neuzeichnen beim Ziehen (würde den Regler unter dem Finger austauschen).
  slide(ctx, el) {
    const s = SLIDERS.find((x) => x.id === el.id);
    if (!s) return;
    const v = parseFloat(el.value);
    document.documentElement.style.setProperty(s.token, String(v));
    const out = document.getElementById(s.id + '-out');
    if (out) out.textContent = s.out(v);
    const r = document.querySelector('.lab [data-act="reset"]');
    if (r) r.disabled = false;
  },
  reset(ctx) {
    SLIDERS.forEach((s) => document.documentElement.style.removeProperty(s.token));
    ctx.rerender();
  },
  play(ctx, el) {
    if (el.dataset.k === 'press') pressDemo();
  }
};
