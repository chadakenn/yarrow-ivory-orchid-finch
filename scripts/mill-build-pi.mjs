#!/usr/bin/env node
/**
 * Pi client build. Writes dist/client for mill-server.mjs.
 * The mill TV still runs Vite until MILL_PROD=1 and dist/client exists.
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const result = spawnSync("node", ["scripts/with-app-env.mjs", "vite", "build"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
if (result.status !== 0) process.exit(result.status || 1);

const dest = join(root, "dist", "client");
const candidates = [
  dest,
  join(root, ".output", "public"),
  join(root, ".vercel", "output", "static"),
];

function hasIndex(dir) {
  return existsSync(join(dir, "index.html"));
}

if (hasIndex(dest)) {
  console.log(`[build:pi] mill TV client is in ${dest}`);
  process.exit(0);
}

const src = candidates.find((dir) => dir !== dest && hasIndex(dir));
if (!src) {
  console.error("build:pi: no index.html after vite build. Stay on Vite (`npm run dev`) for now.");
  process.exit(1);
}
rmSync(dest, { recursive: true, force: true });
mkdirSync(join(root, "dist"), { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`[build:pi] copied ${src} → ${dest}`);
