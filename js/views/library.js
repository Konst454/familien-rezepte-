// Startseite: alle Rezepte, Suche, Sammlungen und „Heute".
import { esc, isoDate, minutesText } from '../lib/format.js';
import { icon, ribbon } from '../lib/icons.js';
import { colorValue, symbolSvg } from '../lib/symbols.js';
import { EXAMPLES } from '../examples.js';
import { effectiveTheme, toggleTheme } from '../theme.js';

export const id = 'library';

function matches(r, q, chip) {
  if (chip === 'fav' && !r.favorit) return false;
  if (chip && chip !== 'fav' && chip !== 'all' && !(r.tags || []).includes(chip)) return false;
  if (!q) return true;
  const hay = [r.titel, ...(r.tags || []), ...(r.zutaten || []).map((z) => z.name)].join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
}

function card(r) {
  const total = (Number(r.vorbereitungMin) || 0) + (Number(r.kochMin) || 0);
  const meta = [total ? minutesText(total) : '', r.portionen ? r.portionen + ' Portionen' : ''].filter(Boolean).join(' · ');
  return `<a class="rcard" href="#/rezept/${encodeURIComponent(r.id)}">
    <div class="img" style="background:${colorValue(r.farbe)}">${r.favorit ? '<span class="stk">Favorit</span>' : ''}${symbolSvg(r.symbol, 76)}</div>
    <div class="cap"><b>${esc(r.titel)}</b><span>${esc(meta)}</span></div></a>`;
}

export function listHtml(ctx) {
  const q = ctx.ui.libQuery || '';
  const chip = ctx.ui.libChip || 'all';
  const rows = ctx.state.recipes.filter((r) => matches(r, q, chip));
  if (!rows.length) {
    return `<div class="empty"><div class="h3">Nichts gefunden</div><p class="muted small" style="margin:0">Probier ein anderes Wort oder wähle „Alle".</p></div>`;
  }
  return `<div class="grid2">${rows.map(card).join('')}</div>`;
}

// Hell/Dunkel-Schalter. „Automatisch" gibt es weiter im Konto.
function themeSwitch() {
  const dark = effectiveTheme() === 'dark';
  return `<button type="button" class="mode-switch" role="switch" aria-checked="${dark}" aria-label="Dunkelmodus" data-act="theme">
    <span class="mode-ic">${icon('sun', 16)}</span><span class="mode-ic">${icon('moon', 16)}</span>
    <span class="knob">${icon(dark ? 'moon' : 'sun', 18, 2.4)}</span></button>`;
}

export function render(ctx) {
  const { recipes, loaded } = ctx.state;
  const chip = ctx.ui.libChip || 'all';
  const tags = Array.from(new Set(recipes.flatMap((r) => r.tags || []))).sort((a, b) => a.localeCompare(b, 'de'));
  const chips = [['all', 'Alle ' + recipes.length], ['fav', 'Favoriten'], ...tags.map((t) => [t, t])]
    .map(([k, label]) => `<button type="button" class="chip" data-act="chip" data-k="${esc(k)}" aria-pressed="${chip === k}">${esc(label)}</button>`).join('');

  const today = ctx.state.plan[isoDate(new Date())];
  const meals = (today && today.mahlzeiten) || [];
  const tonight = meals.find((m) => m.slot === 'Abend' && m.rezeptId) || meals.find((m) => m.rezeptId);
  const tr = tonight && ctx.recipe(tonight.rezeptId);
  const tonightHtml = tr ? `<a class="tonight" href="#/rezept/${encodeURIComponent(tr.id)}">
      <span class="ic" style="background:${colorValue(tr.farbe)}">${symbolSvg(tr.symbol, 46)}</span>
      <span class="grow" style="display:flex;flex-direction:column;gap:2px"><span class="label">Heute · ${esc(tonight.slot)}</span><span class="t">${esc(tr.titel)}</span></span>
      <span class="go">${icon('next', 20, 2.4)}</span></a>` : '';

  let body;
  if (!loaded.recipes) body = '<p class="muted">Rezepte werden geladen …</p>';
  else if (!recipes.length) {
    body = `<div class="empty"><div class="h3">Noch keine Rezepte</div>
      <p class="muted" style="margin:0;line-height:1.45">Tippe auf das Plus unten rechts und trag euer erstes Familienrezept ein.</p>
      <div class="btns" style="width:100%;flex-wrap:wrap"><a class="btn primary" href="#/neu">${icon('plus')}Rezept eintragen</a>
      <button type="button" class="btn" data-act="examples">Beispiele laden</button></div></div>`;
  } else {
    body = `<label class="search">${icon('search', 20)}<span class="sr-only">Rezepte durchsuchen</span>
        <input id="lib-q" type="search" placeholder="Rezept oder Zutat suchen" autocomplete="off" data-input="search" value="${esc(ctx.ui.libQuery || '')}"></label>
      <div class="chips" role="group" aria-label="Sammlungen">${chips}</div>
      ${tonightHtml}
      <div id="lib-list">${listHtml(ctx)}</div>`;
  }

  return `<main class="screen">
    ${ribbon('M180 190 C 230 60, 300 40, 330 110 S 380 200, 430 60', 480, 220, 'top:40px;left:0')}
    <div class="row between"><span class="stk tilt-l">Creative Recipes</span>
      <span class="row" style="gap:8px">${themeSwitch()}<a class="icon-btn" href="#/konto" aria-label="Konto und Einstellungen">${icon('user')}</a></span></div>
    <h1 class="display">Rezepte</h1>
    ${body}
  </main>`;
}

export const actions = {
  theme(ctx, el) {
    // Knopf erst gleiten lassen, dann umschalten (bei „Bewegung reduzieren" sofort).
    el.setAttribute('aria-checked', String(el.getAttribute('aria-checked') !== 'true'));
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(toggleTheme, reduce ? 0 : 180);
  },
  search(ctx, el) {
    ctx.ui.libQuery = el.value;
    const box = document.getElementById('lib-list');
    if (box) box.innerHTML = listHtml(ctx);
  },
  chip(ctx, el) {
    ctx.ui.libChip = el.dataset.k;
    ctx.rerender();
  },
  examples(ctx) {
    const who = ctx.userName();
    ctx.save(ctx.store.batch(EXAMPLES.map((r, i) => ({ type: 'add', coll: 'recipes', value: { ...r, erstelltVon: who, geaendertAm: Date.now() + i } }))));
    ctx.toast('3 Beispielrezepte hinzugefügt');
  }
};
