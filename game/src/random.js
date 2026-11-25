// Sizzle & Serve — seeded random numbers (mulberry32).
// Shots and playtests seed this so a frame can be reproduced exactly;
// normal play seeds it from the clock.

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One shared generator. reseed() is called at boot (clock) and by shots.js
// (a fixed number) so a screenshot never depends on the time of day.
const RNG = {
  _next: mulberry32(1),
  reseed(seed) { this._next = mulberry32(seed); },
  next() { return this._next(); },
  // Integer in [min, max] inclusive.
  int(min, max) { return min + Math.floor(this.next() * (max - min + 1)); },
  // Float in [min, max).
  range(min, max) { return min + this.next() * (max - min); },
  // Pick one element of an array.
  pick(array) { return array[Math.floor(this.next() * array.length)]; },
  // Fisher-Yates shuffle, in place, using the seeded generator.
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.next() * (i + 1));
      const tmp = array[i];
      array[i] = array[j];
      array[j] = tmp;
    }
    return array;
  },
};
