export const PLANT_NAMES = [
  "Marshville",
  "Henderson",
  "North Baltimore",
  "Albertville",
] as const;

export type PlantName = (typeof PLANT_NAMES)[number];

export const OUR_PLANT: PlantName = "North Baltimore";

export type PlantTons = {
  name: PlantName;
  tons: number;
};

export type HistoryWeek = {
  id: string;
  weekEnding: string;
  plants: PlantTons[];
  winners: PlantName[];
};

export type RankedPlant = {
  name: PlantName;
  tons: number;
  tonsDisplay: string;
  rank: number;
  our: boolean;
  wins: number;
  gapLabel: string;
  barPercent: number;
  trendLabel: string;
  trendClass: "gain" | "loss" | "lead" | "neutral";
  trendSymbol: "▲" | "▼" | "•";
};

export type TerritoryRow = {
  name: PlantName;
  our: boolean;
  weeklyRank: number;
  seasonRank: number;
  weeklyTons: number;
  weeklyTonsDisplay: string;
  ytdTons: number;
  ytdTonsDisplay: string;
  wins: number;
  territories: number;
  weeklyGapLabel: string;
  seasonGapLabel: string;
  trendLabel: string;
  trendSymbol: RankedPlant["trendSymbol"];
  trendDir: "up" | "down" | "flat";
  leader: boolean;
  seasonLeader: boolean;
};

export type CaptureTransfer = {
  winner: PlantName;
  loser: PlantName;
  major: boolean;
  applied: boolean;
  territoryId: string;
  territoryName: string;
  fromId: string;
  fromName: string;
};

export type PersonKind = "birthday" | "anniversary" | "shoutout";

export type PersonEntry = {
  id: string;
  kind: PersonKind;
  name: string;
  date: string;
  endDate: string;
  message: string;
  photo: string;
  yearly: boolean;
  enabled: boolean;
};

export type PlantBoard = {
  enabled: boolean;
  title: string;
  subtitle: string;
  goalText: string;
  todayFocus: string;
  safetyFocus: string;
  maintenance: string;
  shipping: string;
  staffing: string;
  managerNote: string;
  updatedAt: number | null;
};

export type Announcement = {
  message: string;
  type: "info" | "safety" | "urgent" | "celebration";
  createdAt: number;
  expiresAt: number;
} | null;

export type TickerState = {
  enabled: boolean;
  message: string;
  speed: "slow" | "normal" | "fast";
};

export type DisplaySettings = {
  clockEnabled: boolean;
  clockPosition: "top-right" | "top-left" | "bottom-left";
  ticker: TickerState;
  conquestEnabled: boolean;
  conquestMode: "weekly" | "season" | "both";
  productionEnabled: boolean;
  championshipEnabled: boolean;
  ytdEnabled: boolean;
  trendsEnabled: boolean;
  recordsEnabled: boolean;
  peopleEnabled: boolean;
  decksEnabled: boolean;
  durations: {
    productionWeekly: number;
    productionYtd: number;
    productionRecords: number;
    productionTrends: number;
    people: number;
    plantBoard: number;
    conquest: number;
    presentation: number;
  };
  reloadAt?: number;
};

export type ProductionState = {
  weekEnding: string;
  plants: PlantTons[];
  history: HistoryWeek[];
  lastUpdated: number | null;
};

export type AppState = {
  production: ProductionState;
  plantBoard: PlantBoard;
  people: PersonEntry[];
  announcement: Announcement;
  settings: DisplaySettings;
};
