// Rezept anlegen oder bearbeiten. Zutaten und Schritte als einfache Textfelder.
import { esc, uid } from '../lib/format.js';
import { icon } from '../lib/icons.js';
import { COLORS, SYMBOLS, symbolSvg, colorValue } from '../lib/symbols.js';
import { parseZutatenText, parseSchritteText, parseRecipeText, zutatZeile } from '../lib/parse.js';
import { makePhoto, isPhotoData } from '../lib/photo.js';

export const id = 'editor';
export const tabs = false;

function editing(ctx) {
  return ctx.route.name === 'bearbeiten' ? ctx.recipe(ctx.route.params[0]) : null;
}

const FOTO_FEHLER = 'Dieses Foto konnte nicht gelesen werden. Probier ein JPEG oder PNG.';

export function mount(ctx) {
  const r = editing(ctx);
  ctx.ui.editor = {
    forId: r ? r.id : null,
    farbe: r ? r.farbe || 'tomate' : 'tomate', symbol: r ? r.symbol || 'schuessel' : 'schuessel', paste: false, error: '',
    // Foto: vorschau (klein, im Rezept), bild (groß, nur bei neuer Auswahl), geaendert → beim Speichern hochladen.
    foto: r && isPhotoData(r.vorschau) ? { vorschau: r.vorschau, bild: null, geaendert: false } : null,
    fotoBusy: false, fotoError: ''
  };
}

function fotoField(ctx, ed) {
  const demo = ctx.store.mode === 'demo';
  const input = '<input type="file" accept="image/*" id="ed-foto" data-change="foto" data-keep="no" hidden>';
  let body;
  if (ed.fotoBusy) body = '<div class="photo-busy" role="status">Foto wird vorbereitet …</div>';
  else if (ed.foto) {
    body = `<div class="photo-btns"><button type="button" class="btn" data-act="fotoPick">${icon('edit', 18)}Anderes Foto</button><button type="button" class="btn" data-act="fotoRemove">${icon('trash', 18)}Foto entfernen</button></div>
      <span class="hint">Farbe und Bild werden gezeigt, wenn kein Foto da ist.</span>`;
  } else body = `<button type="button" class="btn dashed block" data-act="fotoPick">${icon('plus', 18, 2.6)}Foto hinzufügen</button>`;
  return `<div class="field"><span>Foto</span>${input}${body}
    ${ed.fotoError ? `<div class="error" role="alert">${esc(ed.fotoError)}</div>` : ''}
    ${demo ? '<span class="hint">Im Demo-Modus werden nur kleine Fotos gespeichert.</span>' : ''}</div>`;
}

export function render(ctx) {
  const r = editing(ctx);
  if (ctx.route.name === 'bearbeiten' && !r) {
    return `<main class="screen no-tabs"><a class="icon-btn" href="#/rezepte" aria-label="Zurück">${icon('back')}</a><div class="empty"><div class="h3">Wird geladen …</div></div></main>`;
  }
  // Rezept war beim Öffnen noch nicht geladen: Zustand jetzt aus dem Rezept übernehmen.
  if (!ctx.ui.editor || (r && ctx.ui.editor.forId !== r.id)) mount(ctx);
  const ed = ctx.ui.editor;
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
    ${fotoField(ctx, ed)}
    ${ed.foto ? `<div class="hero photo" style="height:160px;background:${colorValue(ed.farbe)}"><img src="${esc(ed.foto.bild || ed.foto.vorschau)}" alt="Foto von ${esc(v.titel || 'deinem Rezept')}"></div>`
      : `<div class="hero" style="height:160px;background:${colorValue(ed.farbe)}">${symbolSvg(ed.symbol, 110)}</div>`}
    <button type="button" class="btn primary block" data-act="save">${icon('check', 20, 2.6)}Rezept speichern</button>
  </main>`;
}

const val = (id) => (document.getElementById(id) || {}).value || '';

export const actions = {
  color(ctx, el) { ctx.ui.editor.farbe = el.dataset.k; ctx.rerender(); },
  symbol(ctx, el) { ctx.ui.editor.symbol = el.dataset.k; ctx.rerender(); },
  fotoPick() { const f = document.getElementById('ed-foto'); if (f) f.click(); },
  fotoRemove(ctx) { ctx.ui.editor.foto = null; ctx.ui.editor.fotoError = ''; ctx.rerender(); },
  async foto(ctx, el) {
    const file = el.files && el.files[0];
    el.value = '';
    const ed = ctx.ui.editor;
    if (!file || !ed || ed.fotoBusy) return;
    ed.fotoBusy = true;
    ed.fotoError = '';
    ctx.rerender();
    try {
      const p = await makePhoto(file);
      ed.foto = { vorschau: p.vorschau, bild: p.bild, geaendert: true };
    } catch (e) {
      console.warn('Foto', e);
      ed.fotoError = FOTO_FEHLER;
    }
    ed.fotoBusy = false;
    if (ctx.ui.editor === ed) ctx.rerender(); // nur, wenn der Editor noch offen ist
  },
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
    if (ed.fotoBusy) { ctx.toast('Einen Moment, das Foto wird noch vorbereitet'); return; }
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
    if (ed.foto) value.vorschau = ed.foto.vorschau;
    const id = r ? r.id : uid();
    // Großes Foto liegt in rezeptfotos/<id> (nicht im Demo-Modus). Rezept und Foto zusammen speichern.
    const big = ctx.store.mode !== 'demo';
    if (big && ed.foto && ed.foto.geaendert && ed.foto.bild) {
      ctx.save(ctx.store.batch([
        { type: 'set', coll: 'recipes', id, value },
        { type: 'set', coll: 'rezeptfotos', id, value: { bild: ed.foto.bild, geaendertAm: Date.now() } }
      ]));
    } else if (big && !ed.foto && r && r.vorschau) {
      ctx.save(ctx.store.batch([
        { type: 'set', coll: 'recipes', id, value },
        { type: 'remove', coll: 'rezeptfotos', id }
      ]));
    } else ctx.save(ctx.store.set('recipes', id, value));
    ed.error = '';
    ctx.toast(r ? 'Änderungen gespeichert' : 'Rezept gespeichert');
    ctx.go('#/rezept/' + encodeURIComponent(id));
  }
};
