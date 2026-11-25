// Sizzle & Serve — boot: canvas, input, the frame loop, debug handle.
// The loop renders every animation frame and updates the game only while
// the shift is running (and never while a screenshot is frozen).

const Main = {
  canvas: null,
  last: 0,

  boot() {
    this.canvas = document.getElementById('game');
    this.canvas.width = CFG.canvasWidth;
    this.canvas.height = CFG.canvasHeight;
    Render.init(this.canvas);
    Input.attach(this.canvas);
    RNG.reseed((Date.now() % 2147483647) || 1);

    // Debug handle for playtests: state plus the actions a player can take.
    window.__sizzle = {
      Game,
      Stations,
      Orders,
      screen: () => Game.screen,
      score: () => Game.score,
      combo: () => Game.combo,
      served: () => Game.served,
      fails: () => Game.fails,
      clock: () => Math.round(Game.clock),
      orders: () => Game.orders.length,
      plate: () => Stations.plate.slice(),
      grill: () => Stations.grill.map((s) => (s ? s.state : null)),
    };

    // A plain load (no ?shot=) is the title screen, ready at once.
    if (!Shots.params().get('shot')) {
      window.__shotReady = true;
    }
    Shots.apply();

    this.last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      if (!window.__shotFrozen) Game.update(dt);
      Render.draw();
      this.canvas.style.cursor = Input.isOverButton() ? 'pointer' : 'default';
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },
};

window.addEventListener('DOMContentLoaded', () => Main.boot());
