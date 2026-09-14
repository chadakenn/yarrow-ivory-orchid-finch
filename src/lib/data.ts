import type {
  DisplaySettings,
  HistoryWeek,
  PersonEntry,
  PlantBoard,
  PlantName,
  PlantTons,
  ProductionState,
} from "@/lib/types";
import { PLANT_NAMES } from "@/lib/types";

/** Marshville, Henderson, North Baltimore, Albertville — real 2026 Saturdays. */
const RAW_WEEKS: Array<[string, [number, number, number, number]]> = [
  ["2026-01-03", [2305, 1034, 2853, 2367]],
  ["2026-01-10", [2817, 2487, 2363, 3002]],
  ["2026-01-17", [2845, 2572, 2494, 2981]],
  ["2026-01-24", [2638, 2190, 2496, 2684]],
  ["2026-01-31", [2130, 1353, 1937, 1276]],
  ["2026-02-07", [2020, 2928, 3418, 2793]],
  ["2026-02-14", [2724, 2100, 3264, 2614]],
  ["2026-02-21", [2673, 2536, 3269, 2753]],
  ["2026-02-28", [3175, 2107, 1078, 2561]],
  ["2026-03-07", [2419, 2742, 4270, 2540]],
  ["2026-03-14", [2936, 2544, 2092, 2358]],
  ["2026-03-21", [2404, 2316, 2549, 3122]],
  ["2026-03-28", [2399, 2084, 3048, 2883]],
  ["2026-04-04", [2787, 2716, 3009, 2349]],
  ["2026-04-11", [2787, 2122, 2906, 2485]],
  ["2026-04-18", [2720, 1416, 2936, 2578]],
  ["2026-04-25", [2710, 2400, 2941, 2521]],
  ["2026-05-02", [2406, 2580, 3324, 2920]],
  ["2026-05-09", [2578, 2698, 3239, 2805]],
  ["2026-05-16", [2894, 2705, 2864, 2745]],
  ["2026-05-23", [2644, 2562, 3644, 2902]],
  ["2026-05-30", [2157, 1862, 2748, 2306]],
  ["2026-06-06", [2518, 2260, 3258, 2491]],
  ["2026-06-13", [2412, 2416, 3225, 2338]],
  ["2026-06-20", [3091, 2470, 3662, 2890]],
  ["2026-06-27", [2400, 2270, 3608, 2957]],
  ["2026-07-04", [2192, 2020, 3206, 2531]],
  ["2026-07-11", [2941, 2205, 2862, 2602]],
  ["2026-07-18", [3041, 2329, 3458, 2618]],
  ["2026-07-25", [2844, 2500, 3127, 2798]],
  ["2026-08-01", [2777, 2614, 3364, 3206]],
  ["2026-08-08", [2262, 2470, 3295, 2718]],
  ["2026-08-15", [2868, 2649, 3124, 2964]],
  ["2026-08-22", [3253, 2200, 4051, 2477]],
  ["2026-08-29", [3008, 2433, 3387, 2694]],
];

function plantsFromTuple(tuple: [number, number, number, number]): PlantTons[] {
  return PLANT_NAMES.map((name, index) => ({
    name,
    tons: tuple[index],
  }));
}

function winnersOf(plants: PlantTons[]): PlantName[] {
  const leader = Math.max(...plants.map((p) => p.tons));
  return plants.filter((p) => p.tons === leader).map((p) => p.name);
}

export function buildReal2026History(): HistoryWeek[] {
  return RAW_WEEKS.map(([weekEnding, tuple]) => {
    const plants = plantsFromTuple(tuple);
    return {
      id: `real2026_${weekEnding.replaceAll("-", "")}`,
      weekEnding,
      plants,
      winners: winnersOf(plants),
    };
  }).sort((a, b) => (a.weekEnding < b.weekEnding ? 1 : -1));
}

export const DEFAULT_PRODUCTION: ProductionState = {
  weekEnding: "2026-09-05",
  lastUpdated: Date.parse("2026-09-04T14:30:00"),
  history: buildReal2026History(),
  plants: PLANT_NAMES.map((name) => ({ name, tons: 0 })),
};

export const DEFAULT_PLANT_BOARD: PlantBoard = {
  enabled: true,
  title: "Daily Plant Board",
  subtitle: "North Baltimore priorities, goals and updates",
  goalText: "Hit 3,400 tons by Saturday close. Protect Line 2 uptime.",
  todayFocus: "Pellet mill die temperature in range all shift. No unplanned stops after 14:00.",
  safetyFocus: "Lockout/tagout on Mixer 4 during afternoon PM. Eye protection in receiving.",
  maintenance: "Pellet mill 1 PM window 14:00–16:00. Spare die staged at the west wall.",
  shipping: "Eight loads booked. Two Friday slots still open. Keep the pad clear for corn dump.",
  staffing: "Need one extra on receiving for the afternoon corn dump. Shift B covered.",
  managerNote: "Strong week. Keep the floor clean and the numbers honest. We take this map.",
  updatedAt: Date.parse("2026-09-04T13:10:00"),
};

export const DEFAULT_PEOPLE: PersonEntry[] = [
  {
    id: "p1",
    kind: "birthday",
    name: "Maria Alvarez",
    date: "2026-09-06",
    endDate: "",
    message: "Wishing you a great day from the whole North Baltimore crew.",
    enabled: true,
    yearly: true,
    photo: "",
  },
  {
    id: "p2",
    kind: "recognition",
    name: "Devon Hale",
    date: "2026-09-01",
    endDate: "2026-09-12",
    message: "90 days without a recordable. That is how we run this mill.",
    enabled: true,
    yearly: false,
    photo: "",
  },
  {
    id: "p3",
    kind: "recognition",
    name: "Shift B Packaging",
    date: "2026-08-29",
    endDate: "2026-09-12",
    message: "Record Saturday — 612 tons packed without a stop. Outstanding.",
    enabled: true,
    yearly: false,
    photo: "",
  },
  {
    id: "p4",
    kind: "birthday",
    name: "James Whitaker",
    date: "2026-09-12",
    endDate: "",
    message: "Happy birthday from receiving, shipping, and the control room.",
    enabled: true,
    yearly: true,
    photo: "",
  },
];

export const DEFAULT_SETTINGS: DisplaySettings = {
  clockEnabled: true,
  clockPosition: "top-right",
  ticker: {
    enabled: true,
    auto: true,
    message:
      "NORTH BALTIMORE 50 TPH  ·  PLAN. PRODUCE. DELIVER. CONQUER.  ·  WEEK ENDING SATURDAY SEPTEMBER 5",
    speed: "normal",
  },
  conquestEnabled: true,
  conquestMode: "season",
  productionEnabled: true,
  recordsEnabled: true,
  peopleEnabled: true,
  decksEnabled: true,
  reloadAt: null,
  durations: {
    productionWeekly: 14,
    productionYtd: 14,
    productionRecords: 16,
    productionTrends: 16,
    people: 12,
    plantBoard: 16,
    conquest: 22,
    presentation: 10,
  },
};

export const MILL_COPY: Record<
  PlantName,
  { short: string; region: string }
> = {
  Marshville: { short: "MAR", region: "Southeast" },
  Henderson: { short: "HEN", region: "Mid-South" },
  "North Baltimore": { short: "NB", region: "Our mill" },
  Albertville: { short: "ALB", region: "Tennessee Valley" },
};
