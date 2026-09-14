#!/usr/bin/env node
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { handleMillRequest, millEnv, startWatchdog, runPython, PY_WORK, PY_MEDIA } from "./mill-http.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = existsSync(join(ROOT, "dist", "client", "index.html")) ? join(ROOT, "dist", "client") : null;
const PORT = Number(process.env.PORT || 8080);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".map": "application/json",
};

function sendStatic(res, file) {
  const type = TYPES[extname(file).toLowerCase()] || "application/octet-stream";
  res.statusCode = 200;
  res.setHeader("content-type", type);
  createReadStream(file).pipe(res);
}

millEnv();
startWatchdog();
setTimeout(() => {
  runPython(PY_WORK, ["health"]).catch(() => {});
  runPython(PY_MEDIA, ["migrate"]).catch(() => {});
}, 2500);

const server = createServer(async (req, res) => {
  try {
    const handled = await handleMillRequest(req, res, { root: ROOT, restart: () => process.exit(0) });
    if (handled) return;
    const urlPath = decodeURIComponent((req.url ?? "/").split("?", 1)[0] || "/");
    if (DIST) {
      const file = urlPath === "/" ? join(DIST, "index.html") : join(DIST, urlPath.replace(/^\/+/, ""));
      if (existsSync(file) && statSync(file).isFile()) {
        sendStatic(res, file);
        return;
      }
      const index = join(DIST, "index.html");
      if (existsSync(index)) {
        sendStatic(res, index);
        return;
      }
    }
    res.statusCode = 404;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Mill TV is missing its built files.");
  } catch (err) {
    res.statusCode = 500;
    res.end(err instanceof Error ? err.message : "mill failed");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[mill-server] ready`);
});
