// Rezept-Detail: Portionen umrechnen, Zutaten abhaken, Timer aus den Schritten, auf die Liste.
import { esc, mengeText, minutesText, formatTime } from '../lib/format.js';
import { icon, ribbon } from '../lib/icons.js';
import { colorValue, symbolSvg } from '../lib/symbols.js';
import { detectTimes } from '../lib/parse.js';
import { addToList, recipeItems } from '../lib/shop.js';

export const id = 'recipe';
export const tabs = false;

function servingsOf(ctx, r) {
  ctx.ui.servings = ctx.ui.servings || {};
  return ctx.ui.servings[r.id] ?? (Number(r.portionen) || 1);
}

// Zeitangaben im Schritt als Timer-Knöpfe darstellen.
function stepHtml(text, r, i) {
  const times = detectTimes(text);
  let out = '';
  let pos = 0;
  times.forEach((t, k) => {
    const at = text.indexOf(t.text, pos);
    if (at < 0) return;
    const label = esc(t.text);
    out += esc(text.slice(pos, at)) + `<button type="button" class="tchip" data-act="timer" data-sek="${t.sek}" data-step="${i}" data-k="${k}" aria-label="Timer ${label} starten">${icon('clock', 13, 2.6)}${label}</button>`;
    pos = at + t.text.length;
  });
  return out + esc(text.slice(pos));
}

export function render(ctx) {
  const r = ctx.recipe(ctx.route.params[0]);
  if (!r) {
    return `<main class="screen no-tabs"><a class="icon-btn" href="#/rezepte" aria-label="Zurück">${icon('back')}</a>
      <div class="empty"><div class="h3">${ctx.state.loaded.recipes ? 'Dieses Rezept gibt es nicht mehr' : 'Wird geladen …'}</div></div></main>`;
  }
  const serves = servingsOf(ctx, r);
  const f = serves / (Number(r.portionen) || 1);
  ctx.ui.checked = ctx.ui.checked || {};
  const checked = ctx.ui.checked[r.id] || {};
  const zutaten = (r.zutaten || []).map((z, i) => {
    const q = mengeText(z, f);
    return `<button type="button" class="checkrow" data-act="tick" data-i="${i}" aria-pressed="${!!checked[i]}">
      <span class="box">${icon('check', 14, 3.2)}</span>
      <span class="txt">${q ? `<b>${esc(q)}</b> ` : ''}${esc(z.name)}</span></button>`;
  }).join('');
  const schritte = (r.schritte || []).map((s, i) => `<li><span class="num">${i + 1}</span><p>${stepHtml(s.text, r, i)}</p></li>`).join('');
  const del = ctx.ui.confirmDelete === r.id;

  return `<main class="screen no-tabs">
    <div class="row">
      <a class="icon-btn" href="#/rezepte" aria-label="Zurück zu den Rezepten">${icon('back', 20, 2.4)}</a>
      <span class="grow"></span>
      <button type="button" class="icon-btn ${r.favorit ? 'on' : ''}" data-act="fav" aria-pressed="${!!r.favorit}" aria-label="Favorit">${icon('heart')}</button>
      <a class="icon-btn" href="#/bearbeiten/${encodeURIComponent(r.id)}" aria-label="Rezept bearbeiten">${icon('edit')}</a>
    </div>
    <div class="hero" style="background:${colorValue(r.farbe)}">
      ${ribbon('M-20 60 C 60 10, 120 40, 110 120 S 190 260, 260 250', 390, 250, 'left:-20px;top:0', ['basilikum', 'salbei'].includes(r.farbe) ? 'var(--accent)' : 'var(--done)')}
      <span style="position:relative">${symbolSvg(r.symbol, 160)}</span>
      ${(Number(r.vorbereitungMin) || 0) + (Number(r.kochMin) || 0) ? `<span class="stk tilt-r" style="top:18px;right:18px;background:var(--card);color:var(--ink)">${esc(minutesText((Number(r.vorbereitungMin) || 0) + (Number(r.kochMin) || 0)))}</span>` : ''}
      ${(r.tags || [])[0] ? `<span class="stk tilt-l" style="bottom:20px;right:26px;background:var(--done)">${esc(r.tags[0])}</span>` : ''}
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <h1 class="h1">${esc(r.titel)}</h1>
      ${r.erstelltVon ? `<p class="muted small" style="margin:0">Eingetragen von ${esc(r.erstelltVon)}</p>` : ''}
      ${(r.tags || []).length ? `<div class="tags">${r.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
    </div>
    <div class="stats">
      <div class="stat" style="background:var(--timer)"><span class="label">Vorb.</span><b>${esc(minutesText(Number(r.vorbereitungMin)) || '–')}</b></div>
      <div class="stat" style="background:var(--note)"><span class="label">Kochen</span><b>${esc(minutesText(Number(r.kochMin)) || '–')}</b></div>
      <div class="stat" style="background:var(--done)"><span class="label">Portionen</span><b>${serves}</b></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${(r.schritte || []).length ? `<a class="btn primary" href="#/kochen/${encodeURIComponent(r.id)}"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>Kochen starten</a>` : ''}
      <div class="btns">
        <a class="btn" href="#/plan?add=${encodeURIComponent(r.id)}">${icon('calendar', 18)}Einplanen</a>
        <button type="button" class="btn" data-act="shop">${icon('cart', 18)}Auf die Liste</button>
      </div>
    </div>
    ${(r.zutaten || []).length ? `
    <h2 class="h2" style="padding-top:8px">Zutaten</h2>
    <div class="stepper"><span class="grow" style="font-weight:700">Portionen</span>
      <button type="button" class="icon-btn" style="background:var(--soft)" data-act="less" aria-label="Weniger Portionen">${icon('minus', 18, 2.6)}</button>
      <span class="n" aria-live="polite">${serves}</span>
      <button type="button" class="icon-btn" style="background:var(--accent);color:var(--on-color)" data-act="more" aria-label="Mehr Portionen">${icon('plus', 18, 2.6)}</button></div>
    <div class="checklist">${zutaten}</div>` : ''}
    ${schritte ? `<h2 class="h2" style="padding-top:8px">Zubereitung</h2><ol class="steps">${schritte}</ol>` : ''}
    ${r.notizen ? `<div class="note-card"><h3 class="h3">Notizen</h3><p>${esc(r.notizen)}</p></div>` : ''}
    <button type="button" class="btn danger ${del ? 'confirm' : ''}" data-act="del">${icon('trash', 18)}${del ? 'Wirklich löschen? Nochmal tippen' : 'Rezept löschen'}</button>
  </main>`;
}

function current(ctx) { return ctx.recipe(ctx.route.params[0]); }

export const actions = {
  tick(ctx, el) {
    const r = current(ctx);
    const c = (ctx.ui.checked[r.id] = ctx.ui.checked[r.id] || {});
    c[el.dataset.i] = !c[el.dataset.i];
    ctx.rerender();
  },
  less(ctx) { const r = current(ctx); ctx.ui.servings[r.id] = Math.max(1, servingsOf(ctx, r) - 1); ctx.rerender(); },
  more(ctx) { const r = current(ctx); ctx.ui.servings[r.id] = Math.min(40, servingsOf(ctx, r) + 1); ctx.rerender(); },
  fav(ctx) { const r = current(ctx); ctx.save(ctx.store.update('recipes', r.id, { favorit: !r.favorit })); },
  shop(ctx) {
    const r = current(ctx);
    const f = servingsOf(ctx, r) / (Number(r.portionen) || 1);
    const n = addToList(ctx, recipeItems(r, f));
    ctx.toast(n === 1 ? '1 Zutat auf der Liste' : `${n} Zutaten auf der Liste`, { action: { label: 'Ansehen', fn: () => ctx.go('#/liste') } });
  },
  timer(ctx, el) {
    const r = current(ctx);
    const sek = Number(el.dataset.sek);
    const step = Number(el.dataset.step);
    ctx.T.start(`${r.titel} · Schritt ${step + 1}`, sek, `${r.id}:${step}:${el.dataset.k}`);
    ctx.toast(`Timer ${formatTime(sek)} läuft`, { action: { label: 'Timer', fn: () => ctx.go('#/timer') } });
  },
  del(ctx) {
    const r = current(ctx);
    if (ctx.ui.confirmDelete !== r.id) { ctx.ui.confirmDelete = r.id; ctx.rerender(); return; }
    ctx.ui.confirmDelete = null;
    ctx.save(ctx.store.remove('recipes', r.id));
    ctx.toast(`„${r.titel}" gelöscht`);
    ctx.go('#/rezepte');
  }
};
