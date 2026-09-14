import { Link } from "@tanstack/react-router";
import {
  Bell,
  Flag,
  KeyRound,
  Lock,
  MonitorPlay,
  Presentation,
  Save,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminPanel } from "@/components/control/AdminPanel";
import { BakeryLogo } from "@/components/control/BakeryLogo";
import { ConfirmBox, type ConfirmSpec } from "@/components/control/ConfirmBox";
import { PeoplePanel } from "@/components/control/PeoplePanel";
import { SlidesPanel } from "@/components/control/SlidesPanel";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { APP_VERSION } from "@/lib/brand";
import { MILL_COPY } from "@/lib/data";
import { flushKioskNow, useKioskSyncStatus } from "@/lib/kiosk-sync";
import { millEvent } from "@/lib/mill-log";
import { MILL_HEX } from "@/lib/mills";
import {
  closedWeekOverWeek,
  conquestContext,
  formatTons,
  formatWeekEnding,
  lastClosedPair,
  rankedProduction,
  ytdProduction,
} from "@/lib/production";
import { buildTicker } from "@/lib/ticker";
import { useDisplayStore } from "@/lib/store";
import type { PlantBoard, PlantName } from "@/lib/types";
import { PLANT_NAMES } from "@/lib/types";
import { cn } from "@/lib/utils";

const PIN_KEY = "nb-admin-pin";
function readAdminPin() {
  try {
    return localStorage.getItem(PIN_KEY) || "1231";
  } catch {
    return "1231";
  }
}

type Room = "office" | "slides" | "production" | "plant" | "people" | "announce" | "display" | "admin";

const NAV: Array<[Room, string, string, typeof Trophy]> = [
  ["office", "Office", "Home", MonitorPlay],
  ["slides", "Slides", "Slides", Presentation],
  ["production", "Production", "Tons", Trophy],
  ["plant", "Plant board", "Plant", Flag],
  ["people", "People", "People", Users],
  ["announce", "Announce", "Air", Bell],
  ["display", "Display", "Clock", MonitorPlay],
  ["admin", "Admin", "Admin", KeyRound],
];

function usePhoneUi() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 820px)");
    const apply = () => setPhone(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  return phone;
}

export function ControlRoom({ room }: { room?: string }) {
  const [tab, setTab] = useState<Room>(room === "admin" ? "admin" : "office");
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const phone = usePhoneUi();

  useEffect(() => {
    try {
      setUnlocked(sessionStorage.getItem("breakroom-admin-unlocked") === "1");
    } catch {
      setUnlocked(false);
    }
  }, []);

  const openAdmin = () => {
    if (code.trim() !== readAdminPin()) {
      toast.error("Wrong code.");
      return;
    }
    sessionStorage.setItem("breakroom-admin-unlocked", "1");
    setUnlocked(true);
    setTab("admin");
  };

  const go = (id: Room) => {
    if (id === "admin" && !unlocked) {
      setTab("admin");
      return;
    }
    setTab(id);
  };

  return (
    <div className={cn("control-shell", phone && "is-phone")}>
      <aside className="control-nav">
        <div className="control-brand">
          <BakeryLogo size="sm" />
          <div>
            <div className="control-brand-kicker">North Baltimore · v{APP_VERSION}</div>
            <div className="control-brand-title">Breakroom Display</div>
          </div>
        </div>
        <SyncPill short={phone} />
        <nav className="control-links">
          {NAV.map(([id, label, short, Icon]) => (
            <button key={id} type="button" className={cn("control-link", tab === id && "active")} onClick={() => go(id)}>
              <Icon size={16} />
              {phone ? short : label}
            </button>
          ))}
        </nav>
        <Link to="/" className="control-tv-btn">
          {phone ? "TV" : "Open TV display"}
        </Link>
      </aside>
      <main className="control-main">
        {tab === "admin" && !unlocked ? (
          <section className="control-page pin-gate">
            <p className="eyebrow">Admin</p>
            <h1>Enter mill code</h1>
            <p className="lede">Office phones stay on production. This code opens admin only.</p>
            <div className="pin-panel">
              <Input className="pin-input" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} />
              <Button onClick={openAdmin}>Open admin</Button>
            </div>
          </section>
        ) : null}
        {tab === "office" ? <Overview /> : null}
        {tab === "slides" ? <SlidesPanel /> : null}
        {tab === "production" ? <ProductionPanel /> : null}
        {tab === "plant" ? <PlantPanel /> : null}
        {tab === "people" ? <PeoplePanel /> : null}
        {tab === "announce" ? <AnnouncePanel /> : null}
        {tab === "display" ? <DisplayPanel /> : null}
        {tab === "admin" && unlocked ? <AdminPanel /> : null}
      </main>
    </div>
  );
}

function SyncPill({ short = false }: { short?: boolean }) {
  const { status } = useKioskSyncStatus();
  const label =
    status === "live"
      ? short
        ? "Live"
        : "TV is live"
      : status === "saving"
        ? short
          ? "Saving"
          : "Updating TV…"
        : status === "disk"
          ? short
            ? "DISK"
            : "WRITE ERROR — mill disk did not keep the last save"
        : status === "error"
          ? short
            ? "Retry"
            : "TV not reached — retrying"
          : short
            ? "Wait"
            : "Connecting to TV…";
  return <div className={cn("sync-pill", status)}>{label}</div>;
}

function Overview() {
  const production = useDisplayStore((s) => s.production);
  const conquest = useMemo(() => conquestContext(production), [production]);
  const ytd = useMemo(() => ytdProduction(production), [production]);
  const last = lastClosedPair(production).current;
  const champion = last ? rankedProduction(last.plants)[0] : null;
  const wow = closedWeekOverWeek(production);
  const ytdLeader = ytd.ranked[0];

  return (
    <section className="control-page">
      <header className="control-header">
        <div>
          <p className="eyebrow">Office page · mill hotspot</p>
          <h1>Update the TV</h1>
          <p className="lede">Type tons, drop slides, or post a shout-out. The Pi TV stays on the display page, fullscreen.</p>
        </div>
      </header>
      <ol className="how-strip">
        <li>
          <strong>1</strong>
          <span>Pi TV stays on the display page, fullscreen.</span>
        </li>
        <li>
          <strong>2</strong>
          <span>Phones join the mill Wi‑Fi and open this office page.</span>
        </li>
        <li>
          <strong>3</strong>
          <span>Save tons or drop a photo. The TV catches up in a few seconds.</span>
        </li>
      </ol>
      <div className="stat-grid">
        <article className="stat-card">
          <div className="stat-label">{ytd.year} YTD</div>
          <div className="stat-value">{ytdLeader?.name ?? "—"}</div>
          <div className="stat-sub">{ytdLeader ? `${ytdLeader.tonsDisplay} tons · ${ytdLeader.wins} Saturday wins` : "Waiting"}</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Last Saturday champion</div>
          <div className="stat-value">{champion?.name ?? "—"}</div>
          <div className="stat-sub">
            {champion && last ? `${champion.tonsDisplay} tons · ${formatWeekEnding(last.weekEnding)}` : "Lock a Saturday first"}
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Map control</div>
          <div className="stat-value">{conquest.territoryRows[0]?.name ?? "—"}</div>
          <div className="stat-sub">{conquest.territoryRows[0]?.territories ?? 0} territories</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Open week</div>
          <div className="stat-value">{formatWeekEnding(production.weekEnding)}</div>
          <div className="stat-sub">Type Saturday tons on Production</div>
        </article>
      </div>
      <div className="panel">
        <h2>Territory board</h2>
        <div className="territory-list compact">
          {conquest.territoryRows.map((row) => (
            <div key={row.name} className="territory-row">
              <span className="swatch" style={{ background: MILL_HEX[row.name].stroke }} />
              <strong className="grow">{row.name}</strong>
              <span>{row.territories}</span>
            </div>
          ))}
        </div>
      </div>
      {Object.keys(wow).length ? (
        <div className="wow-strip">
          {PLANT_NAMES.map((name) => {
            const row = wow[name];
            return (
              <div key={name} className="wow-chip">
                <span>{name}</span>
                <strong className={row?.dir}>{row ? formatTons(row.delta, true) : "—"}</strong>
                <em className={row?.dir}>{row?.label ?? ""}</em>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function emptyDraft(): Record<PlantName, string> {
  return { Marshville: "", Henderson: "", "North Baltimore": "", Albertville: "" };
}

function plantsFromDraft(draft: Record<PlantName, string>) {
  return PLANT_NAMES.map((name) => ({ name, tons: Math.max(0, Number(draft[name]) || 0) }));
}

function ProductionPanel() {
  const production = useDisplayStore((s) => s.production);
  const setAllPlantTons = useDisplayStore((s) => s.setAllPlantTons);
  const closeCurrentWeek = useDisplayStore((s) => s.closeCurrentWeek);
  const resetCurrentWeek = useDisplayStore((s) => s.resetCurrentWeek);
  const [draft, setDraft] = useState<Record<PlantName, string>>(
    Object.fromEntries(production.plants.map((plant) => [plant.name, plant.tons ? String(plant.tons) : ""])) as Record<
      PlantName,
      string
    >,
  );
  const [confirm, setConfirm] = useState<ConfirmSpec | null>(null);
  const ranked = rankedProduction(plantsFromDraft(draft));
  const leader = ranked[0];
  const draftPlants = plantsFromDraft(draft);

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
      <div className="panel tons-panel">
        <h2>Enter Saturday tons</h2>
        <div className="ton-grid">
          {PLANT_NAMES.map((name) => (
            <label key={name} className={cn("ton-card", name === "North Baltimore" && "ours")}>
              <div className="ton-head">
                <span className="swatch" style={{ background: MILL_HEX[name].stroke }} />
                <span>{name}</span>
                <em>{MILL_COPY[name].short}</em>
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
        <div className="header-actions" style={{ marginTop: 16 }}>
          <Button
            onClick={() => {
              setAllPlantTons(draftPlants);
              void flushKioskNow();
              toast.success("Tons are on the TV. The conquest map updates with these numbers.");
            }}
          >
            <Save size={16} />
            Update the TV
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const total = draftPlants.reduce((sum, plant) => sum + plant.tons, 0);
              if (total <= 0) {
                toast.error("Enter tons before locking Saturday.");
                return;
              }
              setConfirm({
                title: `Lock Saturday ${formatWeekEnding(production.weekEnding)}?`,
                body: "This Saturday goes into mill history. The open week resets to zero. Map, YTD, trends, and records rebuild.",
                items: draftPlants.map((plant) => `${plant.name} · ${plant.tons.toLocaleString()} tons`),
                confirmLabel: "Lock Saturday",
                onConfirm: () => {
                  setAllPlantTons(draftPlants);
                  const result = closeCurrentWeek();
                  setConfirm(null);
                  if (!result.ok) toast.error(result.message);
                  else {
                    setDraft(emptyDraft());
                    void flushKioskNow();
                    void millEvent(
                      "week-locked",
                      `Week ending ${formatWeekEnding(production.weekEnding)} · ${draftPlants.map((plant) => `${plant.name} ${plant.tons}`).join(", ")}`,
                    );
                    toast.success(result.message);
                  }
                },
              });
            }}
          >
            <Lock size={16} />
            Lock Saturday
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setConfirm({
                title: "Clear this week's tons?",
                body: "Zeros the four mill pads for the open week. Locked Saturdays stay put. The TV goes back to 0.",
                confirmLabel: "Clear week",
                danger: true,
                onConfirm: () => {
                  resetCurrentWeek();
                  setDraft(emptyDraft());
                  setConfirm(null);
                  void flushKioskNow();
                  void millEvent("week-cleared", `Open week ${formatWeekEnding(production.weekEnding)} zeroed`);
                  toast.success("Current week reset to zero.");
                },
              });
            }}
          >
            Clear week
          </Button>
        </div>
        {confirm ? <ConfirmBox spec={confirm} onCancel={() => setConfirm(null)} /> : null}
        <p className="lede" style={{ marginTop: 10 }}>
          {leader && leader.tons > 0
            ? `If these numbers stand: ${leader.name} leads · ${leader.tonsDisplay} tons`
            : "No border attack yet. Type tons and the map marches."}
        </p>
        <p className="lede">Live order: {ranked.map((row) => `${row.rank}. ${row.name} ${formatTons(row.tons)}`).join(" · ")}</p>
      </div>
      <HistoryCorrection />
    </section>
  );
}

function HistoryCorrection() {
  const production = useDisplayStore((s) => s.production);
  const updateHistoryWeek = useDisplayStore((s) => s.updateHistoryWeek);
  const weeks = useMemo(
    () => production.history.slice().sort((a, b) => b.weekEnding.localeCompare(a.weekEnding)),
    [production.history],
  );
  const [open, setOpen] = useState(false);
  const [weekId, setWeekId] = useState(weeks[0]?.id ?? "");
  const selected = weeks.find((week) => week.id === weekId) ?? weeks[0];
  const [draft, setDraft] = useState<Record<PlantName, string>>(emptyDraft());
  const [confirm, setConfirm] = useState<ConfirmSpec | null>(null);

  useEffect(() => {
    if (!weeks.some((week) => week.id === weekId) && weeks[0]) setWeekId(weeks[0].id);
  }, [weekId, weeks]);

  useEffect(() => {
    if (!selected) {
      setDraft(emptyDraft());
      return;
    }
    setDraft(
      Object.fromEntries(selected.plants.map((plant) => [plant.name, plant.tons ? String(plant.tons) : ""])) as Record<
        PlantName,
        string
      >,
    );
  }, [selected]);

  if (!weeks.length) return null;

  return (
    <div className="panel tons-panel">
      <button type="button" className="correction-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>
          <strong>Fix a locked Saturday</strong>
          <em>Any week in the mill sheet — {weeks.length} Saturdays. Map, YTD, trends, and records rebuild.</em>
        </span>
        <b>{open ? "Hide" : "Open"}</b>
      </button>
      {open ? (
        <>
          <select className="select" value={selected?.id ?? ""} onChange={(event) => setWeekId(event.target.value)} aria-label="Locked Saturday">
            {weeks.map((week) => (
              <option key={week.id} value={week.id}>
                {formatWeekEnding(week.weekEnding)} · {week.winners.join(" & ")}
              </option>
            ))}
          </select>
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
                  value={draft[name]}
                  onChange={(event) => setDraft((prev) => ({ ...prev, [name]: event.target.value }))}
                />
              </label>
            ))}
          </div>
          <Button
            onClick={() => {
              if (!selected) return;
              const next = plantsFromDraft(draft);
              if (next.reduce((sum, plant) => sum + plant.tons, 0) <= 0) {
                toast.error("Enter tons before saving the correction.");
                return;
              }
              setConfirm({
                title: `Replace ${formatWeekEnding(selected.weekEnding)}?`,
                body: "This locked Saturday is rewritten. Map, YTD, trends, and records rebuild from the new tons.",
                items: next.map((plant) => `${plant.name} · ${plant.tons.toLocaleString()} tons`),
                confirmLabel: "Save correction",
                danger: true,
                onConfirm: () => {
                  updateHistoryWeek(selected.id, next);
                  setConfirm(null);
                  void flushKioskNow();
                  void millEvent(
                    "week-corrected",
                    `${formatWeekEnding(selected.weekEnding)} · ${next.map((plant) => `${plant.name} ${plant.tons}`).join(", ")}`,
                  );
                  toast.success("Saturday corrected. Map and records updated.");
                },
              });
            }}
          >
            <Save size={16} />
            Save correction
          </Button>
          {confirm ? <ConfirmBox spec={confirm} onCancel={() => setConfirm(null)} /> : null}
        </>
      ) : null}
    </div>
  );
}

const BOARD_FIELDS: Array<{ key: keyof PlantBoard; label: string; rows?: boolean }> = [
  { key: "title", label: "Title" },
  { key: "subtitle", label: "Subtitle" },
  { key: "goalText", label: "Goal", rows: true },
  { key: "todayFocus", label: "Today", rows: true },
  { key: "safetyFocus", label: "Safety focus", rows: true },
  { key: "maintenance", label: "Maintenance", rows: true },
  { key: "shipping", label: "Shipping / loads", rows: true },
  { key: "staffing", label: "Staffing / coverage", rows: true },
  { key: "managerNote", label: "Manager note", rows: true },
];

function PlantPanel() {
  const board = useDisplayStore((s) => s.plantBoard);
  const setPlantBoard = useDisplayStore((s) => s.setPlantBoard);
  const [draft, setDraft] = useState<PlantBoard>(board);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!touched) setDraft(board);
  }, [board, touched]);

  const edit = (patch: Partial<PlantBoard>) => {
    setTouched(true);
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  return (
    <section className="control-page">
      <header className="control-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Daily plant board</h1>
          <p className="lede">Type here all you want. Nothing hits the mill SD card until you save the board.</p>
        </div>
        {touched ? <div className="week-chip">Unsaved</div> : null}
      </header>
      <div className="panel">
        <label className="check-row">
          <input type="checkbox" checked={draft.enabled} onChange={(event) => edit({ enabled: event.target.checked })} />
          Show on the TV playlist
        </label>
        <div className="form-grid" style={{ marginTop: 12 }}>
          {BOARD_FIELDS.map((field) => (
            <label key={field.key} className={field.rows ? "full" : undefined}>
              <Label>{field.label}</Label>
              {field.rows ? (
                <Textarea
                  value={String(draft[field.key] ?? "")}
                  onChange={(event) => edit({ [field.key]: event.target.value })}
                />
              ) : (
                <Input
                  value={String(draft[field.key] ?? "")}
                  onChange={(event) => edit({ [field.key]: event.target.value })}
                />
              )}
            </label>
          ))}
        </div>
        <Button
          style={{ marginTop: 14 }}
          onClick={() => {
            setPlantBoard({ ...draft, updatedAt: Date.now() });
            setTouched(false);
            void flushKioskNow();
            toast.success("Plant board is on the TV.");
          }}
        >
          Save board
        </Button>
      </div>
    </section>
  );
}

function AnnouncePanel() {
  const announcement = useDisplayStore((s) => s.announcement);
  const postAnnouncement = useDisplayStore((s) => s.postAnnouncement);
  const clearAnnouncement = useDisplayStore((s) => s.clearAnnouncement);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "safety" | "urgent" | "celebration">("info");
  const [minutes, setMinutes] = useState("5");
  const live = announcement && announcement.expiresAt > Date.now() ? announcement : null;

  return (
    <section className="control-page">
      <header className="control-header">
        <div>
          <p className="eyebrow">Interrupt</p>
          <h1>Announcement</h1>
          <p className="lede">Takes over the TV until it expires or you clear it.</p>
        </div>
      </header>
      {live ? (
        <div className="panel live-announce">
          <div>
            <div className="people-kind">On air now</div>
            <strong>{live.message}</strong>
          </div>
          <Button variant="secondary" onClick={clearAnnouncement}>
            Clear
          </Button>
        </div>
      ) : null}
      <div className="panel">
        <div className="form-grid">
          <label>
            <Label>Type</Label>
            <select className="select" value={type} onChange={(event) => setType(event.target.value as typeof type)}>
              <option value="info">Information</option>
              <option value="safety">Safety notice</option>
              <option value="urgent">Urgent</option>
              <option value="celebration">Celebration</option>
            </select>
          </label>
          <label>
            <Label>Minutes</Label>
            <Input inputMode="numeric" value={minutes} onChange={(event) => setMinutes(event.target.value)} />
          </label>
          <label className="full">
            <Label>Message</Label>
            <Textarea value={message} onChange={(event) => setMessage(event.target.value)} />
          </label>
        </div>
        <Button
          style={{ marginTop: 14 }}
          onClick={() => {
            if (!message.trim()) {
              toast.error("Type a message first.");
              return;
            }
            postAnnouncement(message, type, Math.max(1, Number(minutes) || 5));
            setMessage("");
            void flushKioskNow();
            void millEvent("announcement-posted", message.trim().slice(0, 120));
            toast.success("Announcement is on the TV.");
          }}
        >
          Put on TV
        </Button>
      </div>
    </section>
  );
}

function DisplayPanel() {
  const settings = useDisplayStore((s) => s.settings);
  const setSettings = useDisplayStore((s) => s.setSettings);
  const production = useDisplayStore((s) => s.production);
  const people = useDisplayStore((s) => s.people);
  const tickerAuto = settings.ticker.auto !== false;
  const tickerOn = settings.ticker.enabled !== false;
  const preview = buildTicker({ production, people }, settings);

  return (
    <section className="control-page">
      <header className="control-header">
        <div>
          <p className="eyebrow">Display settings</p>
          <h1>Clock and ticker</h1>
          <p className="lede">Clock and ticker stay on every board. Type your own copy here. Auto mill facts ride in front of it.</p>
        </div>
      </header>
      <div className="panel">
        <h2>Clock overlay</h2>
        <label className="check-row">
          <input type="checkbox" checked={settings.clockEnabled} onChange={(event) => setSettings({ clockEnabled: event.target.checked })} />
          Show clock
        </label>
        <Label>Clock position</Label>
        <select
          className="select"
          value={settings.clockPosition}
          onChange={(event) => setSettings({ clockPosition: event.target.value as typeof settings.clockPosition })}
        >
          <option value="top-right">Top right</option>
          <option value="top-left">Top left</option>
          <option value="bottom-left">Bottom left</option>
        </select>
      </div>
      <div className="panel">
        <h2>Ticker</h2>
        <label className="check-row">
          <input
            type="checkbox"
            checked={tickerOn}
            onChange={(event) => setSettings({ ticker: { ...settings.ticker, enabled: event.target.checked } })}
          />
          Show ticker
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={tickerAuto}
            onChange={(event) => setSettings({ ticker: { ...settings.ticker, auto: event.target.checked } })}
          />
          Auto mill facts (last Saturday, YTD, next birthday)
        </label>
        <Label>Speed</Label>
        <select
          className="select"
          value={settings.ticker.speed}
          onChange={(event) =>
            setSettings({ ticker: { ...settings.ticker, speed: event.target.value as typeof settings.ticker.speed } })
          }
        >
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </select>
        <Label>Your ticker copy</Label>
        <Textarea
          value={settings.ticker.message.startsWith("NORTH BALTIMORE 50 TPH") ? "" : settings.ticker.message}
          placeholder="Type extra copy for the TV ticker"
          onChange={(event) => setSettings({ ticker: { ...settings.ticker, enabled: true, message: event.target.value } })}
        />
        <div className="ticker-preview" aria-hidden="true">
          <span className="bakery-ticker">
            <img src="/bakery-feeds.svg" alt="" />
          </span>
          <div className="ticker-viewport">
            <div className="ticker-track" style={{ animationDuration: "22s" }}>
              <span>{preview}</span>
              <span>{preview}</span>
            </div>
          </div>
        </div>
        <p className="lede" style={{ marginTop: 8 }}>
          {tickerOn ? "On the TV now." : "Ticker is off — check Show ticker to put it back."}
        </p>
      </div>
    </section>
  );
}
