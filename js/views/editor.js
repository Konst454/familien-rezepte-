// Rezept anlegen oder bearbeiten. Zutaten und Schritte als einfache Textfelder.
import { esc, uid } from '../lib/format.js';
import { icon } from '../lib/icons.js';
import { COLORS, SYMBOLS, symbolSvg, colorValue } from '../lib/symbols.js';
import { parseZutatenText, parseSchritteText, parseRecipeText, zutatZeile } from '../lib/parse.js';

export const id = 'editor';
export const tabs = false;

function editing(ctx) {
  return ctx.route.name === 'bearbeiten' ? ctx.recipe(ctx.route.params[0]) : null;
}

export function mount(ctx) {
  const r = editing(ctx);
  ctx.ui.editor = { farbe: r ? r.farbe || 'tomate' : 'tomate', symbol: r ? r.symbol || 'schuessel' : 'schuessel', paste: false, error: '' };
}

export function render(ctx) {
  const r = editing(ctx);
  if (ctx.route.name === 'bearbeiten' && !r) {
    return `<main class="screen no-tabs"><a class="icon-btn" href="#/rezepte" aria-label="Zurück">${icon('back')}</a><div class="empty"><div class="h3">Wird geladen …</div></div></main>`;
  }
  const ed = ctx.ui.editor || (mount(ctx), ctx.ui.editor);
  const v = r || { titel: '', portionen: 4, vorbereitungMin: '', kochMin: '', tags: [], zutaten: [], schritte: [], notizen: '' };
  const colors = COLORS.map((c) => `<button type="button" class="swatch" style="background:${c.value}" data-act="color" data-k="${c.key}" aria-pressed="${ed.farbe === c.key}" aria-label="Farbe ${c.name}"></button>`).join('');
  const symbols = Object.entries(SYMBOLS).map(([k, s]) => `<button type="button" class="symbol" data-act="symbol" data-k="${k}" aria-pressed="${ed.symbol === k}" aria-label="${s.name}">${symbolSvg(k, 44)}</button>`).join('');

  return `<main class="screen no-tabs">
    <div class="row">
      <a class="icon-btn" href="${r ? '#/rezept/' + encodeURIComponent(r.id) : '#/rezepte'}" aria-label="Abbrechen">${icon('x', 20, 2.4)}</a>
      <span class="grow"></span>
      <button type="button" class="btn small primary" style="height:44px" data-act="save">${icon('check', 18, 2.6)}Speichern</button>
    </div>
    <h1 class="display md">${r ? 'Rezept<br>bearbeiten' : 'Neues<br>Rezept'}</h1>
    ${ed.error ? `<div class="error" role="alert">${esc(ed.error)}</div>` : ''}

    ${ed.paste ? `<div class="paste-box">
        <label class="field" for="ed-paste"><span>Rezepttext einfügen</span></label>
        <p class="hint" style="margin:0">Kopiere ein Rezept von einer Webseite, aus einer Nachricht oder Notiz und füge es hier ein. Titel, Portionen, Zutaten und Schritte werden erkannt.</p>
        <textarea id="ed-paste" class="textarea" placeholder="Tomatensuppe&#10;Für 4 Personen&#10;&#10;Zutaten&#10;1 Zwiebel&#10;800 g Tomaten&#10;…&#10;&#10;Zubereitung&#10;1. Zwiebel hacken …"></textarea>
        <div class="btns"><button type="button" class="btn" data-act="pasteClose">Abbrechen</button><button type="button" class="btn primary" style="height:52px;font-size:15px" data-act="pasteApply">Übernehmen</button></div>
      </div>` : `<button type="button" class="btn dashed block" data-act="pasteOpen">${icon('text', 18)}Rezepttext einfügen und erkennen</button>`}

    <label class="field" for="ed-titel"><span>Titel</span>
      <input id="ed-titel" class="input" type="text" autocomplete="off" placeholder="z. B. Omas Linsensuppe" value="${esc(v.titel)}"></label>
    <div class="stats">
      <label class="field" for="ed-portionen"><span>Portionen</span><input id="ed-portionen" class="input" type="number" inputmode="numeric" min="1" max="40" value="${esc(v.portionen || '')}"></label>
      <label class="field" for="ed-vorb"><span>Vorb. (Min.)</span><input id="ed-vorb" class="input" type="number" inputmode="numeric" min="0" value="${esc(v.vorbereitungMin || '')}"></label>
      <label class="field" for="ed-koch"><span>Kochen (Min.)</span><input id="ed-koch" class="input" type="number" inputmode="numeric" min="0" value="${esc(v.kochMin || '')}"></label>
    </div>
    <label class="field" for="ed-zutaten"><span>Zutaten</span>
      <textarea id="ed-zutaten" class="textarea" placeholder="Eine Zutat pro Zeile, z. B.&#10;200 g Mehl&#10;2 Eier&#10;1 Prise Salz">${esc((v.zutaten || []).map(zutatZeile).join('\n'))}</textarea>
      <span class="hint">Menge und Einheit vorne: so kann die App Portionen umrechnen und die Einkaufsliste zusammenfassen.</span></label>
    <label class="field" for="ed-schritte"><span>Zubereitung</span>
      <textarea id="ed-schritte" class="textarea" style="min-height:200px" placeholder="Ein Schritt pro Absatz, z. B.&#10;Zwiebeln 5 Minuten anbraten.&#10;&#10;Tomaten dazugeben und 20 Minuten köcheln.">${esc((v.schritte || []).map((s) => s.text).join('\n\n'))}</textarea>
      <span class="hint">Zeiten wie „20 Minuten" werden im Kochmodus automatisch zu Timern.</span></label>
    <label class="field" for="ed-tags"><span>Stichworte</span>
      <input id="ed-tags" class="input" type="text" autocomplete="off" placeholder="z. B. Schnell, Vegetarisch, Kinder" value="${esc((v.tags || []).join(', '))}"></label>
    <label class="field" for="ed-notizen"><span>Notizen</span>
      <textarea id="ed-notizen" class="textarea" style="min-height:100px" placeholder="Tipps, Varianten, wer es am liebsten mag …">${esc(v.notizen || '')}</textarea></label>
    <div class="field"><span>Farbe</span><div class="swatches" role="group" aria-label="Farbe">${colors}</div></div>
    <div class="field"><span>Bild</span><div class="symbols" role="group" aria-label="Bild">${symbols}</div></div>
    <div class="hero" style="height:160px;background:${colorValue(ed.farbe)}">${symbolSvg(ed.symbol, 110)}</div>
    <button type="button" class="btn primary block" data-act="save">${icon('check', 20, 2.6)}Rezept speichern</button>
  </main>`;
}

const val = (id) => (document.getElementById(id) || {}).value || '';

export const actions = {
  color(ctx, el) { ctx.ui.editor.farbe = el.dataset.k; ctx.rerender(); },
  symbol(ctx, el) { ctx.ui.editor.symbol = el.dataset.k; ctx.rerender(); },
  pasteOpen(ctx) { ctx.ui.editor.paste = true; ctx.rerender(); const t = document.getElementById('ed-paste'); if (t) t.focus(); },
  pasteClose(ctx) { ctx.ui.editor.paste = false; ctx.rerender(); },
  pasteApply(ctx) {
    const p = parseRecipeText(val('ed-paste'));
    const set = (id, v) => { const el = document.getElementById(id); if (el && v !== undefined && v !== null && v !== '') el.value = v; };
    set('ed-titel', p.titel);
    set('ed-portionen', p.portionen);
    if (p.zutaten.length) set('ed-zutaten', p.zutaten.map(zutatZeile).join('\n'));
    if (p.schritte.length) set('ed-schritte', p.schritte.map((s) => s.text).join('\n\n'));
    ctx.ui.editor.paste = false;
    ctx.rerender();
    ctx.toast(`${p.zutaten.length} Zutaten und ${p.schritte.length} Schritte erkannt. Bitte kurz prüfen.`, { timeout: 5000 });
  },
  save(ctx) {
    const ed = ctx.ui.editor;
    const titel = val('ed-titel').trim();
    if (!titel) {
      ed.error = 'Bitte gib dem Rezept einen Titel.';
      ctx.rerender();
      const t = document.getElementById('ed-titel'); if (t) t.focus();
      return;
    }
    const r = editing(ctx);
    const value = {
      titel,
      portionen: Math.max(1, Math.round(Number(val('ed-portionen')) || 1)),
      vorbereitungMin: Math.max(0, Math.round(Number(val('ed-vorb')) || 0)),
      kochMin: Math.max(0, Math.round(Number(val('ed-koch')) || 0)),
      tags: val('ed-tags').split(',').map((t) => t.trim()).filter(Boolean),
      zutaten: parseZutatenText(val('ed-zutaten')),
      schritte: parseSchritteText(val('ed-schritte')),
      notizen: val('ed-notizen').trim(),
      farbe: ed.farbe,
      symbol: ed.symbol,
      favorit: r ? !!r.favorit : false,
      erstelltVon: r ? r.erstelltVon || ctx.userName() : ctx.userName(),
      geaendertAm: Date.now()
    };
    const id = r ? r.id : uid();
    ctx.save(ctx.store.set('recipes', id, value));
    ed.error = '';
    ctx.toast(r ? 'Änderungen gespeichert' : 'Rezept gespeichert');
    ctx.go('#/rezept/' + encodeURIComponent(id));
  }
};
