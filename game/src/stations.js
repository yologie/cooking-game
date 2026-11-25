// Sizzle & Serve — the two workstations: the grill and the plate.
// The grill cooks raw patties (raw -> cooked -> burnt). The plate is the
// dish being assembled: ingredients stack on it in the order they are added.
// Fries and drinks go straight on the plate; a patty only joins it cooked.

const Stations = {
  // Two grill slots; each is null or { state: 'raw'|'cooked'|'burnt', t }.
  grill: [null, null],
  // Plate contents, in the order added: ingredient ids.
  plate: [],

  reset() {
    this.grill = [null, null];
    this.plate = [];
  },

  // Put a raw patty on a free grill slot. Returns false when both are busy.
  startPatty() {
    for (let i = 0; i < this.grill.length; i += 1) {
      if (this.grill[i] === null) {
        this.grill[i] = { state: 'raw', t: 0 };
        return true;
      }
    }
    return false;
  },

  // Advance cooking. Returns 'burnt' when a patty just burned, else null.
  tickGrill(dt) {
    let burned = false;
    for (const slot of this.grill) {
      if (!slot) continue;
      slot.t += dt;
      if (slot.state === 'raw' && slot.t >= CFG.pattyCookSeconds) {
        slot.state = 'cooked';
        slot.t = 0;
        AudioFX.ding();
      } else if (slot.state === 'cooked' && slot.t >= CFG.pattyBurnSeconds) {
        slot.state = 'burnt';
        slot.t = 0;
        burned = true;
        AudioFX.burn();
      }
    }
    return burned;
  },

  // How far along a slot's current stage is, 0..1 (0 for an empty slot).
  // The grill renderer draws this as the progress ring around the patty.
  slotProgress(slotIndex) {
    const slot = this.grill[slotIndex];
    if (!slot) return 0;
    const total = slot.state === 'raw' ? CFG.pattyCookSeconds : CFG.pattyBurnSeconds;
    return Math.min(1, slot.t / total);
  },

  // Is any patty sizzling right now (for the sound loop)?
  anyCooking() {
    return this.grill.some((slot) => slot && slot.state === 'raw');
  },

  // Take a cooked patty off the grill onto the plate.
  // Returns 'cooked' | 'burnt' | 'raw' | 'empty'.
  takePatty(slotIndex) {
    const slot = this.grill[slotIndex];
    if (!slot) return 'empty';
    if (slot.state === 'raw') return 'raw';
    this.grill[slotIndex] = null;
    if (slot.state === 'burnt') return 'burnt';
    this.plate.push('patty');
    return 'cooked';
  },

  // Throw a burnt patty away (it never reaches a plate).
  clearSlot(slotIndex) {
    this.grill[slotIndex] = null;
  },

  // Add an ingredient straight to the plate (everything but the patty,
  // which has to be grilled first). Returns false for a patty.
  addToPlate(id) {
    if (id === 'patty') return false;
    this.plate.push(id);
    return true;
  },

  // Empty the plate into the bin.
  trashPlate() {
    this.plate = [];
  },

  // The plate as a readable list of names, for the serve panel.
  plateNames() {
    return this.plate.map((id) => ING_BY_ID[id].name);
  },

  platePrice() {
    return this.plate.reduce((sum, id) => sum + ING_BY_ID[id].price, 0);
  },
};
