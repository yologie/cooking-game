// Sizzle & Serve — all sound is synthesized with WebAudio, no audio files.
// Short oscillator blips: a chop, a ding, a serve chime, a fail buzz, plus a
// soft crackle while a patty sizzles on the grill. Audio starts only after
// the first user gesture (browsers block autoplay), so shots stay silent.

const AudioFX = {
  ctx: null,
  muted: false,
  _sizzleTimer: 0,

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch (err) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  },

  // One short tone: frequency, seconds, waveform, volume.
  blip(freq, seconds, type, volume) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume || 0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + seconds);
  },

  // Two notes in sequence, a little arpeggio.
  chime(freqA, freqB, seconds) {
    this.blip(freqA, seconds, 'triangle', 0.14);
    const self = this;
    setTimeout(() => self.blip(freqB, seconds, 'triangle', 0.14), 90);
  },

  click() { this.blip(660, 0.06, 'square', 0.05); },
  chop() { this.blip(220, 0.08, 'sawtooth', 0.07); },
  ding() { this.chime(880, 1320, 0.18); },
  serve() { this.chime(523, 784, 0.22); },
  fail() { this.blip(160, 0.35, 'sawtooth', 0.1); },
  burn() { this.blip(110, 0.5, 'sawtooth', 0.1); },
  // A little three-note fanfare for the end of a shift.
  fanfare() {
    this.chime(523, 659, 0.2);
    const self = this;
    setTimeout(() => self.chime(784, 1047, 0.25), 180);
  },

  // A patty on the grill crackles: a tiny random pop every ~120ms.
  // Called from the game loop with the frame delta; only while cooking.
  sizzleTick(dt, cooking) {
    if (this.muted || !cooking) return;
    this._sizzleTimer += dt;
    if (this._sizzleTimer < 0.12) return;
    this._sizzleTimer = 0;
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1200 + Math.random() * 1800;
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  },
};
