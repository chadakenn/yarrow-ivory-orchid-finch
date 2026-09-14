import { fetchKiosk, saveKiosk } from "@/lib/kiosk";
import { loadMillClock } from "@/lib/mill-clock";
import { useDisplayStore } from "@/lib/store";
import { useEffect, useState } from "react";

let ready = false;
let dirty = false;
let version = 0;
let revision = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let pushing = false;

type SyncStatus = "connecting" | "live" | "saving" | "error" | "disk";

const listeners = new Set<(status: SyncStatus, at: number | null) => void>();
let status: SyncStatus = "connecting";
let lastSaved: number | null = null;
const FLUSH_WAIT = 15000;

function setStatus(next: SyncStatus, at: number | null = lastSaved) {
  status = next;
  lastSaved = at;
  for (const listener of listeners) listener(status, lastSaved);
}

function snapshot() {
  const state = useDisplayStore.getState();
  return {
    production: state.production,
    plantBoard: state.plantBoard,
    settings: state.settings,
    announcement: state.announcement,
    people: state.people,
    revision,
  };
}

function applyRemote(remote: {
  production: ReturnType<typeof snapshot>["production"];
  plantBoard: ReturnType<typeof snapshot>["plantBoard"];
  settings: ReturnType<typeof snapshot>["settings"];
  announcement: ReturnType<typeof snapshot>["announcement"];
  people?: ReturnType<typeof snapshot>["people"];
  updatedAt: number;
  revision?: number;
}) {
  version = remote.updatedAt;
  revision = Number(remote.revision) || revision;
  useDisplayStore.setState({
    production: remote.production,
    plantBoard: remote.plantBoard,
    settings: remote.settings,
    announcement: remote.announcement,
    people: remote.people ?? useDisplayStore.getState().people,
  });
}

async function pushNow() {
  if (pushing) return;
  if (!dirty) return;
  pushing = true;
  dirty = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  setStatus("saving");
  try {
    const result = await saveKiosk({ data: snapshot() });
    if (result.stale) {
      await pullKiosk();
      setStatus("live", result.updatedAt);
      return;
    }
    version = result.updatedAt;
    revision = Number(result.revision) || revision + 1;
    if (result.persistOk === false) {
      dirty = true;
      setStatus("disk", result.updatedAt);
      return;
    }
    if (!dirty) setStatus("live", result.updatedAt);
  } catch {
    dirty = true;
    setStatus("error");
  } finally {
    pushing = false;
    if (dirty && status !== "disk") queuePush();
  }
}

function queuePush() {
  if (!ready) return;
  dirty = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void pushNow();
  }, FLUSH_WAIT);
}

export function markKioskDirty() {
  queuePush();
}

export async function flushKioskNow() {
  if (!ready) return;
  dirty = true;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  await pushNow();
}

export async function hydrateKiosk() {
  try {
    const remote = await fetchKiosk();
    applyRemote(remote);
    ready = true;
    setStatus("live", remote.updatedAt);
  } catch {
    ready = true;
    setStatus("error");
    queuePush();
  }
}

export async function pullKiosk() {
  if (!ready || dirty || pushing) return;
  try {
    const remote = await fetchKiosk();
    if (remote.updatedAt <= version && (Number(remote.revision) || 0) <= revision) {
      if (status !== "live" && status !== "disk") setStatus("live", lastSaved);
      return;
    }
    applyRemote(remote);
    setStatus("live", remote.updatedAt);
  } catch {
    setStatus("error");
  }
}

export function useKioskSyncStatus() {
  const [state, setState] = useState({ status, lastSaved });
  useEffect(() => {
    const listener = (next: SyncStatus, at: number | null) => setState({ status: next, lastSaved: at });
    listeners.add(listener);
    listener(status, lastSaved);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return state;
}

export function KioskSync() {
  useEffect(() => {
    void hydrateKiosk();
    void loadMillClock();
    const pullId = window.setInterval(() => {
      void pullKiosk();
    }, 8000);
    const flushId = window.setInterval(() => {
      if (dirty) void pushNow();
    }, 30000);
    const onHide = () => {
      if (dirty) void pushNow();
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onHide();
    });
    const unsub = useDisplayStore.subscribe((current, previous) => {
      if (!ready) return;
      if (
        current.production === previous.production &&
        current.plantBoard === previous.plantBoard &&
        current.settings === previous.settings &&
        current.announcement === previous.announcement &&
        current.people === previous.people
      ) {
        return;
      }
      markKioskDirty();
    });
    return () => {
      window.clearInterval(pullId);
      window.clearInterval(flushId);
      window.removeEventListener("pagehide", onHide);
      unsub();
    };
  }, []);
  return null;
}
