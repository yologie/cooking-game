// Sizzle & Serve — customer orders: what they ask for, how long they wait,
// and whether the plate on the counter matches what they ordered.
// An order is a burger (bun + cooked patty + 0-3 toppings) plus, sometimes,
// fries and/or a drink on the side. The plate must match exactly.

const Orders = {
  _nextId: 1,

  // Build one random order. lateShift shortens the wait as the rush builds.
  make(lateShift) {
    const toppings = ['lettuce', 'tomato', 'cheese'];
    RNG.shuffle(toppings);
    const toppingCount = RNG.int(1, 3);
    const items = ['bun', 'patty'];
    for (let i = 0; i < toppingCount; i += 1) items.push(toppings[i]);
    if (RNG.next() < 0.45) items.push('fries');
    if (RNG.next() < 0.35) items.push('drink');
    const wait = lateShift ? CFG.orderWaitLateSeconds : CFG.orderWaitSeconds;
    const price = items.reduce((sum, id) => sum + ING_BY_ID[id].price, 0);
    return {
      id: this.nextId(),
      customer: CUSTOMERS[(this._nextId - 1) % CUSTOMERS.length],
      items,
      price,
      wait,
      left: wait,
      // A face colour so each customer reads as a different person.
      face: ['#f2b880', '#c98d5f', '#8a5a33', '#f7d0a0'][(this._nextId - 1) % 4],
    };
  },

  // A fixed order for screenshots and tests: same plate every time.
  makeFixed(items, wait, customer) {
    const price = items.reduce((sum, id) => sum + ING_BY_ID[id].price, 0);
    return {
      id: this.nextId(),
      customer: customer || 'Maya',
      items: items.slice(),
      price,
      wait,
      left: wait,
      face: '#f2b880',
    };
  },

  nextId() {
    const id = this._nextId;
    this._nextId += 1;
    return id;
  },

  // Count down every active order; returns the orders that just ran out.
  tick(active, dt) {
    const expired = [];
    for (const order of active) {
      order.left -= dt;
      if (order.left <= 0) expired.push(order);
    }
    return expired;
  },

  // Does the plate hold exactly the items this order asks for?
  // Order of items on the plate does not matter; extras fail the match.
  matches(order, plateItems) {
    if (order.items.length !== plateItems.length) return false;
    const wanted = order.items.slice().sort();
    const have = plateItems.slice().sort();
    for (let i = 0; i < wanted.length; i += 1) {
      if (wanted[i] !== have[i]) return false;
    }
    return true;
  },

  // Tip: up to half the dish price, scaled by the time still left.
  tip(order) {
    const fraction = Math.max(0, order.left / order.wait);
    return Math.round(order.price * CFG.tipMaxFraction * fraction);
  },

  // Urgency colour for the countdown bar: green, then amber, then red.
  urgency(order) {
    const fraction = order.left / order.wait;
    if (fraction > 0.5) return PALETTE.good;
    if (fraction > 0.25) return PALETTE.warn;
    return PALETTE.bad;
  },
};
