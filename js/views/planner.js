// Wochenplan: Frühstück, Mittag, Abend für jeden Tag; gemeinsam für die ganze Familie.
import { esc, isoDate, startOfWeek, addDays, shortDate, WEEKDAYS } from '../lib/format.js';
import { icon } from '../lib/icons.js';
import { colorValue, symbolSvg } from '../lib/symbols.js';
import { addToList, recipeItems } from '../lib/shop.js';

export const id = 'planner';
const SLOTS = ['Frühstück', 'Mittag', 'Abend'];

function weekStart(ctx) {
  return addDays(startOfWeek(new Date()), 7 * (ctx.ui.planWeek || 0));
}
function selectedDate(ctx) {
  const ws = weekStart(ctx);
  if (ctx.ui.planDay === undefined) {
    const today = new Date();
    ctx.ui.planDay = (ctx.ui.planWeek || 0) === 0 ? (today.getDay() + 6) % 7 : 0;
  }
  return addDays(ws, ctx.ui.planDay);
}
function mealsOf(ctx, date) {
  const doc = ctx.state.plan[isoDate(date)];
  return (doc && doc.mahlzeiten) || [];
}
function saveMeals(ctx, date, meals) {
  const key = isoDate(date);
  if (meals.length) ctx.save(ctx.store.set('plan', key, { mahlzeiten: meals }));
  else if (ctx.state.plan[key]) ctx.save(ctx.store.remove('plan', key));
}

function mealHtml(ctx, m, i, key) {
  const r = m.rezeptId ? ctx.recipe(m.rezeptId) : null;
  const del = `<button type="button" class="x" data-act="removeMeal" data-date="${key}" data-i="${i}" aria-label="${esc(m.titel)} entfernen">${icon('x', 18, 2.4)}</button>`;
  if (r) {
    return `<div class="meal"><a class="row grow" href="#/rezept/${encodeURIComponent(r.id)}" style="gap:12px">
      <span class="sq" style="background:${colorValue(r.farbe)}">${symbolSvg(r.symbol, 36)}</span>
      <span class="grow" style="display:flex;flex-direction:column;gap:2px"><b style="font-size:16px;line-height:1.2">${esc(r.titel)}</b>
      ${m.von ? `<span class="small muted">geplant von ${esc(m.von)}</span>` : ''}</span></a>${del}</div>`;
  }
  return `<div class="meal note"><span class="sq" style="border-style:dashed">${icon('edit', 20)}</span>
    <span class="grow" style="display:flex;flex-direction:column;gap:2px"><b style="font-size:16px">${esc(m.titel || 'Notiz')}</b>${m.rezeptId ? '<span class="small muted">Rezept wurde gelöscht</span>' : ''}</span>${del}</div>`;
}

function sheetHtml(ctx) {
  const sh = ctx.ui.planSheet;
  if (!sh) return '';
  const q = (ctx.ui.planQuery || '').toLowerCase();
  const rows = ctx.state.recipes.filter((r) => !q || r.titel.toLowerCase().includes(q)).map((r) =>
    `<button type="button" class="pick" data-act="pickRecipe" data-id="${esc(r.id)}"><span class="sq" style="background:${colorValue(r.farbe)}">${symbolSvg(r.symbol, 30)}</span><b class="grow">${esc(r.titel)}</b>${icon('plus', 18, 2.4)}</button>`).join('');
  const d = new Date(sh.date);
  return `<div class="sheet-bg" data-act="closeSheet"><div class="sheet" role="dialog" aria-modal="true" aria-label="Mahlzeit hinzufügen" data-act="noop">
    <div class="row between"><h2 class="h3">${esc(sh.slot)} · ${esc(WEEKDAYS[(d.getDay() + 6) % 7])}</h2>
      <button type="button" class="icon-btn" data-act="closeSheet" aria-label="Schließen">${icon('x')}</button></div>
    <form class="row" data-submit="addNote">
      <label class="grow" for="plan-note"><span class="sr-only">Notiz</span><input id="plan-note" class="input pill" type="text" placeholder="Notiz, z. B. Reste oder Essen gehen" autocomplete="off"></label>
      <button type="submit" class="btn small" style="height:50px">Notiz</button></form>
    <label class="search" style="height:48px">${icon('search', 18)}<span class="sr-only">Rezept suchen</span><input id="plan-q" type="search" placeholder="Rezept suchen" autocomplete="off" data-input="planQuery" value="${esc(ctx.ui.planQuery || '')}"></label>
    <div id="plan-picks" style="display:flex;flex-direction:column;gap:8px">${rows || '<p class="muted small">Keine Rezepte gefunden.</p>'}</div>
  </div></div>`;
}

export function render(ctx) {
  const ws = weekStart(ctx);
  const sel = selectedDate(ctx);
  const todayKey = isoDate(new Date());
  const addId = ctx.route.query.add;
  const addRecipe = addId ? ctx.recipe(addId) : null;
  const days = WEEKDAYS.map((name, i) => {
    const d = addDays(ws, i);
    const key = isoDate(d);
    const has = mealsOf(ctx, d).length > 0;
    return `<button type="button" class="day ${has ? 'has' : ''} ${key === todayKey ? 'today' : ''}" data-act="day" data-i="${i}" aria-pressed="${ctx.ui.planDay === i}" aria-label="${name}, ${shortDate(d)}${has ? ', geplant' : ''}">
      <span class="small" style="font-weight:700">${name.slice(0, 2)}</span><span class="d">${d.getDate()}</span><span class="dot"></span></button>`;
  }).join('');
  const selKey = isoDate(sel);
  const meals = mealsOf(ctx, sel);
  const slots = SLOTS.map((slot) => {
    const items = meals.map((m, i) => ({ m, i })).filter((x) => x.m.slot === slot);
    return `<section class="slot" aria-label="${slot}">
      <div class="row between"><span class="label muted">${slot}</span></div>
      ${items.map((x) => mealHtml(ctx, x.m, x.i, selKey)).join('')}
      <button type="button" class="btn dashed block small" style="height:46px" data-act="addSlot" data-slot="${slot}">${icon('plus', 16, 2.6)}${addRecipe ? `„${esc(addRecipe.titel)}" hier einplanen` : slot + ' hinzufügen'}</button>
    </section>`;
  }).join('');
  const weekRecipes = WEEKDAYS.flatMap((_, i) => mealsOf(ctx, addDays(ws, i))).filter((m) => m.rezeptId && ctx.recipe(m.rezeptId));

  return `<main class="screen">
    <div class="row">
      <button type="button" class="icon-btn" data-act="week" data-d="-1" aria-label="Vorherige Woche">${icon('back', 18, 2.4)}</button>
      <span style="font-weight:700;font-size:14px;white-space:nowrap" aria-live="polite">${shortDate(ws)} – ${shortDate(addDays(ws, 6))}</span>
      <button type="button" class="icon-btn" data-act="week" data-d="1" aria-label="Nächste Woche">${icon('next', 18, 2.4)}</button>
      <span class="grow"></span>
      <button type="button" class="btn small smart tilt-l" style="height:44px" data-act="autofill">${icon('sparkle', 16)}Füllen</button>
    </div>
    <h1 class="display">Plan</h1>
    ${addRecipe ? `<div class="banner">${icon('calendar', 18)}<span class="grow">Wähle Tag und Mahlzeit für „${esc(addRecipe.titel)}".</span><a class="btn small" href="#/plan">Abbrechen</a></div>` : ''}
    <div class="week" role="group" aria-label="Wochentage">${days}</div>
    <div class="row" style="gap:10px"><h2 class="h2" style="font-size:26px">${WEEKDAYS[ctx.ui.planDay]}, ${shortDate(sel)}</h2>${selKey === todayKey ? '<span class="stk tilt-r" style="font-size:12px;padding:3px 10px">Heute</span>' : ''}</div>
    ${slots}
    ${weekRecipes.length ? `<button type="button" class="tonight" style="text-align:left;width:100%;cursor:pointer" data-act="weekToList">
      ${icon('cart', 22)}<span class="grow" style="display:flex;flex-direction:column"><b style="font-size:15px">Woche auf die Einkaufsliste</b><span class="small">Zutaten aus ${weekRecipes.length} geplanten Rezepten</span></span>${icon('next', 18, 2.4)}</button>` : ''}
    ${sheetHtml(ctx)}
  </main>`;
}

export const actions = {
  noop() {},
  day(ctx, el) { ctx.ui.planDay = Number(el.dataset.i); ctx.rerender(); },
  week(ctx, el) { ctx.ui.planWeek = (ctx.ui.planWeek || 0) + Number(el.dataset.d); ctx.ui.planDay = 0; if (ctx.ui.planWeek === 0) ctx.ui.planDay = undefined; ctx.rerender(); },
  addSlot(ctx, el) {
    const slot = el.dataset.slot;
    const date = selectedDate(ctx);
    const addId = ctx.route.query.add;
    const r = addId ? ctx.recipe(addId) : null;
    if (r) {
      saveMeals(ctx, date, [...mealsOf(ctx, date), { slot, rezeptId: r.id, titel: r.titel, von: ctx.userName() }]);
      ctx.toast(`„${r.titel}" für ${WEEKDAYS[ctx.ui.planDay]} eingeplant`);
      ctx.go('#/plan');
      return;
    }
    ctx.ui.planSheet = { date: date.getTime(), slot };
    ctx.ui.planQuery = '';
    ctx.rerender();
  },
  closeSheet(ctx, el, ev) {
    if (el.classList.contains('sheet-bg') && ev.target !== el) return;
    ctx.ui.planSheet = null; ctx.rerender();
  },
  planQuery(ctx, el) {
    ctx.ui.planQuery = el.value;
    ctx.rerender();
  },
  pickRecipe(ctx, el) {
    const sh = ctx.ui.planSheet;
    const r = ctx.recipe(el.dataset.id);
    const date = new Date(sh.date);
    saveMeals(ctx, date, [...mealsOf(ctx, date), { slot: sh.slot, rezeptId: r.id, titel: r.titel, von: ctx.userName() }]);
    ctx.ui.planSheet = null;
    ctx.rerender();
  },
  addNote(ctx) {
    const input = document.getElementById('plan-note');
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    const sh = ctx.ui.planSheet;
    const date = new Date(sh.date);
    saveMeals(ctx, date, [...mealsOf(ctx, date), { slot: sh.slot, titel: text, von: ctx.userName() }]);
    ctx.ui.planSheet = null;
    ctx.rerender();
  },
  removeMeal(ctx, el) {
    const date = new Date(el.dataset.date + 'T12:00:00');
    const meals = mealsOf(ctx, date).filter((_, i) => i !== Number(el.dataset.i));
    saveMeals(ctx, date, meals);
  },
  autofill(ctx) {
    const ws = weekStart(ctx);
    const recipes = ctx.state.recipes;
    if (!recipes.length) { ctx.toast('Erst ein paar Rezepte eintragen'); return; }
    const pool = [...recipes.filter((r) => r.favorit), ...recipes.filter((r) => !r.favorit)];
    const used = new Set(WEEKDAYS.flatMap((_, i) => mealsOf(ctx, addDays(ws, i))).map((m) => m.rezeptId));
    let k = 0;
    const before = [];
    WEEKDAYS.forEach((_, i) => {
      const d = addDays(ws, i);
      const meals = mealsOf(ctx, d);
      if (meals.some((m) => m.slot === 'Abend')) return;
      let r = pool.find((x) => !used.has(x.id)) || pool[k++ % pool.length];
      used.add(r.id);
      before.push({ d, meals });
      saveMeals(ctx, d, [...meals, { slot: 'Abend', rezeptId: r.id, titel: r.titel, von: ctx.userName() }]);
    });
    if (!before.length) { ctx.toast('Alle Abende sind schon geplant'); return; }
    ctx.toast(`${before.length} Abende gefüllt`, { timeout: 6000, action: { label: 'Rückgängig', fn: () => before.forEach((b) => saveMeals(ctx, b.d, b.meals)) } });
  },
  weekToList(ctx) {
    const ws = weekStart(ctx);
    const items = WEEKDAYS.flatMap((_, i) => mealsOf(ctx, addDays(ws, i)))
      .map((m) => m.rezeptId && ctx.recipe(m.rezeptId)).filter(Boolean)
      .flatMap((r) => recipeItems(r, 1));
    const n = addToList(ctx, items);
    ctx.toast(`${n} Zutaten auf der Liste`, { action: { label: 'Ansehen', fn: () => ctx.go('#/liste') } });
  }
};
