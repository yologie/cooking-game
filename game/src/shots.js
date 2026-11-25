// Sizzle & Serve — deterministic screenshot states (?shot=...&seed=N).
// The shotter loads the game with one of these queries and waits for
// window.__shotReady. Each state is built by calling the same functions
// the player uses, then the loop is frozen so the captured frame is exact.
// First by name is the cover: the mid-play shot, which shows the board,
// the grill, a dish mid-assembly and the timer in one frame.

const Shots = {
  // The query this page was opened with, if any.
  params() {
    return new URLSearchParams(window.location.search);
  },

  apply() {
    const shot = this.params().get('shot');
    if (!shot) return;
    const seed = Number(this.params().get('seed') || 1);
    RNG.reseed(seed);

    if (shot === 'title') {
      Game.screen = 'title';
    } else if (shot === 'play') {
      this._midPlay();
    } else if (shot === 'serve') {
      this._readyToServe();
    } else if (shot === 'end') {
      this._shiftComplete();
    } else {
      // An unknown ?shot= falls back to the title screen.
      Game.screen = 'title';
    }

    // Freeze the loop: the frame the shotter captures is this exact state.
    window.__shotFrozen = true;
    // Let two frames render, then signal readiness.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.__shotReady = true;
    }));
  },

  // Cover: three orders on the board, a bun and lettuce on the plate, a
  // patty two-thirds cooked on the grill, clock at 2:17, score 145.
  _midPlay() {
    Game.reset();
    Game.screen = 'play';
    Game.clock = 137;
    Game.score = 145;
    Game.combo = 2;
    Game.bestCombo = 2;
    Game.served = 4;
    Game.spawnIn = 999;
    Orders._nextId = 1;
    Game.orders = [
      Orders.makeFixed(['bun', 'patty', 'lettuce', 'tomato'], 48, 'Maya'),
      Orders.makeFixed(['bun', 'patty', 'cheese', 'fries'], 40, 'Riko'),
      Orders.makeFixed(['bun', 'patty', 'lettuce', 'cheese', 'drink'], 32, 'Sari'),
    ];
    Game.orders[0].left = 31;
    Game.orders[1].left = 24;
    Game.orders[2].left = 14;
    Stations.plate = ['bun', 'lettuce'];
    Stations.grill = [{ state: 'raw', t: 4 }, null];
  },

  // A finished dish on the plate, matching Maya's order, serve button lit.
  _readyToServe() {
    Game.reset();
    Game.screen = 'play';
    Game.clock = 102;
    Game.score = 210;
    Game.combo = 3;
    Game.bestCombo = 3;
    Game.served = 7;
    Game.spawnIn = 999;
    Orders._nextId = 1;
    Game.orders = [
      Orders.makeFixed(['bun', 'patty', 'lettuce', 'tomato', 'cheese'], 48, 'Maya'),
      Orders.makeFixed(['bun', 'patty', 'fries'], 40, 'Dimas'),
    ];
    Game.orders[0].left = 36;
    Game.orders[1].left = 19;
    Stations.plate = ['bun', 'patty', 'lettuce', 'tomato', 'cheese'];
    Stations.grill = [null, null];
  },

  // Shift-complete screen with a final score and stats.
  _shiftComplete() {
    Game.reset();
    Game.screen = 'play';
    Game.score = 486;
    Game.served = 14;
    Game.bestCombo = 5;
    Game.fails = 2;
    Game.endShift();
  },
};
