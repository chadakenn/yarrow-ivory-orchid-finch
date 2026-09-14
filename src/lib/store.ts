import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PEOPLE, DEFAULT_PLANT_BOARD, DEFAULT_PRODUCTION, DEFAULT_SETTINGS } from "@/lib/data";
import type {
  Announcement,
  AppState,
  DisplaySettings,
  PersonEntry,
  PlantBoard,
  PlantName,
  ProductionState,
} from "@/lib/types";
import { closeWeek, editHistoryWeek } from "@/lib/production";
import { normalizePerson } from "@/lib/people";
import { PLANT_NAMES } from "@/lib/types";

type Store = AppState & {
  setPlantTons: (name: PlantName, tons: number) => void;
  setAllPlantTons: (plants: ProductionState["plants"]) => void;
  closeCurrentWeek: () => { ok: boolean; message: string };
  resetCurrentWeek: () => void;
  resetAllProduction: () => void;
  updateHistoryWeek: (id: string, plants: ProductionState["plants"]) => void;
  setPlantBoard: (board: PlantBoard) => void;
  setPeople: (people: PersonEntry[]) => void;
  addPerson: (person: Omit<PersonEntry, "id">) => void;
  updatePerson: (id: string, patch: Partial<PersonEntry>) => void;
  removePerson: (id: string) => void;
  postAnnouncement: (message: string, type: NonNullable<Announcement>["type"], minutes: number) => void;
  clearAnnouncement: () => void;
  setSettings: (patch: Partial<DisplaySettings>) => void;
  loadSaturdayBook: () => void;
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
        set({ production: closeWeek(current) });
        return { ok: true, message: "Saturday archived. New week reset to zero." };
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
      updateHistoryWeek: (id, plants) =>
        set((state) => ({
          production: editHistoryWeek(state.production, id, plants),
        })),
      setPlantBoard: (board) => set({ plantBoard: board }),
      setPeople: (people) => set({ people }),
      addPerson: (person) =>
        set((state) => ({
          people: [...state.people, normalizePerson(person)],
        })),
      updatePerson: (id, patch) =>
        set((state) => ({
          people: state.people.map((item) => (item.id === id ? normalizePerson({ ...item, ...patch }) : item)),
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
          settings: { ...state.settings, ...patch },
        })),
      loadSaturdayBook: () =>
        set({
          production: {
            ...DEFAULT_PRODUCTION,
            lastUpdated: Date.now(),
          },
        }),
      resetDemo: () => set({ ...seed, announcement: null }),
    }),
    {
      name: "breakroom-kiosk-people-v1",
      partialize: (state) => ({ people: state.people }),
    },
  ),
);
