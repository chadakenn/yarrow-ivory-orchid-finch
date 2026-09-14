export type MillClock = {
  ok?: boolean;
  piEpoch?: number;
  skewMs?: number;
  syncedAt?: string | null;
  systemSet?: boolean;
};

let cache: MillClock = { skewMs: 0, syncedAt: null };

export function millNowMs() {
  return Date.now() + (cache.skewMs || 0);
}

export function millNow() {
  return new Date(millNowMs());
}

export async function loadMillClock() {
  try {
    const res = await fetch("/api/mill-clock", { cache: "no-store" });
    if (!res.ok) return cache;
    cache = (await res.json()) as MillClock;
    return cache;
  } catch {
    return cache;
  }
}

export async function syncMillClock() {
  const res = await fetch("/api/mill-clock", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ epochMs: Date.now() }),
  });
  cache = (await res.json()) as MillClock;
  return cache;
}

export function millClockLabel(clock: MillClock) {
  if (!clock.syncedAt) return "Pi clock has not been synced from a phone yet.";
  const at = Date.parse(clock.syncedAt);
  if (!Number.isFinite(at)) return `Pi clock synced ${clock.syncedAt}`;
  const minutes = Math.max(0, Math.round((Date.now() - at) / 60000));
  if (minutes < 1) return "Pi clock synced just now";
  if (minutes === 1) return "Pi clock synced 1 minute ago";
  if (minutes < 60) return `Pi clock synced ${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  return `Pi clock synced ${hours} hour${hours === 1 ? "" : "s"} ago`;
}
