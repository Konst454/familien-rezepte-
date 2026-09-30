// Konto, Abmelden und Anleitung „Zum Home-Bildschirm".
import { esc } from '../lib/format.js';
import { icon } from '../lib/icons.js';

export const id = 'account';

export function render(ctx) {
  const u = ctx.state.user || {};
  const demo = ctx.store.mode === 'demo';
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  return `<main class="screen">
    <div class="row"><a class="icon-btn" href="#/rezepte" aria-label="Zurück">${icon('back', 20, 2.4)}</a></div>
    <h1 class="display md">Konto</h1>
    <div class="card" style="padding:18px;display:flex;flex-direction:column;gap:6px">
      <span class="label muted">${demo ? 'Demo-Modus' : 'Angemeldet als'}</span>
      <b style="font-size:18px">${esc(demo ? 'Nur auf diesem Gerät' : u.name)}</b>
      ${!demo && u.email ? `<span class="muted">${esc(u.email)}</span>` : ''}
      ${demo ? '<p class="hint" style="margin:6px 0 0">Die Daten liegen nur in diesem Browser. Sobald die Firebase-Konfiguration eingetragen ist, teilt die ganze Familie Rezepte, Plan und Einkaufsliste.</p>' : ''}
    </div>
    ${standalone ? '' : `<div class="note-card" style="transform:none"><h2 class="h3">Als App auf den Home-Bildschirm</h2>
      <p><b>iPhone/iPad (Safari):</b> unten auf Teilen ${icon('share', 16)} tippen, dann „Zum Home-Bildschirm".<br><b>Android (Chrome):</b> Menü ⋮ oben rechts, dann „App installieren" oder „Zum Startbildschirm hinzufügen".</p></div>`}
    <div class="btns" style="flex-direction:column">
      <a class="btn block" href="#/timer">${icon('clock', 18)}Timer</a>
      ${demo ? '<button type="button" class="btn block" data-act="reset">Demo zurücksetzen</button>' : `<button type="button" class="btn block" data-act="logout">${icon('logout', 18)}Abmelden</button>`}
    </div>
    <p class="hint" style="margin:0">Creative Recipes · Familien-Version 1.0</p>
  </main>`;
}

export const actions = {
  async logout(ctx) { await ctx.store.signOut(); ctx.go('#/rezepte'); },
  reset(ctx) {
    if (!ctx.ui.confirmReset) { ctx.ui.confirmReset = true; ctx.toast('Nochmal tippen, um alle Demo-Daten zu löschen'); setTimeout(() => { ctx.ui.confirmReset = false; }, 4000); return; }
    ctx.store.resetDemo();
  }
};
