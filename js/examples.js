// Beispielrezepte: im Demo-Modus vorbelegt, in der Familien-Version per Knopfdruck hinzufügbar.

export const EXAMPLES = [
  {
    titel: 'Gnocchi mit brauner Salbeibutter',
    portionen: 4, vorbereitungMin: 10, kochMin: 20,
    tags: ['Italienisch', 'Schnell', 'Vegetarisch'], farbe: 'tomate', symbol: 'schuessel', favorit: true,
    zutaten: [
      { menge: 500, einheit: 'g', name: 'Kartoffel-Gnocchi' },
      { menge: 60, einheit: 'g', name: 'Butter' },
      { menge: 12, einheit: '', name: 'Salbeiblätter' },
      { menge: 2, einheit: 'Zehen', name: 'Knoblauch, in Scheiben' },
      { menge: 1, einheit: '', name: 'Zitrone (Schale und Saft)' },
      { menge: 40, einheit: 'g', name: 'Parmesan, gerieben' },
      { menge: null, einheit: '', name: 'Salz und Pfeffer' }
    ],
    schritte: [
      { text: 'Einen großen Topf mit Salzwasser zum Kochen bringen.' },
      { text: 'Die Butter in einer weiten Pfanne bei mittlerer Hitze schmelzen, bis sie schäumt und nussig riecht, etwa 4 Minuten.' },
      { text: 'Salbei und Knoblauch dazugeben und 1 Minute knusprig braten. Vom Herd nehmen.' },
      { text: 'Die Gnocchi kochen, bis sie oben schwimmen, 2–3 Minuten. Direkt in die Pfanne heben.' },
      { text: 'Mit Zitronenschale, etwas Saft und der Hälfte vom Parmesan schwenken. Abschmecken.' },
      { text: 'Anrichten und mit dem restlichen Parmesan und dem knusprigen Salbei bestreuen.' }
    ],
    notizen: 'Die Butter ruhig einen Tick dunkler werden lassen, als man denkt.'
  },
  {
    titel: 'Miso-Lachs mit Frühlingszwiebeln',
    portionen: 2, vorbereitungMin: 10, kochMin: 15,
    tags: ['Fisch', 'Schnell'], farbe: 'basilikum', symbol: 'fisch', favorit: false,
    zutaten: [
      { menge: 2, einheit: '', name: 'Lachsfilets' },
      { menge: 2, einheit: 'EL', name: 'helle Misopaste' },
      { menge: 1, einheit: 'EL', name: 'Honig' },
      { menge: 1, einheit: 'EL', name: 'Sojasoße' },
      { menge: 1, einheit: 'Bund', name: 'Frühlingszwiebeln' },
      { menge: 150, einheit: 'g', name: 'Reis' }
    ],
    schritte: [
      { text: 'Reis nach Packungsangabe kochen, etwa 12 Minuten.' },
      { text: 'Miso, Honig und Sojasoße verrühren und die Lachsfilets damit bestreichen.' },
      { text: 'Den Lachs im Ofen bei 220 °C Grillstufe 8 Minuten garen.' },
      { text: 'Frühlingszwiebeln in Ringe schneiden und über den Lachs streuen. Mit Reis servieren.' }
    ],
    notizen: ''
  },
  {
    titel: 'Zitronen-Ricotta-Pfannkuchen',
    portionen: 3, vorbereitungMin: 10, kochMin: 10,
    tags: ['Frühstück', 'Süß'], farbe: 'butter', symbol: 'pfannkuchen', favorit: false,
    zutaten: [
      { menge: 250, einheit: 'g', name: 'Ricotta' },
      { menge: 3, einheit: '', name: 'Eier' },
      { menge: 150, einheit: 'ml', name: 'Milch' },
      { menge: 150, einheit: 'g', name: 'Mehl' },
      { menge: 1, einheit: 'TL', name: 'Backpulver' },
      { menge: 1, einheit: '', name: 'Bio-Zitrone' },
      { menge: 1, einheit: 'EL', name: 'Butter zum Braten' }
    ],
    schritte: [
      { text: 'Ricotta, Eier, Milch und Zitronenschale glatt rühren.' },
      { text: 'Mehl und Backpulver unterheben, nur kurz rühren.' },
      { text: 'Butter in einer Pfanne erhitzen und kleine Pfannkuchen je Seite 2 Minuten goldbraun backen.' }
    ],
    notizen: 'Mit Beeren und Ahornsirup servieren.'
  }
];
