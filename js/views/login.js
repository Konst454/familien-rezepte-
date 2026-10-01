// Anmeldung (Google oder E-Mail) und Hinweis, wenn eine E-Mail noch nicht freigeschaltet ist.
import { esc } from '../lib/format.js';
import { icon, ribbon } from '../lib/icons.js';

export const id = 'login';
export const tabs = false;

const ERRORS = {
  'auth/invalid-credential': 'E-Mail oder Passwort stimmt nicht.',
  'auth/wrong-password': 'Das Passwort stimmt nicht.',
  'auth/user-not-found': 'Zu dieser E-Mail gibt es noch kein Konto. Tippe auf „Konto erstellen".',
  'auth/email-already-in-use': 'Diese E-Mail hat schon ein Konto. Bitte anmelden.',
  'auth/weak-password': 'Das Passwort braucht mindestens 6 Zeichen.',
  'auth/invalid-email': 'Die E-Mail-Adresse sieht nicht richtig aus.',
  'auth/popup-closed-by-user': 'Anmeldung abgebrochen.',
  'auth/network-request-failed': 'Keine Internetverbindung.',
  'auth/too-many-requests': 'Zu viele Versuche. Bitte kurz warten.',
  'auth/unauthorized-domain': 'Diese Adresse ist in Firebase noch nicht freigegeben (Authentication → Einstellungen → Autorisierte Domains).',
  'auth/operation-not-allowed': 'Diese Anmeldeart ist in Firebase noch nicht aktiviert.'
};
const msg = (e) => ERRORS[e && e.code] || 'Anmeldung hat nicht geklappt. Bitte nochmal versuchen.';

export function render(ctx) {
  const l = ctx.ui.login || (ctx.ui.login = { mode: 'login', error: '', busy: false });
  const reg = l.mode === 'register';
  return `<main class="screen no-tabs">
    ${ribbon('M150 170 C 200 50, 270 30, 300 100 S 360 190, 420 50', 480, 220, 'top:40px;left:0')}
    <span class="stk tilt-l" style="align-self:flex-start">Creative Recipes</span>
    <h1 class="display md">Unsere<br>Rezepte</h1>
    <p class="muted" style="margin:0;font-size:16px;line-height:1.5">Rezepte, Wochenplan und Einkaufsliste für die ganze Familie. Bitte einmal anmelden.</p>
    ${l.error ? `<div class="error" role="alert">${esc(l.error)}</div>` : ''}
    ${l.info ? `<div class="banner" role="status">${esc(l.info)}</div>` : ''}
    <button type="button" class="btn primary block" data-act="google" ${l.busy ? 'disabled' : ''}>
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="currentColor" opacity=".8" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="currentColor" opacity=".6" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z"/><path fill="currentColor" opacity=".9" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 5.9 12 5.9z"/></svg>
      Mit Google anmelden</button>
    <div class="row" style="gap:12px"><span class="grow" style="height:2px;background:var(--soft)"></span><span class="small muted">oder mit E-Mail</span><span class="grow" style="height:2px;background:var(--soft)"></span></div>
    <form class="card login-card" data-submit="email">
      ${reg ? '<label class="field" for="l-name"><span>Dein Name</span><input id="l-name" class="input" type="text" autocomplete="name" placeholder="z. B. Anna"></label>' : ''}
      <label class="field" for="l-email"><span>E-Mail</span><input id="l-email" class="input" type="email" autocomplete="email" inputmode="email" required></label>
      <label class="field" for="l-pass"><span>Passwort</span><input id="l-pass" class="input" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" minlength="6" required></label>
      <button type="submit" class="btn accent block" ${l.busy ? 'disabled' : ''}>${reg ? 'Konto erstellen' : 'Anmelden'}</button>
      <div class="row between" style="flex-wrap:wrap">
        <button type="button" class="btn small" style="border:0;background:none;padding:0;text-decoration:underline" data-act="toggleMode">${reg ? 'Ich habe schon ein Konto' : 'Konto erstellen'}</button>
        ${reg ? '' : '<button type="button" class="btn small" style="border:0;background:none;padding:0;text-decoration:underline" data-act="reset">Passwort vergessen?</button>'}
      </div>
    </form>
  </main>`;
}

export function renderDenied(ctx) {
  const u = ctx.state.user || {};
  if (!u.verified) {
    return `<main class="screen no-tabs">
    <span class="stk tilt-l" style="align-self:flex-start;background:var(--timer)">Ein Schritt noch</span>
    <h1 class="h1">Bitte E-Mail bestätigen</h1>
    <p style="margin:0;font-size:16px;line-height:1.5">Wir haben einen Bestätigungslink an diese Adresse geschickt:</p>
    <div class="card" style="padding:16px;font-weight:700;overflow-wrap:anywhere">${esc(u.email || '')}</div>
    <p class="muted" style="margin:0;line-height:1.5">Link in der E-Mail antippen (auch im Spam-Ordner schauen), dann hier auf „Ich habe bestätigt" tippen.</p>
    ${ctx.ui.verifyInfo ? `<div class="banner" role="status">${esc(ctx.ui.verifyInfo)}</div>` : ''}
    <button type="button" class="btn primary block" data-act="refresh">Ich habe bestätigt</button>
    <div class="btns"><button type="button" class="btn" data-act="resend">Link nochmal senden</button><button type="button" class="btn" data-act="logout">${icon('logout', 18)}Abmelden</button></div>
  </main>`;
  }
  return `<main class="screen no-tabs">
    <span class="stk tilt-l" style="align-self:flex-start;background:var(--note)">Noch nicht freigeschaltet</span>
    <h1 class="h1">Fast geschafft, ${esc(u.name || '')}</h1>
    <p style="margin:0;font-size:16px;line-height:1.5">Du bist angemeldet, aber deine E-Mail-Adresse ist noch nicht für die Familien-Rezepte freigegeben:</p>
    <div class="card" style="padding:16px;font-weight:700;overflow-wrap:anywhere">${esc(u.email || '')}</div>
    <p class="muted" style="margin:0;line-height:1.5">Bitte schick diese Adresse an die Person, die die App eingerichtet hat. Sie trägt sie in den Firebase-Regeln ein. Danach hier neu laden.</p>
    <div class="btns"><button type="button" class="btn" data-act="logout">${icon('logout', 18)}Abmelden</button><button type="button" class="btn primary" style="height:52px;font-size:15px" data-act="refresh">Neu laden</button></div>
  </main>`;
}

const val = (id) => ((document.getElementById(id) || {}).value || '').trim();

export const actions = {
  async google(ctx) {
    const l = ctx.ui.login;
    l.error = ''; l.busy = true; ctx.rerender();
    try { await ctx.store.signInGoogle(); } catch (e) { l.error = msg(e); }
    l.busy = false; ctx.rerender();
  },
  toggleMode(ctx) { const l = ctx.ui.login; l.mode = l.mode === 'login' ? 'register' : 'login'; l.error = ''; l.info = ''; ctx.rerender(); },
  async email(ctx) {
    const l = ctx.ui.login;
    const email = val('l-email');
    const pass = (document.getElementById('l-pass') || {}).value || '';
    l.error = ''; l.info = ''; l.busy = true; ctx.rerender();
    try {
      if (l.mode === 'register') await ctx.store.registerEmail(val('l-name'), email, pass);
      else await ctx.store.signInEmail(email, pass);
    } catch (e) { l.error = msg(e); }
    l.busy = false; ctx.rerender();
  },
  async reset(ctx) {
    const l = ctx.ui.login;
    const email = val('l-email');
    if (!email) { l.error = 'Bitte zuerst die E-Mail-Adresse eintragen.'; ctx.rerender(); return; }
    try { await ctx.store.resetPassword(email); l.info = 'Wir haben dir eine E-Mail zum Zurücksetzen geschickt.'; l.error = ''; } catch (e) { l.error = msg(e); }
    ctx.rerender();
  },
  async logout(ctx) { await ctx.store.signOut(); },
  async refresh(ctx) {
    try { await ctx.store.refreshUser(); } catch (e) {}
    location.reload();
  },
  async resend(ctx) {
    try { await ctx.store.sendVerification(); ctx.ui.verifyInfo = 'Neuer Link ist unterwegs.'; } catch (e) { ctx.ui.verifyInfo = msg(e); }
    ctx.rerender();
  }
};
