export const MILL_ZIP_NAME = "north-baltimore-mill-workspace.zip";

export async function downloadWorkspaceZip() {
  const res = await fetch("/api/mill-workspace.zip", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not download the mill zip.");
  const blob = await res.blob();
  const header = res.headers.get("content-disposition") || "";
  const match = header.match(/filename="?([^"]+)"?/i);
  const name = match?.[1] || MILL_ZIP_NAME;
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 4000);
  return name;
}

export async function uploadWorkspaceZip(file: File) {
  const res = await fetch("/api/mill-workspace", {
    method: "POST",
    headers: { "x-filename": file.name },
    body: file,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || "Could not install that zip.");
  try {
    return JSON.parse(text) as { files: number; name: string };
  } catch {
    return { files: 0, name: file.name };
  }
}

export async function listMillTemp() {
  const res = await fetch("/api/mill-cleanup", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not check leftover update files.");
  return (await res.json()) as {
    count: number;
    bytes: number;
    items: Array<{ name: string; where: string; bytes: number }>;
  };
}

export async function cleanMillTemp() {
  const res = await fetch("/api/mill-cleanup", { method: "POST", cache: "no-store" });
  if (!res.ok) throw new Error("Could not clean leftover update files.");
  try {
    await caches.delete("mill-kiosk");
  } catch {
    /* no cache to dump */
  }
  return (await res.json()) as {
    count: number;
    bytes: number;
    items: Array<{ name: string; where: string; bytes: number }>;
  };
}

export async function fetchPiStats() {
  const res = await fetch("/api/mill-pi", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not read this Pi.");
  return (await res.json()) as {
    host: string;
    model: string;
    os: string;
    ip: string[];
    cores: number;
    uptime: number;
    load: number[];
    temp: number | null;
    disk: { total: number; free: number; used: number; percent: number };
    memory: { total: number; free: number; used: number; percent: number };
    notes: string[];
    at: number;
  };
}
