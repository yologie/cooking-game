// Sizzle & Serve — mouse and keyboard input.
// Click targets are computed from the same LAYOUT the renderer uses, so a
// button is exactly where it looks. Number keys mirror the counter bins.

const Input = {
  mouse: { x: -1, y: -1 },

  // One counter bin per ingredient, spread across the counter region.
  // The region's first line is the section header, so bins start below it.
  binRect(i) {
    const c = LAYOUT.counter;
    const gap = 12;
    const w = (c.w - gap * (INGREDIENTS.length - 1)) / INGREDIENTS.length;
    return { x: c.x + i * (w + gap), y: c.y + 34, w, h: 190 };
  },

  grillSlotRect(i) {
    const g = LAYOUT.grill;
    const w = (g.w - 48) / 2;
    return { x: g.x + 16 + i * (w + 16), y: g.y + 56, w, h: 120 };
  },

  orderCardRect(i) {
    const b = LAYOUT.board;
    const gap = 12;
    const w = (b.w - gap * (CFG.maxOrders - 1)) / CFG.maxOrders;
    return { x: b.x + i * (w + gap), y: b.y + 8, w, h: b.h - 16 };
  },

  serveButtonRect() {
    const s = LAYOUT.serve;
    return { x: s.x + 24, y: s.y + 146, w: s.w - 48, h: 48 };
  },

  trashButtonRect() {
    const s = LAYOUT.serve;
    return { x: s.x + 24, y: s.y + 92, w: s.w - 48, h: 44 };
  },

  pauseButtonRect() {
    return { x: 1176, y: 12, w: 44, h: 40 };
  },

  muteButtonRect() {
    return { x: 1112, y: 12, w: 56, h: 40 };
  },

  _inside(rect, x, y) {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  },

  // Is the mouse over anything clickable right now? The main loop uses
  // this to show a pointer cursor over buttons and bins.
  isOverButton() {
    if (Game.screen !== 'play') return true;
    const { x, y } = this.mouse;
    if (this._inside(this.pauseButtonRect(), x, y)) return true;
    if (this._inside(this.muteButtonRect(), x, y)) return true;
    if (this._inside(this.serveButtonRect(), x, y)) return true;
    if (this._inside(this.trashButtonRect(), x, y)) return true;
    for (let i = 0; i < Game.orders.length; i += 1) {
      if (this._inside(this.orderCardRect(i), x, y)) return true;
    }
    for (let i = 0; i < Stations.grill.length; i += 1) {
      if (this._inside(this.grillSlotRect(i), x, y)) return true;
    }
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      if (this._inside(this.binRect(i), x, y)) return true;
    }
    return false;
  },

  attach(canvas) {
    canvas.addEventListener('mousemove', (ev) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (ev.clientX - r.left) * (CFG.canvasWidth / r.width);
      this.mouse.y = (ev.clientY - r.top) * (CFG.canvasHeight / r.height);
    });
    canvas.addEventListener('click', (ev) => {
      const r = canvas.getBoundingClientRect();
      const x = (ev.clientX - r.left) * (CFG.canvasWidth / r.width);
      const y = (ev.clientY - r.top) * (CFG.canvasHeight / r.height);
      AudioFX.ensure();
      this.click(x, y);
    });
    window.addEventListener('keydown', (ev) => {
      if (ev.repeat) return;
      AudioFX.ensure();
      this.key(ev.key);
    });
  },

  click(x, y) {
    const screen = Game.screen;
    if (screen === 'title') { Game.startShift(); return; }
    if (screen === 'end') { Game.toTitle(); return; }
    if (screen === 'paused') { Game.togglePause(); return; }

    // HUD buttons work in every play state.
    if (this._inside(this.pauseButtonRect(), x, y)) { Game.togglePause(); return; }
    if (this._inside(this.muteButtonRect(), x, y)) { AudioFX.toggleMute(); return; }

    // Order cards: serve the plate to the card clicked.
    for (let i = 0; i < Game.orders.length; i += 1) {
      if (this._inside(this.orderCardRect(i), x, y)) { Game.serveOrder(i); return; }
    }

    // Grill slots: lift a cooked patty onto the plate, bin a burnt one.
    for (let i = 0; i < Stations.grill.length; i += 1) {
      if (this._inside(this.grillSlotRect(i), x, y)) { Game.takeFromGrill(i); return; }
    }

    // Counter bins: add the ingredient (patty goes on the grill).
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      if (this._inside(this.binRect(i), x, y)) { Game.addIngredient(INGREDIENTS[i].id); return; }
    }

    if (this._inside(this.trashButtonRect(), x, y)) { Game.trashPlate(); return; }
    if (this._inside(this.serveButtonRect(), x, y)) { Game.serveFirstMatch(); return; }
  },

  key(k) {
    const screen = Game.screen;
    if (k === 'm' || k === 'M') { AudioFX.toggleMute(); return; }
    if (screen === 'title' && (k === 'Enter' || k === ' ')) { Game.startShift(); return; }
    if (screen === 'end' && (k === 'Enter' || k === ' ')) { Game.toTitle(); return; }
    if (k === 'p' || k === 'P' || k === 'Escape') {
      if (screen === 'play' || screen === 'paused') Game.togglePause();
      return;
    }
    if (screen !== 'play') return;
    const ing = INGREDIENTS.find((item) => item.key === k);
    if (ing) { Game.addIngredient(ing.id); return; }
    if (k === 's' || k === 'S' || k === 'Enter') Game.serveFirstMatch();
    if (k === 'x' || k === 'X') Game.trashPlate();
  },
};
