// Kochmodus: ein Schritt pro Bildschirm, große Schrift, Timer aus dem Text, Bildschirm bleibt an.
import { esc, formatTime, mengeText } from '../lib/format.js';
import { icon, PLAY, PAUSE } from '../lib/icons.js';
import { detectTimes, zutatenImSchritt } from '../lib/parse.js';

export const id = 'cook';
export const tabs = false;

let wakeLock = null;
let onVisible = null;
let touch = null;
let onTouchStart = null;
let onTouchEnd = null;

function recipeOf(ctx) { return ctx.recipe(ctx.route.params[0]); }
function stepIndex(ctx, r) {
  ctx.ui.cookStep = ctx.ui.cookStep || {};
  const n = (r.schritte || []).length;
  return Math.min(Math.max(0, ctx.ui.cookStep[r.id] || 0), Math.max(0, n - 1));
}

async function lock(ctx) {
  try {
    if ('wakeLock' in navigator && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
      ctx.ui.wake = true;
      wakeLock.addEventListener('release', () => { ctx.ui.wake = false; });
      ctx.rerender();
    }
  } catch (e) { ctx.ui.wake = false; }
}

export function mount(ctx) {
  lock(ctx);
  onVisible = () => { if (document.visibilityState === 'visible') lock(ctx); };
  document.addEventListener('visibilitychange', onVisible);
  onTouchStart = (e) => { const t = e.changedTouches[0]; touch = { x: t.clientX, y: t.clientY }; };
  onTouchEnd = (e) => {
    if (!touch) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.x;
    const dy = t.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) actions[dx < 0 ? 'next' : 'prev'](ctx);
  };
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
}

export function unmount() {
  document.removeEventListener('visibilitychange', onVisible);
  document.removeEventListener('touchstart', onTouchStart);
  document.removeEventListener('touchend', onTouchEnd);
  try { if (wakeLock) wakeLock.release(); } catch (e) {}
  wakeLock = null;
}

export function render(ctx) {
  const r = recipeOf(ctx);
  if (!r || !(r.schritte || []).length) {
    return `<main class="cook"><a class="icon-btn" href="#/rezepte" aria-label="Zurück">${icon('x')}</a><p class="steptext">${ctx.state.loaded.recipes ? 'Dieses Rezept hat noch keine Schritte.' : 'Wird geladen …'}</p></main>`;
  }
  const i = stepIndex(ctx, r);
  const n = r.schritte.length;
  const text = r.schritte[i].text;
  const serves = (ctx.ui.servings && ctx.ui.servings[r.id]) || Number(r.portionen) || 1;
  const f = serves / (Number(r.portionen) || 1);
  const uses = zutatenImSchritt(text, r.zutaten || []).map((z) => {
    const q = mengeText(z, f);
    return `<span>${esc((q ? q + ' ' : '') + z.name)}</span>`;
  }).join('');
  const times = detectTimes(text).map((t, k) => {
    const source = `${r.id}:${i}:${k}`;
    const running = ctx.T.findBySource(source);
    const left = running ? running.left : t.sek;
    const isRunning = running && running.running;
    return `<div class="tcard">
      <div class="grow" style="display:flex;flex-direction:column;gap:2px">
        <span class="small" style="font-weight:700">${running && running.done ? 'Fertig!' : 'Timer · ' + esc(t.text)}</span>
        <span class="time" ${running ? `data-tleft="${running.id}"` : ''}>${running && running.done ? 'fertig' : formatTime(left)}</span>
        <a class="link" href="#/timer">Alle Timer</a>
      </div>
      <button type="button" class="round ${isRunning ? 'pause' : ''}" data-act="timer" data-k="${k}" data-sek="${t.sek}" aria-label="${isRunning ? 'Timer anhalten' : 'Timer starten'}">${isRunning ? PAUSE : PLAY}</button>
    </div>`;
  }).join('');
  const seg = r.schritte.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'cur' : ''}"></i>`).join('');

  return `<main class="cook">
    <svg class="ribbon" width="200" height="300" viewBox="0 0 200 300" style="top:80px;right:0" aria-hidden="true"><path d="M60 -20 C 240 40, 250 160, 150 200 S 120 300, 240 300" fill="none" stroke="var(--accent)" stroke-width="44" stroke-linecap="round"/></svg>
    <div class="row">
      <a class="icon-btn" href="#/rezept/${encodeURIComponent(r.id)}" aria-label="Kochmodus beenden">${icon('x', 20, 2.4)}</a>
      <span class="grow" style="font-weight:700;font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.titel)}</span>
      ${ctx.ui.wake ? '<span class="hf">Bildschirm bleibt an</span>' : ''}
    </div>
    <div class="prog" role="progressbar" aria-label="Fortschritt" aria-valuemin="1" aria-valuemax="${n}" aria-valuenow="${i + 1}">${seg}</div>
    <div style="display:flex;flex-direction:column;gap:14px;flex-grow:1">
      <div class="bignum">${i + 1}<span>/${n}</span></div>
      <p class="steptext" aria-live="polite">${esc(text)}</p>
      ${uses ? `<div style="display:flex;flex-direction:column;gap:8px"><span class="label" style="color:var(--cook-muted)">In diesem Schritt</span><div class="uses">${uses}</div></div>` : ''}
    </div>
    ${times}
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="btns">
        <button type="button" class="btn back" data-act="prev" ${i === 0 ? 'disabled' : ''}>Zurück</button>
        <button type="button" class="btn next" style="flex-grow:2" data-act="next">${i === n - 1 ? 'Fertig – guten Appetit!' : 'Nächster Schritt'}</button>
      </div>
      <p class="small" style="margin:0;text-align:center;color:var(--cook-muted)">Wischen geht auch: nach links für weiter</p>
    </div>
  </main>`;
}

export const actions = {
  next(ctx) {
    const r = recipeOf(ctx);
    const i = stepIndex(ctx, r);
    if (i >= r.schritte.length - 1) { ctx.ui.cookStep[r.id] = 0; ctx.go('#/rezept/' + encodeURIComponent(r.id)); return; }
    ctx.ui.cookStep[r.id] = i + 1;
    ctx.rerender();
  },
  prev(ctx) {
    const r = recipeOf(ctx);
    const i = stepIndex(ctx, r);
    if (i > 0) { ctx.ui.cookStep[r.id] = i - 1; ctx.rerender(); }
  },
  timer(ctx, el) {
    const r = recipeOf(ctx);
    const i = stepIndex(ctx, r);
    const source = `${r.id}:${i}:${el.dataset.k}`;
    const t = ctx.T.findBySource(source);
    if (t) ctx.T.toggle(t.id);
    else ctx.T.start(`${r.titel} · Schritt ${i + 1}`, Number(el.dataset.sek), source);
  }
};
