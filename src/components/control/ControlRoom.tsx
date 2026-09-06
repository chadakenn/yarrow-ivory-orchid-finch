import { Link } from "@tanstack/react-router";
import {
  Bell,
  CalendarClock,
  Camera,
  ChevronDown,
  ChevronUp,
  Download,
  Flag,
  ImagePlus,
  KeyRound,
  Lock,
  MonitorPlay,
  Presentation,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BakeryLogo } from "@/components/ui/bakery-logo";
import { Input, Label, Textarea } from "@/components/ui/input";
import { applyAppUpdate } from "@/lib/app-update";
import { APP_VERSION } from "@/lib/brand";
import { DEFAULT_SETTINGS, MILL_COPY } from "@/lib/data";
import { useKioskSyncStatus } from "@/lib/kiosk-sync";
import { cleanMillTemp, fetchPiStats, listMillTemp } from "@/lib/workspace-zip";
import { clearDecks, deckBytes, importFiles, moveDeck, removeDeck, toggleDeck, useMediaLibrary } from "@/lib/media-library";
import { MILL_HEX } from "@/lib/mills";
import {
  compressPersonPhoto,
  expiredShoutouts,
  isPersonLive,
  PERSON_KINDS,
  personKindLabel,
  personStatus,
  personWhenLabel,
} from "@/lib/people";
import {
  formatTons,
  formatWeekEnding,
  productionRecords,
  rankedProduction,
  weeklyGraph,
  ytdProduction,
} from "@/lib/production";
import { useDisplayStore } from "@/lib/store";
import type { DisplaySettings, HistoryWeek, PersonEntry, PlantBoard, PlantName, PlantTons } from "@/lib/types";
import { PLANT_NAMES } from "@/lib/types";
import { cn } from "@/lib/utils";

const PIN_KEY = "breakroom-admin-pin";
const PIN_REV_KEY = "breakroom-admin-pin-rev";
const UNLOCK_KEY = "breakroom-admin-unlocked";
const DEFAULT_PIN = "1231";

function readAdminPin() {
  try {
    if (localStorage.getItem(PIN_REV_KEY) !== DEFAULT_PIN) {
      localStorage.setItem(PIN_KEY, DEFAULT_PIN);
      localStorage.setItem(PIN_REV_KEY, DEFAULT_PIN);
      return DEFAULT_PIN;
    }
    return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

function writeAdminPin(pin: string) {
  try {
    localStorage.setItem(PIN_KEY, pin);
    localStorage.setItem(PIN_REV_KEY, pin);
  } catch {
    /* ignore */
  }
}

function emptyDraft(): Record<PlantName, string> {
  return Object.fromEntries(PLANT_NAMES.map((name) => [name, ""])) as Record<PlantName, string>;
}

function plantsFromDraft(draft: Record<PlantName, string>): PlantTons[] {
  return PLANT_NAMES.map((name) => ({
    name,
    tons: Math.max(0, Number.parseFloat(draft[name] || "0") || 0),
  }));
}

type Tab = "production" | "slides" | "board" | "people" | "display";

const NAV: Array<{ id: Tab; label: string; icon: typeof Trophy }> = [
  { id: "production", label: "Production", icon: Trophy },
  { id: "slides", label: "Slides", icon: Presentation },
  { id: "board", label: "Plant pages", icon: Flag },
  { id: "people", label: "People", icon: Users },
  { id: "display", label: "Display", icon: CalendarClock },
];

export function ControlRoom({ room = "office" }: { room?: "office" | "admin" }) {
  const [tab, setTab] = useState<Tab>("production");
  const production = useDisplayStore((s) => s.production);
  const ranked = useMemo(() => rankedProduction(production.plants), [production.plants]);
  const ytd = useMemo(() => ytdProduction(production), [production]);
  const records = useMemo(() => productionRecords(production), [production]);
  const graph = useMemo(() => weeklyGraph(production, 12), [production]);
  const chartData = graph.weeks.map((week) => ({ label: week.label, ...week.values }));

  if (room === "admin") {
    return (
      <AdminGate>
        <Shell tab={tab} setTab={setTab} admin>
          <AdminPanel />
        </Shell>
      </AdminGate>
    );
  }

  return (
    <Shell tab={tab} setTab={setTab}>
      {tab === "production" ? (
        <ProductionPanel ranked={ranked} ytd={ytd} chartData={chartData} graph={graph} records={records} />
      ) : null}
      {tab === "slides" ? <SlidesPanel /> : null}
      {tab === "board" ? <BoardPanel /> : null}
      {tab === "people" ? <PeoplePanel /> : null}
      {tab === "display" ? <DisplayPanel /> : null}
    </Shell>
  );
}

function Shell({
  tab,
  setTab,
  admin,
  children,
}: {
  tab: Tab;
  setTab: (tab: Tab) => void;
  admin?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="control-shell">
      <aside className="control-nav">
        <div className="control-brand">
          <BakeryLogo size="sm" />
          <div>
            <div className="control-brand-kicker">North Baltimore · v{APP_VERSION}</div>
            <div className="control-brand-title">Breakroom Display</div>
          </div>
        </div>
        <SyncPill />
        {admin ? (
          <nav className="control-links">
            <div className="control-link active">
              <MonitorPlay size={16} />
              Admin
            </div>
          </nav>
        ) : (
          <nav className="control-links">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn("control-link", tab === item.id && "active")}
                  onClick={() => setTab(item.id)}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
        <Link to="/" className="control-tv-btn">
          Open TV display
        </Link>
        {admin ? (
          <Link to="/office" className="control-admin-link">
            Back to office page
          </Link>
        ) : (
          <Link to="/admin" className="control-admin-link">
            Admin
          </Link>
        )}
      </aside>

      <header className="control-topbar">
        <div className="control-brand">
          <BakeryLogo size="sm" />
          <div>
            <div className="control-brand-kicker">{admin ? "Admin" : "Office page"} · v{APP_VERSION}</div>
            <div className="control-brand-title">Breakroom</div>
          </div>
        </div>
        <SyncPill />
        <Link to="/" className="control-tv-btn">
          Open TV
        </Link>
      </header>

      <main className="control-main">{children}</main>

      {admin ? null : (
        <nav className="control-dock" aria-label="Office pages">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={cn("control-dock-link", tab === item.id && "active")}
                onClick={() => setTab(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function SyncPill() {
  const { status } = useKioskSyncStatus();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const shown = mounted ? status : "connecting";
  const label = shown === "saving" ? "Saving" : shown === "live" ? "Live" : shown === "error" ? "Retrying" : "Connecting";
  return <div className={cn("sync-pill", shown)}>{label}</div>;
}

function AdminGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(UNLOCK_KEY) === "1") setUnlocked(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (unlocked) return <>{children}</>;

  return (
    <div className="pin-gate">
      <div className="panel" style={{ maxWidth: 420, width: "100%" }}>
        <BakeryLogo size="md" />
        <p className="eyebrow" style={{ marginTop: 14 }}>Admin</p>
        <h1>Admin</h1>
        <p className="lede">Enter the mill code to update the TV, clean old slides, or reset the season.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (code.trim() === readAdminPin()) {
              try {
                sessionStorage.setItem(UNLOCK_KEY, "1");
              } catch {
                /* ignore */
              }
              setUnlocked(true);
              return;
            }
            setError("That code is wrong.");
          }}
        >
          <Label htmlFor="admin-pin">Admin code</Label>
          <Input
            id="admin-pin"
            className="pin-input"
            inputMode="numeric"
            autoComplete="off"
            placeholder="1231"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setError("");
            }}
          />
          {error ? <p className="pin-error">{error}</p> : null}
          <div className="header-actions" style={{ marginTop: 14 }}>
            <Button type="submit">Open Admin</Button>
            <Button variant="ghost" asChild>
              <Link to="/office">Back to office page</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductionPanel({
  ranked,
  ytd,
  chartData,
  graph,
  records,
}: {
  ranked: ReturnType<typeof rankedProduction>;
  ytd: ReturnType<typeof ytdProduction>;
  chartData: Array<Record<string, string | number>>;
  graph: ReturnType<typeof weeklyGraph>;
  records: ReturnType<typeof productionRecords>;
}) {
  const production = useDisplayStore((s) => s.production);
  const book = [...records.rows].sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name));
  return (
    <section className="control-page">
      <header className="control-header">
        <div>
          <p className="eyebrow">Production</p>
          <h1>Saturday tons</h1>
          <p className="lede">Type the four mill totals, send them to the TV, then lock Saturday when the week is done.</p>
        </div>
        <div className="week-chip">Week ending {formatWeekEnding(production.weekEnding)}</div>
      </header>
      <WeeklyTonsForm />
      <HistoryCorrection />
      <div className="panel">
        <div className="library-head">
          <h2>Last 12 completed weeks</h2>
          <div className="chart-legend">
            {PLANT_NAMES.map((name) => (
              <span key={name}>
                <i className="swatch" style={{ background: MILL_HEX[name].stroke }} />
                {MILL_COPY[name].short}
              </span>
            ))}
          </div>
        </div>
        <div className="trends-chart" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(232,237,243,0.08)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} width={48} />
              <Tooltip />
              {PLANT_NAMES.map((name) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={MILL_HEX[name].stroke}
                  strokeWidth={name === "North Baltimore" ? 3 : 2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="lede" style={{ marginTop: 8 }}>
          {graph.count} closed weeks · {ytd.year} YTD leader {ytd.ranked[0]?.name ?? "—"}. This week {ranked[0]?.name ?? "—"} leads the open board.
        </p>
      </div>
      <div className="panel">
        <h2>Wins and streaks</h2>
        <div className="mini-records">
          {book.map((row, index) => (
            <div key={row.name} className={cn("mini-record", row.our && "our")}>
              <strong>
                {index + 1} {row.name}
              </strong>
              <span>{row.wins} wins</span>
              <span>streak {row.currentStreak}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WeeklyTonsForm() {
  const production = useDisplayStore((s) => s.production);
  const setAllPlantTons = useDisplayStore((s) => s.setAllPlantTons);
  const closeCurrentWeek = useDisplayStore((s) => s.closeCurrentWeek);
  const resetCurrentWeek = useDisplayStore((s) => s.resetCurrentWeek);
  const postAnnouncement = useDisplayStore((s) => s.postAnnouncement);
  const [draft, setDraft] = useState<Record<PlantName, string>>(emptyDraft());
  const [confirmLock, setConfirmLock] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setDraft(
      Object.fromEntries(production.plants.map((plant) => [plant.name, plant.tons ? String(plant.tons) : ""])) as Record<
        PlantName,
        string
      >,
    );
    setConfirmLock(false);
    setConfirmReset(false);
  }, [production.plants, production.weekEnding]);

  const plants = plantsFromDraft(draft);
  const preview = rankedProduction(plants);
  const total = plants.reduce((sum, plant) => sum + plant.tons, 0);
  const dirty = PLANT_NAMES.some(
    (name) => (plants.find((plant) => plant.name === name)?.tons ?? 0) !== (production.plants.find((plant) => plant.name === name)?.tons ?? 0),
  );
  const leader = preview[0];

  return (
    <div className="panel tons-panel">
      <div className="library-head">
        <div>
          <h2>Enter Saturday tons</h2>
          <p className="lede">Numbers update the order as you type. Send when it looks right.</p>
        </div>
        <div className="office-live-total">
          <strong>{formatTons(total)}</strong>
          <span>{leader && total > 0 ? `${leader.name} leads` : "No tons yet"}</span>
        </div>
      </div>
      <div className="ton-grid">
        {PLANT_NAMES.map((name) => {
          const row = preview.find((item) => item.name === name);
          return (
            <label key={name} className={cn("ton-card", name === "North Baltimore" && "ours", row?.rank === 1 && total > 0 && "is-lead")}>
              <div className="ton-head">
                <span className="swatch" style={{ background: MILL_HEX[name].stroke }} />
                <span>{name}</span>
                <em>{MILL_COPY[name].short}</em>
                <span className="ton-rank">{total > 0 && row ? `${row.rank}` : "—"}</span>
              </div>
              <Input
                className="ton-input"
                inputMode="decimal"
                placeholder="0"
                value={draft[name]}
                onChange={(event) => {
                  setDraft((prev) => ({ ...prev, [name]: event.target.value }));
                  setConfirmLock(false);
                }}
              />
            </label>
          );
        })}
      </div>
      {total > 0 ? (
        <ol className="office-standings" aria-label="Live order">
          {preview.map((row) => (
            <li key={row.name} className={cn(row.our && "our")}>
              <b>{row.rank}</b>
              <span>{row.name}</span>
              <strong>{row.tonsDisplay}</strong>
            </li>
          ))}
        </ol>
      ) : null}
      <div className="header-actions tons-actions">
        <Button
          disabled={!dirty}
          onClick={() => {
            setAllPlantTons(plants);
            toast.success("Tons sent to the TV.");
          }}
        >
          <Save size={16} />
          {dirty ? "Send to TV" : "On the TV"}
        </Button>
        <Button
          variant={confirmLock ? "danger" : "secondary"}
          onClick={() => {
            if (!confirmLock) {
              setConfirmLock(true);
              return;
            }
            const result = closeCurrentWeek();
            setConfirmLock(false);
            if (result.ok) {
              toast.success("Saturday is locked. New week starts at zero.");
              if (result.nbWin) {
                postAnnouncement(
                  `NORTH BALTIMORE LOCKS SATURDAY · ${result.tonsDisplay} TONS. THE MAP IS OURS.`,
                  "celebration",
                  6,
                );
              }
            } else toast.error(result.message);
          }}
        >
          {confirmLock ? "Tap again to lock Saturday" : "Lock Saturday"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (!confirmReset) {
              setConfirmReset(true);
              return;
            }
            resetCurrentWeek();
            setConfirmReset(false);
            toast.success("This week is back to zero.");
          }}
        >
          {confirmReset ? "Tap again to reset" : "Reset this week"}
        </Button>
      </div>
    </div>
  );
}

function HistoryCorrection() {
  const production = useDisplayStore((s) => s.production);
  const updateHistoryWeek = useDisplayStore((s) => s.updateHistoryWeek);
  const weeks = useMemo(
    () => production.history.slice().sort((a, b) => b.weekEnding.localeCompare(a.weekEnding)).slice(0, 16),
    [production.history],
  );
  const [open, setOpen] = useState(false);
  const [weekId, setWeekId] = useState(weeks[0]?.id ?? "");
  const selected = weeks.find((week) => week.id === weekId) ?? weeks[0];
  const selectedKey = selected
    ? `${selected.id}:${selected.plants.map((plant) => `${plant.name}:${plant.tons}`).join("|")}`
    : "";
  const [draft, setDraft] = useState<Record<PlantName, string>>(emptyDraft());

  useEffect(() => {
    if (!weeks.some((week) => week.id === weekId) && weeks[0]) setWeekId(weeks[0].id);
  }, [weekId, weeks]);

  useEffect(() => {
    const week = weeks.find(
      (entry) => `${entry.id}:${entry.plants.map((plant) => `${plant.name}:${plant.tons}`).join("|")}` === selectedKey,
    );
    if (!week) {
      setDraft(emptyDraft());
      return;
    }
    setDraft(
      Object.fromEntries(week.plants.map((plant) => [plant.name, plant.tons ? String(plant.tons) : ""])) as Record<
        PlantName,
        string
      >,
    );
  }, [selectedKey, weeks]);

  if (!weeks.length) return null;

  return (
    <div className="panel tons-panel">
      <button type="button" className="correction-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>
          <strong>Fix a locked Saturday</strong>
          <em>Only if last week was typed wrong. Map and records rebuild from the new totals.</em>
        </span>
        <b>{open ? "Hide" : "Open"}</b>
      </button>
      {open ? (
        <>
          <div className="library-head">
            <select className="select" value={selected?.id ?? ""} onChange={(event) => setWeekId(event.target.value)} aria-label="Locked Saturday">
              {weeks.map((week) => (
                <option key={week.id} value={week.id}>
                  {formatWeekEnding(week.weekEnding)} · {week.winners.join(" & ")}
                </option>
              ))}
            </select>
          </div>
          <div className="ton-grid">
            {PLANT_NAMES.map((name) => (
              <label key={name} className={cn("ton-card", name === "North Baltimore" && "ours")}>
                <div className="ton-head">
                  <span className="swatch" style={{ background: MILL_HEX[name].stroke }} />
                  <span>{name}</span>
                </div>
                <Input
                  className="ton-input"
                  inputMode="decimal"
                  placeholder="0"
                  value={draft[name]}
                  onChange={(event) => setDraft((prev) => ({ ...prev, [name]: event.target.value }))}
                />
              </label>
            ))}
          </div>
          <div className="header-actions">
            <Button
              onClick={() => {
                if (!selected) return;
                const next = plantsFromDraft(draft);
                if (next.reduce((sum, plant) => sum + plant.tons, 0) <= 0) {
                  toast.error("Enter tons before saving the correction.");
                  return;
                }
                updateHistoryWeek(selected.id, next);
                toast.success("Saturday corrected. Map and records updated.");
              }}
            >
              <Save size={16} />
              Save correction
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function SlidesPanel() {
  const { decks, ready } = useMediaLibrary();
  const settings = useDisplayStore((s) => s.settings);
  const setSettings = useDisplayStore((s) => s.setSettings);
  const [over, setOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const hold = Math.max(4, settings.durations.presentation ?? 10);
  const live = decks.filter((deck) => deck.enabled);
  const liveSlides = live.reduce((sum, deck) => sum + deck.slides.length, 0);

  const onFiles = async (files: File[]) => {
    if (!files.length) return;
    try {
      await importFiles(files, (label) => toast.message(label));
      if (!settings.decksEnabled) setSettings({ decksEnabled: true });
      toast.success("Slides are on the TV.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read that file.");
    }
  };

  const bumpHold = (delta: number) => {
    const current = useDisplayStore.getState().settings;
    const next = { ...DEFAULT_SETTINGS.durations, ...current.durations };
    setSettings({
      durations: { ...next, presentation: Math.min(90, Math.max(4, Math.round((next.presentation ?? 10) + delta))) },
    });
  };

  return (
    <section className="control-page">
      <header className="control-header">
        <div>
          <p className="eyebrow">Slides</p>
          <h1>TV slides</h1>
          <p className="lede">
            PowerPoints, PDFs, and photos play first, then the championship boards. Use this phone — camera, files, or a drop.
          </p>
        </div>
        <div className="week-chip">
          {settings.decksEnabled && liveSlides ? `${liveSlides} on the TV` : "None on the TV"}
        </div>
      </header>

      <div className="panel">
        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.decksEnabled !== false}
            onChange={(event) => setSettings({ decksEnabled: event.target.checked })}
          />
          Play these slides on the TV
        </label>
        <div className="timing-row" style={{ marginTop: 12 }}>
          <div>
            <strong>Hold each slide</strong>
            <span>How long a photo or PPTX page stays up before the next one.</span>
          </div>
          <div className="timing-step">
            <button type="button" onClick={() => bumpHold(-1)} aria-label="Shorter">
              −
            </button>
            <div className="timing-value">
              {hold}
              <em>sec</em>
            </div>
            <button type="button" onClick={() => bumpHold(1)} aria-label="Longer">
              +
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn("upload-drop", over && "over", !ready && "busy")}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          void onFiles([...event.dataTransfer.files]);
        }}
      >
        <Presentation size={28} />
        <strong>Drop a deck here</strong>
        <span>PowerPoint, PDF, or photos from this phone</span>
        <div className="upload-actions">
          <Button type="button" onClick={() => fileRef.current?.click()} disabled={!ready}>
            <ImagePlus size={16} />
            Choose files
          </Button>
          <Button type="button" variant="secondary" onClick={() => photoRef.current?.click()} disabled={!ready}>
            <Camera size={16} />
            Take / pick photos
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept=".pptx,.pdf,image/*"
          onChange={(event) => {
            void onFiles([...(event.target.files ?? [])]);
            event.target.value = "";
          }}
        />
        <input
          ref={photoRef}
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={(event) => {
            void onFiles([...(event.target.files ?? [])]);
            event.target.value = "";
          }}
        />
      </div>

      {decks.length ? (
        <div className="library-list">
          {decks.map((deck, index) => (
            <div key={deck.id} className={cn("library-item", deck.enabled && settings.decksEnabled !== false && "on")}>
              <div className="library-strip">
                {(deck.slides.slice(0, 4).length ? deck.slides.slice(0, 4) : [{ src: "" }]).map((slide, slideIndex) =>
                  slide.src ? (
                    <img key={`${deck.id}-${slideIndex}`} src={slide.src} alt="" className="library-thumb" />
                  ) : (
                    <div key={`${deck.id}-empty`} className="library-thumb" />
                  ),
                )}
                {deck.slides.length > 4 ? <span className="library-more">+{deck.slides.length - 4}</span> : null}
              </div>
              <div className="library-name">
                {deck.name}
                <div className="lede">
                  {deck.slides.length} slide{deck.slides.length === 1 ? "" : "s"}
                  {deck.enabled ? " · plays before production" : " · off"}
                  {index === 0 && deck.enabled ? " · first" : ""}
                </div>
              </div>
              <div className="library-actions">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={index === 0}
                  onClick={() => void moveDeck(deck.id, -1)}
                  aria-label="Move up"
                >
                  <ChevronUp size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={index === decks.length - 1}
                  onClick={() => void moveDeck(deck.id, 1)}
                  aria-label="Move down"
                >
                  <ChevronDown size={16} />
                </Button>
                <Button size="sm" variant="secondary" onClick={() => void toggleDeck(deck.id, !deck.enabled)}>
                  {deck.enabled ? "On TV" : "Off"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void removeDeck(deck.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-note">Nothing queued yet. Drop a PowerPoint or add photos and they play before the championship.</p>
      )}
    </section>
  );
}

const BOARD_FIELDS: Array<{ key: keyof PlantBoard; label: string }> = [
  { key: "title", label: "Title" },
  { key: "subtitle", label: "Subtitle" },
  { key: "goalText", label: "Today's goal" },
  { key: "todayFocus", label: "Today's focus" },
  { key: "safetyFocus", label: "Safety focus" },
  { key: "maintenance", label: "Maintenance" },
  { key: "shipping", label: "Shipping / loads" },
  { key: "staffing", label: "Staffing / coverage" },
  { key: "managerNote", label: "Manager note" },
];

function BoardPanel() {
  const board = useDisplayStore((s) => s.plantBoard);
  const setPlantBoard = useDisplayStore((s) => s.setPlantBoard);
  return (
    <section className="control-page">
      <header className="control-header">
        <div>
          <p className="eyebrow">Plant pages</p>
          <h1>North Baltimore board</h1>
          <p className="lede">What the mill needs to see today. Empty fields stay off the TV.</p>
        </div>
      </header>
      <div className="panel">
        <label className="check-row">
          <input
            type="checkbox"
            checked={board.enabled}
            onChange={(event) => setPlantBoard({ ...board, enabled: event.target.checked, updatedAt: Date.now() })}
          />
          Show plant board on the TV
        </label>
        <p className="lede" style={{ marginTop: 8 }}>
          {board.updatedAt ? `Last saved ${new Date(board.updatedAt).toLocaleString()}` : "Not sent yet. Type below and it saves as you go."}
        </p>
        <div className="form-grid" style={{ marginTop: 16 }}>
          {BOARD_FIELDS.map((field) => (
            <label key={field.key}>
              <Label>{field.label}</Label>
              {field.key === "managerNote" || field.key === "todayFocus" ? (
                <Textarea
                  value={String(board[field.key] ?? "")}
                  onChange={(event) => setPlantBoard({ ...board, [field.key]: event.target.value, updatedAt: Date.now() })}
                />
              ) : (
                <Input
                  value={String(board[field.key] ?? "")}
                  onChange={(event) => setPlantBoard({ ...board, [field.key]: event.target.value, updatedAt: Date.now() })}
                />
              )}
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

function PeoplePanel() {
  const people = useDisplayStore((s) => s.people);
  const addPerson = useDisplayStore((s) => s.addPerson);
  const updatePerson = useDisplayStore((s) => s.updatePerson);
  const removePerson = useDisplayStore((s) => s.removePerson);
  const photoRef = useRef<HTMLInputElement>(null);
  const editId = useRef<string | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    kind: "birthday" as PersonEntry["kind"],
    date: "",
    endDate: "",
    message: "",
    photo: "",
    yearly: false,
  });

  useEffect(() => {
    setDraft((prev) => (prev.date ? prev : { ...prev, date: new Date().toISOString().slice(0, 10) }));
  }, []);

  const dateLabel = draft.kind === "birthday" ? "Birthday" : draft.kind === "anniversary" ? "Hire date" : "Start date";
  const onTv = people.filter((person) => isPersonLive(person)).length;

  return (
    <section className="control-page">
      <header className="control-header">
        <div>
          <p className="eyebrow">People</p>
          <h1>Birthdays, anniversaries, shout-outs</h1>
          <p className="lede">
            Birthdays and work anniversaries come back every year. Shout-outs can be one time, or every year. Add a photo from this phone.
          </p>
        </div>
        <div className="week-chip">{onTv ? `${onTv} on the TV today` : "Nobody due today"}</div>
      </header>
      <div className="panel">
        <div className="people-form">
          <button
            type="button"
            className={draft.photo ? "people-photo-btn has" : "people-photo-btn"}
            onClick={() => {
              editId.current = null;
              photoRef.current?.click();
            }}
          >
            {draft.photo ? <img src={draft.photo} alt="" /> : <Camera size={22} />}
            <span>{draft.photo ? "Change photo" : "Add photo"}</span>
          </button>
          <input
            ref={photoRef}
            className="pack-file"
            type="file"
            accept="image/*"
            aria-label="Person photo"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              const target = editId.current;
              editId.current = null;
              void compressPersonPhoto(file)
                .then((photo) => {
                  if (target) updatePerson(target, { photo });
                  else setDraft((prev) => ({ ...prev, photo }));
                })
                .catch(() => toast.error("Could not read that photo."));
            }}
          />
          <div className="form-grid">
            <label>
              <Label>Name</Label>
              <Input value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} />
            </label>
            <label>
              <Label>Type</Label>
              <select
                className="select"
                value={draft.kind}
                onChange={(event) => setDraft((prev) => ({ ...prev, kind: event.target.value as PersonEntry["kind"] }))}
              >
                {PERSON_KINDS.map((kind) => (
                  <option key={kind.id} value={kind.id}>
                    {kind.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <Label>{dateLabel}</Label>
              <Input
                type="date"
                value={draft.date}
                onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
              />
            </label>
            {draft.kind === "shoutout" ? (
              <>
                <label>
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={draft.endDate}
                    onChange={(event) => setDraft((prev) => ({ ...prev, endDate: event.target.value }))}
                  />
                </label>
                <label className="people-yearly">
                  <input
                    type="checkbox"
                    checked={draft.yearly}
                    onChange={(event) => setDraft((prev) => ({ ...prev, yearly: event.target.checked }))}
                  />
                  <span>
                    <strong>Every year</strong>
                    <em>Same dates next year, and the years after that.</em>
                  </span>
                </label>
              </>
            ) : (
              <p className="people-yearly-note">Comes back every year on this date.</p>
            )}
            <label className="full">
              <Label>Message</Label>
              <Input
                value={draft.message}
                onChange={(event) => setDraft((prev) => ({ ...prev, message: event.target.value }))}
                placeholder="Optional. The TV has a default line if you leave this blank."
              />
            </label>
          </div>
        </div>
        <div className="header-actions" style={{ marginTop: 14 }}>
          <Button
            onClick={() => {
              if (!draft.name.trim()) {
                toast.error("Add a name.");
                return;
              }
              if (!draft.date) {
                toast.error("Add the date.");
                return;
              }
              addPerson({
                kind: draft.kind,
                name: draft.name.trim(),
                date: draft.date,
                endDate: draft.kind === "shoutout" ? draft.endDate : "",
                message: draft.message.trim(),
                photo: draft.photo,
                yearly: draft.kind !== "shoutout" || draft.yearly,
                enabled: true,
              });
              setDraft({
                name: "",
                kind: draft.kind,
                date: new Date().toISOString().slice(0, 10),
                endDate: "",
                message: "",
                photo: "",
                yearly: draft.kind === "shoutout" ? draft.yearly : false,
              });
              toast.success("Saved. It shows on the TV when the date hits.");
            }}
          >
            Save person
          </Button>
        </div>
      </div>
      {people.length ? (
        <div className="people-list">
          {people.map((person) => (
            <div key={person.id} className={cn("people-card", isPersonLive(person) && "on")}>
              <div className="people-thumb">
                {person.photo ? <img src={person.photo} alt="" /> : <span>{person.name.slice(0, 1)}</span>}
              </div>
              <div>
                <div className="people-kind">
                  {personKindLabel(person.kind)} · {personStatus(person)}
                </div>
                <div className="people-name">{person.name}</div>
                <div className="people-meta">
                  {personWhenLabel(person)}
                  {person.message ? ` · ${person.message}` : ""}
                </div>
              </div>
              <div className="people-actions">
                <Button size="sm" variant="secondary" onClick={() => updatePerson(person.id, { enabled: !person.enabled })}>
                  {person.enabled ? "On" : "Off"}
                </Button>
                {person.kind === "shoutout" ? (
                  <Button size="sm" variant="ghost" onClick={() => updatePerson(person.id, { yearly: !person.yearly })}>
                    {person.yearly ? "Yearly" : "Once"}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    editId.current = person.id;
                    photoRef.current?.click();
                  }}
                >
                  Photo
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removePerson(person.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-note">Nobody saved yet. Add a birthday, anniversary, or shout-out above.</p>
      )}
    </section>
  );
}

function DisplayPanel() {
  const settings = useDisplayStore((s) => s.settings);
  const setSettings = useDisplayStore((s) => s.setSettings);
  const announcement = useDisplayStore((s) => s.announcement);
  const postAnnouncement = useDisplayStore((s) => s.postAnnouncement);
  const clearAnnouncement = useDisplayStore((s) => s.clearAnnouncement);
  const [message, setMessage] = useState("");
  const [minutes, setMinutes] = useState("5");
  const [kind, setKind] = useState<"info" | "safety" | "urgent">("info");
  const live = announcement && announcement.expiresAt > Date.now() ? announcement : null;

  return (
    <section className="control-page">
      <header className="control-header">
        <div>
          <p className="eyebrow">Display</p>
          <h1>What's on the TV</h1>
          <p className="lede">Turn boards on or off, set how long they stay, plus the clock and a takeover message.</p>
        </div>
      </header>
      {live ? (
        <div className="live-announce panel">
          <div>
            <div className="eyebrow">On the TV now</div>
            <strong>{live.message}</strong>
          </div>
          <Button variant="ghost" onClick={() => { clearAnnouncement(); toast.success("TV is back to the playlist."); }}>
            Clear now
          </Button>
        </div>
      ) : null}
      <div className="panel">
        <h2>Take over the TV</h2>
        <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message for the breakroom" />
        <div className="header-actions" style={{ marginTop: 14 }}>
          <select className="select" style={{ maxWidth: 160 }} value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} aria-label="Message type">
            <option value="info">Info</option>
            <option value="safety">Safety</option>
            <option value="urgent">Urgent</option>
          </select>
          <Input
            style={{ maxWidth: 100 }}
            inputMode="numeric"
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
            aria-label="Minutes"
          />
          <Button
            onClick={() => {
              if (!message.trim()) {
                toast.error("Type a message.");
                return;
              }
              postAnnouncement(message.trim(), kind, Math.max(1, Number(minutes) || 5));
              toast.success("TV is showing the message.");
            }}
          >
            <Bell size={16} />
            Send
          </Button>
        </div>
        <p className="lede" style={{ marginTop: 8 }}>Minutes the message stays up. Safety and urgent change the TV color.</p>
      </div>
      <div className="panel">
        <h2>Clock and ticker</h2>
        <label className="check-row">
          <input type="checkbox" checked={settings.clockEnabled} onChange={(event) => setSettings({ clockEnabled: event.target.checked })} />
          Show clock
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.ticker.enabled}
            onChange={(event) => setSettings({ ticker: { ...settings.ticker, enabled: event.target.checked } })}
          />
          Show ticker
        </label>
        <Label>Ticker copy</Label>
        <Input
          value={settings.ticker.message}
          onChange={(event) => setSettings({ ticker: { ...settings.ticker, message: event.target.value } })}
        />
      </div>
      <PlaylistPanel />
    </section>
  );
}

type PlaylistRow = {
  durationKey: keyof DisplaySettings["durations"];
  label: string;
  hint: string;
  kind: "settings" | "plant";
  flag?: "championshipEnabled" | "ytdEnabled" | "trendsEnabled" | "recordsEnabled" | "conquestEnabled" | "peopleEnabled" | "decksEnabled";
};

const PLAYLIST: PlaylistRow[] = [
  { durationKey: "productionYtd", flag: "ytdEnabled", label: "Year to date", hint: "Season totals from locked Saturdays", kind: "settings" },
  { durationKey: "productionTrends", flag: "trendsEnabled", label: "Trends", hint: "Last 12 weeks", kind: "settings" },
  { durationKey: "productionRecords", flag: "recordsEnabled", label: "Records & streaks", hint: "Wins and best weeks", kind: "settings" },
  { durationKey: "conquest", flag: "conquestEnabled", label: "Conquest map", hint: "The country board", kind: "settings" },
  { durationKey: "plantBoard", label: "Plant board", hint: "Today’s mill notes", kind: "plant" },
  { durationKey: "people", flag: "peopleEnabled", label: "Birthdays & shout-outs", hint: "When someone is due", kind: "settings" },
  { durationKey: "presentation", flag: "decksEnabled", label: "TV slides", hint: "Each photo or PPTX page", kind: "settings" },
];

const MIN_HOLD = 4;
const MAX_HOLD = 90;

function clampHold(value: number) {
  if (!Number.isFinite(value)) return MIN_HOLD;
  return Math.min(MAX_HOLD, Math.max(MIN_HOLD, Math.round(value)));
}

function PlaylistPanel() {
  const settings = useDisplayStore((s) => s.settings);
  const setSettings = useDisplayStore((s) => s.setSettings);
  const plantBoard = useDisplayStore((s) => s.plantBoard);
  const setPlantBoard = useDisplayStore((s) => s.setPlantBoard);
  const durations = { ...DEFAULT_SETTINGS.durations, ...settings.durations };

  const on = (row: PlaylistRow) => {
    if (row.kind === "plant") return plantBoard.enabled !== false;
    return row.flag ? settings[row.flag] !== false : true;
  };

  const toggle = (row: PlaylistRow, next: boolean) => {
    if (row.kind === "plant") {
      setPlantBoard({ ...plantBoard, enabled: next });
      return;
    }
    if (!row.flag) return;
    setSettings({ [row.flag]: next });
  };

  const bump = (key: keyof DisplaySettings["durations"], delta: number) => {
    const current = useDisplayStore.getState().settings;
    const next = { ...DEFAULT_SETTINGS.durations, ...current.durations };
    setSettings({
      durations: { ...next, [key]: clampHold((next[key] ?? MIN_HOLD) + delta) },
    });
  };

  return (
    <div className="panel">
      <div className="library-head">
        <div>
          <h2>Playlist</h2>
          <p className="lede">Off boards stay off the TV. Times apply when the board is on.</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSettings({
              championshipEnabled: false,
              ytdEnabled: true,
              trendsEnabled: true,
              recordsEnabled: true,
              conquestEnabled: true,
              peopleEnabled: true,
              decksEnabled: true,
              durations: { ...DEFAULT_SETTINGS.durations },
            });
            setPlantBoard({ ...plantBoard, enabled: true });
            toast.success("All boards are on, mill default times.");
          }}
        >
          Turn all on
        </Button>
      </div>
      <div className="timing-list">
        {PLAYLIST.map((row) => {
          const enabled = on(row);
          return (
            <div key={row.durationKey} className={cn("timing-row", !enabled && "off")}>
              <label className="check-row playlist-toggle">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => toggle(row, event.target.checked)}
                />
                <span>
                  <strong>{row.label}</strong>
                  <em>{enabled ? row.hint : "Off the TV"}</em>
                </span>
              </label>
              <div className="timing-step">
                <button
                  type="button"
                  aria-label={`Shorter ${row.label}`}
                  onClick={() => bump(row.durationKey, -2)}
                  disabled={!enabled || durations[row.durationKey] <= MIN_HOLD}
                >
                  −
                </button>
                <strong className="timing-value">
                  {durations[row.durationKey]}
                  <em>sec</em>
                </strong>
                <button
                  type="button"
                  aria-label={`Longer ${row.label}`}
                  onClick={() => bump(row.durationKey, 2)}
                  disabled={!enabled || durations[row.durationKey] >= MAX_HOLD}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${Math.max(1, minutes)}m`;
}

function PiMeter({ percent, warn }: { percent: number; warn?: boolean }) {
  return (
    <div className={cn("pi-meter", warn && "warn")} aria-hidden="true">
      <i style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
    </div>
  );
}

function downloadSaturdayBook(history: HistoryWeek[]) {
  const header = ["weekEnding", ...PLANT_NAMES, "winners"].join(",");
  const lines = [...history]
    .sort((a, b) => a.weekEnding.localeCompare(b.weekEnding))
    .map((week) => {
      const tons = PLANT_NAMES.map((name) => week.plants.find((plant) => plant.name === name)?.tons ?? 0);
      return [week.weekEnding, ...tons, week.winners.join("|")].join(",");
    });
  const blob = new Blob([`${header}\n${lines.join("\n")}\n`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `north-baltimore-saturdays.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function AdminPanel() {
  const resetDemo = useDisplayStore((s) => s.resetDemo);
  const loadSaturdayBook = useDisplayStore((s) => s.loadSaturdayBook);
  const resetAllProduction = useDisplayStore((s) => s.resetAllProduction);
  const setPeople = useDisplayStore((s) => s.setPeople);
  const production = useDisplayStore((s) => s.production);
  const people = useDisplayStore((s) => s.people);
  const { status } = useKioskSyncStatus();
  const { decks, ready } = useMediaLibrary();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState<"off" | "all" | "people" | "reset" | "temp" | "book" | "">("");
  const [temps, setTemps] = useState<{ count: number; bytes: number; items: Array<{ name: string; where: string; bytes: number }> }>({
    count: 0,
    bytes: 0,
    items: [],
  });
  const [pi, setPi] = useState<Awaited<ReturnType<typeof fetchPiStats>> | null>(null);

  const refreshTemps = () => {
    void listMillTemp()
      .then(setTemps)
      .catch(() => setTemps({ count: 0, bytes: 0, items: [] }));
  };

  useEffect(() => {
    setPin(readAdminPin());
    refreshTemps();
    const load = () => {
      void fetchPiStats()
        .then(setPi)
        .catch(() => setPi(null));
    };
    load();
    const id = window.setInterval(load, 8000);
    return () => window.clearInterval(id);
  }, []);

  const loadNewApp = async () => {
    toast.success("Loading the new app…");
    await applyAppUpdate("/");
  };

  const stalePeople = expiredShoutouts(people);
  const slideBytes = decks.reduce((sum, deck) => sum + deckBytes(deck), 0);
  const photoBytes = people.reduce((sum, person) => sum + (person.photo?.length ?? 0), 0);
  const offDecks = decks.filter((deck) => !deck.enabled);
  const liveSlides = decks.filter((deck) => deck.enabled).reduce((sum, deck) => sum + deck.slides.length, 0);

  return (
    <section className="control-page">
      <header className="control-header">
        <div>
          <p className="eyebrow">Admin only</p>
          <h1>Mill shop</h1>
          <p className="lede">
            Update the TV, watch the Pi (SD room, heat, memory), pull leftover files, and keep the Saturday book honest.
          </p>
        </div>
        <div className="week-chip">v{APP_VERSION}</div>
      </header>

      <div className="stat-grid three">
        <article className="stat-card">
          <div className="stat-label">TV</div>
          <div className="stat-value">{status === "live" || status === "saving" ? "Live" : "Waiting"}</div>
          <div className="stat-sub">v{APP_VERSION} · keep the Pi on the TV page</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Slides on this TV</div>
          <div className="stat-value">{decks.length}</div>
          <div className="stat-sub">
            {liveSlides} playing · {formatBytes(slideBytes)} stored
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Saturdays</div>
          <div className="stat-value">{production.history.length}</div>
          <div className="stat-sub">{formatWeekEnding(production.weekEnding)} is open</div>
        </article>
      </div>

      {pi ? (
        <div className="panel pi-panel">
          <div className="library-head">
            <div>
              <h2>This Pi</h2>
              <p className="lede">
                {pi.model} · {pi.host}
                {pi.ip[0] ? ` · ${pi.ip[0]}` : ""} · {pi.os}
              </p>
            </div>
            <div className="week-chip">{pi.temp != null ? `${pi.temp.toFixed(0)}°C` : `${pi.cores} CPU`}</div>
          </div>
          {pi.notes.length ? (
            <p className="pi-notes">{pi.notes.join(" · ")}</p>
          ) : null}
          <div className="pi-row">
            <div>
              <div className="stat-label">SD card</div>
              <div className="stat-value">{formatBytes(pi.disk.free)} free</div>
              <PiMeter percent={pi.disk.percent} warn={pi.disk.percent >= 85} />
              <div className="stat-sub">
                {pi.disk.percent}% used · {formatBytes(pi.disk.used)} of {formatBytes(pi.disk.total)}
              </div>
            </div>
            <div>
              <div className="stat-label">Memory</div>
              <div className="stat-value">{formatBytes(pi.memory.free)} free</div>
              <PiMeter percent={pi.memory.percent} warn={pi.memory.percent >= 90} />
              <div className="stat-sub">
                {pi.memory.percent}% used · {formatBytes(pi.memory.total)} total
              </div>
            </div>
          </div>
          <div className="stat-grid three" style={{ marginBottom: 0, marginTop: 14 }}>
            <article className="stat-card">
              <div className="stat-label">Heat</div>
              <div className="stat-value">{pi.temp != null ? `${pi.temp.toFixed(0)}°` : "—"}</div>
              <div className="stat-sub">{pi.temp == null ? "No temp probe on this box" : pi.temp >= 70 ? "Warm — check airflow" : "Running cool"}</div>
            </article>
            <article className="stat-card">
              <div className="stat-label">Up</div>
              <div className="stat-value">{formatUptime(pi.uptime)}</div>
              <div className="stat-sub">Load {pi.load.join(" / ")}</div>
            </article>
            <article className="stat-card">
              <div className="stat-label">Network</div>
              <div className="stat-value">{pi.ip[0] ?? "—"}</div>
              <div className="stat-sub">{pi.cores} core{pi.cores === 1 ? "" : "s"} · {pi.host}</div>
            </article>
          </div>
        </div>
      ) : null}

      <div className="panel">
        <h2>Update this TV</h2>
        <p className="lede">
          From your phone: download the mill zip, then upload it on the update page. The Pi installs it and the playlist comes back.
        </p>
        <div className="header-actions" style={{ marginTop: 16 }}>
          <Button variant="secondary" asChild>
            <Link to="/update">Open TV update page</Link>
          </Button>
          <Button onClick={() => void loadNewApp()}>
            <RefreshCw size={16} />
            Reload the TV
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/">Open TV display</Link>
          </Button>
        </div>
      </div>

      <div className="panel">
        <h2>Clean old update files</h2>
        <p className="lede">
          Leftover mill zips and install temp folders from the last update. They do not belong on the TV once the new app is in.
        </p>
        {temps.count ? (
          <div className="library-list" style={{ marginTop: 12 }}>
            {temps.items.map((item) => (
              <div key={`${item.where}-${item.name}`} className="library-item">
                <div className="library-name">
                  {item.name}
                  <div className="lede">
                    {item.where === "temp" ? "Temp folder" : "On this Pi"} · {formatBytes(item.bytes)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-note">No leftover update files or temp folders on this Pi.</p>
        )}
        <div className="header-actions" style={{ marginTop: 16 }}>
          <Button
            variant={confirm === "temp" ? "danger" : "secondary"}
            disabled={!temps.count}
            onClick={() => {
              if (confirm !== "temp") {
                setConfirm("temp");
                return;
              }
              void cleanMillTemp()
                .then((result) => {
                  setConfirm("");
                  setTemps({ count: 0, bytes: 0, items: [] });
                  refreshTemps();
                  toast.success(
                    result.count
                      ? `Cleared ${result.count} leftover file${result.count === 1 ? "" : "s"} · ${formatBytes(result.bytes)}.`
                      : "Nothing left to clean.",
                  );
                })
                .catch((error) => {
                  setConfirm("");
                  toast.error(error instanceof Error ? error.message : "Could not clean those files.");
                });
            }}
          >
            <Trash2 size={16} />
            {confirm === "temp"
              ? "Tap again to dump leftover zips"
              : temps.count
                ? `Clean update files (${formatBytes(temps.bytes)})`
                : "Clean update files"}
          </Button>
        </div>
      </div>

      <div className="panel">
        <h2>Clean old files</h2>
        <p className="lede">
          PowerPoints and photos sit on this Pi until you pull them off. Off slides still take space. Finished shout-outs do too if they had a photo.
        </p>
        {decks.length ? (
          <div className="library-list" style={{ marginTop: 12 }}>
            {decks.map((deck) => (
              <div key={deck.id} className={cn("library-item", deck.enabled && "on")}>
                <div className="library-name">
                  {deck.name}
                  <div className="lede">
                    {deck.slides.length} slide{deck.slides.length === 1 ? "" : "s"} · {formatBytes(deckBytes(deck))}
                    {deck.enabled ? " · on TV" : " · off"}
                  </div>
                </div>
                <div className="library-actions">
                  <Button size="sm" variant="secondary" onClick={() => void toggleDeck(deck.id, !deck.enabled)}>
                    {deck.enabled ? "On TV" : "Off"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void removeDeck(deck.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-note">No PowerPoints or photos stored on this TV.</p>
        )}
        <div className="header-actions" style={{ marginTop: 16 }}>
          <Button
            variant={confirm === "off" ? "danger" : "secondary"}
            disabled={!ready || !offDecks.length}
            onClick={() => {
              if (confirm !== "off") {
                setConfirm("off");
                return;
              }
              void clearDecks("off").then((count) => {
                setConfirm("");
                toast.success(count ? `Removed ${count} off slide${count === 1 ? "" : "s"}.` : "Nothing was off.");
              });
            }}
          >
            <Trash2 size={16} />
            {confirm === "off" ? "Tap again to dump off slides" : `Remove off slides (${offDecks.length})`}
          </Button>
          <Button
            variant={confirm === "all" ? "danger" : "ghost"}
            disabled={!ready || !decks.length}
            onClick={() => {
              if (confirm !== "all") {
                setConfirm("all");
                return;
              }
              void clearDecks("all").then((count) => {
                setConfirm("");
                toast.success(count ? `Cleared ${count} deck${count === 1 ? "" : "s"} off the Pi.` : "Slides were already empty.");
              });
            }}
          >
            {confirm === "all" ? "Tap again to wipe all slides" : "Remove all TV slides"}
          </Button>
          <Button
            variant={confirm === "people" ? "danger" : "ghost"}
            disabled={!stalePeople.length}
            onClick={() => {
              if (confirm !== "people") {
                setConfirm("people");
                return;
              }
              const drop = new Set(stalePeople.map((person) => person.id));
              setPeople(people.filter((person) => !drop.has(person.id)));
              setConfirm("");
              toast.success(`Removed ${stalePeople.length} finished shout-out${stalePeople.length === 1 ? "" : "s"}.`);
            }}
          >
            {confirm === "people"
              ? "Tap again to drop old shout-outs"
              : `Remove finished shout-outs (${stalePeople.length})`}
          </Button>
        </div>
        <p className="lede" style={{ marginTop: 10 }}>
          People photos {formatBytes(photoBytes)}. Birthdays and yearly items stay. {stalePeople.length ? "" : "No leftover shout-outs."}
        </p>
      </div>

      <div className="panel">
        <h2>Saturday book</h2>
        <p className="lede">
          The mill sheet through Saturday August 29 is the season. This week (September 5) starts at zero until you type tons.
        </p>
        <div className="header-actions" style={{ marginTop: 16 }}>
          <Button
            variant={confirm === "book" ? "danger" : "secondary"}
            onClick={() => {
              if (confirm !== "book") {
                setConfirm("book");
                return;
              }
              loadSaturdayBook();
              setConfirm("");
              toast.success("2026 Saturdays are on the map, trends, and records. This week is open at zero.");
            }}
          >
            {confirm === "book" ? "Tap again to load the mill sheet" : "Load 2026 Saturday book"}
          </Button>
          <Button
            variant="ghost"
            disabled={!production.history.length}
            onClick={() => {
              downloadSaturdayBook(production.history);
              toast.success("Saturday book is on this phone.");
            }}
          >
            <Download size={16} />
            Download Saturdays
          </Button>
        </div>
      </div>

      <div className="panel">
        <h2>Reset production numbers</h2>
        <p className="lede">
          Wipes this week and every Saturday in history. The conquest map starts even. Use it for a new season, not a bad Saturday — fix a locked week on the office page.
        </p>
        <div className="header-actions" style={{ marginTop: 16 }}>
          <Button
            variant={confirm === "reset" ? "danger" : "secondary"}
            onClick={() => {
              if (confirm !== "reset") {
                setConfirm("reset");
                return;
              }
              resetAllProduction();
              setConfirm("");
              toast.success("All production numbers are cleared. TV will catch up.");
            }}
          >
            <RotateCcw size={16} />
            {confirm === "reset" ? "Tap again to wipe all tons" : "Reset all production numbers"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              resetDemo();
              setConfirm("");
              toast.success("People, plant board, and mill defaults are back.");
            }}
          >
            Restore mill defaults
          </Button>
        </div>
      </div>

      <div className="panel">
        <h2>Admin code</h2>
        <p className="lede">Saved on this phone. Office pages stay open without it.</p>
        <div className="header-actions" style={{ marginTop: 14 }}>
          <Input
            className="pin-input"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
          />
          <Button
            onClick={() => {
              const next = pin.trim();
              if (next.length < 4) {
                toast.error("Use at least 4 numbers.");
                return;
              }
              writeAdminPin(next);
              toast.success("Admin code saved on this phone.");
            }}
          >
            <KeyRound size={16} />
            Save code
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              try {
                sessionStorage.removeItem(UNLOCK_KEY);
              } catch {
                /* ignore */
              }
              window.location.assign("/admin");
            }}
          >
            <Lock size={16} />
            Lock admin
          </Button>
        </div>
      </div>
    </section>
  );
}
