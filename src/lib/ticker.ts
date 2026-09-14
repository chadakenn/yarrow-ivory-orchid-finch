import { format, parseISO } from "date-fns";
import { lastClosedPair, rankedProduction, ytdProduction } from "@/lib/production";
import { livePeople, upcomingPeople } from "@/lib/people";
import type { AppState, DisplaySettings } from "@/lib/types";

export function millTicker(state: Pick<AppState, "production" | "people">, now = new Date()): string {
  const bits = ["NORTH BALTIMORE 50 TPH", "PLAN. PRODUCE. DELIVER. CONQUER."];
  const last = lastClosedPair(state.production).current;
  if (last) {
    const lead = rankedProduction(last.plants)[0];
    if (lead) {
      bits.push(
        `LAST SATURDAY ${format(parseISO(last.weekEnding), "MMM d").toUpperCase()} · ${lead.name.toUpperCase()} ${lead.tonsDisplay} TONS`,
      );
    }
  }
  const ytdLead = ytdProduction(state.production).ranked[0];
  if (ytdLead && ytdLead.tons > 0) {
    bits.push(
      `YTD ${ytdLead.name.toUpperCase()} LEADS · ${ytdLead.wins} SATURDAY WIN${ytdLead.wins === 1 ? "" : "S"} · ${ytdLead.tonsDisplay} TONS`,
    );
  }
  const live = livePeople(state.people, now);
  for (const person of live.slice(0, 2)) {
    if (person.kind === "birthday") bits.push(`HAPPY BIRTHDAY ${person.name.toUpperCase()}`);
    else if (person.kind === "anniversary") bits.push(`HAPPY ANNIVERSARY ${person.name.toUpperCase()}`);
    else bits.push(`SHOUT-OUT ${person.name.toUpperCase()}`);
  }
  if (!live.length) {
    const next = upcomingPeople(state.people, now, 21)[0];
    if (next) {
      const label = next.person.kind === "anniversary" ? "ANNIVERSARY" : "BIRTHDAY";
      bits.push(`NEXT UP ${next.person.name.toUpperCase()} · ${label} ${next.whenLabel.toUpperCase()}`);
    }
  }
  return bits.join("  ·  ");
}

function extraCopy(message: string | undefined) {
  const custom = String(message || "").trim();
  if (!custom) return "";
  if (custom.startsWith("NORTH BALTIMORE 50 TPH")) return "";
  return custom;
}

export function buildTicker(
  state: Pick<AppState, "production" | "people">,
  settings: Pick<DisplaySettings, "ticker">,
  now = new Date(),
) {
  const extra = extraCopy(settings.ticker.message);
  if (settings.ticker.auto === false) return extra || millTicker(state, now);
  const auto = millTicker(state, now);
  return extra ? `${auto}  ·  ${extra}` : auto;
}
