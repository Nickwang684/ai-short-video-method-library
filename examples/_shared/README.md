# _shared — frame-by-frame browser capture harness

The renderer shared by every method that "makes video with web technology". It seeks a **deterministic** HTML scene one frame at a time, screenshots it, and pipes the frames straight into FFmpeg.

Nothing depends on wall-clock time, so every run gives the same result — the same guarantee Remotion offers, but for any web technology (GSAP / Canvas / WebGL / D3 / Lottie …).

## Scene contract

A scene's HTML only has to expose two things on `window`:

```js
window.SCENE_META = { width: 1080, height: 1920, fps: 30, durationInFrames: 300 };
window.seekFrame  = (frame) => { /* draw exactly this frame; may return a Promise */ };
```

The key discipline: **no CSS transitions / animations, and no `requestAnimationFrame` advancing time on its own**. Every piece of state must be a pure function of `frame`, or captured frames jitter.

For scenes that are stateful by nature and can't be pure functions (particle systems and the like), add `stateful: true` to `SCENE_META` and replay from the start in `seekFrame` when it goes backwards. `still.mjs` sees the flag and walks from frame 0 to the target frame instead of jumping straight there.

## Usage

```bash
npm install && npx playwright install chromium   # once
node ../_shared/capture.mjs scene.html out/video.mp4
node .../capture.mjs scene.html out/video.mp4 --audio voice.mp3   # mux an audio track
node .../capture.mjs scene.html out/video.mp4 --crf 18            # higher bitrate
node .../capture.mjs scene.html out/video.mp4 --png               # lossless frames (5× slower)
node .../capture.mjs scene.html out/video.mp4 --headed            # real GPU (heavy WebGL scenes)
```

Frames default to JPEG q94 — they're re-encoded to H.264 anyway, so there's no visible difference, and it's about 5× faster than PNG (60 frames: 3.8s vs 19.8s).

## One output spec

Every method outputs **1080×1920 / 30fps / H.264 yuv420p / mp4** to its own `out/video.mp4`.
So any two clips can be cut into the same video directly, with no transcoding to match them.
