import { i as DEFAULT_SETTINGS, n as DEFAULT_PLANT_BOARD, r as DEFAULT_PRODUCTION } from "./data-F7qCzk8B.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { c as string, i as boolean, n as any, o as number, r as array, s as object, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kiosk-YCLRd6ZC.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var KIOSK_ID = "main";
var BOARD_FILE = "data/kiosk-board.json";
var DECKS_FILE = "data/kiosk-decks.json";
var plantSchema = object({
	name: _enum([
		"Marshville",
		"Henderson",
		"North Baltimore",
		"Albertville"
	]),
	tons: number().nonnegative()
});
var productionSchema = object({
	weekEnding: string(),
	lastUpdated: number().nullable(),
	plants: array(plantSchema),
	history: array(object({
		id: string(),
		weekEnding: string(),
		plants: array(plantSchema),
		winners: array(_enum([
			"Marshville",
			"Henderson",
			"North Baltimore",
			"Albertville"
		]))
	}))
});
function seedPayload(now = Date.now()) {
	return {
		production: DEFAULT_PRODUCTION,
		plantBoard: DEFAULT_PLANT_BOARD,
		settings: DEFAULT_SETTINGS,
		announcement: null,
		updatedAt: now
	};
}
async function fileRead(file) {
	try {
		const raw = await (await import("node:fs/promises")).readFile(file, "utf8");
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
async function fileWrite(file, value) {
	try {
		const fs = await import("node:fs/promises");
		const path = await import("node:path");
		await fs.mkdir(path.dirname(file), { recursive: true });
		await fs.writeFile(file, JSON.stringify(value), "utf8");
	} catch {}
}
function normalize(parsed, updatedAt) {
	return {
		...seedPayload(updatedAt),
		...parsed,
		production: parsed.production ?? DEFAULT_PRODUCTION,
		plantBoard: parsed.plantBoard ?? DEFAULT_PLANT_BOARD,
		settings: {
			...DEFAULT_SETTINGS,
			...parsed.settings ?? {},
			durations: {
				...DEFAULT_SETTINGS.durations,
				...parsed.settings?.durations ?? {}
			},
			ticker: {
				...DEFAULT_SETTINGS.ticker,
				...parsed.settings?.ticker ?? {}
			}
		},
		announcement: parsed.announcement ?? null,
		updatedAt
	};
}
async function readState() {
	const { getSql } = await import("./db-DNuKsQxu.mjs");
	const rows = await (await getSql())`
    select payload, updated_at from kiosk_state where id = ${KIOSK_ID}
  `;
	if (rows[0]?.payload) return normalize(JSON.parse(rows[0].payload), Number(rows[0].updated_at) || Date.now());
	const fromFile = await fileRead(BOARD_FILE);
	const payload = fromFile ? normalize(fromFile, fromFile.updatedAt || Date.now()) : seedPayload();
	await writeState(payload);
	return payload;
}
async function writeState(payload) {
	const { getSql } = await import("./db-DNuKsQxu.mjs");
	await (await getSql())`
    insert into kiosk_state (id, payload, updated_at)
    values (${KIOSK_ID}, ${JSON.stringify(payload)}, ${payload.updatedAt})
    on conflict (id) do update set payload = excluded.payload, updated_at = excluded.updated_at
  `;
	await fileWrite(BOARD_FILE, payload);
}
async function loadDecks() {
	const { getSql } = await import("./db-DNuKsQxu.mjs");
	const rows = await (await getSql())`
    select id, name, kind, enabled, created_at, slides from kiosk_decks order by created_at asc
  `;
	if (rows.length) return rows.map((row) => ({
		id: row.id,
		name: row.name,
		kind: row.kind,
		enabled: Boolean(row.enabled),
		createdAt: Number(row.created_at),
		slides: JSON.parse(row.slides)
	}));
	const fromFile = await fileRead(DECKS_FILE);
	if (fromFile?.length) {
		for (const deck of fromFile) await upsertDeckRow(deck);
		return fromFile;
	}
	return [];
}
async function upsertDeckRow(deck) {
	const { getSql } = await import("./db-DNuKsQxu.mjs");
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
	await fileWrite(DECKS_FILE, await loadDecks());
}
var fetchKiosk_createServerFn_handler = createServerRpc({
	id: "72c76414a7186669e32012ed00d32065407d8803434ea7546c58c3b7e8d01cd6",
	name: "fetchKiosk",
	filename: "src/lib/kiosk.ts"
}, (opts) => fetchKiosk.__executeServer(opts));
var fetchKiosk = createServerFn({ method: "GET" }).handler(fetchKiosk_createServerFn_handler, async () => {
	return readState();
});
var saveKiosk_createServerFn_handler = createServerRpc({
	id: "c49be3cbe29504f0a3cf7c2e25665d0dbd1ae5def75a2e358da1c07014fa9b0f",
	name: "saveKiosk",
	filename: "src/lib/kiosk.ts"
}, (opts) => saveKiosk.__executeServer(opts));
var saveKiosk = createServerFn({ method: "POST" }).validator(object({
	production: productionSchema,
	plantBoard: any(),
	settings: any(),
	announcement: any()
})).handler(saveKiosk_createServerFn_handler, async ({ data }) => {
	const payload = {
		production: data.production,
		plantBoard: data.plantBoard,
		settings: data.settings,
		announcement: data.announcement,
		updatedAt: Date.now()
	};
	await writeState(payload);
	return { updatedAt: payload.updatedAt };
});
var listRemoteDecks_createServerFn_handler = createServerRpc({
	id: "896535e7cc8c39fbda5ca0491dd9fcf2520793609ccd7a9ea9cf06aad2265bcf",
	name: "listRemoteDecks",
	filename: "src/lib/kiosk.ts"
}, (opts) => listRemoteDecks.__executeServer(opts));
var listRemoteDecks = createServerFn({ method: "GET" }).handler(listRemoteDecks_createServerFn_handler, async () => {
	return loadDecks();
});
var saveRemoteDeck_createServerFn_handler = createServerRpc({
	id: "40a353c2b56330e8713d14f69817c76fc6b1d310ae41df1c028e2db231f05b44",
	name: "saveRemoteDeck",
	filename: "src/lib/kiosk.ts"
}, (opts) => saveRemoteDeck.__executeServer(opts));
var saveRemoteDeck = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	name: string(),
	kind: _enum([
		"pptx",
		"pdf",
		"image"
	]),
	enabled: boolean(),
	createdAt: number(),
	slides: array(object({ src: string() }))
})).handler(saveRemoteDeck_createServerFn_handler, async ({ data }) => {
	await upsertDeckRow(data);
	await persistDeckFile();
	return { ok: true };
});
var toggleRemoteDeck_createServerFn_handler = createServerRpc({
	id: "3bb244513fad74173ae6fea06af30d24fe5b29fecd75a0e06023d970459da166",
	name: "toggleRemoteDeck",
	filename: "src/lib/kiosk.ts"
}, (opts) => toggleRemoteDeck.__executeServer(opts));
var toggleRemoteDeck = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	enabled: boolean()
})).handler(toggleRemoteDeck_createServerFn_handler, async ({ data }) => {
	const { getSql } = await import("./db-DNuKsQxu.mjs");
	await (await getSql())`update kiosk_decks set enabled = ${data.enabled} where id = ${data.id}`;
	await persistDeckFile();
	return { ok: true };
});
var removeRemoteDeck_createServerFn_handler = createServerRpc({
	id: "0bfa6c90cba78e6cd4b52bf29d3264bb4eae039020e78368a3a02251228047e4",
	name: "removeRemoteDeck",
	filename: "src/lib/kiosk.ts"
}, (opts) => removeRemoteDeck.__executeServer(opts));
var removeRemoteDeck = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(removeRemoteDeck_createServerFn_handler, async ({ data }) => {
	const { getSql } = await import("./db-DNuKsQxu.mjs");
	await (await getSql())`delete from kiosk_decks where id = ${data.id}`;
	await persistDeckFile();
	return { ok: true };
});
//#endregion
export { fetchKiosk_createServerFn_handler, listRemoteDecks_createServerFn_handler, removeRemoteDeck_createServerFn_handler, saveKiosk_createServerFn_handler, saveRemoteDeck_createServerFn_handler, toggleRemoteDeck_createServerFn_handler };
