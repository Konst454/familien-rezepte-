// Fotos zu Rezepten: im Browser verkleinern und als JPEG-Text (Base64) speichern.
// Kein Firebase Storage nötig (Gratistarif): kleine Vorschau im Rezept, großes Bild in „rezeptfotos".
const PREFIX = 'data:image/jpeg;base64,';
const MAX_CHARS = 400000;
const MIN_QUALITY = 0.4;

export const VORSCHAU = { maxSide: 320, quality: 0.7, maxBytes: 20 * 1024 };
export const BILD = { maxSide: 900, quality: 0.7, maxBytes: 300 * 1024 };

// Nur echte, nicht zu große JPEG-Daten anzeigen (gilt für alles, was aus der Datenbank kommt).
export function isPhotoData(s) {
  return typeof s === 'string' && s.length <= MAX_CHARS && s.startsWith(PREFIX)
    && /^[A-Za-z0-9+/]+={0,2}$/.test(s.slice(PREFIX.length));
}

// Datei einlesen. createImageBitmap dreht Handyfotos nach EXIF richtig; sonst <img> (dreht moderne Browser auch).
async function loadImage(file) {
  if (window.createImageBitmap) {
    try {
      const b = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { src: b, w: b.width, h: b.height, close: () => { if (b.close) b.close(); } };
    } catch (e) { /* weiter mit <img> */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Bild nicht lesbar'));
      img.src = url;
    });
    return { src: img, w: img.naturalWidth, h: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

// Erst die Qualität senken (bis 0,4), dann die Kantenlänge, bis die Größe passt.
function encode(img, { maxSide, quality, maxBytes }) {
  if (!img.w || !img.h) throw new Error('Bild ist leer');
  const canvas = document.createElement('canvas');
  try {
    let side = maxSide;
    for (let round = 0; round < 10 && side >= 40; round++) {
      const s = Math.min(1, side / Math.max(img.w, img.h));
      const w = Math.max(1, Math.round(img.w * s));
      const h = Math.max(1, Math.round(img.h * s));
      canvas.width = w;
      canvas.height = h;
      const c = canvas.getContext('2d');
      c.fillStyle = '#FFFFFF'; // durchsichtige PNGs bekommen weißen Grund
      c.fillRect(0, 0, w, h);
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';
      c.drawImage(img.src, 0, 0, w, h);
      for (let q = quality; q >= MIN_QUALITY - 0.001; q -= 0.1) {
        const data = canvas.toDataURL('image/jpeg', Math.round(q * 100) / 100);
        if (!data.startsWith(PREFIX)) throw new Error('JPEG wird nicht unterstützt');
        if (data.length <= maxBytes) return data;
      }
      side = Math.round(Math.min(side, Math.max(w, h)) * 0.8);
    }
    throw new Error('Bild lässt sich nicht klein genug machen');
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

// Eine Bilddatei verkleinern → JPEG als data:-Text.
export async function shrinkImage(file, opts = BILD) {
  const img = await loadImage(file);
  try {
    return encode(img, { ...BILD, ...opts });
  } finally {
    img.close();
  }
}

// Beide Größen aus einer Datei (nur einmal einlesen).
export async function makePhoto(file) {
  const img = await loadImage(file);
  try {
    return { vorschau: encode(img, VORSCHAU), bild: encode(img, BILD) };
  } finally {
    img.close();
  }
}
