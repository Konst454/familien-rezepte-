// Die Sticker-Illustrationen und Kartenfarben für Rezepte.

export const COLORS = [
  { key: 'tomate', name: 'Tomate', value: '#FF5A3C' },
  { key: 'basilikum', name: 'Basilikum', value: '#6CC58A' },
  { key: 'pfirsich', name: 'Pfirsich', value: '#FFC9B5' },
  { key: 'paprika', name: 'Paprika', value: '#FF8A3D' },
  { key: 'butter', name: 'Butter', value: '#FFD66B' },
  { key: 'salbei', name: 'Salbei', value: '#B9D8B0' }
];

export function colorValue(key) {
  return (COLORS.find((c) => c.key === key) || COLORS[0]).value;
}

const S = 'stroke="#1C1A17" stroke-width="2.5" stroke-linejoin="round"';
const Y = '#FFD66B';
const R = '#FF8A3D';

export const SYMBOLS = {
  schuessel: {
    name: 'Schüssel',
    svg: `<path d="M26 6c-3 3 3 5 0 9M38 5c-3 3 3 5 0 9" fill="none" stroke="#1C1A17" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="26" r="6" fill="${Y}" ${S}/><circle cx="35" cy="23" r="6" fill="${Y}" ${S}/><circle cx="44" cy="28" r="6" fill="${Y}" ${S}/><path d="M8 31h48a24 22 0 0 1-48 0z" fill="#FFFFFF" ${S}/>`
  },
  fisch: {
    name: 'Fisch',
    svg: `<path d="M8 32c9-13 27-15 38 0-11 15-29 13-38 0z" fill="${R}" ${S}/><path d="M46 32l10-9v18z" fill="${R}" ${S}/><path d="M26 24c3 5 3 11 0 16M33 24c3 5 3 11 0 16" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/><circle cx="16" cy="30" r="2" fill="#1C1A17"/>`
  },
  pfannkuchen: {
    name: 'Pfannkuchen',
    svg: `<rect x="12" y="40" width="40" height="9" rx="4.5" fill="${Y}" ${S}/><rect x="14" y="31" width="36" height="9" rx="4.5" fill="${Y}" ${S}/><rect x="12" y="22" width="40" height="9" rx="4.5" fill="${Y}" ${S}/><rect x="26" y="14" width="12" height="8" rx="2" fill="#FFFFFF" ${S}/>`
  },
  pfanne: {
    name: 'Pfanne',
    svg: `<path d="M46 30l14-7" stroke="#1C1A17" stroke-width="6" stroke-linecap="round"/><circle cx="28" cy="34" r="19" fill="${R}" ${S}/><circle cx="22" cy="30" r="6" fill="#FFFFFF" ${S}/><circle cx="22" cy="30" r="2.5" fill="${Y}"/><circle cx="34" cy="39" r="6" fill="#FFFFFF" ${S}/><circle cx="34" cy="39" r="2.5" fill="${Y}"/>`
  },
  brot: {
    name: 'Brot',
    svg: `<rect x="8" y="18" width="48" height="30" rx="9" fill="${Y}" ${S}/><circle cx="20" cy="28" r="2" fill="#1C1A17"/><circle cx="32" cy="36" r="2" fill="#1C1A17"/><circle cx="44" cy="28" r="2" fill="#1C1A17"/><circle cx="22" cy="40" r="2" fill="#1C1A17"/><path d="M36 24l6 4M42 38l6-3" stroke="#2E6B4A" stroke-width="2.5" stroke-linecap="round"/>`
  },
  salat: {
    name: 'Salat',
    svg: `<path d="M8 30h48a24 22 0 0 1-48 0z" fill="#6CC58A" ${S}/><path d="M30 28c-2-10 6-18 16-18-1 10-8 17-16 18z" fill="#6CC58A" ${S}/><path d="M30 28l10-12" stroke="#1C1A17" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="25" r="4" fill="#FF5A3C" ${S}/>`
  },
  kuchen: {
    name: 'Kuchen',
    svg: `<path d="M10 30h44v18a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" fill="${Y}" ${S}/><path d="M10 30c4-10 40-10 44 0z" fill="#FFC9B5" ${S}/><path d="M10 40h44" stroke="#1C1A17" stroke-width="2.5"/><circle cx="32" cy="16" r="5" fill="#FF5A3C" ${S}/><path d="M32 11c1-3 3-4 5-4" fill="none" stroke="#2E6B4A" stroke-width="2.5" stroke-linecap="round"/>`
  },
  topf: {
    name: 'Topf',
    svg: `<path d="M24 8c-3 3 3 5 0 9M34 7c-3 3 3 5 0 9M44 8c-3 3 3 5 0 9" fill="none" stroke="#1C1A17" stroke-width="2.5" stroke-linecap="round"/><rect x="12" y="24" width="40" height="26" rx="6" fill="#FF5A3C" ${S}/><rect x="8" y="22" width="48" height="6" rx="3" fill="#FFFFFF" ${S}/><path d="M6 32h6M52 32h6" stroke="#1C1A17" stroke-width="3" stroke-linecap="round"/>`
  }
};

export function symbolSvg(key, size = 64) {
  const s = SYMBOLS[key] || SYMBOLS.schuessel;
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">${s.svg}</svg>`;
}
