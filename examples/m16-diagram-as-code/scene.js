/**
 * Diagram as code: Mermaid text -> SVG -> animated reveal.
 *
 * The point of this method is that layout is not your problem. You write the
 * relationships as text; the engine places the boxes and routes the edges. Add a
 * node and everything reflows — which is exactly what makes technical diagrams
 * cheap enough to put in a video at all.
 *
 * Mermaid emits a static SVG, so the animation is done afterwards by walking the
 * generated nodes and edge paths: nodes stagger in, edges draw themselves with
 * stroke-dashoffset. Nothing is hand-positioned.
 */

import mermaid from "./node_modules/mermaid/dist/mermaid.esm.mjs";

const FPS = 30;
const DURATION_IN_FRAMES = 300;

const DEFINITION = `flowchart TD
  A["Script script.json"] --> B{"Pick a method per beat"}
  B -->|data| C["m10 Vega + D3"]
  B -->|concept| D["m04 Manim"]
  B -->|title| E["m13 Kinetic type"]
  B -->|mood| F["m15 Shader"]
  C --> G["ffmpeg concat"]
  D --> G
  E --> G
  F --> G
  G --> H["Final cut 1080x1920"]`;

/** Shown in the source panel, typed out one line at a time. */
const SOURCE_LINES = [
  ["flowchart TD", true],
  ['  A["Script"] --> B{"Pick a method per beat"}', false],
  ['  B -->|data| C["m10 Vega + D3"]', false],
  ['  B -->|concept| D["m04 Manim"]', false],
  ['  B -->|title| E["m13 Kinetic type"]', false],
  ['  B -->|mood| F["m15 Shader"]', false],
  ["  C & D & E & F --> G[\"ffmpeg concat\"]", false],
  ['  G --> H["Final cut 1080x1920"]', false],
];

const SOURCE_FROM = 22;
const SOURCE_PER_LINE = 9;
const NODES_FROM = 118;
const NODE_STAGGER = 9;
const EDGES_FROM = 150;
const EDGE_STAGGER = 6;

const el = (id) => document.getElementById(id);

// anim.js is a classic script loaded before this module, so its exports are on
// `window` by the time module code runs.
const { interpolate, Ease } = window;

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  fontFamily: '"Noto Sans SC", sans-serif',
  flowchart: { curve: "basis", nodeSpacing: 46, rankSpacing: 62, padding: 14, useMaxWidth: false },
  theme: "base",
  themeVariables: {
    darkMode: true,
    background: "#08080C",
    primaryColor: "#141A28",
    primaryTextColor: "#EEF2FA",
    primaryBorderColor: "#3A4A66",
    secondaryColor: "#182236",
    tertiaryColor: "#101725",
    lineColor: "#7CD4FF",
    fontSize: "26px",
  },
});

const { svg } = await mermaid.render("pipeline", DEFINITION);
el("chart").innerHTML = svg;

const svgRoot = el("chart").querySelector("svg");
svgRoot.removeAttribute("width");
svgRoot.removeAttribute("height");
svgRoot.style.width = "1000px";

const nodes = Array.from(svgRoot.querySelectorAll("g.node"));
const edges = Array.from(svgRoot.querySelectorAll("path.flowchart-link, .edgePath path"));
const labels = Array.from(svgRoot.querySelectorAll("g.edgeLabel"));

for (const edge of edges) {
  const length = edge.getTotalLength();
  edge.style.strokeDasharray = String(length);
  edge.dataset.length = String(length);
}

window.SCENE_META = { width: 1080, height: 1920, fps: FPS, durationInFrames: DURATION_IN_FRAMES };

window.seekFrame = (frame) => {
  el("kicker").style.opacity = String(interpolate(frame, [4, 20], [0, 1], Ease.outCubic));
  el("title").style.opacity = String(interpolate(frame, [8, 30], [0, 1], Ease.outCubic));
  el("source").style.opacity = String(interpolate(frame, [16, 34], [0, 1], Ease.outCubic));
  el("source").style.translate = `0 ${interpolate(frame, [16, 40], [20, 0], Ease.outCubic)}px`;

  // Source types in line by line; the caret blinks while it does.
  const shown = Math.floor(interpolate(frame, [SOURCE_FROM, SOURCE_FROM + SOURCE_PER_LINE * SOURCE_LINES.length], [0, SOURCE_LINES.length], Ease.linear));
  const typing = shown < SOURCE_LINES.length;
  el("src-text").innerHTML =
    SOURCE_LINES.slice(0, shown)
      .map(([text, keyword]) => (keyword ? `<b>${text}</b>` : text))
      .join("\n") + (typing && Math.floor(frame / 8) % 2 === 0 ? '\n<span id="caret">▊</span>' : "");

  nodes.forEach((node, index) => {
    const start = NODES_FROM + index * NODE_STAGGER;
    node.style.opacity = String(interpolate(frame, [start, start + 12], [0, 1], Ease.outCubic));
    node.style.transformBox = "fill-box";
    node.style.transformOrigin = "center";
    node.style.scale = String(interpolate(frame, [start, start + 18], [0.72, 1], Ease.outBack));
  });

  edges.forEach((edge, index) => {
    const start = EDGES_FROM + index * EDGE_STAGGER;
    const length = Number(edge.dataset.length);
    edge.style.strokeDashoffset = String(
      interpolate(frame, [start, start + 20], [length, 0], Ease.outCubic),
    );
  });

  labels.forEach((label, index) => {
    const start = EDGES_FROM + index * EDGE_STAGGER + 12;
    label.style.opacity = String(interpolate(frame, [start, start + 12], [0, 1], Ease.outCubic));
  });

  el("foot").style.opacity = String(interpolate(frame, [252, 274], [0, 1], Ease.outCubic));
};

window.seekFrame(0);
