// Einkaufsliste nach Gängen im Supermarkt sortieren.

export const AISLES = [
  { key: 'obst', name: 'Obst & Gemüse', color: 'var(--done)' },
  { key: 'brot', name: 'Brot & Backwaren', color: 'var(--timer)' },
  { key: 'kuehl', name: 'Kühlregal', color: 'var(--sky)' },
  { key: 'fleisch', name: 'Fleisch & Fisch', color: 'var(--note)' },
  { key: 'vorrat', name: 'Vorrat', color: 'var(--fav)' },
  { key: 'tk', name: 'Tiefkühl', color: 'var(--sky)' },
  { key: 'getraenke', name: 'Getränke', color: 'var(--sage)' },
  { key: 'haushalt', name: 'Haushalt', color: 'var(--sage)' },
  { key: 'sonst', name: 'Sonstiges', color: 'var(--card)' }
];

const WORDS = {
  obst: ['apfel', 'äpfel', 'banane', 'zitrone', 'limette', 'tomate', 'zwiebel', 'knoblauch', 'kartoffel', 'salat', 'gurke', 'paprika', 'karotte', 'möhre', 'zucchini', 'aubergine', 'spinat', 'pilz', 'champignon', 'kräuter', 'petersilie', 'basilikum', 'salbei', 'rosmarin', 'thymian', 'schnittlauch', 'frühlingszwiebel', 'lauch', 'ingwer', 'avocado', 'beere', 'orange', 'sellerie', 'brokkoli', 'blumenkohl', 'kohl', 'chili', 'koriander', 'minze', 'birne', 'traube', 'mango', 'ananas', 'kiwi', 'rucola', 'radieschen', 'kürbis', 'fenchel', 'spargel', 'süßkartoffel', 'schalotte', 'dill', 'obst', 'gemüse', 'melone', 'pfirsich'],
  brot: ['brot', 'brötchen', 'toast', 'baguette', 'tortilla', 'wrap', 'croissant', 'fladenbrot', 'ciabatta', 'semmel', 'laugen'],
  kuehl: ['milch', 'butter', 'sahne', 'joghurt', 'quark', 'käse', 'parmesan', 'mozzarella', 'feta', 'ricotta', 'eier', 'ei', 'schmand', 'crème', 'creme', 'frischkäse', 'gnocchi', 'tofu', 'mascarpone', 'buttermilch', 'gouda', 'emmentaler', 'halloumi', 'pesto', 'hefe', 'blätterteig', 'pizzateig', 'saft'],
  fleisch: ['hähnchen', 'huhn', 'hühnchen', 'rind', 'schwein', 'hack', 'speck', 'schinken', 'wurst', 'lachs', 'fisch', 'garnele', 'thunfisch', 'pute', 'steak', 'filet', 'salami', 'chorizo', 'forelle', 'kabeljau', 'bacon', 'lamm'],
  vorrat: ['gemüsebrühe', 'aus der dose', 'dosentomaten', 'mehl', 'zucker', 'salz', 'pfeffer', 'öl', 'essig', 'reis', 'nudel', 'pasta', 'spaghetti', 'penne', 'linsen', 'bohnen', 'kichererbsen', 'dose', 'brühe', 'miso', 'soja', 'honig', 'senf', 'gewürz', 'backpulver', 'natron', 'haferflocken', 'tomatenmark', 'passiert', 'kokosmilch', 'currypaste', 'curry', 'nüsse', 'mandel', 'walnuss', 'paprikapulver', 'zimt', 'vanille', 'schokolade', 'kakao', 'couscous', 'bulgur', 'quinoa', 'müsli', 'marmelade', 'ketchup', 'mayonnaise', 'oliven', 'kapern', 'sesam', 'stärke', 'speisestärke', 'rosinen', 'lasagne', 'polenta', 'grieß'],
  tk: ['tiefkühl', 'tk-', 'tk ', 'erbsen', 'eis', 'pommes', 'spinat tk'],
  getraenke: ['wasser', 'wein', 'bier', 'kaffee', 'tee', 'limo', 'cola', 'sprudel', 'orangensaft', 'apfelsaft'],
  haushalt: ['spülmittel', 'toilettenpapier', 'klopapier', 'taschentücher', 'küchenrolle', 'müllbeutel', 'waschmittel', 'alufolie', 'backpapier', 'frischhaltefolie', 'seife', 'zahnpasta', 'schwamm']
};

export function guessAisle(name, einheit = '') {
  const low = ' ' + String(name || '').toLowerCase() + ' ';
  let best = 'sonst';
  let bestLen = 0;
  for (const key of Object.keys(WORDS)) {
    for (const w of WORDS[key]) {
      const hit = w.length <= 3 ? new RegExp('[\\s-]' + w + '[\\s-]').test(low) : low.includes(w);
      if (hit && w.length > bestLen) { best = key; bestLen = w.length; }
    }
  }
  if (best === 'obst' && /^(dose|dosen|glas|gläser|tube|packung|pck\.?)$/i.test(einheit)) return 'vorrat';
  return best;
}

export function aisleName(key) {
  return (AISLES.find((a) => a.key === key) || AISLES[AISLES.length - 1]).name;
}
