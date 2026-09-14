import { useMemo } from "react";
import { PigGlyph } from "@/components/display/Heraldry";
import { MILL_HEX } from "@/lib/mills";
import {
  capitalOf,
  captureLabelPoint,
  continentBounds,
  islandPath,
  LAND_SRC,
  makeArrowPath,
  MAP_VIEW,
  REGION_ORDER,
  TERRITORY_BY_ID,
  territoryGeometry,
  VOID_SRC,
  visibleCaptures,
  type BoardOwner,
  type TerritoryView,
} from "@/lib/map-engine";
import type { CaptureTransfer, PlantName, TerritoryRow } from "@/lib/types";
import { OUR_PLANT } from "@/lib/types";

type Props = {
  territories: TerritoryRow[];
  transfers: CaptureTransfer[];
  owners: BoardOwner;
  mode: "weekly" | "season";
  live: boolean;
};

const MILL_SHORT: Record<PlantName, string> = {
  "North Baltimore": "NB",
  Henderson: "HEN",
  Marshville: "MAR",
  Albertville: "ALB",
};

function PigFlag({ x, y, color, scale = 1 }: { x: number; y: number; color: string; scale?: number }) {
  return (
    <g transform={`translate(${Math.round(x)} ${Math.round(y)}) scale(${scale})`} className="cq-flag">
      <ellipse cx={4} cy={18} rx={7} ry={2.2} fill="rgba(0,0,0,.35)" />
      <line x1={0} y1={-16} x2={0} y2={18} className="cq-flag-pole" />
      <path d="M1.2 -15 C10 -18 16 -12 26 -16 L26 -2 C16 -3 10 3 1.2 1.4 Z" fill={color} className="cq-flag-cloth" />
      <g transform="translate(5.2 -14.6) scale(0.22)">
        <PigGlyph fill="#f4f0e6" />
      </g>
    </g>
  );
}

function MillName({ name, x, y, compact }: { name: PlantName; x: number; y: number; compact?: boolean }) {
  const cls = compact ? "cq-label-name cq-compact" : "cq-label-name";
  if (name === "North Baltimore") {
    return (
      <>
        <text x={x} y={y - (compact ? 11 : 14)} className={cls}>
          NORTH
        </text>
        <text x={x} y={y + (compact ? 9 : 12)} className={cls}>
          BALTIMORE
        </text>
      </>
    );
  }
  return (
    <text x={x} y={y} className={cls}>
      {name.toUpperCase()}
    </text>
  );
}

function PlaceName({ name, x, y }: { name: string; x: number; y: number }) {
  const parts = name.toUpperCase().split(" ");
  if (parts.length > 1) {
    return (
      <>
        <text x={x} y={y - 7} className="cq-prov-name">
          {parts[0]}
        </text>
        <text x={x} y={y + 8} className="cq-prov-name">
          {parts.slice(1).join(" ")}
        </text>
      </>
    );
  }
  return (
    <text x={x} y={y} className="cq-prov-name">
      {parts[0]}
    </text>
  );
}

function MarchArrow({
  d,
  color,
  delay,
  duration,
}: {
  d: string;
  color: string;
  delay: string;
  duration: string;
}) {
  return (
    <g
      className="cq-arrow-token"
      style={{
        offsetPath: `path('${d}')`,
        ["--cq-delay" as string]: delay,
        ["--cq-dur" as string]: duration,
      }}
    >
      <path d="M -6 -14 L 22 0 L -6 14 L 2 0 Z" fill={color} />
      <path d="M -24 -14 L 4 0 L -24 14 L -16 0 Z" fill={color} opacity={0.88} />
    </g>
  );
}

function Burst({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${Math.round(x)} ${Math.round(y)})`} className="cq-burst">
      <circle r={6} className="cq-burst-core" />
      <circle r={18} className="cq-burst-ring" />
      <circle r={32} className="cq-burst-halo" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <path
          key={deg}
          d="M0 -8 L2 -22 L0 -28 L-2 -22 Z"
          className="cq-burst-ray"
          transform={`rotate(${deg})`}
        />
      ))}
    </g>
  );
}

function mixToward(from: [number, number], to: [number, number], t: number): [number, number] {
  return [from[0] * (1 - t) + to[0] * t, from[1] * (1 - t) + to[1] * t];
}

function IncomingCapture({
  cap,
  from,
  taken,
}: {
  cap: CaptureTransfer;
  from: TerritoryView;
  taken: TerritoryView;
}) {
  const tone = MILL_HEX[cap.winner];
  const [labelX, labelY] = captureLabelPoint(from, taken);
  const pillW = 188;

  return (
    <g className="cq-incoming" style={{ ["--takeover-glow" as string]: tone.glow }}>
      <path d={taken.path} fill={tone.stroke} className="cq-chunk-glow" />
      <path d={taken.path} fill="none" stroke={tone.stroke} className="cq-taken-ring" />
      <Burst x={taken.centroid[0]} y={taken.centroid[1]} />
      <PigFlag x={taken.centroid[0] + 10} y={taken.centroid[1] - 8} color={tone.stroke} scale={0.66} />
      <g className="cq-capture-callout" transform={`translate(${labelX} ${labelY})`}>
        <rect x={-pillW / 2} y={-16} width={pillW} height={38} rx={8} className="cq-capture-pill" />
        <text x={0} y={0} className="cq-capture-label">
          {MILL_SHORT[cap.winner]} TAKES
        </text>
        <text x={0} y={14} className="cq-capture-sub">
          {cap.territoryName.toUpperCase()}
        </text>
      </g>
    </g>
  );
}

export function ConquestMap({ territories, transfers, owners, mode, live }: Props) {
  const lookup = useMemo(
    () => Object.fromEntries(territories.map((row) => [row.name, row])) as Record<PlantName, TerritoryRow>,
    [territories],
  );
  const geom = useMemo(() => territoryGeometry(), []);
  const captures = useMemo(() => visibleCaptures(transfers), [transfers]);
  const takenIds = useMemo(() => new Set(captures.map((cap) => cap.territoryId)), [captures]);
  const continentBoxes = useMemo(
    () => Object.fromEntries(REGION_ORDER.map((name) => [name, continentBounds(name)])) as Record<
      PlantName,
      [number, number, number, number]
    >,
    [],
  );

  return (
    <svg
      className={live ? "conquest-map-svg is-live" : "conquest-map-svg"}
      viewBox={`0 0 ${MAP_VIEW.w} ${MAP_VIEW.h}`}
      preserveAspectRatio="xMidYMid meet"
      aria-label="Mill conquest map"
    >
      <defs>
        <linearGradient id="cq-nb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#145fbd" />
          <stop offset="100%" stopColor="#0a2748" />
        </linearGradient>
        <linearGradient id="cq-marshville" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#496f2d" />
          <stop offset="100%" stopColor="#142519" />
        </linearGradient>
        <linearGradient id="cq-henderson" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c2b25" />
          <stop offset="100%" stopColor="#281311" />
        </linearGradient>
        <linearGradient id="cq-albertville" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67369d" />
          <stop offset="100%" stopColor="#21152f" />
        </linearGradient>
        <radialGradient id="cq-label-shade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(4,6,10,.72)" />
          <stop offset="70%" stopColor="rgba(4,6,10,.28)" />
          <stop offset="100%" stopColor="rgba(4,6,10,0)" />
        </radialGradient>
        {Object.values(geom).map((view) => (
          <clipPath id={`cq-prov-${view.id}`} key={`clip-${view.id}`}>
            <path d={view.path} />
          </clipPath>
        ))}
      </defs>

      <rect className="cq-water" x={0} y={0} width={MAP_VIEW.w} height={MAP_VIEW.h} rx={10} />
      <image href={VOID_SRC} x={0} y={0} width={MAP_VIEW.w} height={MAP_VIEW.h} preserveAspectRatio="xMidYMid slice" opacity={0.42} />
      <rect x={0} y={0} width={MAP_VIEW.w} height={MAP_VIEW.h} fill="rgba(4,6,10,.42)" />
      <path d={islandPath()} className="cq-island" />

      {Object.values(geom).map((view) => {
        const owner = owners[view.id] ?? view.home;
        const tone = MILL_HEX[owner];
        const [minX, minY, maxX, maxY] = continentBoxes[view.home];
        const bw = Math.max(80, maxX - minX);
        const bh = Math.max(80, maxY - minY);
        const enemyFront = view.neighbors.some((nid) => (owners[nid] ?? TERRITORY_BY_ID[nid]?.home) !== owner);
        const taken = takenIds.has(view.id);

        return (
          <g key={view.id} className="cq-region">
            <path d={view.path} className="cq-land-shadow" transform="translate(3 8)" />
            <path d={view.path} fill={`url(#cq-${tone.token})`} />
            <g clipPath={`url(#cq-prov-${view.id})`}>
              <image
                href={LAND_SRC[view.home]}
                x={minX - bw * 0.04}
                y={minY - bh * 0.04}
                width={bw * 1.08}
                height={bh * 1.08}
                preserveAspectRatio="xMidYMid slice"
              />
              <rect
                x={minX - 12}
                y={minY - 12}
                width={bw + 24}
                height={bh + 24}
                fill={tone.dark}
                opacity={owner === view.home ? 0.22 : 0.38}
              />
              <rect
                x={minX - 12}
                y={minY - 12}
                width={bw + 24}
                height={bh + 24}
                fill={tone.stroke}
                opacity={owner === view.home ? 0.14 : 0.28}
                style={{ mixBlendMode: "color" }}
              />
            </g>
            <path
              d={view.path}
              fill="none"
              stroke={taken ? tone.accent : tone.stroke}
              className={taken ? "cq-land cq-leader" : enemyFront ? "cq-land cq-front" : "cq-land cq-internal"}
              style={{ ["--cq-glow" as string]: tone.glow }}
            />
          </g>
        );
      })}

      {Object.values(geom).map((view) => {
        const owner = owners[view.id] ?? view.home;
        if (owner === view.home) return null;
        const tone = MILL_HEX[owner];
        const hqTooClose = REGION_ORDER.some((mill) => {
          const cap = geom[capitalOf(mill).id];
          return Math.hypot(view.label[0] - cap.label[0], view.label[1] - cap.label[1]) < 92;
        });
        return (
          <g key={`occ-${view.id}`}>
            {hqTooClose || takenIds.has(view.id) ? null : (
              <PlaceName name={view.name} x={view.label[0]} y={view.label[1]} />
            )}
            {takenIds.has(view.id) ? null : (
              <circle
                cx={view.centroid[0]}
                cy={view.centroid[1] + (hqTooClose ? 0 : 18)}
                r={4.2}
                fill={tone.stroke}
                stroke="#070c12"
                strokeWidth={1.15}
              />
            )}
          </g>
        );
      })}

      {REGION_ORDER.map((name) => {
        const spec = capitalOf(name);
        const view = geom[spec.id];
        const row = lookup[name];
        const tone = MILL_HEX[name];
        const isOurs = name === OUR_PLANT;
        const leader = mode === "season" ? Boolean(row?.seasonLeader) : Boolean(row?.leader);
        const tons = mode === "season" ? (row?.ytdTonsDisplay ?? "0") : (row?.weeklyTonsDisplay ?? "0");
        const tonsLabel = mode === "season" ? "YTD TONS" : "WEEKLY TONS";
        const count = row?.territories ?? 0;
        const compact = count <= 2;
        const nameY = isOurs && !compact ? view.label[1] - 8 : view.label[1];
        const statY = isOurs && !compact ? view.label[1] + 42 : view.label[1] + (compact ? 22 : 30);
        const flagX = view.centroid[0] + (name === "Henderson" || name === "Albertville" ? -78 : 72);
        const flagY = view.centroid[1] - (compact ? 28 : 40);

        return (
          <g key={`hq-${name}`}>
            <ellipse cx={view.label[0]} cy={view.label[1] + 6} rx={compact ? 108 : isOurs ? 150 : 132} ry={compact ? 58 : isOurs ? 84 : 72} fill="url(#cq-label-shade)" />
            <MillName name={name} x={view.label[0]} y={nameY} compact={compact} />
            {isOurs && !compact ? (
              <>
                <rect x={view.label[0] - 54} y={view.label[1] + 18} width={108} height={18} rx={9} className="cq-our-ribbon" />
                <text x={view.label[0]} y={view.label[1] + 31} className="cq-label-our">
                  OUR MILL
                </text>
              </>
            ) : null}
            <text x={view.label[0]} y={statY} className="cq-label-small">
              {compact ? "ARMIES" : tonsLabel}
            </text>
            {compact ? null : (
              <text x={view.label[0]} y={statY + 28} className="cq-label-tons">
                {tons}
              </text>
            )}
            <g transform={`translate(${view.label[0] + (compact ? 0 : isOurs ? 78 : 70)} ${compact ? statY + 28 : statY + 10})`}>
              <circle r={compact ? 15 : 16} className={leader ? "cq-army-disc is-lead" : "cq-army-disc"} style={{ ["--cq-glow" as string]: tone.glow }} />
              <circle r={compact ? 15 : 16} fill={tone.dark} stroke={tone.stroke} strokeWidth={2.2} />
              <text y={5} className="cq-army-num">
                {count}
              </text>
            </g>
            <PigFlag x={flagX} y={flagY} color={tone.stroke} scale={compact ? 0.64 : 0.72} />
          </g>
        );
      })}

      {captures.map((cap) => {
        const from = geom[cap.fromId];
        const taken = geom[cap.territoryId];
        if (!from || !taken) return null;
        return <IncomingCapture key={`cap-${cap.territoryId}`} cap={cap} from={from} taken={taken} />;
      })}

      <g className="cq-attacks">
        {captures.map((cap) => {
          const from = geom[cap.fromId];
          const taken = geom[cap.territoryId];
          if (!from || !taken) return null;
          const start = mixToward(from.centroid, taken.centroid, 0.16);
          const end = mixToward(taken.centroid, from.centroid, 0.18);
          const route = makeArrowPath(start, end, cap.major ? 22 : -16);
          const tone = MILL_HEX[cap.winner];
          return (
            <g key={`atk-${cap.territoryId}`} style={{ ["--takeover-glow" as string]: tone.glow }}>
              <path d={route} stroke={tone.stroke} className="cq-takeover-route" />
              <MarchArrow d={route} color={tone.stroke} delay={cap.major ? "0.12s" : "0.9s"} duration={cap.major ? "2.4s" : "2.9s"} />
              {cap.major ? <MarchArrow d={route} color={tone.stroke} delay="1.05s" duration="2.2s" /> : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
