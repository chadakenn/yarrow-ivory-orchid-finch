import { format, parseISO } from "date-fns";
import type {
  CaptureTransfer,
  HistoryWeek,
  PlantName,
  PlantTons,
  ProductionState,
  RankedPlant,
  TerritoryRow,
} from "@/lib/types";
import { OUR_PLANT, PLANT_NAMES } from "@/lib/types";
import {
  countBoard,
  freshBoard,
  legalFronts,
  TERRITORY_BY_ID,
  type BoardOwner,
} from "@/lib/map-engine";

/** Starting continents only — live attacks follow shared province borders, like Risk. */
export const MILL_NEIGHBORS: Record<PlantName, PlantName[]> = {
  "North Baltimore": ["Henderson", "Marshville"],
  Henderson: ["North Baltimore", "Albertville"],
  Marshville: ["North Baltimore", "Albertville"],
  Albertville: ["Henderson", "Marshville"],
};

export function formatTons(value: number, signed = false): string {
  const abs = Math.abs(value);
  const body = abs % 1 ? abs.toLocaleString("en-US", { maximumFractionDigits: 1 }) : abs.toLocaleString("en-US");
  if (signed) {
    if (value > 0) return `+${body}`;
    if (value < 0) return `-${body}`;
  }
  return body;
}

export function formatWeekEnding(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "EEEE, MMMM d, yyyy");
  } catch {
    return iso;
  }
}

export function formatWeekRange(iso: string): string {
  try {
    const end = parseISO(iso);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
  } catch {
    return iso;
  }
}

export function formatWeekShort(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d");
  } catch {
    return iso;
  }
}

export type TrendPiece = {
  label: string;
  class: RankedPlant["trendClass"];
  symbol: RankedPlant["trendSymbol"];
  dir: "up" | "down" | "flat";
  delta: number;
};

export function lastClosedPair(state: ProductionState): {
  current: HistoryWeek | null;
  previous: HistoryWeek | null;
} {
  const year = productionYear(state);
  const weeks = historyWeeksChrono(state, year);
  return {
    current: weeks[weeks.length - 1] ?? null,
    previous: weeks[weeks.length - 2] ?? null,
  };
}

export function rankChangeTrends(
  plants: PlantTons[],
  previous: HistoryWeek | null | undefined,
): Partial<Record<PlantName, TrendPiece>> {
  if (!previous || plants.every((plant) => plant.tons <= 0)) return {};
  const nextRanks = Object.fromEntries(rankedProduction(plants).map((row) => [row.name, row.rank])) as Record<
    PlantName,
    number
  >;
  const oldRanks = Object.fromEntries(rankedProduction(previous.plants).map((row) => [row.name, row.rank])) as Record<
    PlantName,
    number
  >;
  const trends: Partial<Record<PlantName, TrendPiece>> = {};
  for (const name of PLANT_NAMES) {
    const moved = (oldRanks[name] ?? 4) - (nextRanks[name] ?? 4);
    if (moved > 0) {
      trends[name] = {
        label: `UP ${moved} PLACE${moved === 1 ? "" : "S"} VS LAST WEEK`,
        class: nextRanks[name] === 1 ? "lead" : "gain",
        symbol: "▲",
        dir: "up",
        delta: moved,
      };
    } else if (moved < 0) {
      const down = -moved;
      trends[name] = {
        label: `DOWN ${down} PLACE${down === 1 ? "" : "S"} VS LAST WEEK`,
        class: "loss",
        symbol: "▼",
        dir: "down",
        delta: moved,
      };
    } else {
      trends[name] = {
        label: nextRanks[name] === 1 ? "HOLDING THE LEAD" : "HOLDING PLACE",
        class: nextRanks[name] === 1 ? "lead" : "neutral",
        symbol: "•",
        dir: "flat",
        delta: 0,
      };
    }
  }
  return trends;
}

export function closedWeekOverWeek(state: ProductionState): Partial<Record<PlantName, TrendPiece>> {
  const { current, previous } = lastClosedPair(state);
  if (!current || !previous) return {};
  const currMap = Object.fromEntries(current.plants.map((plant) => [plant.name, plant.tons])) as Record<PlantName, number>;
  const prevMap = Object.fromEntries(previous.plants.map((plant) => [plant.name, plant.tons])) as Record<PlantName, number>;
  const trends: Partial<Record<PlantName, TrendPiece>> = {};
  for (const name of PLANT_NAMES) {
    const delta = (currMap[name] ?? 0) - (prevMap[name] ?? 0);
    if (Math.abs(delta) < 0.05) {
      trends[name] = { label: "NO CHANGE VS LAST WEEK", class: "neutral", symbol: "•", dir: "flat", delta: 0 };
    } else if (delta > 0) {
      trends[name] = {
        label: `▲ ${formatTons(delta, true)} VS LAST WEEK`,
        class: "gain",
        symbol: "▲",
        dir: "up",
        delta,
      };
    } else {
      trends[name] = {
        label: `▼ ${formatTons(delta, true)} VS LAST WEEK`,
        class: "loss",
        symbol: "▼",
        dir: "down",
        delta,
      };
    }
  }
  return trends;
}

export function rankedProduction(
  plants: PlantTons[],
  wins: Partial<Record<PlantName, number>> = {},
  trends: Partial<Record<PlantName, { label: string; class: RankedPlant["trendClass"]; symbol: RankedPlant["trendSymbol"] }>> = {},
): RankedPlant[] {
  const rows = plants.map((plant) => ({
    name: plant.name,
    tons: plant.tons,
    our: plant.name === OUR_PLANT,
    wins: wins[plant.name] ?? 0,
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
      barPercent: leader > 0 ? Math.round(Math.max(4, Math.min(100, (row.tons / leader) * 100)) * 10) / 10 : 0,
      trendLabel: trend?.label ?? "",
      trendClass: trend?.class ?? "neutral",
      trendSymbol: trend?.symbol ?? "•",
    };
  });
}

export function productionYear(state: ProductionState): number {
  try {
    return parseISO(state.weekEnding).getFullYear();
  } catch {
    return 2026;
  }
}

export function ytdProduction(state: ProductionState): {
  year: number;
  plants: Array<PlantTons & { wins: number }>;
  ranked: RankedPlant[];
} {
  const year = productionYear(state);
  const totals: Record<PlantName, number> = {
    Marshville: 0,
    Henderson: 0,
    "North Baltimore": 0,
    Albertville: 0,
  };
  const wins: Record<PlantName, number> = {
    Marshville: 0,
    Henderson: 0,
    "North Baltimore": 0,
    Albertville: 0,
  };

  for (const entry of state.history) {
    if (!entry.weekEnding.startsWith(String(year))) continue;
    for (const plant of entry.plants) {
      totals[plant.name] += plant.tons;
    }
    for (const winner of entry.winners) {
      wins[winner] += 1;
    }
  }

  for (const plant of state.plants) {
    totals[plant.name] += plant.tons;
  }

  const plants = PLANT_NAMES.map((name) => ({
    name,
    tons: totals[name],
    wins: wins[name],
  }));

  return {
    year,
    plants,
    ranked: rankedProduction(plants, wins),
  };
}

function historyWeeksChrono(state: ProductionState, year: number): HistoryWeek[] {
  return state.history
    .filter((entry) => entry.weekEnding.startsWith(String(year)))
    .slice()
    .sort((a, b) => a.weekEnding.localeCompare(b.weekEnding));
}

export function applyBattleWeek(owners: BoardOwner, plants: PlantTons[]): CaptureTransfer[] {
  const ranked = rankedProduction(plants);
  const transfers: CaptureTransfer[] = [];
  if (ranked.length < 4) return transfers;
  const total = ranked.reduce((sum, row) => sum + row.tons, 0);
  if (total <= 0) return transfers;

  const tons = Object.fromEntries(plants.map((plant) => [plant.name, plant.tons])) as Record<PlantName, number>;
  const targeted = new Set<PlantName>();
  const usedTerritory = new Set<string>();

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
    const pick = fronts
      .filter((front) => front.loser === loser)
      .sort((a, b) => {
        const liberate = Number(b.province.home === row.name) - Number(a.province.home === row.name);
        if (liberate) return liberate;
        const homeBias = Number(b.province.home === loser) - Number(a.province.home === loser);
        if (homeBias) return homeBias;
        const pa = [a.province.col, a.province.row] as const;
        const pb = [b.province.col, b.province.row] as const;
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
      fromName: pick.from.name,
    });
  }
  return transfers;
}

function centroidOfMill(owners: BoardOwner, mill: PlantName): [number, number] {
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

const CAMPAIGN_WEEKS = 8;

export function battleAllocations(
  state: ProductionState,
  includeOpenWeek: boolean,
): {
  allocations: Record<PlantName, number>;
  owners: BoardOwner;
  lastTransfers: CaptureTransfer[];
  completedWeeks: number;
  campaignWeeks: number;
} {
  const year = productionYear(state);
  const owners = freshBoard();
  const weeks = historyWeeksChrono(state, year);
  const campaign = weeks.slice(-CAMPAIGN_WEEKS);

  let lastTransfers: CaptureTransfer[] = [];
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
    campaignWeeks: campaign.length,
  };
}

export function weeklySource(state: ProductionState): {
  plants: PlantTons[];
  live: boolean;
  weekEnding: string;
  label: string;
} {
  const openTotal = state.plants.reduce((sum, plant) => sum + plant.tons, 0);
  if (openTotal > 0) {
    return {
      plants: state.plants,
      live: true,
      weekEnding: state.weekEnding,
      label: "CURRENT WEEK",
    };
  }

  const latest = state.history
    .slice()
    .sort((a, b) => b.weekEnding.localeCompare(a.weekEnding))[0];

  if (latest) {
    return {
      plants: latest.plants,
      live: false,
      weekEnding: latest.weekEnding,
      label: "LAST COMPLETED WEEK",
    };
  }

  return {
    plants: state.plants,
    live: false,
    weekEnding: state.weekEnding,
    label: "WAITING",
  };
}

export function conquestContext(state: ProductionState) {
  const weekly = weeklySource(state);
  const lastClosed = lastClosedPair(state);
  const priorWeek = weekly.live ? lastClosed.current : lastClosed.previous;
  const weeklyRanked = rankedProduction(weekly.plants, {}, rankChangeTrends(weekly.plants, priorWeek));
  const ytd = ytdProduction(state);
  const includeOpen = weekly.live;
  const battle = battleAllocations(state, includeOpen);
  const weeklyLookup = Object.fromEntries(weeklyRanked.map((row) => [row.name, row])) as Record<PlantName, RankedPlant>;
  const ytdLookup = Object.fromEntries(ytd.ranked.map((row) => [row.name, row])) as Record<PlantName, RankedPlant>;

  const seasonOrder = [...PLANT_NAMES].sort((a, b) => {
    const terr = battle.allocations[b] - battle.allocations[a];
    if (terr) return terr;
    return (ytdLookup[b]?.tons ?? 0) - (ytdLookup[a]?.tons ?? 0);
  });

  const weeklyLeader = weeklyRanked[0]?.name;
  const seasonLeader = seasonOrder[0];

  const territories: TerritoryRow[] = PLANT_NAMES.map((name, slot) => {
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
      seasonLeader: name === seasonLeader,
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
    ytd,
  };
}

export function productionRecords(state: ProductionState) {
  const year = productionYear(state);
  const weeks = historyWeeksChrono(state, year);

  const stats = Object.fromEntries(
    PLANT_NAMES.map((name) => [
      name,
      {
        name,
        wins: 0,
        currentStreak: 0,
        longestStreak: 0,
        longestStreakEnd: null as string | null,
        bestWeekTons: 0,
        bestWeekEnding: null as string | null,
        biggestMargin: 0,
        biggestMarginWeek: null as string | null,
      },
    ]),
  ) as Record<
    PlantName,
    {
      name: PlantName;
      wins: number;
      currentStreak: number;
      longestStreak: number;
      longestStreakEnd: string | null;
      bestWeekTons: number;
      bestWeekEnding: string | null;
      biggestMargin: number;
      biggestMarginWeek: string | null;
    }
  >;

  const runs: Record<PlantName, number> = {
    Marshville: 0,
    Henderson: 0,
    "North Baltimore": 0,
    Albertville: 0,
  };

  let overallBest = { name: "" as PlantName | "", tons: 0, weekEnding: null as string | null };
  let biggestWin = {
    name: "",
    margin: 0,
    weekEnding: null as string | null,
    tons: 0,
  };

  for (const week of weeks) {
    const values: Partial<Record<PlantName, number>> = {};
    for (const plant of week.plants) values[plant.name] = plant.tons;
    const ordered = Object.values(values).sort((a, b) => (b ?? 0) - (a ?? 0));
    const leaderTons = ordered[0] ?? 0;
    const runner = ordered[1] ?? 0;
    const margin = Math.max(0, leaderTons - runner);
    const winners = new Set(
      week.winners.length
        ? week.winners
        : week.plants.filter((p) => p.tons === leaderTons).map((p) => p.name),
    );

    for (const name of PLANT_NAMES) {
      const tons = values[name] ?? 0;
      const stat = stats[name];
      if (tons > stat.bestWeekTons) {
        stat.bestWeekTons = tons;
        stat.bestWeekEnding = week.weekEnding;
      }
      if (tons > overallBest.tons) {
        overallBest = { name, tons, weekEnding: week.weekEnding };
      }
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
      } else {
        runs[name] = 0;
      }
    }

    if (margin > biggestWin.margin && winners.size) {
      biggestWin = {
        name: [...winners].join(" & "),
        margin,
        weekEnding: week.weekEnding,
        tons: leaderTons,
      };
    }
  }

  for (const name of PLANT_NAMES) {
    stats[name].currentStreak = runs[name];
  }

  const latest = weeks[weeks.length - 1];

  return {
    completedWeeks: weeks.length,
    latestWinnerLabel: latest?.winners.join(" & ") || "No completed week",
    latestWeekDisplay: latest ? formatWeekEnding(latest.weekEnding) : "No completed week",
    overallBest: {
      name: overallBest.name,
      tons: overallBest.tons,
      tonsDisplay: formatTons(overallBest.tons),
      weekDisplay: overallBest.weekEnding ? formatWeekEnding(overallBest.weekEnding) : "",
    },
    biggestWin: {
      name: biggestWin.name,
      margin: biggestWin.margin,
      marginDisplay: formatTons(biggestWin.margin),
      weekDisplay: biggestWin.weekEnding ? formatWeekEnding(biggestWin.weekEnding) : "",
    },
    currentStreakLabel:
      PLANT_NAMES.filter((n) => stats[n].currentStreak === Math.max(...PLANT_NAMES.map((x) => stats[x].currentStreak)))
        .filter((n) => stats[n].currentStreak > 0)
        .join(" & ") || "No active streak",
    currentStreakCount: Math.max(...PLANT_NAMES.map((n) => stats[n].currentStreak)),
    rows: PLANT_NAMES.map((name) => ({
      ...stats[name],
      our: name === OUR_PLANT,
      bestWeekDisplay: formatTons(stats[name].bestWeekTons),
    }))
      .sort((a, b) => b.wins - a.wins || b.currentStreak - a.currentStreak || b.bestWeekTons - a.bestWeekTons || a.name.localeCompare(b.name))
      .map((row, index) => ({ ...row, rank: index + 1 })),
  };
}

export function weeklyGraph(state: ProductionState, limit = 0) {
  const year = productionYear(state);
  const all = historyWeeksChrono(state, year);
  const weeks = limit > 0 ? all.slice(-limit) : all;
  const latest = weeks[weeks.length - 1];
  const previous = weeks[weeks.length - 2];
  const latestRanked = latest ? rankedProduction(latest.plants) : [];
  const prevMap = Object.fromEntries((previous?.plants ?? []).map((plant) => [plant.name, plant.tons])) as Partial<
    Record<PlantName, number>
  >;

  const mills = PLANT_NAMES.map((name) => {
    const tons = latest?.plants.find((plant) => plant.name === name)?.tons ?? 0;
    const prev = prevMap[name];
    const delta = prev == null ? 0 : tons - prev;
    const dir: TerritoryRow["trendDir"] =
      prev == null || Math.abs(delta) < 0.05 ? "flat" : delta > 0 ? "up" : "down";
    return {
      name,
      our: name === OUR_PLANT,
      tons,
      tonsDisplay: formatTons(tons),
      previous: prev ?? null,
      delta,
      deltaDisplay: prev == null ? "—" : formatTons(delta, true),
      dir,
      symbol: (dir === "up" ? "▲" : dir === "down" ? "▼" : "•") as RankedPlant["trendSymbol"],
      rank: latestRanked.find((row) => row.name === name)?.rank ?? 0,
    };
  }).sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));

  return {
    plants: [...PLANT_NAMES],
    weeks: weeks.map((week, index) => {
      const month = format(parseISO(week.weekEnding), "MMM");
      const prev = weeks[index - 1] ? format(parseISO(weeks[index - 1].weekEnding), "MMM") : "";
      return {
        label: formatWeekShort(week.weekEnding),
        month,
        showMonth: index === 0 || month !== prev,
        weekEnding: week.weekEnding,
        values: Object.fromEntries(week.plants.map((plant) => [plant.name, plant.tons])) as Record<PlantName, number>,
      };
    }),
    count: weeks.length,
    latestLabel: latest ? formatWeekEnding(latest.weekEnding) : "",
    previousLabel: previous ? formatWeekShort(previous.weekEnding) : "",
    mills,
  };
}

export function closeWeek(state: ProductionState): ProductionState {
  const total = state.plants.reduce((sum, plant) => sum + plant.tons, 0);
  if (total <= 0) return state;
  if (state.history.some((entry) => entry.weekEnding === state.weekEnding)) return state;

  const ranked = rankedProduction(state.plants);
  const leaderTons = ranked[0]?.tons ?? 0;
  const winners = ranked.filter((row) => row.tons === leaderTons).map((row) => row.name);
  const next = new Date(parseISO(state.weekEnding));
  next.setDate(next.getDate() + 7);

  return {
    weekEnding: format(next, "yyyy-MM-dd"),
    lastUpdated: Date.now(),
    history: [
      {
        id: `week_${state.weekEnding}`,
        weekEnding: state.weekEnding,
        plants: state.plants.map((p) => ({ ...p })),
        winners,
      },
      ...state.history,
    ],
    plants: PLANT_NAMES.map((name) => ({ name, tons: 0 })),
  };
}

export function editHistoryWeek(state: ProductionState, id: string, plants: PlantTons[]): ProductionState {
  const ranked = rankedProduction(plants);
  const leaderTons = ranked[0]?.tons ?? 0;
  const winners = ranked.filter((row) => row.tons === leaderTons).map((row) => row.name);
  return {
    ...state,
    lastUpdated: Date.now(),
    history: state.history.map((week) => (week.id === id ? { ...week, plants: plants.map((plant) => ({ ...plant })), winners } : week)),
  };
}
