import type { CaptureTransfer, PlantName } from "@/lib/types";

export type Point = [number, number];

export const REGION_ORDER: PlantName[] = [
  "North Baltimore",
  "Henderson",
  "Marshville",
  "Albertville",
];

export type TerrainKind = "forest" | "rock" | "river" | "mountain";

export const MAP_VIEW = { w: 1280, h: 760, cx: 640, cy: 385 };

export const LAND_SRC: Record<PlantName, string> = {
  "North Baltimore": "/map/nb-land.jpg",
  Henderson: "/map/henderson-land.jpg",
  Marshville: "/map/marshville-land.jpg",
  Albertville: "/map/albertville-land.jpg",
};

export const VOID_SRC = "/map/void.jpg";

export const TERRAIN: Record<PlantName, TerrainKind> = {
  "North Baltimore": "river",
  Henderson: "rock",
  Marshville: "forest",
  Albertville: "mountain",
};

export type TerritorySpec = {
  id: string;
  name: string;
  home: PlantName;
  capital: boolean;
  col: number;
  row: number;
  neighbors: string[];
};

export type BoardOwner = Record<string, PlantName>;

export type TerritoryView = TerritorySpec & {
  path: string;
  points: Point[];
  centroid: Point;
  label: Point;
  bounds: [number, number, number, number];
};

const RAW_TERRITORIES: Array<Omit<TerritorySpec, "neighbors">> = [
  { id: "sandusky", name: "Sandusky", home: "North Baltimore", capital: false, col: 0, row: 0 },
  { id: "fostoria", name: "Fostoria", home: "North Baltimore", capital: false, col: 1, row: 0 },
  { id: "tiffin", name: "Tiffin", home: "North Baltimore", capital: false, col: 2, row: 0 },
  { id: "fremont", name: "Fremont", home: "North Baltimore", capital: false, col: 0, row: 1 },
  { id: "findlay", name: "Findlay", home: "North Baltimore", capital: true, col: 1, row: 1 },
  { id: "port-clinton", name: "Port Clinton", home: "North Baltimore", capital: false, col: 2, row: 1 },
  { id: "corydon", name: "Corydon", home: "Henderson", capital: false, col: 3, row: 0 },
  { id: "madisonville", name: "Madisonville", home: "Henderson", capital: false, col: 4, row: 0 },
  { id: "evansville", name: "Evansville", home: "Henderson", capital: false, col: 5, row: 0 },
  { id: "newburgh", name: "Newburgh", home: "Henderson", capital: false, col: 3, row: 1 },
  { id: "henderson", name: "Henderson", home: "Henderson", capital: true, col: 4, row: 1 },
  { id: "owensboro", name: "Owensboro", home: "Henderson", capital: false, col: 5, row: 1 },
  { id: "wingate", name: "Wingate", home: "Marshville", capital: false, col: 0, row: 2 },
  { id: "marshville", name: "Marshville", home: "Marshville", capital: true, col: 1, row: 2 },
  { id: "peachland", name: "Peachland", home: "Marshville", capital: false, col: 2, row: 2 },
  { id: "monroe", name: "Monroe", home: "Marshville", capital: false, col: 0, row: 3 },
  { id: "wadesboro", name: "Wadesboro", home: "Marshville", capital: false, col: 1, row: 3 },
  { id: "pageland", name: "Pageland", home: "Marshville", capital: false, col: 2, row: 3 },
  { id: "crossville", name: "Crossville", home: "Albertville", capital: false, col: 3, row: 2 },
  { id: "albertville", name: "Albertville", home: "Albertville", capital: true, col: 4, row: 2 },
  { id: "arab", name: "Arab", home: "Albertville", capital: false, col: 5, row: 2 },
  { id: "fyffe", name: "Fyffe", home: "Albertville", capital: false, col: 3, row: 3 },
  { id: "guntersville", name: "Guntersville", home: "Albertville", capital: false, col: 4, row: 3 },
  { id: "boaz", name: "Boaz", home: "Albertville", capital: false, col: 5, row: 3 },
];

function orthogonalNeighbors(col: number, row: number) {
  return RAW_TERRITORIES.filter((other) => Math.abs(other.col - col) + Math.abs(other.row - row) === 1).map(
    (other) => other.id,
  );
}

export const TERRITORIES: TerritorySpec[] = RAW_TERRITORIES.map((row) => ({
  ...row,
  neighbors: orthogonalNeighbors(row.col, row.row),
}));

export const TERRITORY_BY_ID: Record<string, TerritorySpec> = Object.fromEntries(
  TERRITORIES.map((row) => [row.id, row]),
);

export function clampNum(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function pathFromPoints(points: Point[]) {
  return `M ${points.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join(" L ")} Z`;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export function smoothClosedPath(points: Point[]) {
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

function boundsFromPoints(points: Point[]) {
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
  return { minX, minY, maxX, maxY };
}

export function makeArrowPath(from: Point, to: Point, lift: number) {
  const midX = (from[0] + to[0]) / 2;
  const midY = (from[1] + to[1]) / 2 - lift;
  return `M ${Math.round(from[0])} ${Math.round(from[1])} Q ${round1(midX)} ${round1(midY)} ${Math.round(to[0])} ${Math.round(to[1])}`;
}

function hash01(seed: number, i: number) {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function seedOf(id: string) {
  let s = 17;
  for (let i = 0; i < id.length; i++) s = (s * 33 + id.charCodeAt(i)) | 0;
  return Math.abs(s);
}

function polygonCentroid(points: Point[]): Point {
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
  area *= 0.5;
  if (Math.abs(area) < 1) {
    const b = boundsFromPoints(points);
    return [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2];
  }
  return [cx / (6 * area), cy / (6 * area)];
}

const PLAY_RX = MAP_VIEW.w * 0.462;
const PLAY_RY = MAP_VIEW.h * 0.424;

function coastScale(angle: number) {
  const westBay = Math.exp(-Math.pow((angle - 2.85) / 0.42, 2)) * 0.14;
  const southBite = Math.exp(-Math.pow((angle - 1.45) / 0.5, 2)) * 0.09;
  const northCape = Math.exp(-Math.pow((angle + 1.55) / 0.55, 2)) * 0.07;
  return (
    1 +
    0.06 * Math.sin(angle * 2.2 + 0.4) +
    0.045 * Math.sin(angle * 4.1 - 0.7) +
    0.028 * Math.cos(angle * 6.4 + 1.2) +
    northCape -
    westBay -
    southBite
  );
}

function inPlay(x: number, y: number) {
  const dx = x - MAP_VIEW.cx;
  const dy = y - MAP_VIEW.cy;
  const ang = Math.atan2(dy, dx);
  const s = coastScale(ang);
  const nx = dx / (PLAY_RX * s);
  const ny = dy / (PLAY_RY * s);
  return nx * nx + ny * ny <= 1;
}

const SITE_BASE: Record<string, Point> = {
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
  boaz: [1162, 598],
};

const SITE_WEIGHT: Record<string, number> = {
  sandusky: 0.7,
  fostoria: 1.16,
  tiffin: 0.86,
  fremont: 1.08,
  findlay: 1.46,
  "port-clinton": 0.74,
  corydon: 0.8,
  madisonville: 1.12,
  evansville: 0.68,
  newburgh: 0.88,
  henderson: 1.44,
  owensboro: 1.02,
  wingate: 0.72,
  marshville: 1.4,
  peachland: 0.9,
  monroe: 1.18,
  wadesboro: 0.82,
  pageland: 1.04,
  crossville: 0.84,
  albertville: 1.42,
  arab: 0.7,
  fyffe: 0.94,
  guntersville: 1.2,
  boaz: 0.76,
};

function pullInside(x: number, y: number): Point {
  for (let i = 0; i < 14; i++) {
    if (inPlay(x, y)) return [x, y];
    x = x * 0.9 + MAP_VIEW.cx * 0.1;
    y = y * 0.9 + MAP_VIEW.cy * 0.1;
  }
  return [x, y];
}

function siteOf(spec: TerritorySpec): Point {
  const [bx, by] = SITE_BASE[spec.id];
  const seed = seedOf(spec.id);
  const x = bx + (hash01(seed, 1) - 0.5) * 22;
  const y = by + (hash01(seed, 2) - 0.5) * 18;
  const [px, py] = pullInside(x, y);
  return [round1(px), round1(py)];
}

function siteWeight(id: string) {
  return SITE_WEIGHT[id] ?? 1;
}

function assignedId(
  x: number,
  y: number,
  sites: Record<string, Point>,
  weights: Record<string, number>,
): string | null {
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

function rayContour(
  id: string,
  origin: Point,
  sites: Record<string, Point>,
  weights: Record<string, number>,
): Point[] {
  const n = 36;
  const seed = seedOf(id);
  const span: number[] = [];
  let total = 0;
  for (let i = 0; i < n; i++) {
    const s = 0.55 + hash01(seed, i) * 1.15;
    span.push(s);
    total += s;
  }
  const pts: Point[] = [];
  let ang = hash01(seed, 99) * 0.5;
  for (let i = 0; i < n; i++) {
    ang += (span[i] / total) * Math.PI * 2;
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    let lo = 8;
    let hi = 680;
    for (let iter = 0; iter < 18; iter++) {
      const mid = (lo + hi) / 2;
      const x = origin[0] + dx * mid;
      const y = origin[1] + dy * mid;
      if (assignedId(x, y, sites, weights) === id) lo = mid;
      else hi = mid;
    }
    const coast = 0.99 + 0.025 * hash01(seed, i + 90);
    const r = Math.max(18, lo * coast);
    pts.push([round1(origin[0] + dx * r), round1(origin[1] + dy * r)]);
  }
  return pts;
}

function islandPoints(): Point[] {
  const n = 80;
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let lo = 40;
    let hi = 720;
    for (let iter = 0; iter < 16; iter++) {
      const mid = (lo + hi) / 2;
      const x = MAP_VIEW.cx + dx * mid;
      const y = MAP_VIEW.cy + dy * mid;
      if (inPlay(x, y)) lo = mid;
      else hi = mid;
    }
    pts.push([round1(MAP_VIEW.cx + dx * lo), round1(MAP_VIEW.cy + dy * lo)]);
  }
  return pts;
}

let GEOM: Record<string, TerritoryView> | null = null;
let ISLAND: string | null = null;

export function islandPath(): string {
  if (ISLAND) return ISLAND;
  ISLAND = smoothClosedPath(islandPoints());
  return ISLAND;
}

export function territoryGeometry(): Record<string, TerritoryView> {
  if (GEOM) return GEOM;
  const sites = {} as Record<string, Point>;
  const weights = {} as Record<string, number>;
  for (const spec of TERRITORIES) {
    sites[spec.id] = siteOf(spec);
    weights[spec.id] = siteWeight(spec.id);
  }

  const next = {} as Record<string, TerritoryView>;
  for (const spec of TERRITORIES) {
    let pts = rayContour(spec.id, sites[spec.id], sites, weights);
    const span = boundsFromPoints(pts);
    if (span.maxX - span.minX < 64 || span.maxY - span.minY < 52) {
      const [cx, cy] = sites[spec.id];
      pts = [];
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2;
        const n1 = 0.86 + 0.22 * hash01(seedOf(spec.id), i + 4);
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
      bounds: [b.minX, b.minY, b.maxX, b.maxY],
    };
  }
  GEOM = next;
  return next;
}

export function freshBoard(): BoardOwner {
  const owners: BoardOwner = {};
  for (const row of TERRITORIES) owners[row.id] = row.home;
  return owners;
}

export function countBoard(owners: BoardOwner): Record<PlantName, number> {
  const counts = {
    Marshville: 0,
    Henderson: 0,
    "North Baltimore": 0,
    Albertville: 0,
  } as Record<PlantName, number>;
  for (const row of TERRITORIES) {
    const owner = owners[row.id] ?? row.home;
    counts[owner] += 1;
  }
  return counts;
}

export function capitalOf(mill: PlantName): TerritorySpec {
  return TERRITORIES.find((row) => row.home === mill && row.capital)!;
}

export function continentBounds(mill: PlantName): [number, number, number, number] {
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
  return [minX, minY, maxX, maxY];
}

export function capturePoint(view: TerritoryView): Point {
  return view.centroid;
}

export function captureLabelPoint(_from: TerritoryView, taken: TerritoryView): Point {
  return [
    Math.round(clampNum(taken.centroid[0], 140, MAP_VIEW.w - 140)),
    Math.round(clampNum(taken.centroid[1] - 56, 42, MAP_VIEW.h - 56)),
  ];
}

export function visibleCaptures(transfers: CaptureTransfer[]) {
  return transfers.filter((t) => t.applied && t.winner !== t.loser && t.territoryId);
}

export type FrontOption = {
  loser: PlantName;
  province: TerritorySpec;
  from: TerritorySpec;
};

export function legalFronts(
  owners: BoardOwner,
  attacker: PlantName,
  tons: Record<PlantName, number>,
  blockedLosers: Set<PlantName>,
  usedTerritory: Set<string>,
): FrontOption[] {
  const result: FrontOption[] = [];
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
      const held = TERRITORIES.reduce((sum, row) => sum + (owners[row.id] === holder ? 1 : 0), 0);
      if (held <= 1) continue;
      result.push({ loser: holder, province: spec, from });
    }
  }
  return result;
}
