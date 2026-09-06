import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "mill-workspace.py");
const ROOT = process.cwd();
const MAX_BYTES = 80 * 1024 * 1024;

/** @param {string[]} args */
function runPython(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("python3", [SCRIPT, ...args], { cwd: ROOT });
    let out = "";
    let err = "";
    child.stdout.on("data", (chunk) => {
      out += chunk;
    });
    child.stderr.on("data", (chunk) => {
      err += chunk;
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error((err || out || "zip failed").trim()));
        return;
      }
      resolve(out.trim());
    });
  });
}

export async function packMillWorkspace() {
  const dir = await mkdtemp(join(tmpdir(), "mill-pack-"));
  const dest = join(dir, "north-baltimore-mill-workspace.zip");
  try {
    await runPython(["pack", ROOT, dest]);
    return await readFile(dest);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** @param {Buffer} buffer @param {string} [filename] */
export async function installMillWorkspace(buffer, filename = "upload.zip") {
  if (!buffer?.length) throw new Error("Choose a mill zip.");
  if (buffer.length > MAX_BYTES) throw new Error("That zip is too large.");
  const dir = await mkdtemp(join(tmpdir(), "mill-install-"));
  const zipPath = join(dir, filename.replace(/[^\w.-]+/g, "_") || "upload.zip");
  try {
    await writeFile(zipPath, buffer);
    const raw = await runPython(["install", zipPath, ROOT]);
    return JSON.parse(raw);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export async function listMillTemp() {
  const raw = await runPython(["list-temp", ROOT]);
  return JSON.parse(raw);
}

export async function cleanMillTemp() {
  const raw = await runPython(["clean-temp", ROOT]);
  return JSON.parse(raw);
}

export const MILL_ZIP_NAME = "north-baltimore-mill-workspace.zip";
