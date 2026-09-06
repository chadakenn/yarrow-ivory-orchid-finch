import { fetchKiosk, saveKiosk } from "@/lib/kiosk";
import { useDisplayStore } from "@/lib/store";
import { useEffect, useState } from "react";

let ready = false;
let dirty = false;
let version = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let pushing = false;

type SyncStatus = "connecting" | "live" | "saving" | "error";

const listeners = new Set<(status: SyncStatus, at: number | null) => void>();
let status: SyncStatus = "connecting";
let lastSaved: number | null = null;

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
  };
}

async function pushNow() {
  if (pushing) return;
  pushing = true;
  dirty = false;
  setStatus("saving");
  try {
    const result = await saveKiosk({ data: snapshot() });
    version = result.updatedAt;
    if (!dirty) setStatus("live", result.updatedAt);
  } catch {
    dirty = true;
    setStatus("error");
  } finally {
    pushing = false;
    if (dirty) queuePush();
  }
}

function queuePush() {
  if (!ready) return;
  dirty = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    void pushNow();
  }, 700);
}

export function markKioskDirty() {
  queuePush();
}

export async function hydrateKiosk() {
  try {
    const remote = await fetchKiosk();
    version = remote.updatedAt;
    useDisplayStore.setState({
      production: remote.production,
      plantBoard: remote.plantBoard,
      settings: remote.settings,
      announcement: remote.announcement,
      ...(Array.isArray(remote.people) ? { people: remote.people } : {}),
    });
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
    if (remote.updatedAt <= version) {
      if (status !== "live") setStatus("live", lastSaved);
      return;
    }
    version = remote.updatedAt;
    useDisplayStore.setState({
      production: remote.production,
      plantBoard: remote.plantBoard,
      settings: remote.settings,
      announcement: remote.announcement,
      ...(Array.isArray(remote.people) ? { people: remote.people } : {}),
    });
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
    const id = window.setInterval(() => {
      void pullKiosk();
    }, 4000);
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
      window.clearInterval(id);
      unsub();
    };
  }, []);
  return null;
}
