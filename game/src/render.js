// Sizzle & Serve — everything the player sees, drawn on one canvas.
// No images, no fonts from the network: flat colours, rounded shapes and
// the system sans-serif. The first screenshot is the cover, so the play
// screen must read as a kitchen at a glance: board on top, grill and plate
// in the middle, ingredients along the bottom.

const Render = {
  ctx: null,

  init(canvas) {
    this.ctx = canvas.getContext('2d');
  },

  // ---- small drawing helpers -------------------------------------------
  rr(x, y, w, h, r) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  },

  text(str, x, y, size, color, align, weight) {
    const c = this.ctx;
    c.fillStyle = color;
    c.font = `${weight || 'bold'} ${size}px system-ui, sans-serif`;
    c.textAlign = align || 'left';
    c.textBaseline = 'middle';
    c.fillText(str, x, y);
  },

  // ---- ingredient icons -------------------------------------------------
  // One painter for every place an ingredient appears: order cards, the
  // plate stack, the counter bins. Drawn at (cx, cy) inside a size box.
  icon(id, cx, cy, size) {
    const c = this.ctx;
    const s = size;
    c.save();
    c.translate(cx, cy);
    if (id === 'bun') {
      c.fillStyle = ING_BY_ID.bun.color;
      c.beginPath();
      c.arc(0, s * 0.08, s * 0.42, Math.PI, 0);
      c.closePath();
      c.fill();
      c.fillStyle = ING_BY_ID.bun.dark;
      c.fillRect(-s * 0.42, s * 0.08, s * 0.84, s * 0.1);
      c.fillStyle = '#fff3d6';
      for (const [dx, dy] of [[-0.2, -0.12], [0.05, -0.2], [0.22, -0.08]]) {
        c.beginPath();
        c.arc(dx * s, dy * s, s * 0.045, 0, Math.PI * 2);
        c.fill();
      }
    } else if (id === 'patty') {
      c.fillStyle = ING_BY_ID.patty.color;
      this.rr(-s * 0.45, -s * 0.16, s * 0.9, s * 0.32, s * 0.12);
      c.fill();
      c.fillStyle = ING_BY_ID.patty.dark;
      for (const dx of [-0.28, 0, 0.28]) {
        c.beginPath();
        c.arc(dx * s, 0, s * 0.05, 0, Math.PI * 2);
        c.fill();
      }
    } else if (id === 'lettuce') {
      // Four scallops spanning exactly the icon width.
      c.fillStyle = ING_BY_ID.lettuce.color;
      c.beginPath();
      c.moveTo(-s * 0.45, s * 0.1);
      for (let i = 0; i < 4; i += 1) {
        c.arc(-s * 0.45 + (i + 0.5) * s * 0.225, s * 0.1, s * 0.1125, Math.PI, 0);
      }
      c.lineTo(s * 0.45, s * 0.22);
      c.lineTo(-s * 0.45, s * 0.22);
      c.closePath();
      c.fill();
    } else if (id === 'tomato') {
      c.fillStyle = ING_BY_ID.tomato.color;
      c.beginPath();
      c.arc(0, 0, s * 0.4, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#f28a80';
      c.beginPath();
      c.arc(-s * 0.12, -s * 0.1, s * 0.14, 0, Math.PI * 2);
      c.fill();
    } else if (id === 'cheese') {
      c.fillStyle = ING_BY_ID.cheese.color;
      c.beginPath();
      c.moveTo(-s * 0.45, s * 0.18);
      c.lineTo(s * 0.45, s * 0.18);
      c.lineTo(0, -s * 0.28);
      c.closePath();
      c.fill();
      c.fillStyle = ING_BY_ID.cheese.dark;
      for (const [dx, dy] of [[-0.18, 0.02], [0.14, -0.06]]) {
        c.beginPath();
        c.arc(dx * s, dy * s, s * 0.05, 0, Math.PI * 2);
        c.fill();
      }
    } else if (id === 'fries') {
      c.fillStyle = ING_BY_ID.fries.dark;
      c.beginPath();
      c.moveTo(-s * 0.32, -s * 0.1);
      c.lineTo(s * 0.32, -s * 0.1);
      c.lineTo(s * 0.24, s * 0.38);
      c.lineTo(-s * 0.24, s * 0.38);
      c.closePath();
      c.fill();
      c.fillStyle = ING_BY_ID.fries.color;
      for (const dx of [-0.22, -0.07, 0.08, 0.23]) {
        c.fillRect((dx - 0.05) * s, -s * 0.42, s * 0.1, s * 0.42);
      }
    } else if (id === 'drink') {
      c.fillStyle = ING_BY_ID.drink.color;
      c.beginPath();
      c.moveTo(-s * 0.26, -s * 0.28);
      c.lineTo(s * 0.26, -s * 0.28);
      c.lineTo(s * 0.18, s * 0.36);
      c.lineTo(-s * 0.18, s * 0.36);
      c.closePath();
      c.fill();
      c.fillStyle = '#fff';
      c.fillRect(-s * 0.3, -s * 0.34, s * 0.6, s * 0.09);
      c.strokeStyle = '#e0483e';
      c.lineWidth = s * 0.07;
      c.beginPath();
      c.moveTo(s * 0.1, -s * 0.3);
      c.lineTo(s * 0.24, -s * 0.52);
      c.stroke();
    }
    c.restore();
  },

  // ---- screens ----------------------------------------------------------
  frame() {
    const c = this.ctx;
    // Wall and floor.
    const wall = c.createLinearGradient(0, 0, 0, 460);
    wall.addColorStop(0, PALETTE.wallTop);
    wall.addColorStop(1, PALETTE.wallBottom);
    c.fillStyle = wall;
    c.fillRect(0, 0, CFG.canvasWidth, 460);
    c.fillStyle = PALETTE.floor;
    c.fillRect(0, 460, CFG.canvasWidth, 260);
    // Chequered floor hint.
    c.fillStyle = 'rgba(0,0,0,0.06)';
    for (let x = 0; x < 1280; x += 80) {
      for (let y = 460; y < 720; y += 80) {
        if (((x + y) / 80) % 2 === 0) c.fillRect(x, y, 80, 80);
      }
    }
  },

  hud() {
    const c = this.ctx;
    const h = LAYOUT.hud;
    c.fillStyle = PALETTE.board;
    c.fillRect(h.x, h.y, h.w, h.h);
    c.fillStyle = PALETTE.gold;
    c.fillRect(0, h.h - 4, CFG.canvasWidth, 4);

    const mm = Math.floor(Math.max(0, Game.clock) / 60);
    const ss = Math.floor(Math.max(0, Game.clock) % 60).toString().padStart(2, '0');
    const clockColor = Game.clock <= 30 ? PALETTE.bad : '#fff';
    this.text('SIZZLE & SERVE', 24, 34, 26, PALETTE.gold, 'left');
    this.text(`TIME ${mm}:${ss}`, 330, 34, 26, clockColor, 'left');
    this.text(`SCORE ${Game.score}`, 520, 34, 26, '#fff', 'left');
    const combo = Game.combo > 1 ? `COMBO x${Game.combo.toFixed(1)}` : 'COMBO —';
    this.text(combo, 760, 34, 24, Game.combo > 1 ? PALETTE.gold : '#cbb9a3', 'left');
    // Failed orders: three slots, filled red as they happen.
    for (let i = 0; i < CFG.maxFails; i += 1) {
      const x = 960 + i * 36;
      c.fillStyle = i < Game.fails ? PALETTE.bad : '#5d4a38';
      c.beginPath();
      c.arc(x + 14, 32, 13, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#fff';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(x + 7, 25);
      c.lineTo(x + 21, 39);
      c.moveTo(x + 21, 25);
      c.lineTo(x + 7, 39);
      c.stroke();
    }
    // Mute and pause buttons.
    this._hudButton(Input.muteButtonRect(), AudioFX.muted ? 'MUTE' : 'SOUND');
    this._hudButton(Input.pauseButtonRect(), 'II');
  },

  _hudButton(rect, label) {
    const c = this.ctx;
    const hover = Input._inside(rect, Input.mouse.x, Input.mouse.y);
    c.fillStyle = hover ? '#6b4a2f' : '#4a3524';
    this.rr(rect.x, rect.y, rect.w, rect.h, 8);
    c.fill();
    c.strokeStyle = PALETTE.gold;
    c.lineWidth = 1.5;
    c.stroke();
    this.text(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1, 13, '#fff', 'center');
  },

  orderBoard() {
    const c = this.ctx;
    const b = LAYOUT.board;
    c.fillStyle = PALETTE.boardEdge;
    this.rr(b.x - 6, b.y - 6, b.w + 12, b.h + 12, 14);
    c.fill();
    c.fillStyle = PALETTE.board;
    this.rr(b.x, b.y, b.w, b.h, 10);
    c.fill();
    this.text('ORDER BOARD', b.x + 16, b.y + 20, 15, PALETTE.gold, 'left');
    for (let i = 0; i < CFG.maxOrders; i += 1) {
      const order = Game.orders[i];
      const r = Input.orderCardRect(i);
      if (!order) {
        c.fillStyle = 'rgba(255,255,255,0.06)';
        this.rr(r.x, r.y, r.w, r.h, 10);
        c.fill();
        this.text('— waiting —', r.x + r.w / 2, r.y + r.h / 2, 16, '#8a7a68', 'center');
        continue;
      }
      const hover = Input._inside(r, Input.mouse.x, Input.mouse.y);
      c.fillStyle = hover ? '#4a3524' : '#2e2118';
      this.rr(r.x, r.y, r.w, r.h, 10);
      c.fill();
      c.strokeStyle = Orders.urgency(order);
      c.lineWidth = 2;
      c.stroke();
      // Customer face + name.
      c.fillStyle = order.face;
      c.beginPath();
      c.arc(r.x + 26, r.y + 26, 15, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#2e2118';
      c.beginPath();
      c.arc(r.x + 21, r.y + 24, 2.5, 0, Math.PI * 2);
      c.arc(r.x + 31, r.y + 24, 2.5, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(r.x + 26, r.y + 30, 5, 0.15 * Math.PI, 0.85 * Math.PI);
      c.stroke();
      this.text(order.customer, r.x + 48, r.y + 26, 17, '#fff', 'left');
      this.text(`$${order.price}`, r.x + r.w - 14, r.y + 26, 17, PALETTE.gold, 'right');
      // Wanted items as a row of icons.
      const iconSize = 30;
      const gap = 8;
      const totalW = order.items.length * (iconSize + gap) - gap;
      let ix = r.x + (r.w - totalW) / 2;
      for (const id of order.items) {
        this.icon(id, ix + iconSize / 2, r.y + 68, iconSize);
        ix += iconSize + gap;
      }
      // Countdown bar.
      const barW = r.w - 28;
      c.fillStyle = '#1c130c';
      this.rr(r.x + 14, r.y + r.h - 26, barW, 12, 6);
      c.fill();
      c.fillStyle = Orders.urgency(order);
      const frac = Math.max(0, order.left / order.wait);
      this.rr(r.x + 14, r.y + r.h - 26, Math.max(12, barW * frac), 12, 6);
      c.fill();
      this.text(`${Math.ceil(order.left)}s`, r.x + r.w - 14, r.y + r.h - 20, 13, '#fff', 'right');
    }
  },

  grill() {
    const c = this.ctx;
    const g = LAYOUT.grill;
    c.fillStyle = PALETTE.counterTop;
    this.rr(g.x, g.y, g.w, g.h, 12);
    c.fill();
    this.text('GRILL — click a patty (or press 2) to plate it', g.x + 16, g.y + 22, 15, PALETTE.ink, 'left');
    for (let i = 0; i < Stations.grill.length; i += 1) {
      const r = Input.grillSlotRect(i);
      const slot = Stations.grill[i];
      c.fillStyle = PALETTE.grill;
      this.rr(r.x, r.y, r.w, r.h, 10);
      c.fill();
      // Grill bars.
      c.strokeStyle = '#33333a';
      c.lineWidth = 4;
      for (let gy = r.y + 18; gy < r.y + r.h - 8; gy += 16) {
        c.beginPath();
        c.moveTo(r.x + 8, gy);
        c.lineTo(r.x + r.w - 8, gy);
        c.stroke();
      }
      if (!slot) {
        this.text('empty', r.x + r.w / 2, r.y + r.h / 2, 16, '#8a8a94', 'center');
        continue;
      }
      // Patty with a progress ring: raw browns, cooked greens, burnt black.
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const stateColor = slot.state === 'raw' ? '#c98d5f' : slot.state === 'cooked' ? PALETTE.good : '#222';
      c.fillStyle = slot.state === 'raw' ? ING_BY_ID.patty.color : slot.state === 'cooked' ? '#7a4a26' : '#1a1a1a';
      c.beginPath();
      c.arc(cx, cy, 34, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = stateColor;
      c.lineWidth = 6;
      const frac = Stations.slotProgress(i);
      c.beginPath();
      c.arc(cx, cy, 44, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
      c.stroke();
      const label = slot.state === 'raw' ? 'COOKING…' : slot.state === 'cooked' ? 'READY!' : 'BURNT!';
      this.text(label, cx, cy + 52, 14, slot.state === 'burnt' ? '#ff6b5e' : '#fff', 'center');
      if (slot.state === 'raw') {
        // Sizzle puffs.
        c.fillStyle = 'rgba(255,255,255,0.5)';
        for (let p = 0; p < 3; p += 1) {
          const px = cx - 20 + p * 20 + Math.sin(Game.now * 3 + p * 2) * 4;
          c.beginPath();
          c.arc(px, cy - 44 - (Game.now * 20 + p * 14) % 18, 4, 0, Math.PI * 2);
          c.fill();
        }
      }
    }
  },

  plateArea() {
    const c = this.ctx;
    const p = LAYOUT.plate;
    c.fillStyle = PALETTE.counterTop;
    this.rr(p.x, p.y, p.w, p.h, 12);
    c.fill();
    this.text('YOUR PLATE', p.x + 16, p.y + 22, 15, PALETTE.ink, 'left');
    // The plate itself.
    const cx = p.x + p.w / 2;
    const cy = p.y + 128;
    c.fillStyle = PALETTE.plateEdge;
    c.beginPath();
    c.ellipse(cx, cy, 150, 46, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = PALETTE.plate;
    c.beginPath();
    c.ellipse(cx, cy, 136, 38, 0, 0, Math.PI * 2);
    c.fill();
    // Stacked ingredients, bottom-up, like a burger being built.
    const items = Stations.plate;
    if (items.length === 0) {
      this.text('empty — add ingredients below', cx, cy, 15, PALETTE.muted, 'center');
    } else {
      const layerH = 13;
      const baseY = cy + 8;
      for (let i = 0; i < items.length; i += 1) {
        const y = baseY - i * layerH;
        this._plateLayer(items[i], cx, y, 220 - i * 8);
      }
    }
  },

  _plateLayer(id, cx, y, w) {
    const c = this.ctx;
    if (id === 'bun') {
      // A flattened dome so a bun reads as one thin layer in the stack.
      c.fillStyle = ING_BY_ID.bun.color;
      c.beginPath();
      c.ellipse(cx, y, w / 2, 13, 0, Math.PI, 0);
      c.closePath();
      c.fill();
      return;
    }
    if (id === 'patty') {
      c.fillStyle = ING_BY_ID.patty.color;
      this.rr(cx - w / 2, y - 7, w, 14, 7);
      c.fill();
      return;
    }
    if (id === 'lettuce') {
      // Four scallops spanning exactly the layer width.
      c.fillStyle = ING_BY_ID.lettuce.color;
      c.beginPath();
      c.moveTo(cx - w / 2, y);
      for (let i = 0; i < 4; i += 1) {
        c.arc(cx - w / 2 + (i + 0.5) * (w / 4), y, w / 8, Math.PI, 0);
      }
      c.lineTo(cx + w / 2, y + 8);
      c.lineTo(cx - w / 2, y + 8);
      c.closePath();
      c.fill();
      return;
    }
    if (id === 'tomato') {
      c.fillStyle = ING_BY_ID.tomato.color;
      this.rr(cx - w / 2, y - 6, w, 12, 6);
      c.fill();
      return;
    }
    if (id === 'cheese') {
      c.fillStyle = ING_BY_ID.cheese.color;
      c.beginPath();
      c.moveTo(cx - w / 2, y - 6);
      c.lineTo(cx + w / 2, y - 6);
      c.lineTo(cx, y + 8);
      c.closePath();
      c.fill();
      return;
    }
    if (id === 'fries' || id === 'drink') {
      // Sides sit beside the burger, not in the stack: draw the icon.
      this.icon(id, cx + w / 2 + 6, y - 4, 26);
    }
  },

  servePanel() {
    const c = this.ctx;
    const s = LAYOUT.serve;
    c.fillStyle = PALETTE.counterTop;
    this.rr(s.x, s.y, s.w, s.h, 12);
    c.fill();
    this.text('SERVE', s.x + 16, s.y + 22, 15, PALETTE.ink, 'left');
    // What is on the plate right now.
    const names = Stations.plateNames();
    const line = names.length ? names.join(' + ') : 'nothing yet';
    this.text(line, s.x + 16, s.y + 48, 16, names.length ? PALETTE.ink : PALETTE.muted, 'left');
    // The first order this plate matches, if any.
    const match = Game.firstMatchingOrder();
    const matchText = match
      ? `✓ matches ${match.customer}'s order — $${match.price} + $${Orders.tip(match)} tip`
      : 'no order matches this plate yet';
    this.text(matchText, s.x + 16, s.y + 76, 15, match ? PALETTE.good : PALETTE.muted, 'left');
    // Trash button.
    const trash = Input.trashButtonRect();
    c.fillStyle = '#8a3a2e';
    this.rr(trash.x, trash.y, trash.w, trash.h, 10);
    c.fill();
    this.text('TRASH PLATE  (X)', trash.x + trash.w / 2, trash.y + trash.h / 2 + 1, 17, '#fff', 'center');
    // Serve button, glowing when a match exists.
    const serve = Input.serveButtonRect();
    const ready = !!match;
    c.fillStyle = ready ? PALETTE.good : '#9a8a76';
    if (ready) {
      c.shadowColor = PALETTE.good;
      c.shadowBlur = 18 + Math.sin(Game.now * 5) * 6;
    }
    this.rr(serve.x, serve.y, serve.w, serve.h, 10);
    c.fill();
    c.shadowBlur = 0;
    this.text(ready ? 'SERVE IT!  (S)' : 'SERVE  (S)', serve.x + serve.w / 2, serve.y + serve.h / 2 + 1, 20, '#fff', 'center');
  },

  counter() {
    const c = this.ctx;
    const ct = LAYOUT.counter;
    c.fillStyle = PALETTE.counter;
    this.rr(ct.x, ct.y, ct.w, ct.h, 12);
    c.fill();
    this.text('INGREDIENTS — click or press the number key', ct.x + 16, ct.y + 14, 14, '#f7e8c9', 'left');
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      const ing = INGREDIENTS[i];
      const r = Input.binRect(i);
      const hover = Input._inside(r, Input.mouse.x, Input.mouse.y);
      c.fillStyle = hover ? '#c98f5f' : '#e8d5b0';
      this.rr(r.x, r.y, r.w, r.h, 12);
      c.fill();
      c.strokeStyle = '#8a6a42';
      c.lineWidth = 2;
      c.stroke();
      this.icon(ing.id, r.x + r.w / 2, r.y + 66, 80);
      this.text(ing.name, r.x + r.w / 2, r.y + 128, 18, PALETTE.ink, 'center');
      this.text(`$${ing.price}`, r.x + r.w / 2, r.y + 150, 15, PALETTE.muted, 'center');
      // Key hint chip.
      c.fillStyle = PALETTE.board;
      this.rr(r.x + r.w / 2 - 15, r.y + 160, 30, 22, 6);
      c.fill();
      this.text(ing.key, r.x + r.w / 2, r.y + 172, 14, '#fff', 'center');
    }
  },

  // ---- full screens ------------------------------------------------------
  title() {
    const c = this.ctx;
    this.frame();
    // Big sign.
    c.fillStyle = 'rgba(46,33,24,0.88)';
    this.rr(240, 120, 800, 300, 20);
    c.fill();
    c.strokeStyle = PALETTE.gold;
    c.lineWidth = 3;
    c.stroke();
    this.text('SIZZLE & SERVE', 640, 190, 54, PALETTE.gold, 'center');
    this.text('the lunch-rush cooking game', 640, 240, 22, '#fff', 'center');
    this.text('Orders roll in on the board — build each dish on your plate,', 640, 292, 19, '#f7e8c9', 'center');
    this.text('grill the patty (don\'t burn it!), serve before the timer runs out.', 640, 320, 19, '#f7e8c9', 'center');
    this.text('Click ingredients or press 1–7  •  S to serve  •  X to trash  •  P to pause', 640, 366, 17, '#cbb9a3', 'center');
    const pulse = 0.75 + Math.sin(Game.now * 4) * 0.25;
    c.globalAlpha = pulse;
    this.text('CLICK OR PRESS ENTER TO START YOUR SHIFT', 640, 480, 24, PALETTE.gold, 'center');
    c.globalAlpha = 1;
    this.text('3-minute shift  •  3 failed orders ends it  •  combos pay up to 2×', 640, 530, 17, '#fff', 'center');
    // A sample burger on the sign's plate, for flavour.
    this._plateLayer('bun', 640, 610, 200);
    this._plateLayer('patty', 640, 596, 210);
    this._plateLayer('cheese', 640, 583, 200);
    this._plateLayer('lettuce', 640, 570, 190);
    this._plateLayer('bun', 640, 556, 180);
  },

  paused() {
    const c = this.ctx;
    c.fillStyle = 'rgba(30,20,12,0.72)';
    c.fillRect(0, 0, CFG.canvasWidth, CFG.canvasHeight);
    this.text('PAUSED', 640, 320, 56, '#fff', 'center');
    this.text('Press P or click to get back to the kitchen', 640, 380, 20, '#f7e8c9', 'center');
  },

  end() {
    const c = this.ctx;
    this.frame();
    c.fillStyle = 'rgba(46,33,24,0.9)';
    this.rr(290, 110, 700, 420, 20);
    c.fill();
    c.strokeStyle = PALETTE.gold;
    c.lineWidth = 3;
    c.stroke();
    this.text('SHIFT COMPLETE!', 640, 170, 44, PALETTE.gold, 'center');
    this.text(`Final score: ${Game.score}`, 640, 240, 32, '#fff', 'center');
    this.text(`Dishes served: ${Game.served}    Best combo: x${Game.bestCombo.toFixed(1)}`, 640, 296, 22, '#f7e8c9', 'center');
    this.text(`Failed orders: ${Game.fails}    Best score: ${Game.bestScore}`, 640, 332, 22, '#f7e8c9', 'center');
    const verdict = Game.fails >= CFG.maxFails
      ? 'The rush beat you this time — three orders walked out.'
      : 'You survived the lunch rush. The kitchen is yours.';
    this.text(verdict, 640, 386, 18, '#cbb9a3', 'center');
    const pulse = 0.75 + Math.sin(Game.now * 4) * 0.25;
    c.globalAlpha = pulse;
    this.text('CLICK OR PRESS ENTER TO PLAY AGAIN', 640, 460, 22, PALETTE.gold, 'center');
    c.globalAlpha = 1;
  },

  // One frame for the current screen.
  draw() {
    if (Game.screen === 'title') { this.title(); return; }
    this.frame();
    this.hud();
    this.orderBoard();
    this.grill();
    this.plateArea();
    this.servePanel();
    this.counter();
    if (Game.screen === 'paused') this.paused();
    if (Game.screen === 'end') this.end();
    // Floating feedback text (e.g. "+$12 TIP!").
    if (Game.toast && Game.toast.t > 0) {
      const c = this.ctx;
      c.globalAlpha = Math.min(1, Game.toast.t);
      this.text(Game.toast.text, 640, 120, 30, Game.toast.color || PALETTE.gold, 'center');
      c.globalAlpha = 1;
    }
  },
};
