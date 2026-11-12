# m01 · LLM + HTML/CSS/SVG (GSAP)

Choreograph DOM/SVG animation on a GSAP timeline, then capture it frame by frame into a video.

## Good at / not good at

**Good at**: timeline choreography (`tl.to().to()` chains the order of dozens of elements), **stagger** (especially grid ripples like `stagger:{grid:[4,5], from:'center'}`, which are painful by hand), a mature ease library (`back.out(2)`, `elastic`, custom Béziers), SVG stroke drawing and morphing, and UI-style motion. It has the biggest ecosystem: any motion idea already has a recipe.

**Not good at**: 3D (pair it with Three.js), large particle counts (a few thousand DOM elements and it stutters), maths visualisation (Manim does it better), and real footage.

## Key technique: turn GSAP into a deterministic renderer

By default GSAP follows the wall clock, so captured frames jitter. Three lines lock it down:

```js
gsap.ticker.remove(gsap.updateRoot);   // detach the ticker; GSAP no longer advances by itself
gsap.ticker.lagSmoothing(0);           // turn off dropped-frame compensation
const tl = gsap.timeline({ paused: true });
// ...
window.seekFrame = (frame) => tl.time(frame / 30);  // render synchronously at an exact time
```

Also **always use `fromTo`, never `from`/`to`**: `from` uses the "current value" as its end point, which comes out wrong when you seek backwards.

## Render

```bash
cd m01-gsap-html
node ../_shared/capture.mjs scene.html out/video.mp4
```

Output is 1080×1920 / 30fps / 9s. On the test laptop it took about 96 seconds for 270 frames (30 elements with shadows plus a masked gradient is fairly heavy).

## What this demo shows

Grid stagger ripple → a colour wave sweeps across → an SVG ring draws itself → the edge waveform re-flows → characters flip in one by one.
The bottom of the frame is **its own timeline panel**: the coloured blocks on the three tracks are the real tween intervals, and the yellow playhead and timecode are driven directly by `tl.time()` — a literal picture of "GSAP is choreographing time".

## Gotchas

- Since GSAP 3.13, plugins such as SplitText / DrawSVG / MorphSVG are free, but this demo uses none of them (hand-written `stroke-dashoffset` and per-character spans), so there is one less dependency.
- `node_modules/gsap/dist/gsap.min.js` is loaded with a plain `<script src>`; it works from `file://` and is fully offline.
