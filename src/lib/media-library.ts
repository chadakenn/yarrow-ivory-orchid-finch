import { useEffect, useState } from "react";
import { listRemoteDecks, removeRemoteDeck, saveRemoteDeck, toggleRemoteDeck } from "@/lib/kiosk";

const DB_NAME = "breakroom-media-v1";
const STORE = "decks";
const CHANNEL = "breakroom-media";

export type DeckKind = "pptx" | "pdf" | "image";

export type Deck = {
  id: string;
  name: string;
  kind: DeckKind;
  enabled: boolean;
  createdAt: number;
  slides: Array<{ src: string }>;
};

function sameDecks(a: Deck[], b: Deck[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((deck, i) => {
    const other = b[i];
    return (
      deck.id === other.id &&
      deck.name === other.name &&
      deck.enabled === other.enabled &&
      deck.createdAt === other.createdAt &&
      deck.slides.length === other.slides.length &&
      deck.slides.every((slide, j) => slide.src === other.slides[j]?.src)
    );
  });
}

function notify() {
  try {
    new BroadcastChannel(CHANNEL).postMessage("changed");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANNEL));
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function listDecks(): Promise<Deck[]> {
  try {
    const remote = await listRemoteDecks();
    await replaceLocal(remote);
    return remote;
  } catch {
    return listLocalDecks();
  }
}

async function replaceLocal(decks: Deck[]) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore(STORE);
    store.clear();
    for (const deck of decks) store.put(deck);
  });
}

async function listLocalDecks(): Promise<Deck[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as Deck[]) ?? [];
      rows.sort((a, b) => a.createdAt - b.createdAt);
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

async function cacheDeck(deck: Deck) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const req = db.transaction(STORE, "readwrite").objectStore(STORE).put(deck);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function putDeck(deck: Deck) {
  await cacheDeck(deck);
  try {
    await saveRemoteDeck({ data: deck });
  } catch {
    /* local copy still plays on this device */
  }
  notify();
}

export async function toggleDeck(id: string, enabled: boolean) {
  const decks = await listLocalDecks();
  const match = decks.find((deck) => deck.id === id);
  if (match) await cacheDeck({ ...match, enabled });
  try {
    await toggleRemoteDeck({ data: { id, enabled } });
  } catch {
    if (match) await putDeck({ ...match, enabled });
  }
  notify();
}

export async function removeDeck(id: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const req = db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  try {
    await removeRemoteDeck({ data: { id } });
  } catch {
    try {
      await fetch(`/api/mill-media/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch {
      /* files may already be gone */
    }
  }
  notify();
}

export async function moveDeck(id: string, dir: -1 | 1) {
  const decks = await listLocalDecks();
  const index = decks.findIndex((deck) => deck.id === id);
  const swap = index + dir;
  if (index < 0 || swap < 0 || swap >= decks.length) return;
  const a = decks[index];
  const b = decks[swap];
  let aTime = a.createdAt;
  let bTime = b.createdAt;
  if (aTime === bTime) {
    aTime = Date.now();
    bTime = aTime + dir * 10;
  }
  await putDeck({ ...a, createdAt: bTime });
  await putDeck({ ...b, createdAt: aTime });
}

function extOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function kindOf(file: File): DeckKind | null {
  const ext = extOf(file.name);
  if (ext === "pptx" || ext === "ppt") return "pptx";
  if (ext === "pdf") return "pdf";
  if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp") return "image";
  const type = file.type;
  if (type.includes("presentation") || type.includes("powerpoint")) return "pptx";
  if (type === "application/pdf") return "pdf";
  if (type.startsWith("image/")) return "image";
  return null;
}

function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return Promise.resolve(file);
  return new Promise((resolve) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1920 / image.width, 1080 / image.height, 1);
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.85,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    image.src = url;
  });
}

export async function importFiles(files: File[], onProgress?: (label: string) => void) {
  const imported: Deck[] = [];
  for (const file of files) {
    const kind = kindOf(file);
    if (!kind) throw new Error(`${file.name} is not a PowerPoint, PDF, or image.`);
    onProgress?.(`Sending ${file.name} to the mill…`);
    const payload = new FormData();
    payload.append("file", kind === "image" ? await shrinkImage(file) : file, file.name);
    const res = await fetch("/api/mill-media", { method: "POST", body: payload });
    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      message?: string;
      deck?: Deck;
    };
    if (!res.ok || body.ok === false || !body.deck) {
      throw new Error(body.message || `Could not import ${file.name}.`);
    }
    const deck: Deck = {
      ...body.deck,
      createdAt: Date.now(),
      enabled: true,
    };
    onProgress?.(`Saving ${file.name}…`);
    await putDeck(deck);
    imported.push(deck);
  }
  return imported;
}

export function useMediaLibrary() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const rows = await listDecks();
        if (alive) setDecks((prev) => (sameDecks(prev, rows) ? prev : rows));
      } finally {
        if (alive) setReady(true);
      }
    };
    refresh();
    const onChange = () => {
      void refresh();
    };
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CHANNEL);
      channel.addEventListener("message", onChange);
    } catch {
      /* ignore */
    }
    window.addEventListener(CHANNEL, onChange);
    const poll = window.setInterval(() => {
      void refresh();
    }, 4000);
    return () => {
      alive = false;
      channel?.close();
      window.removeEventListener(CHANNEL, onChange);
      window.clearInterval(poll);
    };
  }, []);

  return { decks, ready };
}
