import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DEFAULT_PEOPLE, DEFAULT_PLANT_BOARD, DEFAULT_PRODUCTION, DEFAULT_SETTINGS, normalizeSettings } from "@/lib/data";
import type { Announcement, DisplaySettings, PersonEntry, PlantBoard, ProductionState } from "@/lib/types";
import { normalizePerson } from "@/lib/people";

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
  people?: PersonEntry[];
  updatedAt: number;
};

const KIOSK_ID = "main";
const BOARD_FILE = "data/kiosk-board.json";
const DECKS_FILE = "data/kiosk-decks.json";

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
    updatedAt: now,
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
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(value), "utf8");
  } catch {
    /* read-only hosts keep Postgres as the source of truth */
  }
}

function normalize(parsed: Partial<KioskPayload>, updatedAt: number): KioskPayload {
  return {
    ...seedPayload(updatedAt),
    ...parsed,
    production: parsed.production ?? DEFAULT_PRODUCTION,
    plantBoard: parsed.plantBoard ?? DEFAULT_PLANT_BOARD,
    settings: normalizeSettings(parsed.settings),
    announcement: parsed.announcement ?? null,
    people: Array.isArray(parsed.people) ? parsed.people.map((row) => normalizePerson(row as PersonEntry)) : undefined,
    updatedAt,
  };
}

async function readState(): Promise<KioskPayload> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ payload: string; updated_at: number }>`
    select payload, updated_at from kiosk_state where id = ${KIOSK_ID}
  `;
  if (rows[0]?.payload) {
    return normalize(JSON.parse(rows[0].payload) as Partial<KioskPayload>, Number(rows[0].updated_at) || Date.now());
  }

  const fromFile = await fileRead<KioskPayload>(BOARD_FILE);
  const payload = fromFile ? normalize(fromFile, fromFile.updatedAt || Date.now()) : seedPayload();
  await writeState(payload);
  return payload;
}

async function writeState(payload: KioskPayload) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const body = JSON.stringify(payload);
  await sql`
    insert into kiosk_state (id, payload, updated_at)
    values (${KIOSK_ID}, ${body}, ${payload.updatedAt})
    on conflict (id) do update set payload = excluded.payload, updated_at = excluded.updated_at
  `;
  await fileWrite(BOARD_FILE, payload);
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
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      kind: row.kind,
      enabled: Boolean(row.enabled),
      createdAt: Number(row.created_at),
      slides: JSON.parse(row.slides) as RemoteDeck["slides"],
    }));
  }
  const fromFile = await fileRead<RemoteDeck[]>(DECKS_FILE);
  if (fromFile?.length) {
    for (const deck of fromFile) await upsertDeckRow(deck);
    return fromFile;
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
      slides = excluded.slides
  `;
}

async function persistDeckFile() {
  const decks = await loadDecks();
  await fileWrite(DECKS_FILE, decks);
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
    }),
  )
  .handler(async ({ data }) => {
    const payload: KioskPayload = {
      production: data.production,
      plantBoard: data.plantBoard as PlantBoard,
      settings: data.settings as DisplaySettings,
      announcement: data.announcement as Announcement,
      people: Array.isArray(data.people)
        ? (data.people as PersonEntry[]).map((row) => normalizePerson(row))
        : undefined,
      updatedAt: Date.now(),
    };
    await writeState(payload);
    return { updatedAt: payload.updatedAt };
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
    await persistDeckFile();
    return { ok: true as const };
  });
