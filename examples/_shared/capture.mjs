#!/usr/bin/env node
/**
 * Frame-locked browser capture.
 *
 * Renders a deterministic HTML scene to an MP4 by seeking one frame at a time
 * and piping each screenshot straight into FFmpeg. Nothing depends on wall
 * clock, so the output is identical on every run — the same guarantee Remotion
 * gives, but for any web technology (GSAP, Canvas, WebGL, D3, Lottie …).
 *
 * A scene must expose on `window`:
 *   SCENE_META = { width, height, fps, durationInFrames }
 *   seekFrame(frame)  — draw exactly that frame; may return a promise
 *
 * Usage:
 *   node capture.mjs <scene.html> <out.mp4> [--audio track.mp3] [--crf 20] [--png] [--headed]
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { findServerRoot, sceneUrl, serveDirectory } from "./serve.mjs";

/** Flags Chromium needs so WebGL works in headless and colours stay sRGB. */
const CHROMIUM_ARGS = [
  "--force-color-profile=srgb",
  "--font-render-hinting=none",
  "--enable-unsafe-swiftshader",
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--disable-frame-rate-limit",
];

const parseArgs = (argv) => {
  const positional = [];
  const options = { crf: "20", headed: false, audio: null, png: false };

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--headed") {
      options.headed = true;
    } else if (arg === "--png") {
      options.png = true;
    } else if (arg === "--audio") {
      options.audio = argv[++index];
    } else if (arg === "--crf") {
      options.crf = argv[++index];
    } else {
      positional.push(arg);
    }
  }

  if (positional.length < 2) {
    throw new Error("usage: capture.mjs <scene.html> <out.mp4> [--audio f] [--crf n] [--png] [--headed]");
  }
  return { scenePath: positional[0], outPath: positional[1], options };
};

const startFfmpeg = (meta, outPath, options) => {
  const args = ["-y", "-f", "image2pipe", "-framerate", String(meta.fps), "-i", "pipe:0"];
  if (options.audio) {
    args.push("-i", options.audio, "-c:a", "aac", "-b:a", "192k", "-shortest");
  }
  args.push(
    // Screenshots are full-range RGB; broadcast-style limited range keeps these
    // clips tonally identical to clips from other renderers when they are cut
    // together. Without this, x264 tags the output yuvj420p and the brightness
    // jumps at the splice.
    "-vf",
    "scale=in_range=full:out_range=tv,format=yuv420p",
    "-color_range",
    "tv",
    "-colorspace",
    "bt709",
    "-color_primaries",
    "bt709",
    "-color_trc",
    "bt709",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    options.crf,
    "-movflags",
    "+faststart",
    ...(process.env.CAPTURE_FFMPEG_THREADS
      ? ["-threads", process.env.CAPTURE_FFMPEG_THREADS]
      : []),
    outPath,
  );

  const ffmpeg = spawn("ffmpeg", args, { stdio: ["pipe", "ignore", "pipe"] });
  let stderr = "";
  ffmpeg.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  ffmpeg.on("error", (error) => {
    throw error;
  });
  return { ffmpeg, getStderr: () => stderr };
};

/** Writes to a stream, respecting backpressure so memory stays flat. */
const write = (stream, buffer) =>
  new Promise((resolve) => {
    if (stream.write(buffer)) {
      resolve();
      return;
    }
    stream.once("drain", resolve);
  });

const main = async () => {
  const { scenePath, outPath, options } = parseArgs(process.argv.slice(2));
  mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });

  if (options.audio && !existsSync(options.audio)) {
    throw new Error(`audio track not found: ${options.audio}`);
  }

  const root = findServerRoot(scenePath);
  const server = await serveDirectory(root);

  const browser = await chromium.launch({ headless: !options.headed, args: CHROMIUM_ARGS });
  const page = await browser.newPage({ viewport: { width: 16, height: 16 } });

  page.on("pageerror", (error) => {
    console.error(`[scene error] ${error.message}`);
  });

  await page.goto(sceneUrl(server.origin, root, scenePath), { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(window.SCENE_META && window.seekFrame));

  const meta = await page.evaluate(() => ({ ...window.SCENE_META }));
  await page.setViewportSize({ width: meta.width, height: meta.height });

  const { ffmpeg, getStderr } = startFfmpeg(meta, outPath, options);
  ffmpeg.stdin.on("error", (error) => {
    console.error(`[ffmpeg stdin] ${error.message}`);
  });
  const shotOptions = options.png ? { type: "png" } : { type: "jpeg", quality: 94 };
  const startedAt = Date.now();

  for (let frame = 0; frame < meta.durationInFrames; frame++) {
    await page.evaluate(async (current) => {
      await window.seekFrame(current);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, frame);

    await write(ffmpeg.stdin, await page.screenshot(shotOptions));

    // Thermal guard: a per-frame pause keeps the CPU from pinning at 100% for
    // the whole render on machines that would otherwise overheat and die.
    const frameDelay = Number(process.env.CAPTURE_FRAME_DELAY_MS || 0);
    if (frameDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, frameDelay));
    }

    if (frame % 30 === 0 || frame === meta.durationInFrames - 1) {
      process.stdout.write(`\rcaptured ${frame + 1}/${meta.durationInFrames}`);
    }
  }

  ffmpeg.stdin.end();
  await browser.close();
  await server.stop();

  const code = await new Promise((resolve) => ffmpeg.on("close", resolve));
  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  process.stdout.write("\n");

  if (code !== 0) {
    console.error(getStderr().split("\n").slice(-20).join("\n"));
    throw new Error(`ffmpeg exited with ${code}`);
  }
  console.log(`${outPath}  ${meta.width}x${meta.height} ${meta.fps}fps  ${meta.durationInFrames} frames  ${seconds}s`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
