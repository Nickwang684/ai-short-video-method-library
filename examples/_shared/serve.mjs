/**
 * Minimal static server for the capture harness.
 *
 * Scenes are loaded over http:// rather than file:// because Chromium blocks ES
 * module imports, `fetch()` and workers on file:// origins — which rules out
 * Three.js, Lottie JSON, Vega and map tiles. One tiny server removes the whole
 * class of problem.
 */

import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".wasm": "application/wasm",
  ".geojson": "application/geo+json; charset=utf-8",
  ".pbf": "application/x-protobuf",
};

/**
 * Walks up from the scene file to the nearest directory holding `_shared`, so
 * that `../_shared/anim.js` resolves. Falls back to the scene's own directory.
 */
export const findServerRoot = (scenePath) => {
  let directory = path.dirname(path.resolve(scenePath));
  for (let depth = 0; depth < 6; depth++) {
    if (existsSync(path.join(directory, "_shared"))) {
      return directory;
    }
    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  return path.dirname(path.resolve(scenePath));
};

/** Serves `root` on an ephemeral port. Returns the origin and a stop function. */
export const serveDirectory = async (root) => {
  const server = http.createServer((request, response) => {
    const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const target = path.join(root, requestPath);

    // Refuse anything that escapes the root.
    if (!target.startsWith(root) || !existsSync(target) || statSync(target).isDirectory()) {
      response.writeHead(404).end("not found");
      return;
    }

    response.writeHead(200, {
      "content-type": MIME_TYPES[path.extname(target).toLowerCase()] ?? "application/octet-stream",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    });
    createReadStream(target).pipe(response);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  return {
    origin: `http://127.0.0.1:${port}`,
    stop: () => new Promise((resolve) => server.close(resolve)),
  };
};

/** Full URL for a scene file, given the root the server is bound to. */
export const sceneUrl = (origin, root, scenePath) =>
  `${origin}/${path.relative(root, path.resolve(scenePath)).split(path.sep).join("/")}`;
