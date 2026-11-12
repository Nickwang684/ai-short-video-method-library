/**
 * Tiny animation helpers shared by the frame-locked HTML scenes.
 *
 * Loaded with a plain <script src>, so the exports land on `window`. Wrapped in
 * an IIFE on purpose: a top-level `const` in a classic script becomes a global
 * lexical binding, and a scene that later writes `const { interpolate } = window`
 * would then die with "Identifier already declared".
 */

(() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const Ease = {
    linear: (t) => t,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    outQuint: (t) => 1 - Math.pow(1 - t, 5),
    outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    inOutQuint: (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2),
    outBack: (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
    outElastic: (t) =>
      t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin(((t * 10 - 0.75) * 2 * Math.PI) / 3) + 1,
  };

  /**
   * Maps `input` through a keyframe ladder, like Remotion's interpolate().
   * Clamps at both ends and applies `ease` within each segment.
   */
  const interpolate = (input, inputRange, outputRange, ease = Ease.linear) => {
    if (inputRange.length !== outputRange.length) {
      throw new Error("interpolate: ranges must be the same length");
    }
    if (input <= inputRange[0]) return outputRange[0];
    const last = inputRange.length - 1;
    if (input >= inputRange[last]) return outputRange[last];

    for (let index = 0; index < last; index++) {
      const from = inputRange[index];
      const to = inputRange[index + 1];
      if (input >= from && input <= to) {
        const progress = to === from ? 1 : (input - from) / (to - from);
        const eased = ease(clamp(progress, 0, 1));
        return outputRange[index] + (outputRange[index + 1] - outputRange[index]) * eased;
      }
    }
    return outputRange[last];
  };

  /** Deterministic PRNG (mulberry32) — same seed, same sequence, every run. */
  const seededRandom = (seed) => {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /** Smooth 2D value noise with fBm octaves. Enough for flow fields. */
  const makeNoise2D = (seed) => {
    const random = seededRandom(seed);
    const table = new Float32Array(256 * 256);
    for (let index = 0; index < table.length; index++) {
      table[index] = random();
    }
    const smooth = (t) => t * t * (3 - 2 * t);
    const at = (x, y) => table[((y & 255) << 8) | (x & 255)];

    const noise = (x, y) => {
      const x0 = Math.floor(x);
      const y0 = Math.floor(y);
      const fx = smooth(x - x0);
      const fy = smooth(y - y0);
      const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * fx;
      const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * fx;
      return top + (bottom - top) * fy;
    };

    return (x, y, octaves = 3) => {
      let sum = 0;
      let amplitude = 1;
      let total = 0;
      let frequency = 1;
      for (let octave = 0; octave < octaves; octave++) {
        sum += noise(x * frequency, y * frequency) * amplitude;
        total += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }
      return sum / total;
    };
  };

  window.Ease = Ease;
  window.clampValue = clamp;
  window.interpolate = interpolate;
  window.seededRandom = seededRandom;
  window.makeNoise2D = makeNoise2D;
})();
