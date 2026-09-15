import { format } from "date-fns";
import type { ProductionState } from "@/lib/types";

/** Saturday that closes the week currently being run (today if Saturday). */
export function currentOpenSaturday(now = new Date()): string {
  const day = now.getDay();
  const delta = day === 6 ? 0 : 6 - day;
  const sat = new Date(now.getFullYear(), now.getMonth(), now.getDate() + delta);
  return format(sat, "yyyy-MM-dd");
}

/** Advance an empty open week past Saturdays that already elapsed. Never auto-locks tons. */
export function rollOpenWeek(state: ProductionState, now = new Date()): ProductionState {
  const target = currentOpenSaturday(now);
  if (!state.weekEnding || state.weekEnding >= target) return state;
  if (state.plants.some((plant) => plant.tons > 0)) return state;
  return {
    ...state,
    weekEnding: target,
    lastUpdated: Date.now(),
  };
}
