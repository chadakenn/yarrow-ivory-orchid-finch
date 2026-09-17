import { format } from "date-fns";
import {
  conquestContext,
  formatWeekEnding,
  lastClosedPair,
  productionRecords,
  rankChangeTrends,
  rankedProduction,
  weeklyGraph,
  ytdProduction,
} from "@/lib/production";
import type { Deck } from "@/lib/media-library";
import { livePeople } from "@/lib/people";
import { millNow } from "@/lib/mill-clock";
import type { AppState, CaptureTransfer, PersonEntry, PlantBoard, RankedPlant, TerritoryRow } from "@/lib/types";
import type { BoardOwner } from "@/lib/map-engine";

export type Slide =
  | {
      id: string;
      kind: "deck";
      duration: number;
      src: string;
      title: string;
      page: number;
      pages: number;
    }
  | {
      id: string;
      kind: "production";
      duration: number;
      title: string;
      period: string;
      metric: string;
      plants: RankedPlant[];
      showWins?: boolean;
    }
  | {
      id: string;
      kind: "trends";
      duration: number;
      graph: ReturnType<typeof weeklyGraph>;
    }
  | {
      id: string;
      kind: "conquest";
      duration: number;
      mode: "weekly" | "season";
      period: string;
      weekLabel: string;
      live: boolean;
      sourceLabel: string;
      leaderName: string;
      leaderboardTitle: string;
      scoreRows: Array<{
        name: TerritoryRow["name"];
        rank: number;
        our: boolean;
        displayValue: string;
        territories: number;
      }>;
      territories: TerritoryRow[];
      transfers: CaptureTransfer[];
      owners: BoardOwner;
      statusTitle: string;
      statusDetail: string;
    }
  | {
      id: string;
      kind: "records";
      duration: number;
      records: ReturnType<typeof productionRecords>;
    }
  | {
      id: string;
      kind: "plant-board";
      duration: number;
      board: PlantBoard;
      updatedLabel: string;
    }
  | {
      id: string;
      kind: "person";
      duration: number;
      person: PersonEntry;
    };

export function buildSlides(state: AppState, decks: Deck[] = []): Slide[] {
  const slides: Slide[] = [];
  const { production, settings, plantBoard, people } = state;
  const d = settings.durations;
  const lastClosed = lastClosedPair(production);
  const weekly = rankedProduction(production.plants, {}, rankChangeTrends(production.plants, lastClosed.current));
  const ytd = ytdProduction(production);
  const conquest = conquestContext(production);
  const records = productionRecords(production);
  const graph = weeklyGraph(production);

  if (settings.productionEnabled !== false && production.plants.some((plant) => plant.tons > 0)) {
    slides.push({
      id: "prod-weekly",
      kind: "production",
      duration: d.productionWeekly,
      title: "FEED MILL PRODUCTION CHAMPIONSHIP",
      period: `Week ending ${formatWeekEnding(production.weekEnding)}`,
      metric: "TONS RUN",
      plants: weekly,
    });
  }

  if (settings.productionEnabled !== false) {
    slides.push({
      id: "prod-ytd",
      kind: "production",
      duration: d.productionYtd,
      title: `${ytd.year} YEAR-TO-DATE CHAMPIONSHIP`,
      period: `${ytd.year} YTD`,
      metric: "YTD TONS RUN",
      plants: ytd.ranked,
      showWins: true,
    });
  }

  if (settings.productionEnabled !== false && graph.weeks.length) {
    slides.push({
      id: "prod-trends",
      kind: "trends",
      duration: d.productionTrends ?? 16,
      graph,
    });
  }

  if (settings.recordsEnabled) {
    slides.push({
      id: "records",
      kind: "records",
      duration: d.productionRecords,
      records,
    });
  }

  if (settings.conquestEnabled) {
    const seasonRows = conquest.ytdRanked.map((row) => {
      const match = conquest.territories.find((t) => t.name === row.name)!;
      return {
        name: row.name,
        rank: row.rank,
        our: row.our,
        displayValue: match.ytdTonsDisplay,
        territories: match.territories,
      };
    });

    slides.push({
      id: "conquest-season",
      kind: "conquest",
      duration: d.conquest,
      mode: "season",
      period: `${conquest.year} season conquest · week-by-week control`,
      weekLabel: `WEEK ${conquest.weekNumber} • ${conquest.weekRangeDisplay}`,
      live: conquest.weeklyLive,
      sourceLabel: "YTD CAMPAIGN",
      leaderName: conquest.seasonLeader,
      leaderboardTitle: "YTD TOTAL TONS",
      scoreRows: seasonRows,
      territories: conquest.territories,
      transfers: conquest.lastTransfers,
      owners: conquest.owners,
      statusTitle: conquest.seasonLeader
        ? `${conquest.seasonLeader} controls the campaign`
        : "Season campaign waiting for results",
      statusDetail: `24 countries. Capitals hold. Last ${conquest.campaignWeeks} week${conquest.campaignWeeks === 1 ? "" : "s"} of border wars.`,
    });
  }

  const sectionsFilled = [
    plantBoard.goalText,
    plantBoard.todayFocus,
    plantBoard.safetyFocus,
    plantBoard.maintenance,
    plantBoard.shipping,
    plantBoard.staffing,
    plantBoard.managerNote,
  ].some((value) => value.trim());

  if (plantBoard.enabled && sectionsFilled) {
    slides.push({
      id: "plant-board",
      kind: "plant-board",
      duration: d.plantBoard,
      board: plantBoard,
      updatedLabel: plantBoard.updatedAt
        ? format(plantBoard.updatedAt, "MMM d · h:mm a")
        : "",
    });
  }

  if (settings.peopleEnabled) {
    for (const person of livePeople(people, millNow())) {
      slides.push({
        id: `person-${person.id}`,
        kind: "person",
        duration: d.people,
        person,
      });
    }
  }

  const uploaded: Slide[] = [];
  if (settings.decksEnabled !== false) {
    const hold = Math.max(4, d.presentation ?? 10);
    for (const deck of decks.filter((item) => item.enabled && item.slides.length)) {
      deck.slides.forEach((slide, index) => {
        uploaded.push({
          id: `deck-${deck.id}-${index}`,
          kind: "deck",
          duration: hold,
          src: slide.src,
          title: deck.name,
          page: index + 1,
          pages: deck.slides.length,
        });
      });
    }
  }

  return slides.concat(uploaded);
}
