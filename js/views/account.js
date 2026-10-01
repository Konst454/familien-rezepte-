// Konto, Abmelden und Anleitung „Zum Home-Bildschirm".
import { esc } from '../lib/format.js';
import { icon } from '../lib/icons.js';
import { getTheme, setTheme } from '../theme.js';
import { getMotion, setMotion } from '../lib/motion.js';
import { familyMembers, saveFamily, MAX_MEMBERS, MAX_NAME } from '../lib/family.js';

export const id = 'account';

function familyHtml(ctx, demo) {
  const members = familyMembers(ctx);
  const me = demo ? '' : ctx.userName();
  const tags = members.map((n, k) => `<span class="tag fam-tag">${esc(n)}<button type="button" class="fam-x" data-act="famRemove" data-k="${k}" aria-label="${esc(n)} entfernen">${icon('x', 16, 2.6)}</button></span>`).join('');
  return `<section class="card" style="padding:18px;display:flex;flex-direction:column;gap:12px" aria-labelledby="fam-h">
    <h2 class="h3" id="fam-h">Familie</h2>
    ${members.length ? `<div class="tags">${tags}</div>` : `<p class="hint" style="margin:0">Trag hier alle ein, die kochen – auch Kinder ohne eigenes Konto.</p>
      ${me ? `<button type="button" class="btn small" style="align-self:flex-start;height:44px" data-act="famMe">${icon('user', 16)}Mich hinzufügen (${esc(me)})</button>` : ''}`}
    ${members.length < MAX_MEMBERS ? `<form class="row" data-submit="famAdd">
      <label class="grow" for="fam-name"><span class="sr-only">Name hinzufügen</span><input id="fam-name" class="input pill" type="text" maxlength="${MAX_NAME}" autocomplete="off" placeholder="Name hinzufügen"></label>
      <button type="submit" class="icon-btn" style="width:50px;height:50px;background:var(--ink);color:var(--on-ink)" aria-label="Name hinzufügen">${icon('plus', 22, 2.6)}</button>
    </form>` : '<p class="hint" style="margin:0">Höchstens 12 Namen.</p>'}
    <p class="hint" style="margin:0">Gilt für alle Geräte. Im Wochenplan wählst du bei jedem Gericht, wer kocht.</p>
  </section>`;
}

function addMember(ctx, raw) {
  const name = String(raw || '').trim().replace(/\s+/g, ' ').slice(0, MAX_NAME);
  if (!name) return false;
  const members = familyMembers(ctx);
  if (members.some((n) => n.toLowerCase() === name.toLowerCase())) { ctx.toast(`„${name}" steht schon in der Liste`); return false; }
  if (members.length >= MAX_MEMBERS) { ctx.toast('Höchstens 12 Namen'); return false; }
  saveFamily(ctx, [...members, name]);
  return true;
}

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
    ${familyHtml(ctx, demo)}
    <section class="card" style="padding:18px;display:flex;flex-direction:column;gap:10px" aria-labelledby="theme-h">
      <h2 class="h3" id="theme-h">Darstellung</h2>
      <div class="seg" role="group" aria-label="Darstellung" style="align-self:flex-start">
        ${[['auto', 'Automatisch'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([m, l]) => `<button type="button" style="height:44px;padding:0 16px" data-act="theme" data-mode="${m}" aria-pressed="${getTheme() === m}">${l}</button>`).join('')}
      </div>
      <p class="hint" style="margin:0">Gilt nur für dieses Gerät. „Automatisch" folgt der Einstellung des Handys.</p>
    </section>
    <section class="card" style="padding:18px;display:flex;flex-direction:column;gap:10px" aria-labelledby="motion-h">
      <h2 class="h3" id="motion-h">Bewegung</h2>
      <div class="seg" role="group" aria-label="Bewegung" style="align-self:flex-start">
        ${[['normal', 'Normal'], ['slow', 'Zeitlupe']].map(([m, l]) => `<button type="button" style="height:44px;padding:0 16px" data-act="motion" data-mode="${m}" aria-pressed="${getMotion() === m}">${l}</button>`).join('')}
      </div>
      <p class="hint" style="margin:0">Zeitlupe macht Animationen 4× langsamer, damit man Details sieht. Gilt nur für dieses Gerät.</p>
    </section>
    ${standalone ? '' : `<div class="note-card" style="transform:none"><h2 class="h3">Als App auf den Home-Bildschirm</h2>
      <p><b>iPhone/iPad (Safari):</b> unten auf Teilen ${icon('share', 16)} tippen, dann „Zum Home-Bildschirm".<br><b>Android (Chrome):</b> Menü ⋮ oben rechts, dann „App installieren" oder „Zum Startbildschirm hinzufügen".</p></div>`}
    <div style="display:flex;flex-direction:column;gap:10px">
      <a class="btn block" href="#/wuensche">${icon('heart', 18)}Wunschliste</a>
      <a class="btn block" href="#/timer">${icon('clock', 18)}Timer</a>
      ${demo ? '<button type="button" class="btn block" data-act="reset">Demo zurücksetzen</button>' : `<button type="button" class="btn block" data-act="logout">${icon('logout', 18)}Abmelden</button>`}
    </div>
    <p class="hint" style="margin:0" data-act="versionTap">Creative Recipes · Familien-Version 1.0</p>
  </main>`;
}

export const actions = {
  famAdd(ctx) {
    const input = document.getElementById('fam-name');
    const value = input.value;
    if (!value.trim()) { input.focus(); return; }
    // Erst leeren, dann speichern: das Speichern zeichnet die Seite neu.
    input.value = '';
    if (!addMember(ctx, value)) { const again = document.getElementById('fam-name'); if (again) again.value = value; }
    const field = document.getElementById('fam-name');
    if (field) field.focus();
  },
  famMe(ctx) { addMember(ctx, ctx.userName()); },
  famRemove(ctx, el) {
    const members = familyMembers(ctx);
    const k = Number(el.dataset.k);
    const name = members[k];
    if (name === undefined) return;
    saveFamily(ctx, members.filter((_, i) => i !== k));
    ctx.toast(`${name} entfernt`, { action: { label: 'Rückgängig', fn: () => saveFamily(ctx, familyMembers(ctx).some((n) => n === name) ? familyMembers(ctx) : [...familyMembers(ctx), name]) } });
  },
  theme(ctx, el) { setTheme(el.dataset.mode); },
  motion(ctx, el) { setMotion(el.dataset.mode); ctx.rerender(); },
  // Versteckt: 5× schnell auf die Versionszeile tippen öffnet das Animations-Labor.
  versionTap(ctx) {
    const now = Date.now();
    const v = ctx.ui.versionTaps && now - ctx.ui.versionTaps.at < 2500 ? ctx.ui.versionTaps : { n: 0 };
    ctx.ui.versionTaps = { n: v.n + 1, at: now };
    if (ctx.ui.versionTaps.n >= 5) { ctx.ui.versionTaps = null; ctx.go('#/labor'); }
  },
  async logout(ctx) { await ctx.store.signOut(); ctx.go('#/rezepte'); },
  reset(ctx) {
    if (!ctx.ui.confirmReset) { ctx.ui.confirmReset = true; ctx.toast('Nochmal tippen, um alle Demo-Daten zu löschen'); setTimeout(() => { ctx.ui.confirmReset = false; }, 4000); return; }
    ctx.store.resetDemo();
  }
};
