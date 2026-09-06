import { i as DEFAULT_SETTINGS, n as DEFAULT_PLANT_BOARD, o as OUR_PLANT, r as DEFAULT_PRODUCTION, s as PLANT_NAMES, t as DEFAULT_PEOPLE } from "./data-F7qCzk8B.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as format, t as parseISO } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-COqNrb3J.js
var APP_BUILD = "1788636867310";
async function applyAppUpdate(nextPath = "/") {
	try {
		if ("serviceWorker" in navigator) {
			const regs = await navigator.serviceWorker.getRegistrations();
			await Promise.all(regs.map((reg) => reg.unregister()));
		}
		if ("caches" in window) {
			const keys = await caches.keys();
			await Promise.all(keys.map((key) => caches.delete(key)));
		}
		try {
			localStorage.removeItem("nb-mill-pack");
		} catch {}
	} catch {}
	const url = new URL(nextPath, window.location.origin);
	url.searchParams.set("boot", String(Date.now()));
	window.location.replace(url.toString());
}
async function remoteAppBuild() {
	try {
		return (await (await fetch(`/?probe=${Date.now()}`, {
			cache: "no-store",
			headers: { accept: "text/html" }
		})).text()).match(/name="app-build"\s+content="([^"]+)"/i)?.[1] ?? null;
	} catch {
		return null;
	}
}
var REGION_ORDER = [
	"North Baltimore",
	"Henderson",
	"Marshville",
	"Albertville"
];
var MAP_VIEW = {
	w: 1280,
	h: 760,
	cx: 640,
	cy: 385
};
var LAND_SRC = {
	"North Baltimore": "/map/nb-land.jpg",
	Henderson: "/map/henderson-land.jpg",
	Marshville: "/map/marshville-land.jpg",
	Albertville: "/map/albertville-land.jpg"
};
var VOID_SRC = "/map/void.jpg";
var RAW_TERRITORIES = [
	{
		id: "sandusky",
		name: "Sandusky",
		home: "North Baltimore",
		capital: false,
		col: 0,
		row: 0
	},
	{
		id: "fostoria",
		name: "Fostoria",
		home: "North Baltimore",
		capital: false,
		col: 1,
		row: 0
	},
	{
		id: "tiffin",
		name: "Tiffin",
		home: "North Baltimore",
		capital: false,
		col: 2,
		row: 0
	},
	{
		id: "fremont",
		name: "Fremont",
		home: "North Baltimore",
		capital: false,
		col: 0,
		row: 1
	},
	{
		id: "findlay",
		name: "Findlay",
		home: "North Baltimore",
		capital: true,
		col: 1,
		row: 1
	},
	{
		id: "port-clinton",
		name: "Port Clinton",
		home: "North Baltimore",
		capital: false,
		col: 2,
		row: 1
	},
	{
		id: "corydon",
		name: "Corydon",
		home: "Henderson",
		capital: false,
		col: 3,
		row: 0
	},
	{
		id: "madisonville",
		name: "Madisonville",
		home: "Henderson",
		capital: false,
		col: 4,
		row: 0
	},
	{
		id: "evansville",
		name: "Evansville",
		home: "Henderson",
		capital: false,
		col: 5,
		row: 0
	},
	{
		id: "newburgh",
		name: "Newburgh",
		home: "Henderson",
		capital: false,
		col: 3,
		row: 1
	},
	{
		id: "henderson",
		name: "Henderson",
		home: "Henderson",
		capital: true,
		col: 4,
		row: 1
	},
	{
		id: "owensboro",
		name: "Owensboro",
		home: "Henderson",
		capital: false,
		col: 5,
		row: 1
	},
	{
		id: "wingate",
		name: "Wingate",
		home: "Marshville",
		capital: false,
		col: 0,
		row: 2
	},
	{
		id: "marshville",
		name: "Marshville",
		home: "Marshville",
		capital: true,
		col: 1,
		row: 2
	},
	{
		id: "peachland",
		name: "Peachland",
		home: "Marshville",
		capital: false,
		col: 2,
		row: 2
	},
	{
		id: "monroe",
		name: "Monroe",
		home: "Marshville",
		capital: false,
		col: 0,
		row: 3
	},
	{
		id: "wadesboro",
		name: "Wadesboro",
		home: "Marshville",
		capital: false,
		col: 1,
		row: 3
	},
	{
		id: "pageland",
		name: "Pageland",
		home: "Marshville",
		capital: false,
		col: 2,
		row: 3
	},
	{
		id: "crossville",
		name: "Crossville",
		home: "Albertville",
		capital: false,
		col: 3,
		row: 2
	},
	{
		id: "albertville",
		name: "Albertville",
		home: "Albertville",
		capital: true,
		col: 4,
		row: 2
	},
	{
		id: "arab",
		name: "Arab",
		home: "Albertville",
		capital: false,
		col: 5,
		row: 2
	},
	{
		id: "fyffe",
		name: "Fyffe",
		home: "Albertville",
		capital: false,
		col: 3,
		row: 3
	},
	{
		id: "guntersville",
		name: "Guntersville",
		home: "Albertville",
		capital: false,
		col: 4,
		row: 3
	},
	{
		id: "boaz",
		name: "Boaz",
		home: "Albertville",
		capital: false,
		col: 5,
		row: 3
	}
];
function orthogonalNeighbors(col, row) {
	return RAW_TERRITORIES.filter((other) => Math.abs(other.col - col) + Math.abs(other.row - row) === 1).map((other) => other.id);
}
var TERRITORIES = RAW_TERRITORIES.map((row) => ({
	...row,
	neighbors: orthogonalNeighbors(row.col, row.row)
}));
var TERRITORY_BY_ID = Object.fromEntries(TERRITORIES.map((row) => [row.id, row]));
function clampNum(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
function pathFromPoints(points) {
	return `M ${points.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join(" L ")} Z`;
}
function round1(value) {
	return Math.round(value * 10) / 10;
}
function smoothClosedPath(points) {
	const n = points.length;
	if (n < 3) return pathFromPoints(points);
	const tension = 9.6;
	let d = "";
	for (let i = 0; i < n; i++) {
		const p0 = points[(i - 1 + n) % n];
		const p1 = points[i];
		const p2 = points[(i + 1) % n];
		const p3 = points[(i + 2) % n];
		const c1x = p1[0] + (p2[0] - p0[0]) / tension;
		const c1y = p1[1] + (p2[1] - p0[1]) / tension;
		const c2x = p2[0] - (p3[0] - p1[0]) / tension;
		const c2y = p2[1] - (p3[1] - p1[1]) / tension;
		if (i === 0) d = `M ${round1(p1[0])} ${round1(p1[1])}`;
		d += ` C ${round1(c1x)} ${round1(c1y)} ${round1(c2x)} ${round1(c2y)} ${round1(p2[0])} ${round1(p2[1])}`;
	}
	return `${d} Z`;
}
function boundsFromPoints(points) {
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const [x, y] of points) {
		minX = Math.min(minX, x);
		minY = Math.min(minY, y);
		maxX = Math.max(maxX, x);
		maxY = Math.max(maxY, y);
	}
	return {
		minX,
		minY,
		maxX,
		maxY
	};
}
function makeArrowPath(from, to, lift) {
	const midX = (from[0] + to[0]) / 2;
	const midY = (from[1] + to[1]) / 2 - lift;
	return `M ${Math.round(from[0])} ${Math.round(from[1])} Q ${round1(midX)} ${round1(midY)} ${Math.round(to[0])} ${Math.round(to[1])}`;
}
function hash01(seed, i) {
	const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
	return x - Math.floor(x);
}
function seedOf(id) {
	let s = 17;
	for (let i = 0; i < id.length; i++) s = s * 33 + id.charCodeAt(i) | 0;
	return Math.abs(s);
}
function polygonCentroid(points) {
	let area = 0;
	let cx = 0;
	let cy = 0;
	const n = points.length;
	for (let i = 0; i < n; i++) {
		const [x0, y0] = points[i];
		const [x1, y1] = points[(i + 1) % n];
		const cross = x0 * y1 - x1 * y0;
		area += cross;
		cx += (x0 + x1) * cross;
		cy += (y0 + y1) * cross;
	}
	area *= .5;
	if (Math.abs(area) < 1) {
		const b = boundsFromPoints(points);
		return [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2];
	}
	return [cx / (6 * area), cy / (6 * area)];
}
var PLAY_RX = MAP_VIEW.w * .462;
var PLAY_RY = MAP_VIEW.h * .424;
function coastScale(angle) {
	const westBay = Math.exp(-Math.pow((angle - 2.85) / .42, 2)) * .14;
	const southBite = Math.exp(-Math.pow((angle - 1.45) / .5, 2)) * .09;
	const northCape = Math.exp(-Math.pow((angle + 1.55) / .55, 2)) * .07;
	return 1 + .06 * Math.sin(angle * 2.2 + .4) + .045 * Math.sin(angle * 4.1 - .7) + .028 * Math.cos(angle * 6.4 + 1.2) + northCape - westBay - southBite;
}
function inPlay(x, y) {
	const dx = x - MAP_VIEW.cx;
	const dy = y - MAP_VIEW.cy;
	const s = coastScale(Math.atan2(dy, dx));
	const nx = dx / (PLAY_RX * s);
	const ny = dy / (PLAY_RY * s);
	return nx * nx + ny * ny <= 1;
}
var SITE_BASE = {
	sandusky: [152, 118],
	fostoria: [418, 82],
	tiffin: [568, 168],
	fremont: [128, 318],
	findlay: [312, 248],
	"port-clinton": [486, 338],
	corydon: [708, 158],
	madisonville: [972, 78],
	evansville: [1158, 132],
	newburgh: [722, 348],
	henderson: [948, 252],
	owensboro: [1148, 328],
	wingate: [138, 428],
	marshville: [322, 468],
	peachland: [538, 418],
	monroe: [122, 632],
	wadesboro: [348, 658],
	pageland: [548, 598],
	crossville: [738, 432],
	albertville: [948, 472],
	arab: [1152, 418],
	fyffe: [708, 618],
	guntersville: [942, 668],
	boaz: [1162, 598]
};
var SITE_WEIGHT = {
	sandusky: .7,
	fostoria: 1.16,
	tiffin: .86,
	fremont: 1.08,
	findlay: 1.46,
	"port-clinton": .74,
	corydon: .8,
	madisonville: 1.12,
	evansville: .68,
	newburgh: .88,
	henderson: 1.44,
	owensboro: 1.02,
	wingate: .72,
	marshville: 1.4,
	peachland: .9,
	monroe: 1.18,
	wadesboro: .82,
	pageland: 1.04,
	crossville: .84,
	albertville: 1.42,
	arab: .7,
	fyffe: .94,
	guntersville: 1.2,
	boaz: .76
};
function pullInside(x, y) {
	for (let i = 0; i < 14; i++) {
		if (inPlay(x, y)) return [x, y];
		x = x * .9 + MAP_VIEW.cx * .1;
		y = y * .9 + MAP_VIEW.cy * .1;
	}
	return [x, y];
}
function siteOf(spec) {
	const [bx, by] = SITE_BASE[spec.id];
	const seed = seedOf(spec.id);
	const [px, py] = pullInside(bx + (hash01(seed, 1) - .5) * 22, by + (hash01(seed, 2) - .5) * 18);
	return [round1(px), round1(py)];
}
function siteWeight(id) {
	return SITE_WEIGHT[id] ?? 1;
}
function assignedId(x, y, sites, weights) {
	if (!inPlay(x, y)) return null;
	let best = "";
	let bestScore = Infinity;
	for (const spec of TERRITORIES) {
		const [sx, sy] = sites[spec.id];
		const w = weights[spec.id];
		const dx = x - sx;
		const dy = y - sy;
		const score = (dx * dx + dy * dy) / (w * w);
		if (score < bestScore) {
			bestScore = score;
			best = spec.id;
		}
	}
	return best || null;
}
function rayContour(id, origin, sites, weights) {
	const n = 36;
	const seed = seedOf(id);
	const span = [];
	let total = 0;
	for (let i = 0; i < n; i++) {
		const s = .55 + hash01(seed, i) * 1.15;
		span.push(s);
		total += s;
	}
	const pts = [];
	let ang = hash01(seed, 99) * .5;
	for (let i = 0; i < n; i++) {
		ang += span[i] / total * Math.PI * 2;
		const dx = Math.cos(ang);
		const dy = Math.sin(ang);
		let lo = 8;
		let hi = 680;
		for (let iter = 0; iter < 18; iter++) {
			const mid = (lo + hi) / 2;
			if (assignedId(origin[0] + dx * mid, origin[1] + dy * mid, sites, weights) === id) lo = mid;
			else hi = mid;
		}
		const coast = .99 + .025 * hash01(seed, i + 90);
		const r = Math.max(18, lo * coast);
		pts.push([round1(origin[0] + dx * r), round1(origin[1] + dy * r)]);
	}
	return pts;
}
function islandPoints() {
	const n = 80;
	const pts = [];
	for (let i = 0; i < n; i++) {
		const a = i / n * Math.PI * 2;
		const dx = Math.cos(a);
		const dy = Math.sin(a);
		let lo = 40;
		let hi = 720;
		for (let iter = 0; iter < 16; iter++) {
			const mid = (lo + hi) / 2;
			if (inPlay(MAP_VIEW.cx + dx * mid, MAP_VIEW.cy + dy * mid)) lo = mid;
			else hi = mid;
		}
		pts.push([round1(MAP_VIEW.cx + dx * lo), round1(MAP_VIEW.cy + dy * lo)]);
	}
	return pts;
}
var GEOM = null;
var ISLAND = null;
function islandPath() {
	if (ISLAND) return ISLAND;
	ISLAND = smoothClosedPath(islandPoints());
	return ISLAND;
}
function territoryGeometry() {
	if (GEOM) return GEOM;
	const sites = {};
	const weights = {};
	for (const spec of TERRITORIES) {
		sites[spec.id] = siteOf(spec);
		weights[spec.id] = siteWeight(spec.id);
	}
	const next = {};
	for (const spec of TERRITORIES) {
		let pts = rayContour(spec.id, sites[spec.id], sites, weights);
		const span = boundsFromPoints(pts);
		if (span.maxX - span.minX < 64 || span.maxY - span.minY < 52) {
			const [cx, cy] = sites[spec.id];
			pts = [];
			for (let i = 0; i < 28; i++) {
				const a = i / 28 * Math.PI * 2;
				const n1 = .86 + .22 * hash01(seedOf(spec.id), i + 4);
				pts.push([round1(cx + Math.cos(a) * 62 * n1), round1(cy + Math.sin(a) * 48 * n1)]);
			}
		}
		const centroid = polygonCentroid(pts);
		const b = boundsFromPoints(pts);
		next[spec.id] = {
			...spec,
			path: smoothClosedPath(pts),
			points: pts,
			centroid: [Math.round(centroid[0]), Math.round(centroid[1])],
			label: [Math.round(centroid[0]), Math.round(centroid[1])],
			bounds: [
				b.minX,
				b.minY,
				b.maxX,
				b.maxY
			]
		};
	}
	GEOM = next;
	return next;
}
function freshBoard() {
	const owners = {};
	for (const row of TERRITORIES) owners[row.id] = row.home;
	return owners;
}
function countBoard(owners) {
	const counts = {
		Marshville: 0,
		Henderson: 0,
		"North Baltimore": 0,
		Albertville: 0
	};
	for (const row of TERRITORIES) {
		const owner = owners[row.id] ?? row.home;
		counts[owner] += 1;
	}
	return counts;
}
function capitalOf(mill) {
	return TERRITORIES.find((row) => row.home === mill && row.capital);
}
function continentBounds(mill) {
	const geom = territoryGeometry();
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const row of TERRITORIES) {
		if (row.home !== mill) continue;
		const [x0, y0, x1, y1] = geom[row.id].bounds;
		minX = Math.min(minX, x0);
		minY = Math.min(minY, y0);
		maxX = Math.max(maxX, x1);
		maxY = Math.max(maxY, y1);
	}
	return [
		minX,
		minY,
		maxX,
		maxY
	];
}
function captureLabelPoint(_from, taken) {
	return [Math.round(clampNum(taken.centroid[0], 140, MAP_VIEW.w - 140)), Math.round(clampNum(taken.centroid[1] - 56, 42, MAP_VIEW.h - 56))];
}
function visibleCaptures(transfers) {
	return transfers.filter((t) => t.applied && t.winner !== t.loser && t.territoryId);
}
function legalFronts(owners, attacker, tons, blockedLosers, usedTerritory) {
	const result = [];
	const attackerTons = tons[attacker] ?? 0;
	for (const from of TERRITORIES) {
		if (owners[from.id] !== attacker) continue;
		for (const nid of from.neighbors) {
			if (usedTerritory.has(nid)) continue;
			const spec = TERRITORY_BY_ID[nid];
			const holder = owners[nid];
			if (!spec || !holder || holder === attacker) continue;
			if (blockedLosers.has(holder)) continue;
			if ((tons[holder] ?? 0) >= attackerTons) continue;
			if (spec.capital) continue;
			if (TERRITORIES.reduce((sum, row) => sum + (owners[row.id] === holder ? 1 : 0), 0) <= 1) continue;
			result.push({
				loser: holder,
				province: spec,
				from
			});
		}
	}
	return result;
}
function formatTons(value, signed = false) {
	const abs = Math.abs(value);
	const body = abs % 1 ? abs.toLocaleString("en-US", { maximumFractionDigits: 1 }) : abs.toLocaleString("en-US");
	if (signed) {
		if (value > 0) return `+${body}`;
		if (value < 0) return `-${body}`;
	}
	return body;
}
function formatWeekEnding(iso) {
	if (!iso) return "";
	try {
		return format(parseISO(iso), "EEEE, MMMM d, yyyy");
	} catch {
		return iso;
	}
}
function formatWeekRange(iso) {
	try {
		const end = parseISO(iso);
		const start = new Date(end);
		start.setDate(start.getDate() - 6);
		return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
	} catch {
		return iso;
	}
}
function formatWeekShort(iso) {
	try {
		return format(parseISO(iso), "MMM d");
	} catch {
		return iso;
	}
}
function lastClosedPair(state) {
	const weeks = historyWeeksChrono(state, productionYear(state));
	return {
		current: weeks[weeks.length - 1] ?? null,
		previous: weeks[weeks.length - 2] ?? null
	};
}
function rankChangeTrends(plants, previous) {
	if (!previous || plants.every((plant) => plant.tons <= 0)) return {};
	const nextRanks = Object.fromEntries(rankedProduction(plants).map((row) => [row.name, row.rank]));
	const oldRanks = Object.fromEntries(rankedProduction(previous.plants).map((row) => [row.name, row.rank]));
	const trends = {};
	for (const name of PLANT_NAMES) {
		const moved = (oldRanks[name] ?? 4) - (nextRanks[name] ?? 4);
		if (moved > 0) trends[name] = {
			label: `UP ${moved} PLACE${moved === 1 ? "" : "S"} VS LAST WEEK`,
			class: nextRanks[name] === 1 ? "lead" : "gain",
			symbol: "▲",
			dir: "up",
			delta: moved
		};
		else if (moved < 0) {
			const down = -moved;
			trends[name] = {
				label: `DOWN ${down} PLACE${down === 1 ? "" : "S"} VS LAST WEEK`,
				class: "loss",
				symbol: "▼",
				dir: "down",
				delta: moved
			};
		} else trends[name] = {
			label: nextRanks[name] === 1 ? "HOLDING THE LEAD" : "HOLDING PLACE",
			class: nextRanks[name] === 1 ? "lead" : "neutral",
			symbol: "•",
			dir: "flat",
			delta: 0
		};
	}
	return trends;
}
function rankedProduction(plants, wins = {}, trends = {}) {
	const rows = plants.map((plant) => ({
		name: plant.name,
		tons: plant.tons,
		our: plant.name === OUR_PLANT,
		wins: wins[plant.name] ?? 0
	}));
	rows.sort((a, b) => b.tons - a.tons || a.name.localeCompare(b.name));
	const leader = rows[0]?.tons ?? 0;
	return rows.map((row, index) => {
		const rank = index + 1;
		const gap = Math.max(0, leader - row.tons);
		const trend = trends[row.name];
		return {
			name: row.name,
			tons: row.tons,
			tonsDisplay: formatTons(row.tons),
			rank,
			our: row.our,
			wins: row.wins,
			gapLabel: rank === 1 ? "LEADER" : `${formatTons(gap)} TONS BACK`,
			barPercent: leader > 0 ? Math.round(Math.max(4, Math.min(100, row.tons / leader * 100)) * 10) / 10 : 0,
			trendLabel: trend?.label ?? "",
			trendClass: trend?.class ?? "neutral",
			trendSymbol: trend?.symbol ?? "•"
		};
	});
}
function productionYear(state) {
	try {
		return parseISO(state.weekEnding).getFullYear();
	} catch {
		return 2026;
	}
}
function ytdProduction(state) {
	const year = productionYear(state);
	const totals = {
		Marshville: 0,
		Henderson: 0,
		"North Baltimore": 0,
		Albertville: 0
	};
	const wins = {
		Marshville: 0,
		Henderson: 0,
		"North Baltimore": 0,
		Albertville: 0
	};
	for (const entry of state.history) {
		if (!entry.weekEnding.startsWith(String(year))) continue;
		for (const plant of entry.plants) totals[plant.name] += plant.tons;
		for (const winner of entry.winners) wins[winner] += 1;
	}
	for (const plant of state.plants) totals[plant.name] += plant.tons;
	const plants = PLANT_NAMES.map((name) => ({
		name,
		tons: totals[name],
		wins: wins[name]
	}));
	return {
		year,
		plants,
		ranked: rankedProduction(plants, wins)
	};
}
function historyWeeksChrono(state, year) {
	return state.history.filter((entry) => entry.weekEnding.startsWith(String(year))).slice().sort((a, b) => a.weekEnding.localeCompare(b.weekEnding));
}
function applyBattleWeek(owners, plants) {
	const ranked = rankedProduction(plants);
	const transfers = [];
	if (ranked.length < 4) return transfers;
	if (ranked.reduce((sum, row) => sum + row.tons, 0) <= 0) return transfers;
	const tons = Object.fromEntries(plants.map((plant) => [plant.name, plant.tons]));
	const targeted = /* @__PURE__ */ new Set();
	const usedTerritory = /* @__PURE__ */ new Set();
	for (const row of ranked) {
		if (transfers.length >= 2) break;
		if (row.tons <= 0) continue;
		const fronts = legalFronts(owners, row.name, tons, targeted, usedTerritory);
		if (!fronts.length) continue;
		const land = countBoard(owners);
		const loser = [...new Set(fronts.map((front) => front.loser))].sort((a, b) => {
			const landGap = (land[b] ?? 0) - (land[a] ?? 0);
			if (landGap) return landGap;
			const tonGap = (tons[a] ?? 0) - (tons[b] ?? 0);
			if (tonGap) return tonGap;
			return a.localeCompare(b);
		})[0];
		if (!loser) continue;
		const attCentroid = centroidOfMill(owners, row.name);
		const pick = fronts.filter((front) => front.loser === loser).sort((a, b) => {
			const liberate = Number(b.province.home === row.name) - Number(a.province.home === row.name);
			if (liberate) return liberate;
			const homeBias = Number(b.province.home === loser) - Number(a.province.home === loser);
			if (homeBias) return homeBias;
			const pa = [a.province.col, a.province.row];
			const pb = [b.province.col, b.province.row];
			const distA = Math.hypot(pa[0] - attCentroid[0], pa[1] - attCentroid[1]);
			const distB = Math.hypot(pb[0] - attCentroid[0], pb[1] - attCentroid[1]);
			if (distA !== distB) return distA - distB;
			return a.province.name.localeCompare(b.province.name);
		})[0];
		if (!pick) continue;
		owners[pick.province.id] = row.name;
		targeted.add(loser);
		usedTerritory.add(pick.province.id);
		transfers.push({
			winner: row.name,
			loser,
			major: row.rank === 1,
			applied: true,
			territoryId: pick.province.id,
			territoryName: pick.province.name,
			fromId: pick.from.id,
			fromName: pick.from.name
		});
	}
	return transfers;
}
function centroidOfMill(owners, mill) {
	let x = 0;
	let y = 0;
	let n = 0;
	for (const [id, owner] of Object.entries(owners)) {
		if (owner !== mill) continue;
		const spec = TERRITORY_BY_ID[id];
		if (!spec) continue;
		x += spec.col;
		y += spec.row;
		n += 1;
	}
	if (!n) return [2.5, 1.5];
	return [x / n, y / n];
}
function battleAllocations(state, includeOpenWeek) {
	const year = productionYear(state);
	const owners = freshBoard();
	const weeks = historyWeeksChrono(state, year);
	const campaign = weeks.slice(-8);
	let lastTransfers = [];
	for (const week of campaign) {
		const takes = applyBattleWeek(owners, week.plants);
		if (takes.length) lastTransfers = takes;
	}
	const openTotal = state.plants.reduce((sum, plant) => sum + plant.tons, 0);
	if (includeOpenWeek && openTotal > 0) {
		const takes = applyBattleWeek(owners, state.plants);
		if (takes.length) lastTransfers = takes;
	}
	return {
		allocations: countBoard(owners),
		owners,
		lastTransfers,
		completedWeeks: weeks.length,
		campaignWeeks: campaign.length
	};
}
function weeklySource(state) {
	if (state.plants.reduce((sum, plant) => sum + plant.tons, 0) > 0) return {
		plants: state.plants,
		live: true,
		weekEnding: state.weekEnding,
		label: "CURRENT WEEK"
	};
	const latest = state.history.slice().sort((a, b) => b.weekEnding.localeCompare(a.weekEnding))[0];
	if (latest) return {
		plants: latest.plants,
		live: false,
		weekEnding: latest.weekEnding,
		label: "LAST COMPLETED WEEK"
	};
	return {
		plants: state.plants,
		live: false,
		weekEnding: state.weekEnding,
		label: "WAITING"
	};
}
function conquestContext(state) {
	const weekly = weeklySource(state);
	const lastClosed = lastClosedPair(state);
	const priorWeek = weekly.live ? lastClosed.current : lastClosed.previous;
	const weeklyRanked = rankedProduction(weekly.plants, {}, rankChangeTrends(weekly.plants, priorWeek));
	const ytd = ytdProduction(state);
	const includeOpen = weekly.live;
	const battle = battleAllocations(state, includeOpen);
	const weeklyLookup = Object.fromEntries(weeklyRanked.map((row) => [row.name, row]));
	const ytdLookup = Object.fromEntries(ytd.ranked.map((row) => [row.name, row]));
	const seasonOrder = [...PLANT_NAMES].sort((a, b) => {
		const terr = battle.allocations[b] - battle.allocations[a];
		if (terr) return terr;
		return (ytdLookup[b]?.tons ?? 0) - (ytdLookup[a]?.tons ?? 0);
	});
	const weeklyLeader = weeklyRanked[0]?.name;
	const seasonLeader = seasonOrder[0];
	const territories = PLANT_NAMES.map((name, slot) => {
		const weekRow = weeklyLookup[name];
		const ytdRow = ytdLookup[name];
		return {
			name,
			our: name === OUR_PLANT,
			weeklyRank: weekRow?.rank ?? slot + 1,
			seasonRank: ytdRow?.rank ?? slot + 1,
			weeklyTons: weekRow?.tons ?? 0,
			weeklyTonsDisplay: weekRow?.tonsDisplay ?? "0",
			ytdTons: ytdRow?.tons ?? 0,
			ytdTonsDisplay: ytdRow?.tonsDisplay ?? "0",
			wins: ytdRow?.wins ?? 0,
			territories: battle.allocations[name] ?? 0,
			weeklyGapLabel: weekRow?.gapLabel ?? "",
			seasonGapLabel: ytdRow?.gapLabel ?? "",
			trendLabel: weekRow?.trendLabel ?? "",
			trendSymbol: weekRow?.trendSymbol ?? "•",
			trendDir: weekRow?.trendClass === "loss" ? "down" : weekRow?.trendClass === "gain" || weekRow?.trendClass === "lead" ? "up" : "flat",
			leader: name === weeklyLeader,
			seasonLeader: name === seasonLeader
		};
	});
	const territoryRows = territories.slice().sort((a, b) => {
		const t = b.territories - a.territories;
		if (t) return t;
		return b.ytdTons - a.ytdTons;
	});
	return {
		weeklyRanked,
		ytdRanked: ytd.ranked,
		territories,
		territoryRows,
		weeklyLeader: weeklyLeader ?? "",
		seasonLeader: seasonLeader ?? "",
		weeklyLive: weekly.live,
		weeklySourceLabel: weekly.label,
		weekEnding: weekly.weekEnding,
		weekEndingDisplay: formatWeekEnding(weekly.weekEnding),
		weekRangeDisplay: formatWeekRange(weekly.weekEnding).toUpperCase(),
		weekNumber: Math.max(1, battle.completedWeeks + (weekly.live ? 1 : 0)),
		year: ytd.year,
		completedWeeks: battle.completedWeeks,
		campaignWeeks: battle.campaignWeeks,
		lastTransfers: battle.lastTransfers,
		allocations: battle.allocations,
		owners: battle.owners,
		ytd
	};
}
function productionRecords(state) {
	const weeks = historyWeeksChrono(state, productionYear(state));
	const stats = Object.fromEntries(PLANT_NAMES.map((name) => [name, {
		name,
		wins: 0,
		currentStreak: 0,
		longestStreak: 0,
		longestStreakEnd: null,
		bestWeekTons: 0,
		bestWeekEnding: null,
		biggestMargin: 0,
		biggestMarginWeek: null
	}]));
	const runs = {
		Marshville: 0,
		Henderson: 0,
		"North Baltimore": 0,
		Albertville: 0
	};
	let overallBest = {
		name: "",
		tons: 0,
		weekEnding: null
	};
	let biggestWin = {
		name: "",
		margin: 0,
		weekEnding: null,
		tons: 0
	};
	for (const week of weeks) {
		const values = {};
		for (const plant of week.plants) values[plant.name] = plant.tons;
		const ordered = Object.values(values).sort((a, b) => (b ?? 0) - (a ?? 0));
		const leaderTons = ordered[0] ?? 0;
		const runner = ordered[1] ?? 0;
		const margin = Math.max(0, leaderTons - runner);
		const winners = new Set(week.winners.length ? week.winners : week.plants.filter((p) => p.tons === leaderTons).map((p) => p.name));
		for (const name of PLANT_NAMES) {
			const tons = values[name] ?? 0;
			const stat = stats[name];
			if (tons > stat.bestWeekTons) {
				stat.bestWeekTons = tons;
				stat.bestWeekEnding = week.weekEnding;
			}
			if (tons > overallBest.tons) overallBest = {
				name,
				tons,
				weekEnding: week.weekEnding
			};
			if (winners.has(name)) {
				stat.wins += 1;
				runs[name] += 1;
				if (runs[name] > stat.longestStreak) {
					stat.longestStreak = runs[name];
					stat.longestStreakEnd = week.weekEnding;
				}
				if (margin > stat.biggestMargin) {
					stat.biggestMargin = margin;
					stat.biggestMarginWeek = week.weekEnding;
				}
			} else runs[name] = 0;
		}
		if (margin > biggestWin.margin && winners.size) biggestWin = {
			name: [...winners].join(" & "),
			margin,
			weekEnding: week.weekEnding,
			tons: leaderTons
		};
	}
	for (const name of PLANT_NAMES) stats[name].currentStreak = runs[name];
	const latest = weeks[weeks.length - 1];
	return {
		completedWeeks: weeks.length,
		latestWinnerLabel: latest?.winners.join(" & ") || "No completed week",
		latestWeekDisplay: latest ? formatWeekEnding(latest.weekEnding) : "No completed week",
		overallBest: {
			name: overallBest.name,
			tons: overallBest.tons,
			tonsDisplay: formatTons(overallBest.tons),
			weekDisplay: overallBest.weekEnding ? formatWeekEnding(overallBest.weekEnding) : ""
		},
		biggestWin: {
			name: biggestWin.name,
			margin: biggestWin.margin,
			marginDisplay: formatTons(biggestWin.margin),
			weekDisplay: biggestWin.weekEnding ? formatWeekEnding(biggestWin.weekEnding) : ""
		},
		currentStreakLabel: PLANT_NAMES.filter((n) => stats[n].currentStreak === Math.max(...PLANT_NAMES.map((x) => stats[x].currentStreak))).filter((n) => stats[n].currentStreak > 0).join(" & ") || "No active streak",
		currentStreakCount: Math.max(...PLANT_NAMES.map((n) => stats[n].currentStreak)),
		rows: PLANT_NAMES.map((name) => ({
			...stats[name],
			our: name === OUR_PLANT,
			bestWeekDisplay: formatTons(stats[name].bestWeekTons)
		}))
	};
}
function weeklyGraph(state, limit = 12) {
	const weeks = historyWeeksChrono(state, productionYear(state)).slice(-limit);
	const latest = weeks[weeks.length - 1];
	const previous = weeks[weeks.length - 2];
	const latestRanked = latest ? rankedProduction(latest.plants) : [];
	const prevMap = Object.fromEntries((previous?.plants ?? []).map((plant) => [plant.name, plant.tons]));
	const mills = PLANT_NAMES.map((name) => {
		const tons = latest?.plants.find((plant) => plant.name === name)?.tons ?? 0;
		const prev = prevMap[name];
		const delta = prev == null ? 0 : tons - prev;
		const dir = prev == null || Math.abs(delta) < .05 ? "flat" : delta > 0 ? "up" : "down";
		return {
			name,
			our: name === OUR_PLANT,
			tons,
			tonsDisplay: formatTons(tons),
			previous: prev ?? null,
			delta,
			deltaDisplay: prev == null ? "—" : formatTons(delta, true),
			dir,
			symbol: dir === "up" ? "▲" : dir === "down" ? "▼" : "•",
			rank: latestRanked.find((row) => row.name === name)?.rank ?? 0
		};
	}).sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));
	return {
		plants: [...PLANT_NAMES],
		weeks: weeks.map((week) => ({
			label: formatWeekShort(week.weekEnding),
			weekEnding: week.weekEnding,
			values: Object.fromEntries(week.plants.map((plant) => [plant.name, plant.tons]))
		})),
		count: weeks.length,
		latestLabel: latest ? formatWeekEnding(latest.weekEnding) : "",
		previousLabel: previous ? formatWeekShort(previous.weekEnding) : "",
		mills
	};
}
function closeWeek(state) {
	if (state.plants.reduce((sum, plant) => sum + plant.tons, 0) <= 0) return state;
	if (state.history.some((entry) => entry.weekEnding === state.weekEnding)) return state;
	const ranked = rankedProduction(state.plants);
	const leaderTons = ranked[0]?.tons ?? 0;
	const winners = ranked.filter((row) => row.tons === leaderTons).map((row) => row.name);
	const next = new Date(parseISO(state.weekEnding));
	next.setDate(next.getDate() + 7);
	return {
		weekEnding: format(next, "yyyy-MM-dd"),
		lastUpdated: Date.now(),
		history: [{
			id: `week_${state.weekEnding}`,
			weekEnding: state.weekEnding,
			plants: state.plants.map((p) => ({ ...p })),
			winners
		}, ...state.history],
		plants: PLANT_NAMES.map((name) => ({
			name,
			tons: 0
		}))
	};
}
function editHistoryWeek(state, id, plants) {
	const nextPlants = PLANT_NAMES.map((name) => ({
		name,
		tons: Math.max(0, plants.find((p) => p.name === name)?.tons ?? 0)
	}));
	const ranked = rankedProduction(nextPlants);
	const leaderTons = ranked[0]?.tons ?? 0;
	const winners = ranked.filter((row) => row.tons === leaderTons).map((row) => row.name);
	return {
		...state,
		lastUpdated: Date.now(),
		history: state.history.map((entry) => entry.id === id ? {
			...entry,
			plants: nextPlants,
			winners
		} : entry)
	};
}
var seed = {
	production: DEFAULT_PRODUCTION,
	plantBoard: DEFAULT_PLANT_BOARD,
	people: DEFAULT_PEOPLE,
	announcement: null,
	settings: DEFAULT_SETTINGS
};
var useDisplayStore = create()(persist((set, get) => ({
	...seed,
	setPlantTons: (name, tons) => set((state) => ({ production: {
		...state.production,
		lastUpdated: Date.now(),
		plants: state.production.plants.map((plant) => plant.name === name ? {
			...plant,
			tons: Math.max(0, tons)
		} : plant)
	} })),
	setAllPlantTons: (plants) => set((state) => ({ production: {
		...state.production,
		lastUpdated: Date.now(),
		plants
	} })),
	closeCurrentWeek: () => {
		const current = get().production;
		if (current.plants.reduce((sum, plant) => sum + plant.tons, 0) <= 0) return {
			ok: false,
			message: "Enter tons before locking Saturday."
		};
		if (current.history.some((entry) => entry.weekEnding === current.weekEnding)) return {
			ok: false,
			message: "That week is already in history."
		};
		const ranked = rankedProduction(current.plants);
		const leaderTons = ranked[0]?.tons ?? 0;
		const winners = ranked.filter((row) => row.tons === leaderTons).map((row) => row.name);
		const nb = ranked.find((row) => row.name === OUR_PLANT);
		set({ production: closeWeek(current) });
		return {
			ok: true,
			message: "Saturday archived. New week reset to zero.",
			nbWin: winners.includes(OUR_PLANT),
			tonsDisplay: nb?.tonsDisplay ?? formatTons(nb?.tons ?? 0)
		};
	},
	resetCurrentWeek: () => set((state) => ({ production: {
		...state.production,
		lastUpdated: Date.now(),
		plants: state.production.plants.map((plant) => ({
			...plant,
			tons: 0
		}))
	} })),
	resetAllProduction: () => set((state) => ({ production: {
		weekEnding: state.production.weekEnding,
		lastUpdated: Date.now(),
		history: [],
		plants: PLANT_NAMES.map((name) => ({
			name,
			tons: 0
		}))
	} })),
	updateHistoryWeek: (id, plants) => set((state) => ({ production: editHistoryWeek(state.production, id, plants) })),
	setPlantBoard: (board) => set({ plantBoard: board }),
	setPeople: (people) => set({ people }),
	addPerson: (person) => set((state) => ({ people: [...state.people, {
		...person,
		id: `p_${Math.random().toString(36).slice(2, 9)}`
	}] })),
	updatePerson: (id, patch) => set((state) => ({ people: state.people.map((item) => item.id === id ? {
		...item,
		...patch
	} : item) })),
	removePerson: (id) => set((state) => ({ people: state.people.filter((item) => item.id !== id) })),
	postAnnouncement: (message, type, minutes) => set({ announcement: {
		message: message.trim().slice(0, 500),
		type,
		createdAt: Date.now(),
		expiresAt: Date.now() + minutes * 60 * 1e3
	} }),
	clearAnnouncement: () => set({ announcement: null }),
	setSettings: (patch) => set((state) => ({ settings: {
		...state.settings,
		...patch
	} })),
	resetDemo: () => set({
		...seed,
		announcement: null
	})
}), {
	name: "breakroom-kiosk-people-v1",
	partialize: (state) => ({ people: state.people })
}));
//#endregion
export { useDisplayStore as C, ytdProduction as E, territoryGeometry as S, weeklyGraph as T, makeArrowPath as _, TERRITORY_BY_ID as a, rankedProduction as b, capitalOf as c, continentBounds as d, countBoard as f, lastClosedPair as g, islandPath as h, REGION_ORDER as i, captureLabelPoint as l, formatWeekEnding as m, LAND_SRC as n, VOID_SRC as o, formatTons as p, MAP_VIEW as r, applyAppUpdate as s, APP_BUILD as t, conquestContext as u, productionRecords as v, visibleCaptures as w, remoteAppBuild as x, rankChangeTrends as y };
