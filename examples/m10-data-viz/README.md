# m10 · Data-driven video (Vega-Lite + D3)

The same data, two tools, each doing what it does best.

## Good at / not good at

**Good at**: any topic where "the numbers are the content" — rankings, growth, comparisons, earnings, industry reports. Swap the data and the video is automatically a new one: this is **the only method that scales by copying**.

**Not good at**: storytelling, emotion, people. A chart won't explain "why" for you.

## Division of labour: when to use which

| | Vega-Lite | D3 |
|---|---|---|
| Style | declarative spec (JSON) | imperative, you compute every attribute |
| You get | axes, ticks, legend, scales **all automatic** | nothing, but you can do anything |
| Suited to | standard charts: line, bar, scatter, area, facets | bar-chart races, Sankey, force layouts, custom ranking animation |
| Cost | non-standard animation hits a wall | even a plain line chart takes 50 lines |

**Conclusion**: use Vega-Lite to get "is the chart correct" out of the way, and drop to D3 only when you need non-standard motion.

## Two key techniques

### 1. Re-run Vega-Lite on a data slice every frame

Don't pre-render and wipe it in with a mask — that isn't data-driven. The real approach swaps in a growing slice each frame:

```js
view.data("table", rowsUpTo(count));
await view.runAsync();
```

With an `if (count !== lastCount)` guard, most frames cost nothing. Note `seekFrame` must be `async`; the harness awaits it.

### 2. **Never** use `.transition()` in D3

D3 transitions run on wall-clock time, so frame capture tears. The right way to do a bar race:

```js
const position = interpolate(frame, [RACE_START, RACE_END], [0, PERIODS - 1], Ease.inOutCubic);
const value = series[low] + (series[high] - series[low]) * (position - low);  // interpolate yourself
```

Ranks are also re-sorted from the **interpolated values** — so bars slide past each other instead of jumping.

## Render

```bash
cd m10-data-viz
node ../_shared/capture.mjs scene.html out/video.mp4
```

1080×1920 / 30fps / 10s.

## Where the data comes from

`VALUES` at the top of `scene.js` is sample data (12 weeks × 6 content formats; the numbers are illustrative). For real data just replace that object, or use `await d3.csv("data.csv")` — the harness's HTTP server makes `fetch` work.

## Gotchas

- The UMD builds of vega / vega-lite / d3 live at `node_modules/vega/build/vega.min.js`, `node_modules/vega-lite/build/vega-lite.min.js` and `node_modules/d3/dist/d3.min.js`; a plain `<script src>` is the easiest way in.
- Write `data: { name: "table" }` in the Vega-Lite spec so the compiled Vega spec has a dataset called `table` for `view.data()` to replace.
- `background: null` + `config.view.stroke: null` make the chart background transparent so it blends into a dark card.
