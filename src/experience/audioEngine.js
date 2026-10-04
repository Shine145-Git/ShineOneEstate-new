// Generative, soothing soundtrack for the site — synthesised live with the Web Audio API, so there
// are no audio files to load or license.
//
//   Music:  warm pad chords (Dmaj9 → Bm9 → Gmaj7/D → Asus2) + a soft felt-piano melody that wanders
//           over the D-major pentatonic, a quiet sine bass, a whisper of air and the odd wind chime.
//           Everything runs through a large, soft reverb and a gentle echo. Each chapter changes the
//           mood (brightness + how many notes play) smoothly, never abruptly.
//   Effects: soft click, whoosh between chapters, a rising tone while drawing the entry circle, and
//           the glass-shatter that blooms into the music.
//
// Browsers only allow audio after a user gesture, so nothing starts until enable()/drawStart()/
// holdStart() is called from a pointer or key handler.

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

const CHORDS = [
  { pad: [50, 57, 61, 64, 66], bass: 38, tones: [66, 69, 73, 74, 76, 78, 81] }, // Dmaj9
  { pad: [47, 54, 57, 61, 62], bass: 35, tones: [66, 69, 71, 73, 74, 78, 81] }, // Bm9
  { pad: [50, 55, 59, 62, 66], bass: 31, tones: [66, 67, 71, 74, 76, 78, 79] }, // Gmaj7/D
  { pad: [52, 57, 59, 64, 66], bass: 33, tones: [64, 66, 69, 71, 76, 78, 81] }, // Asus2(6)
];
const PENTA = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83];

// Per chapter mood: pad brightness, melody density (chance per beat), reverb wetness
const MOODS = [
  { cutoff: 1100, density: 0.42, wet: 0.62 }, // ground / dawn
  { cutoff: 1350, density: 0.5, wet: 0.55 },  // building / progress
  { cutoff: 950, density: 0.36, wet: 0.65 },  // calm / gallery
  { cutoff: 780, density: 0.28, wet: 0.72 },  // night / closing
];

const BPM = 66;
const BEAT = 60 / BPM;
const BEATS_PER_CHORD = 8;

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.mood = 0;
    this.listeners = new Set();
    this.timer = null;
    this.hold = null;
    this.draw = null;
    this.onVisibility = this.onVisibility.bind(this);
    this.tick = this.tick.bind(this);
  }

  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit() { this.listeners.forEach((fn) => fn(this.enabled)); }

  /* ───────────── graph ───────────── */
  build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    const ctx = new AC({ latencyHint: "playback" });
    this.ctx = ctx;

    // master: gain → soft high cut → compressor → out
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const tone = ctx.createBiquadFilter();
    tone.type = "highshelf"; tone.frequency.value = 5200; tone.gain.value = -6;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 2.5; comp.attack.value = 0.02; comp.release.value = 0.4;
    this.master.connect(tone).connect(comp).connect(ctx.destination);

    // reverb
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.impulse(5.5, 3.2);
    this.wet = ctx.createGain(); this.wet.gain.value = MOODS[0].wet;
    this.reverb.connect(this.wet).connect(this.master);

    // soft echo (dotted eighth), darkened each repeat
    this.delay = ctx.createDelay(2);
    this.delay.delayTime.value = BEAT * 0.75;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const dl = ctx.createBiquadFilter(); dl.type = "lowpass"; dl.frequency.value = 1700;
    this.delayIn = ctx.createGain(); this.delayIn.gain.value = 0.28;
    this.delayIn.connect(this.delay); this.delay.connect(dl).connect(fb).connect(this.delay);
    dl.connect(this.master); dl.connect(this.reverb);

    // music bus (faded for effects-only moments)
    this.music = ctx.createGain(); this.music.gain.value = 0;
    this.music.connect(this.master);
    this.musicSend = ctx.createGain(); this.musicSend.gain.value = 1;
    this.music.connect(this.musicSend).connect(this.reverb);

    // pad filter (mood brightness) with a slow breathing LFO
    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = "lowpass"; this.padFilter.frequency.value = MOODS[0].cutoff; this.padFilter.Q.value = 0.5;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
    const lfoAmt = ctx.createGain(); lfoAmt.gain.value = 220;
    lfo.connect(lfoAmt).connect(this.padFilter.frequency); lfo.start();
    this.padBus = ctx.createGain(); this.padBus.gain.value = 0.9;
    this.padFilter.connect(this.padBus).connect(this.music);

    // air: pink-ish noise through a band-pass that slowly swells
    const air = ctx.createBufferSource();
    air.buffer = this.pinkNoise(8); air.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 700; bp.Q.value = 0.6;
    const airGain = ctx.createGain(); airGain.gain.value = 0.018;
    const swell = ctx.createOscillator(); swell.frequency.value = 0.035;
    const swellAmt = ctx.createGain(); swellAmt.gain.value = 0.01;
    swell.connect(swellAmt).connect(airGain.gain); swell.start();
    air.connect(bp).connect(airGain).connect(this.music);
    air.start();

    document.addEventListener("visibilitychange", this.onVisibility);
    return true;
  }

  impulse(seconds, decay) {
    const { ctx } = this;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        // low-passed noise → warmer, less "hissy" tail
        lp += 0.35 * ((Math.random() * 2 - 1) - lp);
        d[i] = lp * Math.pow(1 - i / len, decay) * (i < ctx.sampleRate * 0.02 ? i / (ctx.sampleRate * 0.02) : 1);
      }
    }
    return buf;
  }

  pinkNoise(seconds) {
    const { ctx } = this;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12;
    }
    const fade = Math.floor(ctx.sampleRate * 0.3);
    for (let i = 0; i < fade; i++) { const k = i / fade; d[i] *= k; d[len - 1 - i] *= k; }
    return buf;
  }

  white(seconds) {
    const { ctx } = this;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  ramp(param, value, time = 0.1, at) {
    const t = at ?? this.ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setValueAtTime(param.value, t);
    param.linearRampToValueAtTime(value, t + time);
  }

  onVisibility() {
    if (!this.ctx) return;
    if (document.hidden) this.ctx.suspend();
    else if (this.enabled) this.ctx.resume();
  }

  /* ───────────── transport ───────────── */
  enable() {
    if (!this.ctx && !this.build()) return;
    this.enabled = true;
    this.ctx.resume().catch(() => {});
    this.ramp(this.master.gain, 0.9, 1.2);
    this.ramp(this.music.gain, 1, 4);
    if (!this.timer) {
      this.beat = 0;
      this.nextTime = this.ctx.currentTime + 0.15;
      this.lastNote = 5;
      this.timer = setInterval(this.tick, 90);
      this.tick();
    }
    this.emit();
  }

  disable() {
    this.enabled = false;
    if (this.ctx) {
      this.ramp(this.master.gain, 0, 0.8);
      setTimeout(() => { if (!this.enabled) { clearInterval(this.timer); this.timer = null; } }, 900);
    }
    this.emit();
  }

  toggle() { if (this.enabled) this.disable(); else this.enable(); }

  setMood(i) {
    const m = MOODS[i % MOODS.length];
    this.mood = i % MOODS.length;
    if (!this.ctx) return;
    this.ramp(this.padFilter.frequency, m.cutoff, 5);
    this.ramp(this.wet.gain, m.wet, 5);
  }

  /* ───────────── sequencer ───────────── */
  tick() {
    if (!this.ctx) return;
    const ahead = this.ctx.currentTime + 0.45;
    while (this.nextTime < ahead) {
      this.scheduleBeat(this.beat, this.nextTime);
      this.nextTime += BEAT;
      this.beat++;
    }
  }

  scheduleBeat(beat, t) {
    const chordIdx = Math.floor(beat / BEATS_PER_CHORD) % CHORDS.length;
    const chord = CHORDS[chordIdx];
    const inChord = beat % BEATS_PER_CHORD;
    if (inChord === 0) {
      this.padChord(chord.pad, t, BEAT * BEATS_PER_CHORD);
      this.bass(chord.bass, t, BEAT * BEATS_PER_CHORD);
    }
    // phrase shape: every 4th chord breathes (fewer notes)
    const resting = Math.floor(beat / BEATS_PER_CHORD) % 4 === 3;
    const density = MOODS[this.mood].density * (resting ? 0.35 : 1) * (inChord === 0 ? 1.4 : 1);
    if (Math.random() < density) {
      this.melodyNote(chord, t + (Math.random() < 0.25 ? BEAT * 0.5 : 0));
      if (Math.random() < 0.12) this.melodyNote(chord, t + BEAT * 0.25, true);
    }
    if (inChord === 4 && Math.random() < 0.18) this.chimes(t + BEAT * 0.5);
  }

  padChord(notes, t, dur) {
    const { ctx } = this;
    const attack = 2.6, release = 3.6;
    notes.forEach((m, i) => {
      const f = mtof(m);
      const g = ctx.createGain();
      const peak = 0.034 - i * 0.003;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + attack);
      g.gain.setValueAtTime(peak, t + dur - 0.2);
      g.gain.linearRampToValueAtTime(0.0001, t + dur + release);
      const a = ctx.createOscillator(); a.type = "triangle"; a.frequency.value = f; a.detune.value = (Math.random() - 0.5) * 8;
      const b = ctx.createOscillator(); b.type = "sine"; b.frequency.value = f * 2; b.detune.value = (Math.random() - 0.5) * 6;
      const bg = ctx.createGain(); bg.gain.value = 0.18;
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      a.connect(g); b.connect(bg).connect(g);
      if (pan) { pan.pan.value = ((i % 2 ? 1 : -1) * (0.15 + i * 0.08)); g.connect(pan).connect(this.padFilter); } else g.connect(this.padFilter);
      a.start(t); b.start(t);
      a.stop(t + dur + release + 0.1); b.stop(t + dur + release + 0.1);
    });
  }

  bass(m, t, dur) {
    const { ctx } = this;
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = mtof(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.075, t + 1.6);
    g.gain.setValueAtTime(0.075, t + dur - 0.3);
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 1.8);
    o.connect(g).connect(this.music);
    o.start(t); o.stop(t + dur + 2);
  }

  // Felt piano / kalimba: a few sine partials with a soft attack and a long, gentle decay
  melodyNote(chord, t, grace = false) {
    const { ctx } = this;
    // wander over the pentatonic, leaning towards chord tones
    let idx = this.lastNote + Math.round((Math.random() - 0.5) * 3.2);
    idx = Math.max(0, Math.min(PENTA.length - 1, idx));
    let m = PENTA[idx];
    if (!chord.tones.includes(m) && Math.random() < 0.6) {
      m = chord.tones.reduce((best, x) => (Math.abs(x - m) < Math.abs(best - m) ? x : best), chord.tones[0]);
    }
    this.lastNote = idx;
    const f = mtof(m);
    const vel = (grace ? 0.5 : 0.75 + Math.random() * 0.25) * 0.055;
    const out = ctx.createGain(); out.gain.value = 1;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800 + vel * 14000; lp.Q.value = 0.3;
    [[1, 1, 3.8], [2.002, 0.32, 1.6], [3.004, 0.1, 0.9], [4.01, 0.04, 0.5]].forEach(([ratio, amp, decay]) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vel * amp, t + 0.012);
      g.gain.exponentialRampToValueAtTime(vel * amp * 0.45, t + 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      o.connect(g).connect(lp);
      o.start(t); o.stop(t + decay + 0.05);
    });
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) { pan.pan.value = (Math.random() - 0.5) * 0.6; lp.connect(pan).connect(out); } else lp.connect(out);
    out.connect(this.music);
    out.connect(this.delayIn);
  }

  chimes(t) {
    const { ctx } = this;
    const start = 6 + Math.floor(Math.random() * 3);
    for (let k = 0; k < 3; k++) {
      const m = PENTA[Math.min(PENTA.length - 1, start + (Math.random() < 0.5 ? k : -k))] + 12;
      const tt = t + k * (0.14 + Math.random() * 0.1);
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = mtof(m);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, tt);
      g.gain.exponentialRampToValueAtTime(0.012, tt + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, tt + 2.2);
      o.connect(g); g.connect(this.reverb); g.connect(this.delayIn);
      o.start(tt); o.stop(tt + 2.3);
    }
  }

  /* ───────────── UI effects ───────────── */
  click() {
    if (!this.enabled || !this.ctx) return;
    const { ctx } = this; const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.04);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.03, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g); g.connect(this.master); g.connect(this.reverb);
    o.start(t); o.stop(t + 0.09);
  }

  whoosh(strength = 1) {
    if (!this.enabled || !this.ctx) return;
    const { ctx } = this; const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.whiteBuffer || (this.whiteBuffer = this.white(2));
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.8;
    f.frequency.setValueAtTime(240, t); f.frequency.exponentialRampToValueAtTime(1400, t + 0.7); f.frequency.exponentialRampToValueAtTime(320, t + 1.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.022 * strength, t + 0.55);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    src.connect(f).connect(g); g.connect(this.master); g.connect(this.reverb);
    src.start(t); src.stop(t + 1.9);
  }

  unlock() {
    if (!this.ctx && !this.build()) return false;
    this.ctx.resume().catch(() => {});
    if (this.master.gain.value < 0.5) this.ramp(this.master.gain, 0.9, 0.3);
    return true;
  }

  // Rising airy tone while the entry circle is being drawn
  drawStart() {
    if (!this.unlock() || this.draw) return;
    const { ctx } = this; const t = ctx.currentTime;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.035, t + 0.3);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600; lp.Q.value = 2;
    const oscs = [0, 7, 12].map((iv) => {
      const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = mtof(50 + iv); o.connect(lp); o.start(t); return o;
    });
    lp.connect(g); g.connect(this.master); g.connect(this.reverb);
    this.draw = { g, lp, oscs };
  }
  drawUpdate(p) {
    if (!this.draw) return;
    this.ramp(this.draw.lp.frequency, 600 + p * 2600, 0.06);
    this.draw.oscs.forEach((o, i) => this.ramp(o.frequency, mtof(50 + [0, 7, 12][i] + p * 12), 0.08));
  }
  drawEnd() {
    if (!this.draw) return;
    const { g, oscs } = this.draw; const t = this.ctx.currentTime;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    oscs.forEach((o) => o.stop(t + 0.55));
    this.draw = null;
    if (!this.enabled) this.ramp(this.master.gain, 0, 0.6);
  }

  // Keyboard alternative to drawing: hold Enter / Space
  holdStart() { this.drawStart(); }
  holdUpdate(p) { this.drawUpdate(p); }
  holdEnd() { this.drawEnd(); }

  // Glass breaking, then a warm chord blooming into the music
  shatter() {
    if (!this.ctx) return;
    const { ctx } = this; const t = ctx.currentTime;
    const noise = ctx.createBufferSource(); noise.buffer = this.whiteBuffer || (this.whiteBuffer = this.white(2));
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2500;
    const ng = ctx.createGain(); ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(0.09, t + 0.008); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    noise.connect(hp).connect(ng); ng.connect(this.master); ng.connect(this.reverb);
    noise.start(t); noise.stop(t + 0.7);
    for (let k = 0; k < 22; k++) {
      const tt = t + Math.random() * 0.9 * Math.pow(Math.random(), 1.5);
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = 2200 + Math.random() * 5200;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, tt);
      g.gain.exponentialRampToValueAtTime(0.012 + Math.random() * 0.012, tt + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.18 + Math.random() * 0.5);
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) { pan.pan.value = Math.random() * 2 - 1; o.connect(g).connect(pan); pan.connect(this.master); pan.connect(this.reverb); }
      else { o.connect(g); g.connect(this.master); }
      o.start(tt); o.stop(tt + 0.8);
    }
    // bloom
    [50, 57, 62, 66, 69, 74].forEach((m, i) => {
      const tt = t + 0.35 + i * 0.06;
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = mtof(m);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, tt);
      g.gain.exponentialRampToValueAtTime(0.03, tt + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, tt + 5);
      o.connect(g); g.connect(this.master); g.connect(this.reverb);
      o.start(tt); o.stop(tt + 5.1);
    });
  }
  breakGround() { this.shatter(); }
}

const audio = new AudioEngine();
export default audio;
