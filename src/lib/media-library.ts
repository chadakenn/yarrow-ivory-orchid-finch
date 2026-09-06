import { useEffect, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import PptxRenderer from "pptx-browser";
import { listRemoteDecks, removeRemoteDeck, saveRemoteDeck, toggleRemoteDeck } from "@/lib/kiosk";

GlobalWorkerOptions.workerSrc = pdfWorker;

const DB_NAME = "breakroom-media-v1";
const STORE = "decks";
const CHANNEL = "breakroom-media";
const JPEG_QUALITY = 0.86;
const RENDER_WIDTH = 1600;

export type DeckKind = "pptx" | "pdf" | "image";

export type Deck = {
  id: string;
  name: string;
  kind: DeckKind;
  enabled: boolean;
  createdAt: number;
  slides: Array<{ src: string }>;
};

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
    if (remote.length) {
      for (const deck of remote) await cacheDeck(deck);
      return remote;
    }
  } catch {
    /* fall through to the local library */
  }
  const local = await listLocalDecks();
  if (local.length) {
    for (const deck of local) {
      try {
        await saveRemoteDeck({ data: deck });
      } catch {
        break;
      }
    }
  }
  return local;
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
    /* ignore */
  }
  notify();
}

export async function clearDecks(mode: "off" | "all") {
  const decks = await listDecks();
  const targets = mode === "off" ? decks.filter((deck) => !deck.enabled) : decks;
  for (const deck of targets) await removeDeck(deck.id);
  if (mode === "all") {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const req = db.transaction(STORE, "readwrite").objectStore(STORE).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    notify();
  }
  return targets.length;
}

export function deckBytes(deck: Deck) {
  return deck.slides.reduce((sum, slide) => sum + (slide.src?.length ?? 0), 0);
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

function canvasToJpeg(canvas: HTMLCanvasElement) {
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

async function renderPptx(file: File, onProgress?: (label: string) => void) {
  const renderer = new PptxRenderer();
  await renderer.load(file, (_progress, message) => onProgress?.(message || "Reading PowerPoint…"));
  if (!renderer.slideCount) throw new Error("No slides found in that PowerPoint.");
  const slides: Array<{ src: string }> = [];
  for (let i = 0; i < renderer.slideCount; i++) {
    onProgress?.(`Rendering slide ${i + 1} of ${renderer.slideCount}…`);
    const canvas = document.createElement("canvas");
    await renderer.renderSlide(i, canvas, RENDER_WIDTH);
    slides.push({ src: canvasToJpeg(canvas) });
  }
  renderer.destroy();
  return slides;
}

async function renderPdf(file: File, onProgress?: (label: string) => void) {
  const data = await file.arrayBuffer();
  const pdf = await getDocument({ data }).promise;
  const slides: Array<{ src: string }> = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(`Rendering page ${i} of ${pdf.numPages}…`);
    const page = await pdf.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: RENDER_WIDTH / base.width });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not draw that PDF page.");
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    slides.push({ src: canvasToJpeg(canvas) });
  }
  return slides;
}

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function importFiles(files: File[], onProgress?: (label: string) => void) {
  const imported: Deck[] = [];
  const images: File[] = [];
  const docs: File[] = [];
  for (const file of files) {
    const kind = kindOf(file);
    if (!kind) throw new Error(`${file.name} is not a PowerPoint, PDF, or image.`);
    if (kind === "pptx" && extOf(file.name) === "ppt") {
      throw new Error("Old .ppt files need to be saved as .pptx or PDF first.");
    }
    if (kind === "image") images.push(file);
    else docs.push(file);
  }

  for (const file of docs) {
    const kind = kindOf(file) as "pptx" | "pdf";
    onProgress?.(`Opening ${file.name}…`);
    const slides = kind === "pptx" ? await renderPptx(file, onProgress) : await renderPdf(file, onProgress);
    if (!slides.length) throw new Error(`${file.name} had no slides to show.`);
    onProgress?.(`Sending ${file.name} to the TV…`);
    imported.push(await saveNewDeck(file.name, kind, slides, Date.now() + imported.length, onProgress));
  }

  if (images.length) {
    const slides: Array<{ src: string }> = [];
    for (const [index, file] of images.entries()) {
      onProgress?.(images.length > 1 ? `Photo ${index + 1} of ${images.length}…` : `Opening ${file.name}…`);
      slides.push({ src: await readImage(file) });
    }
    const name = images.length === 1 ? images[0].name : `${images.length} photos`;
    imported.push(await saveNewDeck(name, "image", slides, Date.now() + imported.length, onProgress));
  }
  return imported;
}

async function saveNewDeck(
  name: string,
  kind: DeckKind,
  slides: Array<{ src: string }>,
  createdAt: number,
  onProgress?: (label: string) => void,
) {
  onProgress?.(`Sending ${name} to the TV…`);
  const deck: Deck = {
    id: `deck_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    kind,
    enabled: true,
    createdAt,
    slides,
  };
  await putDeck(deck);
  return deck;
}

export async function moveDeck(id: string, dir: -1 | 1) {
  const decks = await listLocalDecks();
  const index = decks.findIndex((deck) => deck.id === id);
  const swap = index + dir;
  if (index < 0 || swap < 0 || swap >= decks.length) return;
  const a = decks[index];
  const b = decks[swap];
  const stamp = a.createdAt;
  a.createdAt = b.createdAt === stamp ? stamp + dir : b.createdAt;
  b.createdAt = stamp;
  await putDeck(a);
  await putDeck(b);
}

function sameDecks(a: Deck[], b: Deck[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((deck, index) => {
    const next = b[index];
    return (
      next &&
      deck.id === next.id &&
      deck.enabled === next.enabled &&
      deck.slides.length === next.slides.length &&
      deck.slides[0]?.src === next.slides[0]?.src
    );
  });
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
