#!/usr/bin/env node
/**
 * Single-frame check for a frame-locked HTML scene — the cheap way to validate
 * layout and colour before paying for a full capture.
 *
 * Usage:
 *   node still.mjs <scene.html> <out.jpg> --frame 210 [--scale 0.35] [--headed]
 */

import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { findServerRoot, sceneUrl, serveDirectory } from "./serve.mjs";

const CHROMIUM_ARGS = [
  "--force-color-profile=srgb",
  "--font-render-hinting=none",
  "--enable-unsafe-swiftshader",
  "--use-gl=angle",
  "--use-angle=swiftshader",
];

const parseArgs = (argv) => {
  const positional = [];
  const options = { frame: 0, scale: 0.35, headed: false };

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--frame") options.frame = Number(argv[++index]);
    else if (arg === "--scale") options.scale = Number(argv[++index]);
    else if (arg === "--headed") options.headed = true;
    else positional.push(arg);
  }

  if (positional.length < 2) {
    throw new Error("usage: still.mjs <scene.html> <out.jpg> --frame N [--scale 0.35] [--headed]");
  }
  return { scenePath: positional[0], outPath: positional[1], options };
};

const main = async () => {
  const { scenePath, outPath, options } = parseArgs(process.argv.slice(2));
  mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });

  const root = findServerRoot(scenePath);
  const server = await serveDirectory(root);

  const browser = await chromium.launch({ headless: !options.headed, args: CHROMIUM_ARGS });
  const page = await browser.newPage({ viewport: { width: 16, height: 16 } });
  page.on("pageerror", (error) => console.error(`[scene error] ${error.message}`));

  await page.goto(sceneUrl(server.origin, root, scenePath), { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(window.SCENE_META && window.seekFrame));

  const meta = await page.evaluate(() => ({ ...window.SCENE_META }));
  await page.setViewportSize({ width: meta.width, height: meta.height });

  // Stateful scenes (particle systems) only look right if every frame up to the
  // target has been stepped. Stateless ones can jump straight there, which is
  // the difference between a 1-second check and a 60-second one.
  const startFrame = meta.stateful ? 0 : options.frame;
  for (let frame = startFrame; frame <= options.frame; frame++) {
    await page.evaluate(async (current) => {
      await window.seekFrame(current);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }, frame);
  }

  const width = Math.round(meta.width * options.scale);
  await page.screenshot({ path: outPath, type: "jpeg", quality: 62, scale: "css" });
  await browser.close();
  await server.stop();

  // Downscale after the fact so the capture itself stays at native resolution.
  const { spawnSync } = await import("node:child_process");
  spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", outPath, "-vf", `scale=${width}:-1`, "-q:v", "6", outPath], {
    stdio: "inherit",
  });

  console.log(`${outPath}  frame ${options.frame} of ${meta.durationInFrames}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
