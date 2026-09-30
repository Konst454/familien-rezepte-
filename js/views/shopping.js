// Gemeinsame Einkaufsliste: jeder kann hinzufügen und abhaken, live auf allen Geräten.
import { esc, mengeText } from '../lib/format.js';
import { icon } from '../lib/icons.js';
import { AISLES } from '../lib/aisles.js';
import { parseItem } from '../lib/parse.js';
import { addToList } from '../lib/shop.js';

export const id = 'shopping';

function row(item) {
  const q = mengeText(item);
  const meta = [item.rezeptTitel ? 'für ' + item.rezeptTitel : '', item.hinzugefuegtVon ? 'von ' + item.hinzugefuegtVon : ''].filter(Boolean).join(' · ');
  return `<button type="button" class="checkrow" data-act="toggle" data-id="${esc(item.id)}" aria-pressed="${!!item.erledigt}">
    <span class="box">${icon('check', 14, 3.2)}</span>
    <span class="txt"><b style="font-weight:700">${esc(item.name)}</b>${meta ? `<span class="meta">${esc(meta)}</span>` : ''}</span>
    ${q ? `<span class="qty">${esc(q)}</span>` : ''}</button>`;
}

export function render(ctx) {
  const items = ctx.state.shopping;
  const open = items.filter((i) => !i.erledigt);
  const done = items.filter((i) => i.erledigt);
  const groups = AISLES.map((a) => ({ a, rows: open.filter((i) => (i.gang || 'sonst') === a.key) })).filter((g) => g.rows.length);
  const unknown = open.filter((i) => !AISLES.some((a) => a.key === i.gang));
  if (unknown.length) groups.push({ a: AISLES[AISLES.length - 1], rows: unknown });

  const groupHtml = groups.map((g) => `<section class="aisle" aria-label="${esc(g.a.name)}">
      <div class="aisle-head"><span class="stk" style="background:${g.a.color}">${esc(g.a.name)}</span><span class="small muted">${g.rows.length}</span></div>
      <div class="checklist">${g.rows.map(row).join('')}</div></section>`).join('');

  const confirm = ctx.ui.confirmClear;
  return `<main class="screen">
    <div class="row">
      <span class="stk tilt-l">${open.length} offen</span>
      <span class="grow"></span>
      ${ctx.store.mode === 'firebase' ? '<span class="small muted">Live für alle</span>' : ''}
    </div>
    <h1 class="display">Liste</h1>
    <form class="row" data-submit="add">
      <label class="search grow"><span class="sr-only">Artikel hinzufügen</span><input id="shop-add" type="text" placeholder="z. B. 2 Limetten" autocomplete="off" enterkeyhint="done"></label>
      <button type="submit" class="icon-btn" style="width:52px;height:52px;background:var(--ink);color:var(--on-ink)" aria-label="Hinzufügen">${icon('plus', 22, 2.6)}</button>
    </form>
    ${!ctx.state.loaded.shopping ? '<p class="muted">Liste wird geladen …</p>'
      : !open.length ? `<div class="empty"><div class="h3">${done.length ? 'Alles erledigt' : 'Die Liste ist leer'}</div><p class="muted small" style="margin:0;line-height:1.45">Oben etwas eintippen, oder im Rezept auf „Auf die Liste" tippen.</p></div>` : groupHtml}
    ${done.length ? `<section class="aisle" aria-label="Erledigt">
      <div class="aisle-head"><span class="stk" style="background:var(--soft)">Erledigt</span><span class="small muted">${done.length}</span></div>
      <div class="checklist">${done.map(row).join('')}</div>
      <button type="button" class="btn ${confirm ? 'danger confirm' : ''} block" data-act="clearDone">${icon('trash', 18)}${confirm ? 'Wirklich entfernen? Nochmal tippen' : 'Erledigte entfernen'}</button>
    </section>` : ''}
  </main>`;
}

export const actions = {
  add(ctx) {
    const input = document.getElementById('shop-add');
    const it = parseItem(input.value);
    if (!it) { input.focus(); return; }
    input.value = '';
    addToList(ctx, [it]);
    input.focus();
  },
  toggle(ctx, el) {
    const item = ctx.state.shopping.find((i) => i.id === el.dataset.id);
    if (item) ctx.save(ctx.store.update('shopping', item.id, { erledigt: !item.erledigt }));
  },
  clearDone(ctx) {
    if (!ctx.ui.confirmClear) { ctx.ui.confirmClear = true; ctx.rerender(); setTimeout(() => { ctx.ui.confirmClear = false; }, 4000); return; }
    ctx.ui.confirmClear = false;
    const done = ctx.state.shopping.filter((i) => i.erledigt);
    ctx.save(ctx.store.batch(done.map((i) => ({ type: 'remove', coll: 'shopping', id: i.id }))));
    ctx.toast(`${done.length} erledigte Artikel entfernt`);
  }
};
