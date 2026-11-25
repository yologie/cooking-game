// Sizzle & Serve — configuration: canvas, palette, ingredients, recipes, scoring.
// Every tunable number for the game lives here so the other files stay logic-only.

const CFG = {
  canvasWidth: 1280,
  canvasHeight: 720,

  // A shift lasts three minutes; three failed orders end it early.
  shiftSeconds: 180,
  maxFails: 3,

  // Orders: how long a customer waits, and how fast new ones arrive.
  orderWaitSeconds: 48,
  orderWaitLateSeconds: 32,
  spawnEverySeconds: 12,
  spawnEveryLateSeconds: 7,
  maxOrders: 4,

  // A raw patty cooks in 6s; leave it 6s more and it burns.
  pattyCookSeconds: 6,
  pattyBurnSeconds: 6,

  // Scoring: dish price + a tip worth up to half the price for fast service.
  tipMaxFraction: 0.5,
  comboStep: 0.1,
  comboCap: 2.0,
  wrongServePenalty: 5,

  // Floating feedback text ("+$12 TIP!") lingers this long, in seconds.
  toastSeconds: 1.6,
};

// Ingredient catalogue. Each entry carries its key, price, colour and the
// little drawing recipe render.js uses (shape + colours), so adding a new
// ingredient is one object here and one case in the icon painter.
const INGREDIENTS = [
  { id: 'bun',     key: '1', name: 'Bun',     price: 2, color: '#e8a94e', dark: '#b97e2e' },
  { id: 'patty',   key: '2', name: 'Patty',   price: 5, color: '#8a5a33', dark: '#5d3a1e' },
  { id: 'lettuce', key: '3', name: 'Lettuce', price: 1, color: '#6fbf4a', dark: '#4a8f2f' },
  { id: 'tomato',  key: '4', name: 'Tomato',  price: 1, color: '#e0483e', dark: '#a92c25' },
  { id: 'cheese',  key: '5', name: 'Cheese',  price: 2, color: '#f7c948', dark: '#d9a41f' },
  { id: 'fries',   key: '6', name: 'Fries',   price: 3, color: '#f2d06b', dark: '#c0392b' },
  { id: 'drink',   key: '7', name: 'Drink',   price: 2, color: '#7ec8e3', dark: '#3d7ea6' },
];

const ING_BY_ID = {};
for (const ing of INGREDIENTS) ING_BY_ID[ing.id] = ing;

// Warm kitchen palette used across the whole render.
const PALETTE = {
  wallTop: '#f7e8c9',
  wallBottom: '#f2d8a7',
  floor: '#c98f5f',
  board: '#3d2b1f',
  boardEdge: '#6b4a2f',
  counter: '#a06a3b',
  counterTop: '#c98f5f',
  grill: '#4a4a52',
  grillHot: '#6b3a2a',
  plate: '#fdfdf6',
  plateEdge: '#d8d2c0',
  ink: '#2e2118',
  muted: '#7a6a58',
  good: '#3f9e4d',
  warn: '#e8a13a',
  bad: '#d23c2e',
  gold: '#f7c948',
  cream: '#fff8e7',
};

// Customer names shown on the order board (flavour only).
const CUSTOMERS = [
  'Maya', 'Riko', 'Sari', 'Dimas', 'Luna', 'Bimo',
  'Nadia', 'Fajar', 'Kiki', 'Arga', 'Tania', 'Yoga',
];

// Layout rectangles, in canvas pixels. The render code reads these so the
// screenshot layout and the click hit-boxes always agree.
const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 64 },
  board: { x: 24, y: 76, w: 1232, h: 148 },
  grill: { x: 24, y: 240, w: 400, h: 200 },
  plate: { x: 448, y: 240, w: 384, h: 200 },
  serve: { x: 856, y: 240, w: 400, h: 200 },
  counter: { x: 24, y: 456, w: 1232, h: 240 },
};
