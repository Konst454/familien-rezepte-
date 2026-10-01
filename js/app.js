// App-Kern: Daten abonnieren, Seiten zeichnen, Klicks verteilen, Timer ticken lassen.
import { createStore } from './store.js';
import { applyTheme } from './theme.js';
import * as T from './timers.js';
import { esc, formatTime } from './lib/format.js';
import { icon } from './lib/icons.js';
import * as library from './views/library.js';
import * as recipe from './views/recipe.js';
import * as editor from './views/editor.js';
import * as cook from './views/cook.js';
import * as timers from './views/timers.js';
import * as planner from './views/planner.js';
import * as shopping from './views/shopping.js';
import * as account from './views/account.js';
import * as login from './views/login.js';

const ROUTES = {
  '': library, rezepte: library, rezept: recipe, neu: editor, bearbeiten: editor,
  kochen: cook, timer: timers, plan: planner, liste: shopping, konto: account
};

const root = document.getElementById('app');
const toastBox = document.getElementById('toasts');

const state = {
  store: null, user: null, denied: false,
  recipes: [], shopping: [], plan: {},
  loaded: { recipes: false, shopping: false, plan: false },
  ui: {}
};

let current = null;
let unsubs = [];

function parseRoute() {
  const raw = (location.hash || '#/').replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const query = {};
  new URLSearchParams(qs || '').forEach((v, k) => { query[k] = v; });
  return { name: parts[0] || '', params: parts.slice(1), query };
}

export function go(hash) {
  if (location.hash === hash) render(); else location.hash = hash;
}

const ctx = {
  state,
  get store() { return state.store; },
  get ui() { return state.ui; },
  route: parseRoute(),
  go,
  back(fallback) { if (history.length > 1 && state.ui._navCount > 1) history.back(); else go(fallback); },
  rerender: () => render(),
  toast,
  T,
  // Schreiben ohne zu warten: die Anzeige aktualisiert sich sofort aus dem lokalen Zwischenspeicher.
  save(promise) {
    Promise.resolve(promise).catch((e) => {
      console.error(e);
      toast(e && e.code === 'permission-denied' ? 'Keine Berechtigung zum Speichern' : 'Speichern hat nicht geklappt. Bitte nochmal versuchen.');
    });
  },
  recipe(id) { return state.recipes.find((r) => r.id === id); },
  userName() { return state.user ? state.user.name : ''; }
};

// ---- Zeichnen ----
function capture() {
  const values = {};
  root.querySelectorAll('input[id], textarea[id], select[id]').forEach((el) => {
    if (el.type === 'checkbox' || el.type === 'radio') values[el.id] = { checked: el.checked };
    else values[el.id] = { value: el.value };
  });
  const a = document.activeElement;
  const focus = a && a.id && root.contains(a) ? { id: a.id, s: a.selectionStart, e: a.selectionEnd } : null;
  return { values, focus, y: window.scrollY };
}

function restore(snap) {
  Object.entries(snap.values).forEach(([id, v]) => {
    const el = document.getElementById(id);
    if (!el || el.dataset.keep === 'no') return;
    if ('checked' in v) el.checked = v.checked; else el.value = v.value;
  });
  if (snap.focus) {
    const el = document.getElementById(snap.focus.id);
    if (el) { el.focus({ preventScroll: true }); try { el.setSelectionRange(snap.focus.s, snap.focus.e); } catch (e) {} }
  }
  window.scrollTo(0, snap.y);
}

function tabbar(active) {
  const open = state.shopping.filter((i) => !i.erledigt).length;
  const tab = (href, name, ic, label, extra = '') =>
    `<a href="${href}" ${active === name ? 'aria-current="page"' : ''}>${icon(ic)}${label}${extra}</a>`;
  return `<nav class="tabbar" aria-label="Hauptmenü"><div class="pill">
    ${tab('#/rezepte', 'library', 'book', 'Rezepte')}
    ${tab('#/plan', 'planner', 'calendar', 'Plan')}
    ${tab('#/liste', 'shopping', 'cart', 'Liste', open ? `<span class="badge" aria-label="${open} offen">${open}</span>` : '')}
  </div><a class="fab" href="#/neu" aria-label="Rezept hinzufügen">${icon('plus', 26, 2.6)}</a></nav>`;
}

function miniTimer(view) {
  if (view === timers || view === cook) return '';
  const list = T.running();
  if (!list.length) return '';
  const t = list[0];
  const more = list.length > 1 ? ` · +${list.length - 1}` : '';
  return `<a class="mini-timer ${view.tabs === false ? 'no-tabs' : ''} ${t.done ? 'ringing' : ''}" href="#/timer">${icon('clock', 18)}<span style="max-width:170px;overflow:hidden;text-overflow:ellipsis">${esc(t.label)}</span>${t.running || t.done ? '' : '<span>(Pause)</span>'}<span data-tleft="${t.id}">${t.done ? 'fertig' : formatTime(t.left)}</span>${more}</a>`;
}

function render() {
  ctx.route = parseRoute();
  let view = null;
  if (!state.store) view = null;
  else if (state.store.mode === 'firebase' && !state.user) view = login;
  else if (state.denied) view = login;
  else view = ROUTES[ctx.route.name] || library;

  const changed = current !== view || state.ui._lastRoute !== location.hash;
  const snap = changed ? null : capture();
  if (changed) {
    if (current && current.unmount) current.unmount(ctx);
    current = view;
    state.ui._lastRoute = location.hash;
    if (view && view.mount) view.mount(ctx);
  }

  let html;
  if (!view) html = '<div class="loading">Creative Recipes</div>';
  else if (view === login) html = state.denied ? login.renderDenied(ctx) : login.render(ctx);
  else {
    html = view.render(ctx);
    if (view.tabs !== false) html += tabbar(view.id);
    html += miniTimer(view);
  }
  root.innerHTML = html;
  if (snap) restore(snap); else window.scrollTo(0, 0);
  if (view && view.after) view.after(ctx);
}

// ---- Ereignisse (ein Handler für alles) ----
function handler(kind) {
  return (ev) => {
    const el = ev.target.closest(`[data-${kind}]`);
    if (!el || !root.contains(el) || !current || !current.actions) return;
    const name = el.dataset[kind];
    const fn = current.actions[name];
    if (!fn) return;
    if (kind === 'submit') ev.preventDefault();
    fn(ctx, el, ev);
  };
}
root.addEventListener('click', (ev) => { T.unlockAudio(); handler('act')(ev); });
root.addEventListener('input', handler('input'));
root.addEventListener('change', handler('change'));
root.addEventListener('submit', handler('submit'));

window.addEventListener('hashchange', () => { state.ui._navCount = (state.ui._navCount || 0) + 1; render(); });

// ---- Meldungen ----
function toast(msg, opts = {}) {
  const el = document.createElement('div');
  el.className = 'toast' + (opts.alarm ? ' alarm' : '');
  el.setAttribute('role', opts.alarm ? 'alert' : 'status');
  el.innerHTML = `<span>${esc(msg)}</span>`;
  let timer;
  const close = () => { clearTimeout(timer); el.remove(); if (opts.onClose) opts.onClose(); };
  if (opts.action) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = opts.action.label;
    b.addEventListener('click', () => { opts.action.fn(); close(); });
    el.appendChild(b);
  }
  toastBox.appendChild(el);
  if (!opts.sticky) timer = setTimeout(close, opts.timeout || 3200);
  return close;
}

// ---- Timer ----
const ringing = new Map();
T.setOnDone((t) => {
  T.ring();
  let count = 0;
  const again = setInterval(() => { count += 1; if (count > 8) stop(); else T.ring(); }, 4000);
  const stop = () => { clearInterval(again); ringing.delete(t.id); };
  const close = toast(`Timer „${t.label}" ist fertig`, { alarm: true, sticky: true, action: { label: 'Aus', fn: () => { stop(); T.remove(t.id); } }, onClose: stop });
  ringing.set(t.id, close);
});
T.subscribe(() => {
  // Timer, die gelöscht wurden, klingeln nicht weiter.
  const ids = new Set(T.list().map((t) => t.id));
  ringing.forEach((close, id) => { if (!ids.has(id)) close(); });
  render();
});
setInterval(() => {
  T.tick();
  const byId = new Map(T.list().map((t) => [t.id, t]));
  root.querySelectorAll('[data-tleft]').forEach((el) => {
    const t = byId.get(el.dataset.tleft);
    if (t) el.textContent = t.done ? 'fertig' : formatTime(t.left);
  });
  root.querySelectorAll('[data-tring]').forEach((el) => {
    const t = byId.get(el.dataset.tring);
    if (t) el.setAttribute('stroke-dashoffset', String(213.6 * (1 - t.left / Math.max(1, t.total))));
  });
}, 1000);

// ---- Start ----
async function start() {
  applyTheme();
  render();
  try {
    state.store = await createStore();
  } catch (e) {
    console.error(e);
    root.innerHTML = `<div class="screen"><h1 class="h1">Die App konnte nicht starten</h1><p class="muted">Bitte prüfe die Internetverbindung und lade die Seite neu.</p><button class="btn primary" onclick="location.reload()">Neu laden</button></div>`;
    return;
  }
  state.store.onDenied(() => { state.denied = true; render(); });
  state.store.onAuth((user) => {
    state.user = user;
    state.denied = false;
    unsubs.forEach((u) => u());
    unsubs = [];
    if (user) {
      unsubs.push(state.store.subscribe('recipes', (rows) => {
        state.recipes = rows.sort((a, b) => String(a.titel).localeCompare(String(b.titel), 'de'));
        state.loaded.recipes = true; render();
      }));
      unsubs.push(state.store.subscribe('shopping', (rows) => {
        state.shopping = rows.sort((a, b) => (a.erstelltAm || 0) - (b.erstelltAm || 0));
        state.loaded.shopping = true; render();
      }));
      unsubs.push(state.store.subscribe('plan', (rows) => {
        state.plan = {};
        rows.forEach((r) => { state.plan[r.id] = r; });
        state.loaded.plan = true; render();
      }));
    }
    render();
  });
}

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

start();
