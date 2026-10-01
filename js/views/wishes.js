// Wunschliste: Jeder schlägt Gerichte vor; im Wochenplan lassen sie sich mit einem Tipp einplanen.
import { esc, fromIso, shortDate, WEEKDAYS } from '../lib/format.js';
import { icon } from '../lib/icons.js';

export const id = 'wishes';

function plannedText(iso) {
  const d = fromIso(iso);
  return `Geplant · ${WEEKDAYS[(d.getDay() + 6) % 7]}, ${shortDate(d)}`;
}

function rowHtml(w, planned) {
  const del = `<button type="button" class="x" data-act="remove" data-id="${esc(w.id)}" aria-label="Wunsch „${esc(w.titel)}" löschen">${icon('x', 18, 2.4)}</button>`;
  return `<div class="meal${planned ? ' wish-done' : ''}">
    <span class="sq" style="background:var(--note);color:var(--on-color)">${icon('heart', 22)}</span>
    <span class="grow" style="display:flex;flex-direction:column;gap:4px;min-width:0">
      <b style="font-size:16px;line-height:1.25;hyphens:auto;-webkit-hyphens:auto;overflow-wrap:break-word">${esc(w.titel)}</b>
      ${w.wunschVon ? `<span class="small muted">von ${esc(w.wunschVon)}</span>` : ''}
      ${planned ? `<span class="stk" style="align-self:flex-start;background:var(--done);font-size:12px;padding:3px 10px">${esc(plannedText(w.geplantAm))}</span>`
        : `<a class="btn small" style="align-self:flex-start;height:44px;margin-top:4px" href="#/plan?wish=${encodeURIComponent(w.id)}">${icon('calendar', 16)}Einplanen</a>`}
    </span>
    ${del}
  </div>`;
}

export function render(ctx) {
  const all = ctx.state.wunschliste;
  const open = all.filter((w) => !w.geplantAm);
  const planned = all.filter((w) => w.geplantAm).sort((a, b) => String(a.geplantAm).localeCompare(String(b.geplantAm)));
  if (ctx.ui.wishWho === undefined) ctx.ui.wishWho = ctx.store.mode === 'demo' ? '' : ctx.userName();

  let body;
  if (!ctx.state.loaded.wunschliste) body = '<p class="muted">Wünsche werden geladen …</p>';
  else if (!all.length) {
    body = `<div class="empty"><div class="h3">Noch keine Wünsche</div><p class="muted small" style="margin:0">Was wollt ihr mal wieder essen?</p></div>`;
  } else {
    body = `${open.length ? `<section class="slot" aria-label="Offen"><span class="label muted">Offen · ${open.length}</span>${open.map((w) => rowHtml(w, false)).join('')}</section>` : ''}
      ${planned.length ? `<section class="slot" aria-label="Eingeplant"><span class="label muted">Eingeplant · ${planned.length}</span>${planned.map((w) => rowHtml(w, true)).join('')}</section>` : ''}`;
  }

  return `<main class="screen">
    <div class="row"><button type="button" class="icon-btn" data-act="back" aria-label="Zurück">${icon('back', 20, 2.4)}</button></div>
    <h1 class="display md">Wünsche</h1>
    <form class="card" style="padding:16px;display:flex;flex-direction:column;gap:12px" data-submit="add">
      <label class="field" for="wish-title"><span>Was wünschst du dir?</span>
        <input id="wish-title" class="input" type="text" maxlength="80" autocomplete="off" placeholder="z. B. Omas Kartoffelsuppe"></label>
      <label class="field" for="wish-who"><span>Wunsch von</span>
        <input id="wish-who" class="input" type="text" maxlength="30" autocomplete="off" placeholder="Name" value="${esc(ctx.ui.wishWho)}"></label>
      <button type="submit" class="btn accent block">${icon('plus', 18, 2.6)}Hinzufügen</button>
    </form>
    ${body}
  </main>`;
}

export const actions = {
  back(ctx) { history.length > 1 ? history.back() : ctx.go('#/plan'); },
  add(ctx) {
    const t = document.getElementById('wish-title');
    const w = document.getElementById('wish-who');
    const titel = t.value.trim().slice(0, 80);
    const von = w.value.trim().slice(0, 30);
    if (!titel) { t.focus(); ctx.toast('Bitte schreib, was du dir wünschst'); return; }
    ctx.ui.wishWho = von;
    t.value = '';
    ctx.save(ctx.store.add('wunschliste', { titel, wunschVon: von, erstelltAm: Date.now(), geplantAm: null }));
    ctx.toast(`„${titel}" steht auf der Wunschliste`);
    t.focus();
  },
  remove(ctx, el) {
    const w = ctx.state.wunschliste.find((x) => x.id === el.dataset.id);
    if (!w) return;
    const { id: wid, ...data } = w;
    ctx.save(ctx.store.remove('wunschliste', wid));
    ctx.toast(`„${w.titel}" gelöscht`, { timeout: 6000, action: { label: 'Rückgängig', fn: () => ctx.save(ctx.store.set('wunschliste', wid, data)) } });
  }
};
