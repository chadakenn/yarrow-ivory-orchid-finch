import { execFile } from "node:child_process";
import { hostname, loadavg, networkInterfaces, totalmem, uptime as osUptime } from "node:os";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { statfs } from "node:fs/promises";

const execFileAsync = promisify(execFile);

async function readText(path) {
  try {
    return (await readFile(path, "utf8")).trim();
  } catch {
    return "";
  }
}

async function vcgencmd(args) {
  try {
    const { stdout } = await execFileAsync("vcgencmd", args, { timeout: 800 });
    return stdout.trim();
  } catch {
    return "";
  }
}

function bytesLabel(value) {
  if (!Number.isFinite(value) || value <= 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 10 || unit === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

export async function readPiStats() {
  let disk = { total: 0, free: 0, used: 0 };
  try {
    const fs = await statfs("/");
    const total = Number(fs.blocks) * Number(fs.bsize);
    const free = Number(fs.bavail) * Number(fs.bsize);
    disk = { total, free, used: Math.max(0, total - free) };
  } catch {
    /* ignore */
  }

  const meminfo = await readText("/proc/meminfo");
  const mem = {};
  for (const line of meminfo.split("\n")) {
    const match = line.match(/^(\w+):\s+(\d+)/);
    if (match) mem[match[1]] = Number(match[2]) * 1024;
  }
  const memTotal = mem.MemTotal || totalmem();
  const memAvailable = mem.MemAvailable || mem.MemFree || 0;

  const tempRaw = await readText("/sys/class/thermal/thermal_zone0/temp");
  const tempC = tempRaw ? Number(tempRaw) / 1000 : null;

  const throttled = await vcgencmd(["get_throttled"]);
  const clock = await vcgencmd(["measure_clock", "arm"]);

  const ifaces = networkInterfaces();
  const ips = [];
  for (const [name, rows] of Object.entries(ifaces)) {
    for (const row of rows || []) {
      if (row.internal || row.family !== "IPv4") continue;
      ips.push({ name, address: row.address });
    }
  }

  const uptimeSec = Number((await readText("/proc/uptime")).split(" ")[0]) || osUptime();
  const load = loadavg();

  return {
    hostname: hostname(),
    now: Date.now(),
    disk: {
      ...disk,
      usedLabel: bytesLabel(disk.used),
      freeLabel: bytesLabel(disk.free),
      totalLabel: bytesLabel(disk.total),
      percent: disk.total ? Math.round((disk.used / disk.total) * 100) : 0,
    },
    memory: {
      total: memTotal,
      used: Math.max(0, memTotal - memAvailable),
      available: memAvailable,
      usedLabel: bytesLabel(Math.max(0, memTotal - memAvailable)),
      totalLabel: bytesLabel(memTotal),
      percent: memTotal ? Math.round(((memTotal - memAvailable) / memTotal) * 100) : 0,
    },
    tempC: Number.isFinite(tempC) ? Math.round(tempC * 10) / 10 : null,
    throttled: throttled || "",
    clock: clock || "",
    uptimeSec,
    load: load.map((n) => Math.round(n * 100) / 100),
    ips,
  };
}
