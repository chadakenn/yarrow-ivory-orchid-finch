import { spawn } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, statSync, copyFileSync } from "node:fs";
import { unlink, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const PY_WORK = join(SCRIPT_DIR, "mill-workspace.py");
export const PY_MEDIA = join(SCRIPT_DIR, "mill-media.py");
export const PY_DATA = join(SCRIPT_DIR, "mill-data.py");
export const PY_CLOCK = join(SCRIPT_DIR, "mill-clock.py");
export const PY_WATCH = join(SCRIPT_DIR, "mill-watchdog.py");
export const APP_ROOT = resolve(SCRIPT_DIR, "..");

export function millDataRoot() {
  if (process.env.MILL_DATA) return resolve(process.env.MILL_DATA);
  if (APP_ROOT.startsWith("/opt/breakroom")) {
    try {
      mkdirSync("/opt/breakroom-data", { recursive: true });
      return "/opt/breakroom-data";
    } catch {
      /* fall through */
    }
  }
  const local = join(APP_ROOT, "data");
  mkdirSync(local, { recursive: true });
  return local;
}

export function millEnv() {
  const data = millDataRoot();
  mkdirSync(join(data, "media"), { recursive: true });
  mkdirSync(join(data, "backups"), { recursive: true });
  mkdirSync(join(data, "updates"), { recursive: true });
  mkdirSync(join(data, "trash"), { recursive: true });
  process.env.MILL_APP = process.env.MILL_APP || APP_ROOT;
  process.env.MILL_DATA = data;
  const nested = join(APP_ROOT, "data");
  if (resolve(nested) !== resolve(data)) {
    for (const name of ["kiosk-board.json", "kiosk-decks.json"]) {
      const src = join(nested, name);
      const dest = join(data, name);
      if (existsSync(src) && !existsSync(dest)) copyFileSync(src, dest);
    }
  }
  return { app: process.env.MILL_APP, data };
}

export function runPython(script, args) {
  const { app, data } = millEnv();
  return new Promise((resolvePromise, reject) => {
    const child = spawn("python3", [script, ...args], {
      cwd: APP_ROOT,
      env: { ...process.env, MILL_APP: app, MILL_DATA: data },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const out = [];
    const err = [];
    child.stdout.on("data", (chunk) => out.push(chunk));
    child.stderr.on("data", (chunk) => err.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      const stdout = Buffer.concat(out).toString("utf8").trim();
      const stderr = Buffer.concat(err).toString("utf8").trim();
      if (code !== 0) {
        try {
          const parsed = JSON.parse(stdout);
          reject(new Error(parsed.message || stderr || stdout || `python ${args[0]} failed`));
          return;
        } catch {
          reject(new Error(shortError(stderr || stdout || `python ${args[0]} failed`)));
        }
      } else resolvePromise(stdout);
    });
  });
}

function extractZipScripts(zipPath) {
  const dir = join(tmpdir(), `mill-healer-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  const code = [
    "import zipfile, sys, os",
    "z = zipfile.ZipFile(sys.argv[1])",
    "dest = sys.argv[2]",
    "wanted = ('scripts/mill-workspace.py', 'scripts/mill_lib.py')",
    "for name in z.namelist():",
    "    norm = name.replace('\\\\', '/').lstrip('/')",
    "    for key in wanted:",
    "        if norm == key or norm.endswith('/' + key):",
    "            open(os.path.join(dest, os.path.basename(key)), 'wb').write(z.read(name))",
  ].join("\n");
  return new Promise((resolvePromise, reject) => {
    const child = spawn("python3", ["-c", code, zipPath, dir], { stdio: ["ignore", "pipe", "pipe"] });
    const err = [];
    child.stderr.on("data", (chunk) => err.push(chunk));
    child.on("error", reject);
    child.on("close", (codeValue) => {
      const script = join(dir, "mill-workspace.py");
      if (codeValue === 0 && existsSync(script)) resolvePromise(script);
      else reject(new Error(Buffer.concat(err).toString("utf8") || "Could not read installer from zip."));
    });
  });
}

export function shortError(text) {
  const line = String(text)
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .find((row) => /permission|denied|cannot|failed|error|LibreOffice/i.test(row));
  return line || String(text).slice(-240);
}

function readBody(req, limit = 90 * 1024 * 1024) {
  return new Promise((resolvePromise, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("File is too large. Keep it under 90 MB."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolvePromise(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function extractPart(buf, contentType) {
  const type = String(contentType || "");
  if (!type.includes("multipart/form-data")) {
    return { name: "upload.bin", body: buf };
  }
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(type);
  const boundary = match ? match[1] || match[2] : "";
  if (!boundary) return { name: "upload.bin", body: buf };
  const marker = `--${boundary}`;
  const raw = buf.toString("binary");
  for (const part of raw.split(marker)) {
    const splitAt = part.indexOf("\r\n\r\n");
    if (splitAt < 0) continue;
    const headers = part.slice(0, splitAt);
    if (!/filename=/i.test(headers)) continue;
    const fileMatch = /filename="([^"]+)"/i.exec(headers);
    let data = part.slice(splitAt + 4);
    if (data.startsWith("\r\n")) data = data.slice(2);
    if (data.endsWith("\r\n")) data = data.slice(0, -2);
    if (data.endsWith("--")) data = data.slice(0, -2);
    if (data.endsWith("\r\n")) data = data.slice(0, -2);
    return { name: fileMatch?.[1] || "upload.bin", body: Buffer.from(data, "binary") };
  }
  return { name: "upload.bin", body: buf };
}

function json(res, status, body) {
  const data = Buffer.from(JSON.stringify(body));
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(data);
}

function sendFile(res, filePath) {
  const ext = extname(filePath).toLowerCase();
  const types = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  res.statusCode = 200;
  res.setHeader("content-type", types[ext] || "application/octet-stream");
  res.setHeader("cache-control", "public, max-age=86400");
  createReadStream(filePath).pipe(res);
}

function mediaFile(urlPath) {
  const { data } = millEnv();
  const rel = decodeURIComponent(urlPath.replace(/^\/media\/?/, ""));
  if (!rel || rel.includes("..")) return null;
  const file = resolve(join(data, "media"), rel);
  const root = resolve(join(data, "media"));
  if (relative(root, file).startsWith("..")) return null;
  if (!existsSync(file) || !statSync(file).isFile()) return null;
  return file;
}

let watchdogStarted = false;
export function startWatchdog() {
  // One systemd mill-watchdog.service, living in /opt/breakroom-watchdog.
  // Do not spawn a detached copy on every Vite or mill-server restart.
  watchdogStarted = true;
}

export async function handleMillRequest(req, res, hooks = {}) {
  const pathOnly = (req.url ?? "").split("?", 1)[0];
  const method = (req.method ?? "GET").toUpperCase();
  try {
    if (method === "GET" && pathOnly.startsWith("/media/")) {
      const file = mediaFile(pathOnly);
      if (!file) {
        res.statusCode = 404;
        res.end("missing");
        return true;
      }
      sendFile(res, file);
      return true;
    }
    if ((pathOnly === "/api/mill-workspace.zip" || pathOnly === "/api/mill-workspace") && (method === "GET" || method === "HEAD")) {
      res.statusCode = 200;
      res.setHeader("content-type", "application/zip");
      res.setHeader("content-disposition", 'attachment; filename="nb-breakroom-display.zip"');
      res.setHeader("cache-control", "no-store");
      res.setHeader("access-control-expose-headers", "content-disposition, content-type, content-length");
      if (method === "HEAD") {
        res.end();
        return true;
      }
      const packed = (await runPython(PY_WORK, ["pack"])).split("\n").filter(Boolean).pop();
      if (!packed || !existsSync(packed)) {
        json(res, 500, { ok: false, message: "Could not pack the mill zip." });
        return true;
      }
      const size = statSync(packed).size;
      res.setHeader("content-length", String(size));
      const stream = createReadStream(packed);
      stream.on("close", () => {
        unlink(packed).catch(() => {});
      });
      stream.on("error", () => {
        if (!res.headersSent) json(res, 500, { ok: false, message: "Could not read the mill zip." });
      });
      stream.pipe(res);
      return true;
    }
    if (pathOnly === "/api/mill-update" && method === "GET") {
      json(res, 200, JSON.parse(await runPython(PY_WORK, ["status"])));
      return true;
    }
    if (pathOnly === "/api/mill-log" && method === "POST") {
      const raw = JSON.parse((await readBody(req, 32 * 1024)).toString("utf8") || "{}");
      json(res, 200, JSON.parse(await runPython(PY_DATA, ["log", String(raw.event || "note"), String(raw.detail || "")])));
      return true;
    }
    if (pathOnly === "/api/mill-log" && method === "GET") {
      json(res, 200, JSON.parse(await runPython(PY_DATA, ["read-log"])));
      return true;
    }
    if (pathOnly === "/api/mill-snapshots" && method === "GET") {
      json(res, 200, JSON.parse(await runPython(PY_DATA, ["list"])));
      return true;
    }
    if (pathOnly === "/api/mill-snapshot" && method === "POST") {
      json(res, 200, JSON.parse(await runPython(PY_DATA, ["log", "snapshot-manual", "Saved mill snapshot"])));
      return true;
    }
    if (pathOnly === "/api/mill-restore" && method === "POST") {
      const raw = JSON.parse((await readBody(req, 8 * 1024)).toString("utf8") || "{}");
      if (!raw.name) {
        json(res, 400, { ok: false, message: "Pick a snapshot." });
        return true;
      }
      const out = JSON.parse(await runPython(PY_DATA, ["restore", raw.name]));
      json(res, out.ok === false ? 500 : 200, out);
      return true;
    }
    if (pathOnly === "/api/mill-persist" && method === "GET") {
      json(res, 200, JSON.parse(await runPython(PY_DATA, ["persist"])));
      return true;
    }
    if (pathOnly === "/api/mill-clock" && method === "GET") {
      json(res, 200, JSON.parse(await runPython(PY_CLOCK, ["status"])));
      return true;
    }
    if (pathOnly === "/api/mill-clock" && method === "POST") {
      const raw = JSON.parse((await readBody(req, 8 * 1024)).toString("utf8") || "{}");
      const epoch = String(raw.epochMs || Date.now());
      json(res, 200, JSON.parse(await runPython(PY_CLOCK, ["sync", epoch])));
      return true;
    }
    if (pathOnly === "/api/mill-rollback" && method === "POST") {
      const result = JSON.parse(await runPython(PY_WORK, ["rollback"]));
      json(res, result.ok === false ? 500 : 200, result);
      if (result.ok && hooks.restart) setTimeout(() => hooks.restart(), 800);
      return true;
    }
    if (pathOnly === "/api/mill-workspace" && method === "POST") {
      const extracted = extractPart(await readBody(req), req.headers["content-type"]);
      if (!extracted.body || extracted.body.length < 64 || extracted.body[0] !== 0x50 || extracted.body[1] !== 0x4b) {
        json(res, 400, { ok: false, message: "That file is not a zip. Download the grok-workspace zip and try again." });
        return true;
      }
      const tmp = join(tmpdir(), `mill-upload-${Date.now()}.zip`);
      await writeFile(tmp, extracted.body);
      const dest = hooks.root || APP_ROOT;
      let script = PY_WORK;
      try {
        script = await extractZipScripts(tmp);
      } catch {
        script = PY_WORK;
      }
      const raw = await runPython(script, ["apply", tmp, dest]);
      unlink(tmp).catch(() => {});
      const result = JSON.parse(raw);
      if (result.ok === false) {
        json(res, 500, result);
        return true;
      }
      json(res, 200, result);
      if (hooks.restart) setTimeout(() => hooks.restart(), 1200);
      return true;
    }
    if (pathOnly === "/api/mill-media" && method === "POST") {
      const extracted = extractPart(await readBody(req), req.headers["content-type"]);
      if (!extracted.body || extracted.body.length < 32) {
        json(res, 400, { ok: false, message: "No file attached." });
        return true;
      }
      const safeName = (extracted.name || "slide.bin").replace(/[^A-Za-z0-9._-]/g, "_");
      const tmp = join(tmpdir(), `mill-slide-${Date.now()}-${safeName}`);
      await writeFile(tmp, extracted.body);
      const deckId = `deck_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      const raw = await runPython(PY_MEDIA, ["ingest", tmp, deckId, extracted.name || safeName]);
      unlink(tmp).catch(() => {});
      const result = JSON.parse(raw);
      json(res, result.ok === false ? 500 : 200, result);
      return true;
    }
    if (pathOnly === "/api/mill-media/person" && method === "POST") {
      const extracted = extractPart(await readBody(req), req.headers["content-type"]);
      if (!extracted.body || extracted.body.length < 32) {
        json(res, 400, { ok: false, message: "No photo attached." });
        return true;
      }
      const personId = String(extracted.name || `person_${Date.now()}`).replace(/[^A-Za-z0-9._-]/g, "_");
      const tmp = join(tmpdir(), `mill-person-${Date.now()}.jpg`);
      await writeFile(tmp, extracted.body);
      const raw = await runPython(PY_MEDIA, ["person", tmp, personId]);
      unlink(tmp).catch(() => {});
      const result = JSON.parse(raw);
      json(res, result.ok === false ? 500 : 200, result);
      return true;
    }
    if (pathOnly.startsWith("/api/mill-media/") && method === "DELETE") {
      const id = decodeURIComponent(pathOnly.slice("/api/mill-media/".length));
      json(res, 200, JSON.parse(await runPython(PY_MEDIA, ["remove", id])));
      return true;
    }
    if (pathOnly === "/api/mill-cleanup" && (method === "POST" || method === "GET")) {
      json(res, 200, JSON.parse(await runPython(PY_WORK, ["clean-temp"])));
      return true;
    }
    if (pathOnly === "/api/mill-pi" && method === "GET") {
      const { readPiStats } = await import("./mill-pi.mjs");
      json(res, 200, await readPiStats());
      return true;
    }
    if (pathOnly === "/api/mill-reboot" && method === "POST") {
      json(res, 200, { ok: true, message: "Pi is rebooting. The TV will be back in about a minute." });
      setTimeout(() => {
        const helper = join(SCRIPT_DIR, "mill-reboot.sh");
        const run = (cmd, args) => {
          try {
            const child = spawn(cmd, args, { stdio: "ignore", detached: true });
            child.on("error", () => {});
            child.unref();
          } catch {
            /* try the next command */
          }
        };
        if (existsSync(helper)) {
          run("sudo", ["-n", helper]);
          run(helper, []);
        }
        run("sudo", ["-n", "reboot"]);
      }, 900);
      return true;
    }
    return false;
  } catch (err) {
    json(res, 500, { ok: false, message: err instanceof Error ? shortError(err.message) : "Mill update failed." });
    return true;
  }
}
