import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as saveRemoteDeck, i as removeRemoteDeck, o as toggleRemoteDeck, r as listRemoteDecks } from "./router-DbzfnbCy.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as getDocument, t as GlobalWorkerOptions } from "../_libs/pdfjs-dist.mjs";
import { t as PptxRenderer } from "../_libs/pptx-browser.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mills-BEzbeQad.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function initials(name) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return "NB";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
}
GlobalWorkerOptions.workerSrc = "/assets/pdf.worker.min-Dswkl-cV.mjs";
var DB_NAME = "breakroom-media-v1";
var STORE = "decks";
var CHANNEL = "breakroom-media";
var JPEG_QUALITY = .86;
var RENDER_WIDTH = 1600;
function notify() {
	try {
		new BroadcastChannel(CHANNEL).postMessage("changed");
	} catch {}
	window.dispatchEvent(new Event(CHANNEL));
}
function openDb() {
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
async function listDecks() {
	try {
		const remote = await listRemoteDecks();
		if (remote.length) {
			for (const deck of remote) await cacheDeck(deck);
			return remote;
		}
	} catch {}
	const local = await listLocalDecks();
	if (local.length) for (const deck of local) try {
		await saveRemoteDeck({ data: deck });
	} catch {
		break;
	}
	return local;
}
async function listLocalDecks() {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
		req.onsuccess = () => {
			const rows = req.result ?? [];
			rows.sort((a, b) => a.createdAt - b.createdAt);
			resolve(rows);
		};
		req.onerror = () => reject(req.error);
	});
}
async function cacheDeck(deck) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readwrite").objectStore(STORE).put(deck);
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}
async function putDeck(deck) {
	await cacheDeck(deck);
	try {
		await saveRemoteDeck({ data: deck });
	} catch {}
	notify();
}
async function toggleDeck(id, enabled) {
	const match = (await listLocalDecks()).find((deck) => deck.id === id);
	if (match) await cacheDeck({
		...match,
		enabled
	});
	try {
		await toggleRemoteDeck({ data: {
			id,
			enabled
		} });
	} catch {
		if (match) await putDeck({
			...match,
			enabled
		});
	}
	notify();
}
async function removeDeck(id) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
	try {
		await removeRemoteDeck({ data: { id } });
	} catch {}
	notify();
}
function extOf(name) {
	return name.split(".").pop()?.toLowerCase() ?? "";
}
function kindOf(file) {
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
function canvasToJpeg(canvas) {
	return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
async function renderPptx(file, onProgress) {
	const renderer = new PptxRenderer();
	await renderer.load(file, (_progress, message) => onProgress?.(message || "Reading PowerPoint…"));
	if (!renderer.slideCount) throw new Error("No slides found in that PowerPoint.");
	const slides = [];
	for (let i = 0; i < renderer.slideCount; i++) {
		onProgress?.(`Rendering slide ${i + 1} of ${renderer.slideCount}…`);
		const canvas = document.createElement("canvas");
		await renderer.renderSlide(i, canvas, RENDER_WIDTH);
		slides.push({ src: canvasToJpeg(canvas) });
	}
	renderer.destroy();
	return slides;
}
async function renderPdf(file, onProgress) {
	const data = await file.arrayBuffer();
	const pdf = await getDocument({ data }).promise;
	const slides = [];
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
		await page.render({
			canvas,
			canvasContext: ctx,
			viewport
		}).promise;
		slides.push({ src: canvasToJpeg(canvas) });
	}
	return slides;
}
function readImage(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || ""));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}
async function importFiles(files, onProgress) {
	const imported = [];
	for (const file of files) {
		const kind = kindOf(file);
		if (!kind) throw new Error(`${file.name} is not a PowerPoint, PDF, or image.`);
		if (kind === "pptx" && extOf(file.name) === "ppt") throw new Error("Old .ppt files need to be saved as .pptx or PDF first.");
		onProgress?.(`Opening ${file.name}…`);
		const slides = kind === "pptx" ? await renderPptx(file, onProgress) : kind === "pdf" ? await renderPdf(file, onProgress) : [{ src: await readImage(file) }];
		if (!slides.length) throw new Error(`${file.name} had no slides to show.`);
		onProgress?.(`Sending ${file.name} to the TV…`);
		const deck = {
			id: `deck_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
			name: file.name,
			kind,
			enabled: true,
			createdAt: Date.now(),
			slides
		};
		await putDeck(deck);
		imported.push(deck);
	}
	return imported;
}
function sameDecks(a, b) {
	if (a === b) return true;
	if (a.length !== b.length) return false;
	return a.every((deck, index) => {
		const next = b[index];
		return next && deck.id === next.id && deck.enabled === next.enabled && deck.slides.length === next.slides.length && deck.slides[0]?.src === next.slides[0]?.src;
	});
}
function useMediaLibrary() {
	const [decks, setDecks] = (0, import_react.useState)([]);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let alive = true;
		const refresh = async () => {
			try {
				const rows = await listDecks();
				if (alive) setDecks((prev) => sameDecks(prev, rows) ? prev : rows);
			} finally {
				if (alive) setReady(true);
			}
		};
		refresh();
		const onChange = () => {
			refresh();
		};
		let channel = null;
		try {
			channel = new BroadcastChannel(CHANNEL);
			channel.addEventListener("message", onChange);
		} catch {}
		window.addEventListener(CHANNEL, onChange);
		const poll = window.setInterval(() => {
			refresh();
		}, 4e3);
		return () => {
			alive = false;
			channel?.close();
			window.removeEventListener(CHANNEL, onChange);
			window.clearInterval(poll);
		};
	}, []);
	return {
		decks,
		ready
	};
}
var MILL_HEX = {
	"North Baltimore": {
		fill: "rgba(20,95,189,.78)",
		stroke: "#3f9fff",
		glow: "rgba(63,159,255,.50)",
		accent: "#9fd9ff",
		dark: "#0a2748",
		token: "nb"
	},
	Marshville: {
		fill: "rgba(73,111,45,.78)",
		stroke: "#7bd555",
		glow: "rgba(123,213,85,.43)",
		accent: "#d6f7a8",
		dark: "#142519",
		token: "marshville"
	},
	Henderson: {
		fill: "rgba(124,43,37,.78)",
		stroke: "#ff6f5d",
		glow: "rgba(255,111,93,.43)",
		accent: "#ffd1ba",
		dark: "#281311",
		token: "henderson"
	},
	Albertville: {
		fill: "rgba(103,54,157,.78)",
		stroke: "#bd70ff",
		glow: "rgba(189,112,255,.46)",
		accent: "#ead9ff",
		dark: "#21152f",
		token: "albertville"
	}
};
//#endregion
export { removeDeck as a, initials as i, cn as n, toggleDeck as o, importFiles as r, useMediaLibrary as s, MILL_HEX as t };
