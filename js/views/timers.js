// Alle laufenden Timer dieses Geräts.
import { esc, formatTime } from '../lib/format.js';
import { icon, PLAY, PAUSE } from '../lib/icons.js';

export const id = 'timers';

const COLORS = ['var(--timer)', 'var(--done)', 'var(--note)', 'var(--sky)'];

export function render(ctx) {
  const list = ctx.T.list();
  const cards = list.map((t, k) => {
    const offset = 213.6 * (1 - t.left / Math.max(1, t.total));
    return `<div class="timer-card ${t.done ? 'ringing' : ''}" style="background:${t.done ? 'var(--accent)' : COLORS[k % COLORS.length]}">
      <div class="ring">
        <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="34" fill="var(--card)" stroke="var(--line)" stroke-width="2"/><circle cx="42" cy="42" r="34" fill="none" stroke="var(--line)" stroke-width="10" stroke-dasharray="213.6" stroke-dashoffset="${offset}" stroke-linecap="round" data-tring="${t.id}"/></svg>
        <button type="button" data-act="toggle" data-id="${t.id}" aria-label="${t.running ? 'Anhalten' : 'Starten'}: ${esc(t.label)}">${t.running ? PAUSE : PLAY}</button>
      </div>
      <div class="grow" style="display:flex;flex-direction:column;gap:2px">
        <span style="font-weight:700;font-size:15px;overflow-wrap:anywhere">${esc(t.label)}</span>
        <span class="time" data-tleft="${t.id}">${t.done ? 'fertig' : formatTime(t.left)}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button type="button" class="btn small" data-act="plus" data-id="${t.id}" aria-label="Eine Minute mehr">+1:00</button>
        <button type="button" class="btn small" data-act="remove" data-id="${t.id}" aria-label="Timer löschen">${icon('trash', 16)}</button>
      </div>
    </div>`;
  }).join('');

  return `<main class="screen">
    <div class="row between">
      <button type="button" class="icon-btn" data-act="back" aria-label="Zurück">${icon('back', 20, 2.4)}</button>
      ${list.length ? `<span class="stk tilt-l" style="background:var(--done)">${list.filter((t) => t.running).length} laufen</span>` : ''}
    </div>
    <h1 class="display">Timer</h1>
    ${cards || '<div class="empty"><div class="h3">Kein Timer läuft</div><p class="muted small" style="margin:0">Starte einen hier oder tippe im Rezept auf eine Zeit wie „20 Minuten".</p></div>'}
    <h2 class="h3" style="padding-top:6px">Neuer Timer</h2>
    <div class="quick">${[1, 5, 10, 15].map((m) => `<button type="button" class="btn" data-act="quick" data-min="${m}">${m} Min.</button>`).join('')}</div>
    <form class="row" data-submit="custom" style="align-items:flex-end" novalidate>
      <label class="field grow" for="t-label"><span>Name</span><input id="t-label" class="input" type="text" placeholder="z. B. Nudeln" autocomplete="off"></label>
      <label class="field" for="t-min" style="width:92px"><span>Minuten</span><input id="t-min" class="input" type="number" inputmode="decimal" min="0" step="any" placeholder="12"></label>
      <button type="submit" class="icon-btn" style="width:50px;height:50px;background:var(--ink);color:var(--on-ink)" aria-label="Timer starten">${icon('plus', 22, 2.6)}</button>
    </form>
    <p class="hint" style="margin:0">Timer klingeln, solange die App geöffnet ist. Beim Kochen bleibt der Bildschirm an.</p>
  </main>`;
}

export const actions = {
  back(ctx) { history.length > 1 ? history.back() : ctx.go('#/rezepte'); },
  toggle(ctx, el) { ctx.T.toggle(el.dataset.id); },
  plus(ctx, el) { ctx.T.addMinute(el.dataset.id); },
  remove(ctx, el) { ctx.T.remove(el.dataset.id); },
  quick(ctx, el) { const m = Number(el.dataset.min); ctx.T.start(`${m}-Minuten-Timer`, m * 60, ''); },
  custom(ctx) {
    const minEl = document.getElementById('t-min');
    const labEl = document.getElementById('t-label');
    const m = Number(String(minEl.value).replace(',', '.'));
    if (!m || m <= 0) { minEl.focus(); ctx.toast('Bitte Minuten eingeben'); return; }
    const label = labEl.value.trim() || `${m}-Minuten-Timer`;
    minEl.value = ''; labEl.value = '';
    ctx.T.start(label, Math.round(m * 60), '');
  }
};
