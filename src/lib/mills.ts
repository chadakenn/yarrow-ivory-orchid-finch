import type { PlantName } from "@/lib/types";

export type MillTone = {
  fill: string;
  stroke: string;
  glow: string;
  accent: string;
  dark: string;
  token: string;
};

export const MILL_TONES: Record<PlantName, MillTone> = {
  "North Baltimore": {
    fill: "color-mix(in oklab, var(--mill-nb) 62%, transparent)",
    stroke: "var(--mill-nb-stroke)",
    glow: "var(--mill-nb-glow)",
    accent: "var(--mill-nb-accent)",
    dark: "var(--mill-nb-dark)",
    token: "nb",
  },
  Marshville: {
    fill: "color-mix(in oklab, var(--mill-marshville) 60%, transparent)",
    stroke: "var(--mill-marshville-stroke)",
    glow: "var(--mill-marshville-glow)",
    accent: "var(--mill-marshville-accent)",
    dark: "var(--mill-marshville-dark)",
    token: "marshville",
  },
  Henderson: {
    fill: "color-mix(in oklab, var(--mill-henderson) 60%, transparent)",
    stroke: "var(--mill-henderson-stroke)",
    glow: "var(--mill-henderson-glow)",
    accent: "var(--mill-henderson-accent)",
    dark: "var(--mill-henderson-dark)",
    token: "henderson",
  },
  Albertville: {
    fill: "color-mix(in oklab, var(--mill-albertville) 60%, transparent)",
    stroke: "var(--mill-albertville-stroke)",
    glow: "var(--mill-albertville-glow)",
    accent: "var(--mill-albertville-accent)",
    dark: "var(--mill-albertville-dark)",
    token: "albertville",
  },
};

export const MILL_HEX: Record<PlantName, { fill: string; stroke: string; glow: string; accent: string; dark: string; token: string }> = {
  "North Baltimore": {
    fill: "rgba(20,95,189,.78)",
    stroke: "#3f9fff",
    glow: "rgba(63,159,255,.50)",
    accent: "#9fd9ff",
    dark: "#0a2748",
    token: "nb",
  },
  Marshville: {
    fill: "rgba(73,111,45,.78)",
    stroke: "#7bd555",
    glow: "rgba(123,213,85,.43)",
    accent: "#d6f7a8",
    dark: "#142519",
    token: "marshville",
  },
  Henderson: {
    fill: "rgba(124,43,37,.78)",
    stroke: "#ff6f5d",
    glow: "rgba(255,111,93,.43)",
    accent: "#ffd1ba",
    dark: "#281311",
    token: "henderson",
  },
  Albertville: {
    fill: "rgba(103,54,157,.78)",
    stroke: "#bd70ff",
    glow: "rgba(189,112,255,.46)",
    accent: "#ead9ff",
    dark: "#21152f",
    token: "albertville",
  },
};

export const MAP_ORDER: PlantName[] = [
  "North Baltimore",
  "Henderson",
  "Marshville",
  "Albertville",
];
