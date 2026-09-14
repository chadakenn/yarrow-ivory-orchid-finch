import { Award, Cake, Flag, Heart, Shield } from "lucide-react";
import { ConquestMap } from "@/components/display/ConquestMap";
import { MillCrest, PigMark, TargetMark, TrophyMark } from "@/components/display/Heraldry";
import type { BoardOwner } from "@/lib/map-engine";
import { MILL_HEX } from "@/lib/mills";
import type { CaptureTransfer, PersonEntry, PlantBoard, PlantName, RankedPlant, TerritoryRow } from "@/lib/types";
import { PLANT_NAMES } from "@/lib/types";
import { initials } from "@/lib/utils";

type WeeklyGraph = ReturnType<typeof import("@/lib/production").weeklyGraph>;

export function DeckSlide({
  src,
  title,
  page,
  pages,
}: {
  src: string;
  title: string;
  page: number;
  pages: number;
}) {
  return (
    <div className="deck-board">
      <img src={src} alt={`${title} slide ${page}`} className="deck-image" />
      <div className="deck-caption">
        {title} · {page}/{pages}
      </div>
    </div>
  );
}

export function ProductionSlide({
  title,
  period,
  metric,
  plants,
  showWins,
}: {
  title: string;
  period: string;
  metric: string;
  plants: RankedPlant[];
  showWins?: boolean;
}) {
  return (
    <div className="production-board">
      <div className="production-head">
        <div className="production-eyebrow">PIG FEED · MULTI-MILL PRODUCTION</div>
        <div className="production-title">{title}</div>
        <div className="production-sub">
          <strong>{metric}</strong>
          <span>· {period}</span>
        </div>
      </div>
      {plants.map((plant) => (
        <div key={plant.name} className={`production-row rank-${plant.rank}${plant.our ? " our" : ""}`}>
          <div className="production-place">{plant.rank}</div>
          <div className="production-main">
            <div className="production-name-line">
              <div className="production-name">{plant.name}</div>
              {plant.our ? <span className="our-badge">OUR MILL</span> : null}
            </div>
            <div className="production-gap">
              {showWins
                ? `${plant.wins} WEEKLY WIN${plant.wins === 1 ? "" : "S"} · ${plant.gapLabel}`
                : plant.gapLabel}
            </div>
            {plant.trendLabel ? (
              <div className={`production-trend ${plant.trendClass}`}>{plant.trendLabel}</div>
            ) : null}
            <div className="production-bar">
              <div
                className="production-bar-fill"
                style={{
                  width: `${plant.barPercent}%`,
                  background: MILL_HEX[plant.name].stroke,
                }}
              />
            </div>
          </div>
          <div className="production-score">
            <div className="production-tons">{plant.tonsDisplay}</div>
            <div className="production-unit">TONS RUN</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrendsSlide({ graph }: { graph: WeeklyGraph }) {
  const first = graph.weeks[0]?.label;
  const last = graph.weeks[graph.weeks.length - 1]?.label;
  return (
    <div className="trends-board">
      <div className="production-head">
        <div className="production-eyebrow">PIG FEED · SATURDAY FINALS</div>
        <div className="production-title">Weekly Tonnage Trends</div>
        <div className="production-sub">
          <strong>{graph.count} locked Saturdays</strong>
          <span>· {first ? `${first} – ` : ""}{last || graph.latestLabel || "—"}</span>
        </div>
      </div>
      <div className="trends-layout">
        <div className="trends-chart-card">
          <div className="trends-legend">
            {PLANT_NAMES.map((name) => (
              <div key={name} className={`trends-legend-item${name === "North Baltimore" ? " our" : ""}`}>
                <span className="trends-swatch" style={{ background: MILL_HEX[name].stroke }} />
                <span>{name}</span>
                {name === "North Baltimore" ? <em>OUR MILL</em> : null}
              </div>
            ))}
          </div>
          <div className="trends-chart">
            <MillTrendChart graph={graph} />
          </div>
        </div>
        <div className="trends-side">
          {graph.mills.map((mill) => (
            <div key={mill.name} className={`trends-mill${mill.our ? " our" : ""}`}>
              <div className="trends-mill-head">
                <span className="trends-swatch" style={{ background: MILL_HEX[mill.name].stroke }} />
                <span className="trends-mill-name">{mill.name}</span>
                <span className="trends-mill-rank">#{mill.rank}</span>
              </div>
              <div className="trends-mill-tons">{mill.tonsDisplay}</div>
              <div className={`trends-mill-delta ${mill.dir}`}>
                {mill.symbol} {mill.deltaDisplay}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MillTrendChart({ graph }: { graph: WeeklyGraph }) {
  const weeks = graph.weeks;
  if (!weeks.length) return <div className="trends-empty">No locked Saturdays yet.</div>;
  const W = 1100;
  const H = 280;
  const L = 58;
  const R = 20;
  const T = 16;
  const B = 36;
  const innerW = W - L - R;
  const innerH = H - T - B;
  const peak = Math.max(1000, ...weeks.flatMap((week) => PLANT_NAMES.map((name) => week.values[name] ?? 0)));
  const max = Math.ceil(peak / 500) * 500;
  const last = weeks.length - 1;
  const xAt = (i: number) => L + (weeks.length <= 1 ? innerW / 2 : (i / (weeks.length - 1)) * innerW);
  const yAt = (value: number) => T + innerH * (1 - value / max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((part) => Math.round(max * part));
  return (
    <svg className="trends-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Weekly mill tons">
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={L} x2={W - R} y1={yAt(tick)} y2={yAt(tick)} stroke="rgba(232,237,243,0.1)" />
          <text x={L - 8} y={yAt(tick) + 4} textAnchor="end" fill="#8b97a8" fontSize="12">
            {tick.toLocaleString("en-US")}
          </text>
        </g>
      ))}
      {weeks.map((week, index) =>
        week.showMonth ? (
          <text key={week.weekEnding} x={xAt(index)} y={H - 10} textAnchor="middle" fill="#8b97a8" fontSize="12">
            {week.month}
          </text>
        ) : null,
      )}
      {PLANT_NAMES.map((name) => {
        const d = weeks
          .map((week, index) => `${index ? "L" : "M"}${xAt(index).toFixed(1)},${yAt(week.values[name] ?? 0).toFixed(1)}`)
          .join(" ");
        return (
          <path
            key={name}
            d={d}
            fill="none"
            stroke={MILL_HEX[name].stroke}
            strokeWidth={name === "North Baltimore" ? 3.6 : 2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        );
      })}
      {PLANT_NAMES.map((name) => (
        <circle
          key={`${name}-last`}
          cx={xAt(last)}
          cy={yAt(weeks[last].values[name] ?? 0)}
          r={name === "North Baltimore" ? 6 : 4.5}
          fill={MILL_HEX[name].stroke}
          stroke="#0a1018"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

export function ConquestSlide({
  mode,
  weekLabel,
  live,
  territories,
  transfers,
  owners,
  statusTitle,
  statusDetail,
}: {
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
}) {
  const applied = transfers.filter((t) => t.applied);
  const captureStatus = applied.length
    ? applied
        .map((row) => `${row.winner.toUpperCase()} TAKES ${row.territoryName.toUpperCase()}`)
        .join("  ·  ")
    : statusTitle.toUpperCase();
  const captureDetail = applied.length
    ? "LIKE RISK. ATTACK ONLY A COUNTRY YOU TOUCH."
    : statusDetail.toUpperCase();

  const weeklySorted = [...territories].sort((a, b) => a.weeklyRank - b.weeklyRank);
  const ytdSorted = [...territories].sort((a, b) => a.seasonRank - b.seasonRank);
  const controlSorted = [...territories].sort((a, b) => {
    const t = b.territories - a.territories;
    if (t) return t;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="conquest-board">
      <div className="conquest-head">
        <div className="conquest-brand">
          <MillCrest className="conquest-crest" />
          <div>
            <div className="conquest-title">MILL CONQUEST BOARD</div>
            <div className="conquest-subtitle">PLAN. PRODUCE. DELIVER. CONQUER.</div>
            <div className="conquest-kicker">PIG FEED. MULTI-MILL PRODUCTION. BUILT ON TEAMWORK.</div>
          </div>
        </div>
        <div className="conquest-week-card">
          <div className="conquest-week-date">{live ? `${weekLabel} · LIVE` : weekLabel}</div>
          <div className="conquest-week-rule">
            <PigMark className="conquest-week-pig" fill="currentColor" />
            YTD CONTROL. ONE MAP.
          </div>
        </div>
      </div>

      <div className="conquest-main">
        <div className="conquest-scene">
          <ConquestMap territories={territories} transfers={transfers} owners={owners} mode={mode} live={live} />
        </div>

        <div className="conquest-sidebar">
          <div className="conquest-panel weekly-panel">
            <div className="conquest-panel-title">
              <i className="cq-star" /> WEEKLY TONS <i className="cq-star" />
            </div>
            <div className="conquest-weekly-list">
              {weeklySorted.map((row) => (
                <div
                  key={row.name}
                  className={`conquest-weekly-row${row.our ? " our" : ""}`}
                  style={{ ["--row-tone" as string]: MILL_HEX[row.name].stroke }}
                >
                  <div className="conquest-mill-shield" aria-hidden="true">
                    <PigMark fill="#f4f0e6" />
                  </div>
                  <div className="conquest-weekly-meta">
                    <div className="conquest-weekly-name">
                      {row.name.toUpperCase()}
                      {row.our ? <em>OUR MILL</em> : null}
                    </div>
                  </div>
                  <div className="conquest-weekly-tons">{row.weeklyTonsDisplay}</div>
                  <div className={`conquest-trend ${row.trendDir}`}>{row.trendSymbol}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="conquest-panel ytd-panel">
            <div className="conquest-panel-title">
              <i className="cq-star" /> YTD TOTAL TONS <i className="cq-star" />
            </div>
            <div className="conquest-ytd-table">
              {ytdSorted.map((row) => (
                <div
                  key={row.name}
                  className={`conquest-ytd-row${row.our ? " our" : ""}`}
                  style={{ ["--row-tone" as string]: MILL_HEX[row.name].stroke }}
                >
                  <div className="conquest-ytd-rank">{row.seasonRank}</div>
                  <div className="conquest-ytd-name">{row.name.toUpperCase()}</div>
                  <div className="conquest-ytd-value">{row.ytdTonsDisplay}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="conquest-panel control-panel">
            <div className="conquest-panel-title">TERRITORIES CONTROLLED</div>
            <div className="conquest-control-row">
              {controlSorted.map((row) => (
                <div
                  key={row.name}
                  className="conquest-control-mill"
                  style={{ ["--row-tone" as string]: MILL_HEX[row.name].stroke }}
                >
                  <div className="conquest-control-shield">
                    <PigMark fill="#f4f0e6" />
                    <strong>{row.territories}</strong>
                  </div>
                  <div className="conquest-control-label">{row.name.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="conquest-footer">
        <div className="conquest-footer-news">
          <TargetMark className="conquest-footer-icon" />
          <div>
            <div className="conquest-footer-value">{captureStatus}</div>
            <div className="conquest-footer-detail">{captureDetail}</div>
          </div>
        </div>
        <div className="conquest-footer-center" aria-hidden="true">
          <span className="cq-chevron-pack left" />
          <span className="cq-swords-mark" />
          <span className="cq-chevron-pack right" />
        </div>
        <div className="conquest-footer-slogan">
          <div className="conquest-slogan">
            {mode === "season" ? "CONTROL THE SEASON." : "ONE WEEK. ONE MAP. ONE WINNER."}
          </div>
          <TrophyMark className="conquest-trophy" />
        </div>
      </div>
    </div>
  );
}

export function RecordsSlide({
  records,
}: {
  records: ReturnType<typeof import("@/lib/production").productionRecords>;
}) {
  return (
    <div className="records-board">
      <div className="records-head">
        <div className="records-eyebrow">PIG FEED · PRODUCTION RECORD BOOK</div>
        <div className="records-title">PRODUCTION RECORDS & STREAKS</div>
        <div className="records-sub">
          {records.completedWeeks} COMPLETED WEEK{records.completedWeeks === 1 ? "" : "S"} · FINAL SATURDAY TOTALS
        </div>
      </div>
      <div className="records-highlights">
        <div className="records-highlight primary">
          <div className="records-label">CURRENT CHAMPION</div>
          <div className="records-value">{records.latestWinnerLabel}</div>
          <div className="records-detail">{records.latestWeekDisplay}</div>
        </div>
        <div className="records-highlight">
          <div className="records-label">RECORD WEEK</div>
          <div className="records-value">
            {records.overallBest.name} · {records.overallBest.tonsDisplay} TONS
          </div>
          <div className="records-detail">{records.overallBest.weekDisplay}</div>
        </div>
        <div className="records-highlight">
          <div className="records-label">BIGGEST WINNING MARGIN</div>
          <div className="records-value">
            {records.biggestWin.name} · +{records.biggestWin.marginDisplay} TONS
          </div>
          <div className="records-detail">{records.biggestWin.weekDisplay}</div>
        </div>
      </div>
      <div className="records-table-head">
        {["MILL", "WINS", "CURRENT STREAK", "LONGEST STREAK", "PERSONAL BEST"].map((label) => (
          <div key={label} className="records-cell">
            {label}
          </div>
        ))}
      </div>
      {records.rows.map((row) => (
        <div key={row.name} className={`records-table-row${row.our ? " our" : ""}`}>
          <div className="records-cell">
            <div className="records-name">
              {row.name}
              {row.our ? " · OUR MILL" : ""}
            </div>
          </div>
          <div className="records-cell">
            <div className="records-number">{row.wins}</div>
            <div className="records-caption">WEEKLY WINS</div>
          </div>
          <div className="records-cell">
            <div className="records-number">{row.currentStreak}</div>
            <div className="records-caption">WEEKS</div>
          </div>
          <div className="records-cell">
            <div className="records-number">{row.longestStreak}</div>
            <div className="records-caption">WEEKS</div>
          </div>
          <div className="records-cell">
            <div className="records-number">{row.bestWeekDisplay}</div>
            <div className="records-caption">TONS RUN</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const BOARD_SECTIONS = [
  { key: "goalText", label: "Today's Goal", icon: Flag },
  { key: "todayFocus", label: "Today's Focus", icon: Shield },
  { key: "safetyFocus", label: "Safety Focus", icon: Shield },
  { key: "maintenance", label: "Maintenance", icon: Shield },
  { key: "shipping", label: "Shipping / Loads", icon: Flag },
  { key: "staffing", label: "Staffing / Coverage", icon: Award },
  { key: "managerNote", label: "Manager Note", icon: Award },
] as const;

export function PlantBoardSlide({ board, updatedLabel }: { board: PlantBoard; updatedLabel: string }) {
  const sections = BOARD_SECTIONS.map((section) => ({
    ...section,
    text: String(board[section.key] ?? "").trim(),
  })).filter((section) => section.text);

  return (
    <div className="plant-board-slide">
      <div className="plant-board-head">
        <div>
          <div className="plant-board-kicker">North Baltimore · Daily Operations</div>
          <div className="plant-board-title">{board.title}</div>
          <div className="plant-board-sub">{board.subtitle}</div>
        </div>
        {updatedLabel ? <div className="plant-board-stamp">UPDATED {updatedLabel}</div> : null}
      </div>
      <div className="plant-board-grid">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.key} className={`plant-board-card${section.key === "goalText" ? " goal" : ""}`}>
              <div className="plant-board-label">
                <Icon size={14} strokeWidth={2.2} />
                {section.label}
              </div>
              <div className="plant-board-text">{section.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PeopleSlide({ person }: { person: PersonEntry }) {
  const birthday = person.kind === "birthday";
  const anniversary = person.kind === "anniversary";
  const kicker = birthday ? "Happy birthday" : anniversary ? "Work anniversary" : "Employee recognition";
  const Icon = birthday ? Cake : anniversary ? Heart : Award;
  return (
    <div className={`person-slide ${person.kind}`}>
      <div className="person-visual">
        {person.photo ? (
          <img src={person.photo} alt={person.name} className="person-photo" />
        ) : (
          <div className="person-fallback">{initials(person.name)}</div>
        )}
      </div>
      <div className="person-copy">
        <div className="person-kicker">
          <Icon size={18} strokeWidth={2} /> {kicker}
        </div>
        <div className="person-name">{person.name}</div>
        <div className="person-message">
          {person.message ||
            (birthday ? "Wishing you a great birthday!" : anniversary ? "Thank you for another year." : "Thank you for your hard work!")}
        </div>
      </div>
    </div>
  );
}
