// Procedural soundtrack for the site — everything is synthesised with the Web Audio API,
// so there are no audio files to load or license.
//
//   • Ambient bed: soft filtered "site air" noise + a slow evolving pad whose chord follows the chapter.
//   • Site texture: rare, distant metallic taps and low thuds, deep in reverb.
//   • UI effects: click, whoosh (chapter change), hold-to-enter charge and the "break ground" hit.
//
// Browsers only allow audio after a user gesture, so nothing is created until `enable()` is called
// from a click / pointer handler.

const MOODS = [
  [73.42, 110.0, 184.99, 329.63], // D add9 — ground / intro
  [61.74, 92.5, 146.83, 220.0], //   Bm7 — structure / building
  [98.0, 146.83, 246.94, 369.99], //  Gmaj7 — overview / calm
  [82.41, 123.47, 196.0, 369.99], //  Em9 — night / closing
];

const ramp = (param, value, ctx, time = 0.08) => {
  const now = ctx.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(value, now + time);
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.mood = 0;
    this.listeners = new Set();
    this.voices = [];
    this.textureTimer = null;
    this.hold = null;
    this.onVisibility = this.onVisibility.bind(this);
  }

  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit() { this.listeners.forEach((fn) => fn(this.enabled)); }

  build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    const ctx = new AC();
    this.ctx = ctx;

    // Master chain
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 3;
    this.master.connect(comp).connect(ctx.destination);

    // Reverb (generated impulse response)
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.impulse(3.4, 2.6);
    this.wet = ctx.createGain(); this.wet.gain.value = 0.55;
    this.reverb.connect(this.wet).connect(this.master);

    // Ambient bus (fades with mood changes / enable)
    this.ambient = ctx.createGain();
    this.ambient.gain.value = 0.9;
    this.ambient.connect(this.master);
    this.ambient.connect(this.reverb);

    // "Site air": brown noise through a slowly moving low-pass
    const noise = ctx.createBufferSource();
    noise.buffer = this.brownNoise(6);
    noise.loop = true;
    const air = ctx.createBiquadFilter();
    air.type = "lowpass"; air.frequency.value = 420; air.Q.value = 0.4;
    const airGain = ctx.createGain(); airGain.gain.value = 0.11;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.045;
    const lfoAmt = ctx.createGain(); lfoAmt.gain.value = 180;
    lfo.connect(lfoAmt).connect(air.frequency);
    noise.connect(air).connect(airGain).connect(this.ambient);
    noise.start(); lfo.start();

    // Pad
    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = "lowpass"; this.padFilter.frequency.value = 900; this.padFilter.Q.value = 0.6;
    this.padGain = ctx.createGain(); this.padGain.gain.value = 0.05;
    this.padFilter.connect(this.padGain).connect(this.ambient);

    MOODS[this.mood].forEach((freq, i) => {
      const g = ctx.createGain(); g.gain.value = 0.0;
      const a = ctx.createOscillator(); a.type = "sine"; a.frequency.value = freq;
      const b = ctx.createOscillator(); b.type = "triangle"; b.frequency.value = freq; b.detune.value = 5 + i;
      const bGain = ctx.createGain(); bGain.gain.value = 0.35;
      // Slow "breathing" per voice
      const breath = ctx.createOscillator(); breath.frequency.value = 0.05 + i * 0.023;
      const breathAmt = ctx.createGain(); breathAmt.gain.value = 0.25;
      const base = ctx.createConstantSource ? ctx.createConstantSource() : null;
      if (base) { base.offset.value = 0.6; base.connect(g.gain); base.start(); }
      breath.connect(breathAmt).connect(g.gain);
      a.connect(g); b.connect(bGain).connect(g); g.connect(this.padFilter);
      a.start(); b.start(); breath.start();
      this.voices.push({ a, b });
    });

    document.addEventListener("visibilitychange", this.onVisibility);
    return true;
  }

  impulse(seconds, decay) {
    const { ctx } = this;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  brownNoise(seconds) {
    const { ctx } = this;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.2;
    }
    // smooth the loop seam
    const fade = Math.floor(ctx.sampleRate * 0.25);
    for (let i = 0; i < fade; i++) { const k = i / fade; d[i] *= k; d[len - 1 - i] *= k; }
    return buf;
  }

  onVisibility() {
    if (!this.ctx) return;
    if (document.hidden) this.ctx.suspend();
    else if (this.enabled) this.ctx.resume();
  }

  enable() {
    if (!this.ctx && !this.build()) return;
    this.enabled = true;
    this.ctx.resume().catch(() => {});
    ramp(this.master.gain, 0.85, this.ctx, 2.5);
    this.scheduleTexture();
    this.emit();
  }

  disable() {
    this.enabled = false;
    if (this.ctx) ramp(this.master.gain, 0, this.ctx, 0.6);
    clearTimeout(this.textureTimer);
    this.emit();
  }

  toggle() { if (this.enabled) this.disable(); else this.enable(); }

  setMood(i) {
    if (i === this.mood) return;
    this.mood = i;
    if (!this.ctx) return;
    const chord = MOODS[i % MOODS.length];
    const now = this.ctx.currentTime;
    this.voices.forEach((v, k) => {
      [v.a, v.b].forEach((o) => {
        o.frequency.cancelScheduledValues(now);
        o.frequency.setValueAtTime(o.frequency.value, now);
        o.frequency.exponentialRampToValueAtTime(chord[k], now + 4);
      });
    });
    ramp(this.padFilter.frequency, [900, 1200, 760, 620][i % 4], this.ctx, 4);
  }

  // ── Distant site texture ──
  scheduleTexture() {
    clearTimeout(this.textureTimer);
    if (!this.enabled) return;
    this.textureTimer = setTimeout(() => {
      if (Math.random() < 0.72) this.tink(); else this.thud();
      this.scheduleTexture();
    }, 2600 + Math.random() * 5200);
  }

  tink() {
    const { ctx } = this; if (!ctx) return;
    const t = ctx.currentTime + 0.01;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const out = ctx.createGain(); out.gain.value = 0;
    const base = 1500 + Math.random() * 1600;
    [1, 2.76, 5.4].forEach((ratio, i) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = base * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.03 / (i + 1), t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5 - i * 0.12);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.6);
    });
    out.gain.setValueAtTime(0.5, t);
    const node = pan ? (pan.pan.value = Math.random() * 1.6 - 0.8, out.connect(pan), pan) : out;
    const dry = ctx.createGain(); dry.gain.value = 0.15;
    node.connect(dry).connect(this.master);
    node.connect(this.reverb);
    // a second, softer repeat — like a hammer stroke echoing off the site
    if (Math.random() < 0.5) setTimeout(() => this.enabled && this.tinkEcho(base), 380 + Math.random() * 300);
  }

  tinkEcho(base) {
    const { ctx } = this; const t = ctx.currentTime + 0.01;
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = base;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.008, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g).connect(this.reverb); o.start(t); o.stop(t + 0.4);
  }

  thud() {
    const { ctx } = this; if (!ctx) return;
    const t = ctx.currentTime + 0.01;
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g); g.connect(this.reverb);
    const dry = ctx.createGain(); dry.gain.value = 0.3; g.connect(dry).connect(this.master);
    o.start(t); o.stop(t + 0.7);
  }

  // ── UI effects ──
  click() {
    if (!this.enabled || !this.ctx) return;
    const { ctx } = this; const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = "triangle";
    o.frequency.setValueAtTime(1300, t); o.frequency.exponentialRampToValueAtTime(700, t + 0.05);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.1);
  }

  whoosh(strength = 1) {
    if (!this.enabled || !this.ctx) return;
    const { ctx } = this; const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.whiteBuffer || (this.whiteBuffer = this.white(1.4));
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 1.2;
    f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2400, t + 0.5); f.frequency.exponentialRampToValueAtTime(500, t + 1.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05 * strength, t + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);
    src.connect(f).connect(g); g.connect(this.master); g.connect(this.reverb);
    src.start(t); src.stop(t + 1.3);
  }

  white(seconds) {
    const { ctx } = this;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // Hold-to-enter charge. Works before the user has "enabled" sound: holding is the gesture that unlocks it.
  holdStart() {
    if (!this.ctx && !this.build()) return;
    this.ctx.resume();
    const { ctx } = this; const t = ctx.currentTime;
    if (this.master.gain.value < 0.5) ramp(this.master.gain, 0.85, ctx, 0.3);
    const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = 55;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 200; f.Q.value = 6;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.2);
    o.connect(f).connect(g).connect(this.master); g.connect(this.reverb);
    o.start(t);
    this.hold = { o, f, g };
  }

  holdUpdate(p) {
    if (!this.hold) return;
    const { ctx } = this;
    ramp(this.hold.o.frequency, 55 + p * 110, ctx, 0.05);
    ramp(this.hold.f.frequency, 200 + p * 2200, ctx, 0.05);
  }

  holdEnd() {
    if (!this.hold) return;
    const { o, g } = this.hold; const t = this.ctx.currentTime;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.stop(t + 0.3);
    this.hold = null;
    if (!this.enabled) ramp(this.master.gain, 0, this.ctx, 0.3);
  }

  breakGround() {
    if (!this.ctx) return;
    const { ctx } = this; const t = ctx.currentTime;
    // sub hit
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(36, t + 0.8);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g).connect(this.master); g.connect(this.reverb);
    o.start(t); o.stop(t + 1.7);
    // shimmer
    [880, 1318.5, 1760].forEach((fq, i) => {
      const s = ctx.createOscillator(); s.type = "sine"; s.frequency.value = fq;
      const sg = ctx.createGain(); sg.gain.setValueAtTime(0.0001, t + 0.05 * i);
      sg.gain.exponentialRampToValueAtTime(0.025, t + 0.05 * i + 0.02); sg.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
      s.connect(sg).connect(this.reverb); s.start(t); s.stop(t + 2.5);
    });
    this.whoosh(1.4);
  }
}

const audio = new AudioEngine();
export default audio;
