import { APP_BUILD } from "@/lib/app-update";
import { APP_VERSION, DEVELOPER } from "@/lib/brand";
import { createZip, readZip } from "@/lib/zip-store";

export const PACK_CACHE = "mill-kiosk";
export const PACK_META_KEY = "nb-mill-pack";
export const PACK_MARK = "mill-pack.json";

const SEED_PATHS = [
  "/",
  "/update",
  "/office",
  "/admin",
  "/favicon.svg",
  "/mill-sw.js",
  "/__grok/manifest.webmanifest",
  "/__grok/icon-180.png",
  "/map/nb-land.jpg",
  "/map/marshville-land.jpg",
  "/map/henderson-land.jpg",
  "/map/albertville-land.jpg",
  "/map/void.jpg",
];

export type PackMeta = {
  name: string;
  build: string;
  created: string;
  version?: string;
  poweredBy?: string;
};

export function readInstalledPack(): PackMeta | null {
  try {
    const raw = localStorage.getItem(PACK_META_KEY);
    return raw ? (JSON.parse(raw) as PackMeta) : null;
  } catch {
    return null;
  }
}

function mimeFor(path: string) {
  if (path.endsWith(".html") || path === "/" || path === "index.html") return "text/html; charset=utf-8";
  if (path.endsWith(".js") || path.endsWith(".mjs")) return "text/javascript; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".json") || path.endsWith(".webmanifest")) return "application/json; charset=utf-8";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".woff2")) return "font/woff2";
  return "application/octet-stream";
}

function toPath(url: URL) {
  if (url.pathname === "/" || url.pathname === "") return "/";
  return url.pathname;
}

function extractUrls(text: string, origin: string) {
  const found = new Set<string>();
  const patterns = [
    /(?:href|src)=["']([^"']+)["']/gi,
    /["'](\/?assets\/[^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
    /from\s+["'](\/[^"']+)["']/g,
    /url\((?:["']?)([^"')]+)(?:["']?)\)/g,
  ];
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text))) {
      const raw = match[1];
      if (!raw || raw.startsWith("data:") || raw.startsWith("blob:") || raw.startsWith("mailto:")) continue;
      try {
        const url = new URL(raw, origin);
        if (url.origin !== origin) continue;
        if (url.pathname.startsWith("/@") || url.pathname.includes("node_modules")) continue;
        found.add(toPath(url));
      } catch {
        /* skip */
      }
    }
  }
  return [...found];
}

export async function collectMillFiles(onProgress?: (done: number, path: string) => void) {
  const origin = window.location.origin;
  const files: Record<string, Uint8Array> = {};
  const seen = new Set<string>();
  const queue = [...SEED_PATHS];

  while (queue.length && seen.size < 220) {
    const path = queue.shift();
    if (!path || seen.has(path)) continue;
    seen.add(path);
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) continue;
      const buf = new Uint8Array(await res.arrayBuffer());
      const name = path === "/" ? "index.html" : path.replace(/^\/+/, "");
      files[name] = buf;
      onProgress?.(Object.keys(files).length, name);
      const type = res.headers.get("content-type") || mimeFor(path);
      if (/html|javascript|css|json|text\//.test(type)) {
        const text = new TextDecoder().decode(buf);
        for (const next of extractUrls(text, origin)) {
          if (!seen.has(next)) queue.push(next);
        }
      }
    } catch {
      /* skip missing */
    }
  }

  const meta: PackMeta = {
    name: "north-baltimore-mill-tv",
    build: APP_BUILD,
    created: new Date().toISOString(),
    version: APP_VERSION,
    poweredBy: DEVELOPER,
  };
  files[PACK_MARK] = new TextEncoder().encode(JSON.stringify(meta));
  return { files, meta };
}

export async function downloadMillPack(onProgress?: (done: number, path: string) => void) {
  const { files, meta } = await collectMillFiles(onProgress);
  const zip = createZip(files);
  const blob = new Blob([asBlobPart(zip)], { type: "application/zip" });
  const stamp = meta.build === "dev" ? "preview" : meta.build;
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = `north-baltimore-mill-tv-${stamp}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 4000);
  return meta;
}

function asBlobPart(data: Uint8Array) {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy;
}

function safePath(name: string) {
  const clean = name.replaceAll("\\", "/").replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.startsWith("/")) return null;
  return clean;
}

export async function installMillPack(file: File, onProgress?: (done: number, total: number) => void) {
  const buf = new Uint8Array(await file.arrayBuffer());
  const files = readZip(buf);
  const mark = files[PACK_MARK] || files[`/${PACK_MARK}`];
  if (!mark) throw new Error("That zip is not a mill pack.");
  let meta: PackMeta;
  try {
    meta = JSON.parse(new TextDecoder().decode(mark)) as PackMeta;
  } catch {
    throw new Error("That zip is not a mill pack.");
  }
  if (meta.name !== "north-baltimore-mill-tv") throw new Error("That zip is not a mill pack.");

  const names = Object.keys(files).filter((name) => safePath(name) && name !== PACK_MARK);
  if (!names.length) throw new Error("That mill pack is empty.");

  const cache = await caches.open(PACK_CACHE);
  const old = await cache.keys();
  await Promise.all(old.map((request) => cache.delete(request)));

  let done = 0;
  for (const name of names) {
    const path = safePath(name);
    if (!path) continue;
    const data = files[name];
    const url = path === "index.html" ? "/" : `/${path}`;
    const body = new Blob([asBlobPart(data)], { type: mimeFor(path) });
    const res = new Response(body, {
      headers: { "content-type": mimeFor(path), "cache-control": "public, max-age=31536000" },
    });
    await cache.put(url, res.clone());
    if (path === "index.html") await cache.put("/index.html", res.clone());
    done += 1;
    onProgress?.(done, names.length);
  }

  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("/mill-sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
  }
  localStorage.setItem(PACK_META_KEY, JSON.stringify(meta));
  return meta;
}
