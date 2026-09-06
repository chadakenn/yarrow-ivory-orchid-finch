import { readFile, statfs } from "node:fs/promises";
import { cpus, hostname, loadavg, networkInterfaces, uptime } from "node:os";
import { spawn } from "node:child_process";

/**
 * @param {string} path
 */
async function readText(path) {
  try {
    return (await readFile(path, "utf8")).trim();
  } catch {
    return "";
  }
}

/**
 * @param {string} bin
 * @param {string[]} args
 * @param {number} [ms]
 */
function runCmd(bin, args, ms = 700) {
  return new Promise((resolve) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    const timer = setTimeout(() => {
      child.kill();
      resolve(out.trim());
    }, ms);
    child.stdout?.on("data", (chunk) => {
      out += chunk;
    });
    child.on("error", () => {
      clearTimeout(timer);
      resolve("");
    });
    child.on("close", () => {
      clearTimeout(timer);
      resolve(out.trim());
    });
  });
}

/**
 * @param {string} raw
 */
function parseMem(raw) {
  /**
   * @param {string} key
   */
  const pick = (key) => {
    const match = raw.match(new RegExp(`^${key}:\\s+(\\d+)`, "m"));
    return match ? Number(match[1]) * 1024 : 0;
  };
  const total = pick("MemTotal");
  const available = pick("MemAvailable") || pick("MemFree");
  return { total, available, used: Math.max(0, total - available) };
}

/**
 * @param {string} raw
 */
function parseOs(raw) {
  const match = raw.match(/^PRETTY_NAME="?([^"\n]+)"?/m);
  return match?.[1] || "Linux";
}

function ips() {
  const nets = networkInterfaces();
  const found = [];
  for (const rows of Object.values(nets)) {
    for (const row of rows ?? []) {
      if (row.internal || row.family === "IPv6") continue;
      if (row.address) found.push(row.address);
    }
  }
  return found;
}

/**
 * @param {string} raw
 */
function throttleNotes(raw) {
  const match = raw.match(/throttled=(0x[0-9a-f]+)/i);
  if (!match) return [];
  const value = Number.parseInt(match[1], 16);
  if (!Number.isFinite(value) || value === 0) return [];
  const notes = [];
  if (value & 1) notes.push("Voltage sag now");
  if (value & 2) notes.push("CPU capped now");
  if (value & 4) notes.push("Hot — throttled now");
  if (value & 8) notes.push("Soft temp limit now");
  if (value & 0x10000) notes.push("Voltage sag earlier");
  if (value & 0x20000) notes.push("CPU capped earlier");
  if (value & 0x40000) notes.push("Throttled earlier");
  if (value & 0x80000) notes.push("Soft temp earlier");
  return notes;
}

export async function readPiStats() {
  const [root, memRaw, osRaw, tempRaw, modelRaw, throttledRaw] = await Promise.all([
    statfs("/"),
    readText("/proc/meminfo"),
    readText("/etc/os-release"),
    readText("/sys/class/thermal/thermal_zone0/temp"),
    readText("/proc/device-tree/model").then(async (text) => text || (await readText("/sys/firmware/devicetree/base/model"))),
    runCmd("vcgencmd", ["get_throttled"]),
  ]);

  const block = Number(root.bsize) || 0;
  const diskTotal = block * Number(root.blocks || 0);
  const diskFree = block * Number(root.bavail || root.bfree || 0);
  const diskUsed = Math.max(0, diskTotal - diskFree);
  const diskPercent = diskTotal ? Math.round((diskUsed / diskTotal) * 100) : 0;
  const memory = parseMem(memRaw);
  const memPercent = memory.total ? Math.round((memory.used / memory.total) * 100) : 0;
  const temp = tempRaw ? Number(tempRaw) / 1000 : null;
  const load = loadavg();
  const notes = throttleNotes(throttledRaw);
  if (diskPercent >= 85) notes.push("SD card is getting full");
  if (temp != null && temp >= 70) notes.push("Pi is running hot");
  if (memPercent >= 90) notes.push("Memory is tight");

  return {
    host: hostname(),
    model: modelRaw.replaceAll("\u0000", "").trim() || (cpus()[0]?.model ? "Linux box" : "This TV"),
    os: parseOs(osRaw),
    ip: ips(),
    cores: cpus().length || 1,
    uptime: Math.round(uptime()),
    load: load.map((n) => Math.round(n * 100) / 100),
    temp: temp != null && Number.isFinite(temp) ? Math.round(temp * 10) / 10 : null,
    disk: { total: diskTotal, free: diskFree, used: diskUsed, percent: diskPercent },
    memory: { total: memory.total, free: memory.available, used: memory.used, percent: memPercent },
    notes,
    at: Date.now(),
  };
}
