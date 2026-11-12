/**
 * Data-driven video: the same table rendered two ways.
 *
 * Vega-Lite gets the declarative job — one spec buys correct axes, ticks and
 * scales, and the chart is re-run each frame against a growing slice of the data.
 * D3 gets the bespoke job — a bar chart race, where rank, width and the numbers
 * are all interpolated from the frame index.
 *
 * The rule that makes this work: never call `.transition()`. D3 transitions run
 * on the wall clock, so they would tear under frame-by-frame capture. Compute the
 * interpolated value yourself and set the attribute.
 */

const FPS = 30;
const DURATION_IN_FRAMES = 300;

const SERIES = [
  { key: "Video", color: "#4A9EFF" },
  { key: "Photos", color: "#FFB84D" },
  { key: "Live", color: "#4ADE80" },
  { key: "Charts", color: "#A78BFA" },
  { key: "Articles", color: "#7CD4FF" },
  { key: "Podcasts", color: "#FF7AB2" },
];

/** Illustrative values (12 periods per series). Swap in a real CSV unchanged. */
const VALUES = {
  Video: [42, 51, 63, 72, 88, 96, 112, 131, 148, 162, 181, 204],
  Photos: [88, 92, 95, 97, 101, 104, 106, 111, 115, 118, 122, 127],
  Live: [20, 26, 35, 47, 55, 71, 80, 94, 103, 121, 140, 158],
  Charts: [12, 15, 21, 29, 38, 44, 58, 67, 79, 92, 108, 126],
  Articles: [64, 66, 65, 68, 70, 69, 72, 74, 73, 76, 78, 80],
  Podcasts: [8, 11, 14, 19, 23, 30, 36, 41, 49, 56, 63, 71],
};

const PERIODS = 12;

/** Vega-Lite reveals one period every 10 frames, starting at frame 30. */
const LINE_START = 30;
const LINE_PER_PERIOD = 10;
/** The race runs from frame 80 to 288. */
const RACE_START = 80;
const RACE_END = 288;

const { interpolate, Ease } = window;
const el = (id) => document.getElementById(id);

// ---------------------------------------------------------------- Vega-Lite

const rowsUpTo = (count) => {
  const rows = [];
  for (let period = 0; period < count; period++) {
    for (const series of SERIES) {
      rows.push({ week: period + 1, key: series.key, value: VALUES[series.key][period] });
    }
  }
  return rows;
};

const vegaLiteSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  width: 812,
  height: 400,
  background: null,
  padding: 0,
  data: { name: "table" },
  mark: { type: "line", strokeWidth: 3, point: { filled: true, size: 44 } },
  encoding: {
    x: {
      field: "week",
      type: "quantitative",
      scale: { domain: [1, PERIODS], nice: false },
      axis: { title: null, tickCount: 6, grid: false, labelFontSize: 20, labelColor: "#6E7488" },
    },
    y: {
      field: "value",
      type: "quantitative",
      scale: { domain: [0, 210] },
      axis: {
        title: null,
        tickCount: 4,
        gridColor: "rgba(255,255,255,0.07)",
        labelFontSize: 20,
        labelColor: "#6E7488",
        domain: false,
        ticks: false,
      },
    },
    color: {
      field: "key",
      type: "nominal",
      scale: { domain: SERIES.map((s) => s.key), range: SERIES.map((s) => s.color) },
      legend: {
        orient: "top-left",
        direction: "horizontal",
        columns: 3,
        title: null,
        labelFontSize: 20,
        labelColor: "#A8AFC0",
        symbolStrokeWidth: 3,
      },
    },
  },
  config: {
    view: { stroke: null },
    font: "Noto Sans SC",
    axis: { labelFont: "Cascadia Mono" },
  },
};

let view = null;
let lastLineCount = -1;

const vegaReady = (async () => {
  const compiled = window.vegaLite.compile(vegaLiteSpec).spec;
  view = new window.vega.View(window.vega.parse(compiled), {
    renderer: "svg",
    container: "#chartA",
    hover: false,
  });
  await view.runAsync();
})();

// ----------------------------------------------------------------------- D3

const BAR_HEIGHT = 54;
const BAR_GAP = 22;
const LABEL_WIDTH = 132;
const TRACK_WIDTH = 560;

const svg = window.d3.select("#chartB");
const bars = new Map();

for (const series of SERIES) {
  const group = svg.append("g");
  group.append("rect").attr("x", LABEL_WIDTH).attr("height", BAR_HEIGHT).attr("rx", 10).attr("fill", series.color);
  group
    .append("text")
    .attr("x", LABEL_WIDTH - 16)
    .attr("y", BAR_HEIGHT / 2 + 10)
    .attr("text-anchor", "end")
    .attr("fill", "#D7DCE8")
    .attr("font-size", 27)
    .attr("font-family", '"Noto Sans SC", sans-serif')
    .text(series.key);
  const value = group
    .append("text")
    .attr("y", BAR_HEIGHT / 2 + 10)
    .attr("fill", series.color)
    .attr("font-size", 29)
    .attr("font-weight", 700)
    .attr("font-family", '"Cascadia Mono", monospace');
  bars.set(series.key, { group, rect: group.select("rect"), value });
}

/** Continuous period position, so values and ranks both move smoothly. */
const periodAt = (frame) =>
  interpolate(frame, [RACE_START, RACE_END], [0, PERIODS - 1], Ease.inOutCubic);

const valueAt = (key, position) => {
  const low = Math.floor(position);
  const high = Math.min(PERIODS - 1, low + 1);
  const series = VALUES[key];
  return series[low] + (series[high] - series[low]) * (position - low);
};

const renderRace = (frame) => {
  const position = periodAt(frame);
  const current = SERIES.map((series) => ({ ...series, value: valueAt(series.key, position) }));
  const maxValue = Math.max(...current.map((entry) => entry.value));

  // Ranks come from the interpolated values, so rows slide past each other
  // instead of jumping when the order changes.
  const ordered = [...current].sort((a, b) => b.value - a.value);
  const rankOf = new Map(ordered.map((entry, index) => [entry.key, index]));

  for (const entry of current) {
    const bar = bars.get(entry.key);
    const y = rankOf.get(entry.key) * (BAR_HEIGHT + BAR_GAP) + 8;
    const width = (entry.value / maxValue) * TRACK_WIDTH;

    bar.group.attr("transform", `translate(0,${y})`);
    bar.rect.attr("width", Math.max(2, width));
    bar.value.attr("x", LABEL_WIDTH + width + 16).text(Math.round(entry.value));
  }

  el("f-period").textContent = String(Math.round(position) + 1).padStart(2, "0");
};

// --------------------------------------------------------------------- draw

window.SCENE_META = { width: 1080, height: 1920, fps: FPS, durationInFrames: DURATION_IN_FRAMES };

window.seekFrame = async (frame) => {
  el("kicker").style.opacity = String(interpolate(frame, [2, 18], [0, 1], Ease.outCubic));
  el("title").style.opacity = String(interpolate(frame, [6, 28], [0, 1], Ease.outCubic));
  el("note").style.opacity = String(interpolate(frame, [18, 38], [0, 1], Ease.outCubic));

  el("cardA").style.opacity = String(interpolate(frame, [20, 40], [0, 1], Ease.outCubic));
  el("cardA").style.translate = `0 ${interpolate(frame, [20, 46], [26, 0], Ease.outCubic)}px`;
  el("cardB").style.opacity = String(interpolate(frame, [58, 78], [0, 1], Ease.outCubic));
  el("cardB").style.translate = `0 ${interpolate(frame, [58, 84], [26, 0], Ease.outCubic)}px`;
  el("foot").style.opacity = String(interpolate(frame, [90, 110], [0, 1], Ease.outCubic));

  await vegaReady;

  // Re-run the spec against a growing slice — only when the slice changes, so
  // most frames cost nothing.
  const lineCount = Math.min(
    PERIODS,
    Math.max(1, Math.floor((frame - LINE_START) / LINE_PER_PERIOD) + 1),
  );
  if (lineCount !== lastLineCount) {
    lastLineCount = lineCount;
    view.data("table", rowsUpTo(lineCount));
    await view.runAsync();
  }

  renderRace(frame);
};
