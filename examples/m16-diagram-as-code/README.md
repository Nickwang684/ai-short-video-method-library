# m16 · Diagrams as code (Mermaid)

Write relationships, not coordinates. The engine places the boxes and routes the lines.

## Good at / not good at

**Good at**: **technical diagrams**. Flowcharts, architecture diagrams, sequence diagrams, state machines, ER diagrams. The biggest win is that **layout is not your problem** — add a node and the whole diagram re-flows. That turns "draw a proper architecture diagram in a video" from half an hour into a minute, so explainer videos can actually afford diagrams.

**Not good at**: free layout and artistic expression. Mermaid has its own aesthetic; forcing it into a brand style is harder than hand-writing SVG with [m01](../m01-gsap-html/).

## Key technique

Mermaid outputs a **static SVG**. The animation happens afterwards — walk the nodes and edges it generated and stagger their entrances:

```js
const {svg} = await mermaid.render('pipeline', definition);
chart.innerHTML = svg;

const nodes = svgRoot.querySelectorAll('g.node');
const edges = svgRoot.querySelectorAll('path.flowchart-link, .edgePath path');
// nodes: staggered opacity + scale
// edges: stroke-dasharray = full length, then animate stroke-dashoffset → they draw themselves
```

Not a single pixel is placed by hand.

### Configure the theme yourself

The default theme is unreadable on a dark background. Take over with `theme: 'base'` + `themeVariables`:

```js
themeVariables: {
  darkMode: true, primaryColor: '#141A28', primaryTextColor: '#EEF2FA',
  primaryBorderColor: '#3A4A66', lineColor: '#7CD4FF', fontSize: '26px',
}
```

`flowchart: { useMaxWidth: false }` matters, or the SVG shrinks itself to the container width and the text gets tiny.

### Show the source and the diagram together

The top half of this demo types the `.mmd` source line by line while the diagram grows in the bottom half. **Viewers see "what was written" and "what came out" at the same time** — the best way to present this method, far stronger than the diagram alone.

## Render

```bash
cd m16-diagram-as-code
node ../_shared/capture.mjs scene.html out/video.mp4
```

1080×1920 / 30fps / 10s; 75 seconds on the test laptop.

## Gotchas

- mermaid ships only as ESM (`node_modules/mermaid/dist/mermaid.esm.mjs`), so use `<script type="module">`. Chromium forbids ESM under `file://` — the harness's built-in HTTP server handles that.
- `anim.js` is a classic script and goes **before** the module script: classic scripts run first and modules are deferred, so the module can read `window.interpolate` directly.
- Similar tools: **Graphviz** (`@viz-js/viz`, WASM, stronger layout) and **D2** (nicer looking but needs a binary). The same "generate SVG → animate it" pattern applies directly.
