// Darstellung: Automatisch (System), Hell oder Dunkel („Night Kitchen"). Pro Gerät gemerkt.
// Das Frühskript in index.html setzt den Modus schon vor dem ersten Zeichnen (kein Aufblitzen).
const KEY = 'cr-theme';
const BAR = { light: '#FFF6EC', dark: '#111214' };
let media = null;

export function getTheme() {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch (e) {
    return 'auto';
  }
}

function systemDark() {
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export function effectiveTheme() {
  const t = getTheme();
  return t === 'auto' ? (systemDark() ? 'dark' : 'light') : t;
}

export function applyTheme() {
  const t = getTheme();
  const root = document.documentElement;
  if (t === 'auto') delete root.dataset.theme;
  else root.dataset.theme = t;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', BAR[effectiveTheme()]);
  if (!media && window.matchMedia) {
    media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (getTheme() === 'auto') applyTheme(); };
    if (media.addEventListener) media.addEventListener('change', onChange);
    else if (media.addListener) media.addListener(onChange);
  }
}

export function setTheme(mode) {
  try {
    if (mode === 'light' || mode === 'dark') localStorage.setItem(KEY, mode);
    else localStorage.removeItem(KEY);
  } catch (e) {}
  applyTheme();
}
