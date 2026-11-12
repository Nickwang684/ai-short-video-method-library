/**
 * GSAP scene, frame-locked for deterministic capture.
 *
 * The trick that makes GSAP usable as a video renderer: build a PAUSED timeline,
 * kill the ticker, then drive it with `tl.time(frame / fps)`. GSAP renders
 * synchronously at that exact time, so frame N is always identical.
 */

const FPS = 30;
const DURATION_S = 9;
const COLS = 5;
const ROWS = 4;
const TILE = 140;
const GAP = 24;
const PANEL_PAD = 30;
const TRACK_WIDTH = 840;

const ACCENTS = ["#4A9EFF", "#FFB84D", "#4ADE80", "#A78BFA", "#7CD4FF"];

/** Timeline blocks, mirrored into the on-screen timeline panel below. */
const TRACKS = [
  { label: "title", color: "#4A9EFF", top: 58, blocks: [[0.0, 0.9]] },
  { label: "grid", color: "#A78BFA", top: 100, blocks: [[0.6, 2.6], [2.6, 4.0], [4.4, 5.8]] },
  { label: "arc + text", color: "#4ADE80", top: 142, blocks: [[3.4, 4.4], [6.0, 7.2]] },
];

const buildTiles = () => {
  const host = document.getElementById("tiles");
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.style.left = `${col * (TILE + GAP)}px`;
      tile.style.top = `${row * (TILE + GAP)}px`;
      host.appendChild(tile);
    }
  }
  return Array.from(host.children);
};

const buildCaption = (text) => {
  const host = document.getElementById("caption");
  return Array.from(text).map((char) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? " " : char;
    host.appendChild(span);
    return span;
  });
};

const buildTrackPanel = () => {
  const host = document.getElementById("tracks");
  for (const track of TRACKS) {
    const row = document.createElement("div");
    row.className = "trackrow";
    row.style.top = `${track.top}px`;
    for (const [from, to] of track.blocks) {
      const block = document.createElement("div");
      block.className = "block";
      block.style.left = `${(from / DURATION_S) * TRACK_WIDTH}px`;
      block.style.width = `${((to - from) / DURATION_S) * TRACK_WIDTH}px`;
      block.style.background = track.color;
      row.appendChild(block);
    }
    const lastEnd = track.blocks[track.blocks.length - 1][1];
    const label = document.createElement("div");
    label.className = "tracklabel";
    label.textContent = track.label;
    label.style.left = `${(lastEnd / DURATION_S) * TRACK_WIDTH + 16}px`;
    label.style.color = track.color;
    row.appendChild(label);
    host.appendChild(row);
  }
};

const tiles = buildTiles();
const captionChars = buildCaption("One timeline runs it all");
buildTrackPanel();

const arc = document.getElementById("arcpath");
const arcLength = 2 * Math.PI * 82;
arc.style.strokeDasharray = String(arcLength);

// Determinism: no ticker, no lag smoothing, no wall clock.
gsap.ticker.remove(gsap.updateRoot);
gsap.ticker.lagSmoothing(0);

const tl = gsap.timeline({ paused: true });

tl.fromTo("#kicker", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0)
  .fromTo("#title", { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.9, ease: "back.out(1.6)" }, 0.15)
  .fromTo("#sub", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.45);

// Signature GSAP move: grid-aware stagger radiating from the centre.
tl.fromTo(
  tiles,
  { scale: 0, opacity: 0, rotate: -35 },
  {
    scale: 1,
    opacity: 1,
    rotate: 0,
    duration: 0.9,
    ease: "back.out(2.2)",
    stagger: { grid: [ROWS, COLS], from: "center", amount: 1.1 },
  },
  0.6,
);

// Colour wave sweeping left to right, then back to neutral.
tl.to(
  tiles,
  {
    backgroundColor: (index) => ACCENTS[index % ACCENTS.length],
    borderColor: "rgba(255,255,255,0.28)",
    duration: 0.5,
    ease: "power2.inOut",
    stagger: { grid: [ROWS, COLS], from: "start", amount: 0.9 },
  },
  2.6,
);

tl.fromTo(arc, { strokeDashoffset: arcLength }, { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut" }, 3.4);

// Same tiles, different orchestration: a rolling wave using per-item stagger.
tl.to(
  tiles,
  {
    y: (index) => (index % COLS) * -18,
    rotate: (index) => ((index % COLS) - 2) * 8,
    scale: 0.86,
    duration: 0.7,
    ease: "power2.inOut",
    stagger: { grid: [ROWS, COLS], from: "edges", amount: 0.7 },
  },
  4.4,
);

tl.fromTo(
  captionChars,
  { opacity: 0, y: 34, rotateX: -70 },
  { opacity: 1, y: 0, rotateX: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.055 },
  6.0,
);

const playhead = document.getElementById("playhead");
const clock = document.getElementById("tlclock");

window.SCENE_META = { width: 1080, height: 1920, fps: FPS, durationInFrames: DURATION_S * FPS };

window.seekFrame = (frame) => {
  const time = frame / FPS;
  tl.time(time);
  playhead.style.left = `${PANEL_PAD + (time / DURATION_S) * TRACK_WIDTH}px`;
  clock.textContent = `${time.toFixed(2)}s`;
};

window.seekFrame(0);
