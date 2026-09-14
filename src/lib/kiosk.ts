import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DEFAULT_PEOPLE, DEFAULT_PLANT_BOARD, DEFAULT_PRODUCTION, DEFAULT_SETTINGS } from "@/lib/data";
import type { Announcement, DisplaySettings, PersonEntry, PlantBoard, ProductionState } from "@/lib/types";

export type RemoteDeck = {
  id: string;
  name: string;
  kind: "pptx" | "pdf" | "image";
  enabled: boolean;
  createdAt: number;
  slides: Array<{ src: string }>;
};

export type KioskPayload = {
  production: ProductionState;
  plantBoard: PlantBoard;
  settings: DisplaySettings;
  announcement: Announcement;
  people: PersonEntry[];
  updatedAt: number;
  revision?: number;
};

const KIOSK_ID = "main";

function dataDir() {
  try {
    return process.env.MILL_DATA || "data";
  } catch {
    return "data";
  }
}

function boardFile() {
  return `${dataDir()}/kiosk-board.json`;
}

function decksFile() {
  return `${dataDir()}/kiosk-decks.json`;
}

const plantSchema = z.object({
  name: z.enum(["Marshville", "Henderson", "North Baltimore", "Albertville"]),
  tons: z.number().nonnegative(),
});

const productionSchema = z.object({
  weekEnding: z.string(),
  lastUpdated: z.number().nullable(),
  plants: z.array(plantSchema),
  history: z.array(
    z.object({
      id: z.string(),
      weekEnding: z.string(),
      plants: z.array(plantSchema),
      winners: z.array(z.enum(["Marshville", "Henderson", "North Baltimore", "Albertville"])),
    }),
  ),
});

function seedPayload(now = Date.now()): KioskPayload {
  return {
    production: DEFAULT_PRODUCTION,
    plantBoard: DEFAULT_PLANT_BOARD,
    settings: DEFAULT_SETTINGS,
    announcement: null,
    people: DEFAULT_PEOPLE,
    updatedAt: now,
    revision: 1,
  };
}

async function fileRead<T>(file: string): Promise<T | null> {
  try {
    const fs = await import("node:fs/promises");
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function fileWrite(file: string, value: unknown) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value), "utf8");
  await fs.rename(tmp, file);
}

async function writeSql(payload: KioskPayload) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const body = JSON.stringify(payload);
  await sql`
    insert into kiosk_state (id, payload, updated_at)
    values (${KIOSK_ID}, ${body}, ${payload.updatedAt})
    on conflict (id) do update set payload = excluded.payload, updated_at = excluded.updated_at
  `;
}

function normalize(parsed: Partial<KioskPayload>, updatedAt: number): KioskPayload {
  return {
    ...seedPayload(updatedAt),
    ...parsed,
    production: parsed.production ?? DEFAULT_PRODUCTION,
    plantBoard: parsed.plantBoard ?? DEFAULT_PLANT_BOARD,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings ?? {}),
      durations: { ...DEFAULT_SETTINGS.durations, ...(parsed.settings?.durations ?? {}) },
      ticker: {
        ...DEFAULT_SETTINGS.ticker,
        ...(parsed.settings?.ticker ?? {}),
        auto: parsed.settings?.ticker?.auto !== false,
        enabled: parsed.settings?.ticker?.enabled !== false,
      },
    },
    announcement: parsed.announcement ?? null,
    people: Array.isArray(parsed.people) ? parsed.people : DEFAULT_PEOPLE,
    updatedAt,
    revision: Number(parsed.revision) || 1,
  };
}

async function readState(): Promise<KioskPayload> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ payload: string; updated_at: number }>`
    select payload, updated_at from kiosk_state where id = ${KIOSK_ID}
  `;
  const fromDb = rows[0]?.payload
    ? normalize(JSON.parse(rows[0].payload) as Partial<KioskPayload>, Number(rows[0].updated_at) || Date.now())
    : null;
  const fromFile = await fileRead<KioskPayload>(boardFile());
  const fileState = fromFile ? normalize(fromFile, fromFile.updatedAt || Date.now()) : null;
  if (fileState && (!fromDb || fileState.updatedAt >= fromDb.updatedAt)) {
    if (!fromDb || fileState.updatedAt > fromDb.updatedAt) await writeSql(fileState);
    return fileState;
  }
  if (fromDb) return fromDb;
  const payload = seedPayload();
  await writeState(payload);
  return payload;
}

async function writeState(payload: KioskPayload) {
  await writeSql(payload);
  try {
    await fileWrite(boardFile(), payload);
    return true;
  } catch {
    return false;
  }
}

async function materializePeople(people: PersonEntry[]): Promise<PersonEntry[]> {
  const next: PersonEntry[] = [];
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(dataDir(), "media", "people");
  await fs.mkdir(dir, { recursive: true });
  for (const person of people) {
    const photo = person.photo || "";
    if (!photo.startsWith("data:")) {
      next.push(person);
      continue;
    }
    try {
      const blob = photo.slice(photo.indexOf(",") + 1);
      const buf = Buffer.from(blob, "base64");
      const fileName = `${person.id.replace(/[^A-Za-z0-9._-]/g, "_")}.jpg`;
      await fs.writeFile(path.join(dir, fileName), buf);
      next.push({ ...person, photo: `/media/people/${fileName}` });
    } catch {
      next.push({ ...person, photo: "" });
    }
  }
  return next;
}

async function loadDecks(): Promise<RemoteDeck[]> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    name: string;
    kind: RemoteDeck["kind"];
    enabled: boolean;
    created_at: number;
    slides: string;
  }>`
    select id, name, kind, enabled, created_at, slides from kiosk_decks order by created_at asc
  `;
  if (rows.length) {
    return materializeDecks(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        kind: row.kind,
        enabled: Boolean(row.enabled),
        createdAt: Number(row.created_at),
        slides: JSON.parse(row.slides) as RemoteDeck["slides"],
      })),
    );
  }
  const fromFile = await fileRead<RemoteDeck[]>(decksFile());
  if (fromFile?.length) {
    const ready = await materializeDecks(fromFile);
    for (const deck of ready) await upsertDeckRow(deck);
    return ready;
  }
  return [];
}

async function upsertDeckRow(deck: RemoteDeck) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const slides = JSON.stringify(deck.slides);
  await sql`
    insert into kiosk_decks (id, name, kind, enabled, created_at, slides)
    values (${deck.id}, ${deck.name}, ${deck.kind}, ${deck.enabled}, ${deck.createdAt}, ${slides})
    on conflict (id) do update set
      name = excluded.name,
      kind = excluded.kind,
      enabled = excluded.enabled,
      created_at = excluded.created_at,
      slides = excluded.slides
  `;
}

async function materializeDecks(decks: RemoteDeck[]): Promise<RemoteDeck[]> {
  const needs = decks.some((deck) => deck.slides.some((slide) => slide.src.startsWith("data:")));
  if (!needs) return decks;
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const next: RemoteDeck[] = [];
  for (const deck of decks) {
    const slides: RemoteDeck["slides"] = [];
    for (let index = 0; index < deck.slides.length; index += 1) {
      const src = deck.slides[index]?.src || "";
      if (!src.startsWith("data:")) {
        slides.push(deck.slides[index]);
        continue;
      }
      const blob = src.slice(src.indexOf(",") + 1);
      const buf = Buffer.from(blob, "base64");
      const dir = path.join(dataDir(), "media", deck.id);
      await fs.mkdir(dir, { recursive: true });
      const fileName = `slide-${String(index + 1).padStart(3, "0")}.jpg`;
      await fs.writeFile(path.join(dir, fileName), buf);
      slides.push({ src: `/media/${deck.id}/${fileName}` });
    }
    next.push({ ...deck, slides });
  }
  for (const deck of next) await upsertDeckRow(deck);
  await fileWrite(decksFile(), next);
  return next;
}

async function removeDeckFiles(id: string) {
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const stamp = Date.now();
    const dest = path.join(dataDir(), "trash", `${id}-${stamp}`);
    await fs.mkdir(dest, { recursive: true });
    for (const folder of ["media", "originals"]) {
      const src = path.join(dataDir(), folder, id);
      try {
        await fs.rename(src, path.join(dest, folder));
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* missing folders are fine */
  }
}

async function persistDeckFile() {
  const decks = await loadDecks();
  await fileWrite(decksFile(), decks);
}

export const fetchKiosk = createServerFn({ method: "GET" }).handler(async () => {
  return readState();
});

export const saveKiosk = createServerFn({ method: "POST" })
  .validator(
    z.object({
      production: productionSchema,
      plantBoard: z.any(),
      settings: z.any(),
      announcement: z.any(),
      people: z.any().optional(),
      revision: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const current = await readState();
    const incoming = Number(data.revision) || 0;
    const held = Number(current.revision) || 1;
    if (incoming && incoming < held) {
      return { updatedAt: current.updatedAt, revision: held, stale: true as const, persistOk: true };
    }
    const people = await materializePeople((data.people as PersonEntry[]) ?? DEFAULT_PEOPLE);
    const payload: KioskPayload = {
      production: data.production,
      plantBoard: data.plantBoard as PlantBoard,
      settings: data.settings as DisplaySettings,
      announcement: data.announcement as Announcement,
      people,
      updatedAt: Date.now(),
      revision: held + 1,
    };
    const persistOk = await writeState(payload);
    return { updatedAt: payload.updatedAt, revision: payload.revision, persistOk, stale: false as const };
  });

export const listRemoteDecks = createServerFn({ method: "GET" }).handler(async () => {
  return loadDecks();
});

export const saveRemoteDeck = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      name: z.string(),
      kind: z.enum(["pptx", "pdf", "image"]),
      enabled: z.boolean(),
      createdAt: z.number(),
      slides: z.array(z.object({ src: z.string() })),
    }),
  )
  .handler(async ({ data }) => {
    await upsertDeckRow(data);
    await persistDeckFile();
    return { ok: true as const };
  });

export const toggleRemoteDeck = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), enabled: z.boolean() }))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`update kiosk_decks set enabled = ${data.enabled} where id = ${data.id}`;
    await persistDeckFile();
    return { ok: true as const };
  });

export const removeRemoteDeck = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from kiosk_decks where id = ${data.id}`;
    await removeDeckFiles(data.id);
    await persistDeckFile();
    return { ok: true as const };
  });
