// Sizzle & Serve — game state, the shift loop, scoring and serving.
// Screens: 'title' -> 'play' <-> 'paused' -> 'end'. The shift is a
// three-minute rush: orders arrive faster as the clock runs down, each with
// its own countdown. Serve the right plate to the right order in time.

const Game = {
  screen: 'title',
  clock: CFG.shiftSeconds,
  score: 0,
  combo: 0,
  bestCombo: 0,
  served: 0,
  fails: 0,
  bestScore: 0,
  orders: [],
  spawnIn: 4,
  now: 0,
  toast: null,

  reset() {
    this.screen = 'play';
    this.clock = CFG.shiftSeconds;
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.served = 0;
    this.fails = 0;
    this.orders = [];
    this.spawnIn = 4;
    this.toast = null;
    Stations.reset();
    try {
      this.bestScore = Number(window.localStorage.getItem('sizzle-best') || 0);
    } catch (err) {
      this.bestScore = 0;
    }
    this.spawnOrder();
  },

  startShift() {
    RNG.reseed((Date.now() % 2147483647) || 1);
    this.reset();
    AudioFX.ensure();
    AudioFX.ding();
  },

  toTitle() {
    this.screen = 'title';
    Stations.reset();
    this.orders = [];
    this.toast = null;
  },

  togglePause() {
    if (this.screen === 'play') this.screen = 'paused';
    else if (this.screen === 'paused') this.screen = 'play';
  },

  // How far into the rush we are, 0 at the start, 1 at the end.
  rush() {
    return 1 - this.clock / CFG.shiftSeconds;
  },

  spawnOrder() {
    if (this.orders.length >= CFG.maxOrders) return;
    this.orders.push(Orders.make(this.rush() > 0.5));
  },

  // ---- player actions ---------------------------------------------------
  addIngredient(id) {
    if (this.screen !== 'play') return;
    if (id === 'patty') {
      // Pressing 2 with a cooked patty ready lifts it onto the plate;
      // otherwise it starts a raw patty cooking on the grill.
      for (let i = 0; i < Stations.grill.length; i += 1) {
        const slot = Stations.grill[i];
        if (slot && slot.state === 'cooked') {
          this.takeFromGrill(i);
          return;
        }
      }
      if (Stations.startPatty()) {
        AudioFX.chop();
      } else {
        this.showToast('GRILL IS FULL!', PALETTE.bad);
      }
      return;
    }
    if (Stations.addToPlate(id)) AudioFX.click();
  },

  takeFromGrill(slotIndex) {
    if (this.screen !== 'play') return;
    const result = Stations.takePatty(slotIndex);
    if (result === 'cooked') {
      AudioFX.chop();
    } else if (result === 'burnt') {
      this.showToast('BURNT PATTY — BINNED', PALETTE.bad);
      AudioFX.fail();
    } else if (result === 'raw') {
      this.showToast('STILL COOKING…', PALETTE.warn);
    }
  },

  trashPlate() {
    if (this.screen !== 'play') return;
    if (Stations.plate.length === 0) return;
    Stations.trashPlate();
    AudioFX.click();
  },

  // The first order whose items match the plate exactly, if any.
  firstMatchingOrder() {
    for (const order of this.orders) {
      if (Orders.matches(order, Stations.plate)) return order;
    }
    return null;
  },

  serveFirstMatch() {
    const match = this.firstMatchingOrder();
    if (!match) {
      if (Stations.plate.length > 0) {
        this.wrongServe();
      }
      return;
    }
    this.serveOrder(this.orders.indexOf(match));
  },

  // Serve the plate to one specific order (clicked card). A wrong plate
  // costs points and the combo; an empty plate does nothing.
  serveOrder(index) {
    if (this.screen !== 'play') return;
    const order = this.orders[index];
    if (!order) return;
    if (Stations.plate.length === 0) return;
    if (!Orders.matches(order, Stations.plate)) {
      this.wrongServe();
      return;
    }
    const tip = Orders.tip(order);
    this.combo += 1;
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;
    const multiplier = Math.min(CFG.comboCap, 1 + (this.combo - 1) * CFG.comboStep);
    const earned = Math.round((order.price + tip) * multiplier);
    this.score += earned;
    this.served += 1;
    this.orders.splice(index, 1);
    Stations.trashPlate();
    AudioFX.serve();
    this.showToast(
      `+$${earned}  ${tip > 0 ? `(TIP $${tip})` : ''}  ${this.combo > 1 ? `COMBO x${multiplier.toFixed(1)}` : ''}`,
      PALETTE.gold,
    );
  },

  wrongServe() {
    this.score = Math.max(0, this.score - CFG.wrongServePenalty);
    this.combo = 0;
    Stations.trashPlate();
    AudioFX.fail();
    this.showToast(`WRONG ORDER! -$${CFG.wrongServePenalty}`, PALETTE.bad);
  },

  failOrder(order) {
    this.orders.splice(this.orders.indexOf(order), 1);
    this.fails += 1;
    this.combo = 0;
    AudioFX.fail();
    this.showToast(`${order.customer} WALKED OUT!`, PALETTE.bad);
    if (this.fails >= CFG.maxFails) this.endShift();
  },

  endShift() {
    this.screen = 'end';
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      try {
        window.localStorage.setItem('sizzle-best', String(this.bestScore));
      } catch (err) { /* storage unavailable: best score lives for the session */ }
    }
    AudioFX.fanfare();
  },

  showToast(text, color) {
    this.toast = { text, color, t: CFG.toastSeconds };
  },

  // ---- the loop ---------------------------------------------------------
  update(dt) {
    this.now += dt;
    if (this.toast) {
      this.toast.t -= dt;
      if (this.toast.t <= 0) this.toast = null;
    }
    if (this.screen !== 'play') return;

    this.clock -= dt;
    if (this.clock <= 0) {
      this.clock = 0;
      this.endShift();
      return;
    }

    // Grill keeps cooking; sizzle while a patty is on it.
    Stations.tickGrill(dt);
    AudioFX.sizzleTick(dt, Stations.anyCooking());

    // Orders tick down; expired ones walk out.
    const expired = Orders.tick(this.orders, dt);
    for (const order of expired) this.failOrder(order);
    if (this.screen !== 'play') return;

    // New orders arrive on a timer that quickens as the rush builds.
    this.spawnIn -= dt;
    if (this.spawnIn <= 0) {
      this.spawnOrder();
      const every = this.rush() > 0.5 ? CFG.spawnEveryLateSeconds : CFG.spawnEverySeconds;
      this.spawnIn = every;
    }
  },
};
