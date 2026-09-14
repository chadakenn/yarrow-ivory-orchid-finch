import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PEOPLE, DEFAULT_PLANT_BOARD, DEFAULT_PRODUCTION, DEFAULT_SETTINGS, normalizeSettings } from "@/lib/data";
import type {
  Announcement,
  AppState,
  DisplaySettings,
  PersonEntry,
  PlantBoard,
  PlantName,
  ProductionState,
} from "@/lib/types";
import { addHistoryWeek, closeWeek, editHistoryWeek, formatTons, rankedProduction } from "@/lib/production";
import { normalizePerson } from "@/lib/people";
import { OUR_PLANT, PLANT_NAMES } from "@/lib/types";

type CloseWeekResult =
  | { ok: false; message: string }
  | { ok: true; message: string; nbWin: boolean; tonsDisplay: string };

type Store = AppState & {
  setPlantTons: (name: PlantName, tons: number) => void;
  setAllPlantTons: (plants: ProductionState["plants"]) => void;
  closeCurrentWeek: () => CloseWeekResult;
  resetCurrentWeek: () => void;
  resetAllProduction: () => void;
  loadSaturdayBook: () => void;
  updateHistoryWeek: (id: string, plants: ProductionState["plants"]) => void;
  addHistoryWeek: (weekEnding: string, plants: ProductionState["plants"]) => boolean;
  setPlantBoard: (board: PlantBoard) => void;
  setPeople: (people: PersonEntry[]) => void;
  addPerson: (person: Omit<PersonEntry, "id">) => void;
  updatePerson: (id: string, patch: Partial<PersonEntry>) => void;
  removePerson: (id: string) => void;
  postAnnouncement: (message: string, type: NonNullable<Announcement>["type"], minutes: number) => void;
  clearAnnouncement: () => void;
  setSettings: (patch: Partial<DisplaySettings>) => void;
  resetDemo: () => void;
};

const seed: AppState = {
  production: DEFAULT_PRODUCTION,
  plantBoard: DEFAULT_PLANT_BOARD,
  people: DEFAULT_PEOPLE,
  announcement: null,
  settings: DEFAULT_SETTINGS,
};

export const useDisplayStore = create<Store>()(
  persist(
    (set, get) => ({
      ...seed,
      setPlantTons: (name, tons) =>
        set((state) => ({
          production: {
            ...state.production,
            lastUpdated: Date.now(),
            plants: state.production.plants.map((plant) =>
              plant.name === name ? { ...plant, tons: Math.max(0, tons) } : plant,
            ),
          },
        })),
      setAllPlantTons: (plants) =>
        set((state) => ({
          production: {
            ...state.production,
            lastUpdated: Date.now(),
            plants,
          },
        })),
      closeCurrentWeek: () => {
        const current = get().production;
        const total = current.plants.reduce((sum, plant) => sum + plant.tons, 0);
        if (total <= 0) {
          return { ok: false, message: "Enter tons before locking Saturday." };
        }
        if (current.history.some((entry) => entry.weekEnding === current.weekEnding)) {
          return { ok: false, message: "That week is already in history." };
        }
        const ranked = rankedProduction(current.plants);
        const leaderTons = ranked[0]?.tons ?? 0;
        const winners = ranked.filter((row) => row.tons === leaderTons).map((row) => row.name);
        const nb = ranked.find((row) => row.name === OUR_PLANT);
        set({ production: closeWeek(current) });
        return {
          ok: true,
          message: "Saturday archived. New week reset to zero.",
          nbWin: winners.includes(OUR_PLANT),
          tonsDisplay: nb?.tonsDisplay ?? formatTons(nb?.tons ?? 0),
        };
      },
      resetCurrentWeek: () =>
        set((state) => ({
          production: {
            ...state.production,
            lastUpdated: Date.now(),
            plants: state.production.plants.map((plant) => ({ ...plant, tons: 0 })),
          },
        })),
      resetAllProduction: () =>
        set((state) => ({
          production: {
            weekEnding: state.production.weekEnding,
            lastUpdated: Date.now(),
            history: [],
            plants: PLANT_NAMES.map((name) => ({ name, tons: 0 })),
          },
        })),
      loadSaturdayBook: () =>
        set({
          production: {
            ...DEFAULT_PRODUCTION,
            lastUpdated: Date.now(),
            plants: PLANT_NAMES.map((name) => ({ name, tons: 0 })),
          },
        }),
      updateHistoryWeek: (id, plants) =>
        set((state) => ({
          production: editHistoryWeek(state.production, id, plants),
        })),
      addHistoryWeek: (weekEnding, plants) => {
        const current = get().production;
        const next = addHistoryWeek(current, weekEnding, plants);
        if (next === current) return false;
        set({ production: next });
        return true;
      },
      setPlantBoard: (board) => set({ plantBoard: board }),
      setPeople: (people) => set({ people }),
      addPerson: (person) =>
        set((state) => ({
          people: [...state.people, normalizePerson({ ...person, id: `p_${Math.random().toString(36).slice(2, 9)}` })],
        })),
      updatePerson: (id, patch) =>
        set((state) => ({
          people: state.people.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),
      removePerson: (id) =>
        set((state) => ({
          people: state.people.filter((item) => item.id !== id),
        })),
      postAnnouncement: (message, type, minutes) =>
        set({
          announcement: {
            message: message.trim().slice(0, 500),
            type,
            createdAt: Date.now(),
            expiresAt: Date.now() + minutes * 60 * 1000,
          },
        }),
      clearAnnouncement: () => set({ announcement: null }),
      setSettings: (patch) =>
        set((state) => ({
          settings: normalizeSettings({ ...state.settings, ...patch }),
        })),
      resetDemo: () => set({ ...seed, announcement: null }),
    }),
    {
      name: "breakroom-kiosk-people-v1",
      partialize: (state) => ({ people: state.people }),
      merge: (persisted, current) => {
        const raw = persisted as { people?: unknown } | undefined;
        const people = Array.isArray(raw?.people) ? raw.people.map((row) => normalizePerson(row as PersonEntry)) : current.people;
        return { ...current, ...((persisted as object) ?? {}), people };
      },
    },
  ),
);
