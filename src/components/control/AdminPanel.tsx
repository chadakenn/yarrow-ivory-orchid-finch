import { HardDrive, KeyRound, Monitor, Power, RefreshCw, RotateCcw, Thermometer, Upload, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BakeryLogo } from "@/components/control/BakeryLogo";
import { ConfirmBox, type ConfirmSpec } from "@/components/control/ConfirmBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_VERSION } from "@/lib/brand";
import { flushKioskNow, useKioskSyncStatus } from "@/lib/kiosk-sync";
import { millEvent } from "@/lib/mill-log";
import { millClockLabel, loadMillClock, syncMillClock, type MillClock } from "@/lib/mill-clock";
import { expiredShoutouts } from "@/lib/people";
import { formatWeekEnding } from "@/lib/production";
import { useDisplayStore } from "@/lib/store";

type PiStats = {
  hostname: string;
  disk: { usedLabel: string; freeLabel: string; totalLabel: string; percent: number };
  memory: { usedLabel: string; totalLabel: string; percent: number };
  tempC: number | null;
  throttled: string;
  uptimeSec: number;
  load: number[];
  ips: Array<{ name: string; address: string }>;
};

type SnapshotRow = { name: string; kind?: string; reason?: string; at?: string; bytes?: number };
type LogRow = { at: string; event: string; detail?: string };
type UpdateInfo = {
  app?: string;
  data?: string;
  status?: { phase?: string; message?: string; backup?: string };
  backups?: Array<{ name: string; path: string; bytes: number }>;
};

function readAdminPin() {
  try {
    return localStorage.getItem("nb-admin-pin") || "1231";
  } catch {
    return "1231";
  }
}
function writeAdminPin(value: string) {
  localStorage.setItem("nb-admin-pin", value);
}

function uptimeLabel(sec: number) {
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function AdminPanel() {
  const loadSaturdayBook = useDisplayStore((s) => s.loadSaturdayBook);
  const resetAllProduction = useDisplayStore((s) => s.resetAllProduction);
  const setPeople = useDisplayStore((s) => s.setPeople);
  const setSettings = useDisplayStore((s) => s.setSettings);
  const production = useDisplayStore((s) => s.production);
  const people = useDisplayStore((s) => s.people);
  const { status } = useKioskSyncStatus();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState("");
  const [pi, setPi] = useState<PiStats | null>(null);
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [log, setLog] = useState<LogRow[]>([]);
  const [confirm, setConfirm] = useState<ConfirmSpec | null>(null);
  const [persist, setPersist] = useState<{ ok?: boolean; message?: string } | null>(null);
  const [clock, setClock] = useState<MillClock | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPin(readAdminPin());
  }, []);

  const loadPi = async () => {
    try {
      const res = await fetch("/api/mill-pi", { cache: "no-store" });
      if (!res.ok) throw new Error("Pi stats unavailable");
      setPi((await res.json()) as PiStats);
    } catch {
      setPi(null);
    }
  };

  const loadUpdate = async () => {
    try {
      const res = await fetch("/api/mill-update", { cache: "no-store" });
      if (!res.ok) return;
      setUpdate((await res.json()) as UpdateInfo);
    } catch {
      /* mill page still works without status */
    }
  };

  const loadSafety = async () => {
    try {
      const [snapRes, logRes, persistRes, clockRes] = await Promise.all([
        fetch("/api/mill-snapshots", { cache: "no-store" }),
        fetch("/api/mill-log", { cache: "no-store" }),
        fetch("/api/mill-persist", { cache: "no-store" }),
        loadMillClock(),
      ]);
      if (snapRes.ok) {
        const body = (await snapRes.json()) as { snapshots?: SnapshotRow[] };
        setSnapshots(body.snapshots ?? []);
      }
      if (logRes.ok) {
        const body = (await logRes.json()) as { entries?: LogRow[] };
        setLog(body.entries ?? []);
      }
      if (persistRes.ok) setPersist((await persistRes.json()) as { ok?: boolean; message?: string });
      setClock(clockRes);
    } catch {
      /* mill still works */
    }
  };

  useEffect(() => {
    void loadPi();
    void loadUpdate();
    void loadSafety();
    const id = window.setInterval(() => {
      void loadPi();
      void loadUpdate();
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  const loadNewApp = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((reg) => reg.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch {
      /* still reload */
    }
    toast.success("Loading the new app…");
    window.location.reload();
  };

  const downloadMillZip = async () => {
    setBusy("Packing mill zip…");
    try {
      const res = await fetch("/api/mill-workspace.zip", { method: "GET", cache: "no-store" });
      const type = res.headers.get("content-type") || "";
      if (!res.ok || type.includes("json") || type.includes("html")) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message || "Could not pack the mill zip.");
      }
      const blob = await res.blob();
      if (blob.size < 64) throw new Error("The mill zip came back empty.");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "nb-breakroom-display.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast.success("Mill zip is ready on this phone.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download the mill zip.");
    } finally {
      setBusy("");
    }
  };

  const installZip = async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast.error("Pick the grok-workspace zip.");
      return;
    }
    setBusy("Installing update…");
    try {
      const payload = new FormData();
      payload.append("zip", file, file.name);
      const res = await fetch("/api/mill-workspace", {
        method: "POST",
        body: payload,
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; copied?: number; dest?: string };
      const message = String(body.message || "").replace(/^.*PermissionError:\s*/s, "Permission denied. ");
      if (!res.ok || body.ok === false) {
        if (/npm is not defined/i.test(message)) {
          throw new Error("The installer on this Pi is broken. Tap Restore last copy, then upload this zip again.");
        }
        throw new Error(message || "Install failed.");
      }
      setSettings({ reloadAt: Date.now() });
      toast.success(body.message || `Installed ${body.copied ?? ""} files. Reloading…`);
      window.setTimeout(() => window.location.reload(), 2200);
    } catch (err) {
      const text = err instanceof Error ? err.message : "Could not install that zip.";
      toast.error(text.length > 180 ? "Upload failed. The Pi updater could not write the mill folder." : text);
      setBusy("");
    }
  };

  return (
    <section className="control-page">
      <header className="control-header">
        <div>
          <p className="eyebrow">Admin only</p>
          <h1>Update</h1>
          <p className="lede">
            Mill TV v{APP_VERSION}. Upload a grok-workspace zip from your phone. The mill saves a restore copy first, then swaps the app. Production numbers live in a separate data folder so updates cannot wipe them.
          </p>
        </div>
        <BakeryLogo size="md" />
      </header>
      {confirm ? <ConfirmBox spec={confirm} onCancel={() => setConfirm(null)} /> : null}

      <div className="stat-grid three">
        <article className="stat-card">
          <div className="stat-label">TV</div>
          <div className="stat-value">{status === "disk" ? "WRITE ERROR" : status === "live" || status === "saving" ? "Live" : "Waiting"}</div>
          <div className="stat-sub">
            {status === "disk"
              ? "Mill disk did not keep the last save. Check the SD card."
              : persist?.ok === false
                ? persist.message || "Persistent data write failed."
                : persist?.ok
                  ? "Persistent data: OK"
                  : "Pi display should stay on the TV page, fullscreen"}
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Open week</div>
          <div className="stat-value">{formatWeekEnding(production.weekEnding)}</div>
          <div className="stat-sub">{production.plants.reduce((sum, plant) => sum + plant.tons, 0).toLocaleString()} tons typed so far</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">History</div>
          <div className="stat-value">{production.history.length}</div>
          <div className="stat-sub">Completed Saturdays on the board</div>
        </article>
      </div>

      <div className="panel">
        <h2>Install from your phone</h2>
        <ol className="how-strip">
          <li>
            <strong>1</strong>
            <span>Download the grok-workspace zip from this chat after we change the app.</span>
          </li>
          <li>
            <strong>2</strong>
            <span>Upload it here. The mill unpacks to a staging folder, checks the app, then swaps it in.</span>
          </li>
          <li>
            <strong>3</strong>
            <span>If the TV does not come back, it restores the last copy by itself. Tons and slides stay in the data folder.</span>
          </li>
        </ol>
        {update?.status?.message ? (
          <p className="lede" style={{ marginTop: 12 }}>
            Last update: {update.status.phase || "idle"} — {update.status.message}
            {update.status.phase === "rolled-back"
              ? " Upload this zip again. The mill now waits for the TV to come back instead of restoring too soon."
              : ""}
          </p>
        ) : null}
        <div className="header-actions">
          <Button onClick={() => void downloadMillZip()} disabled={Boolean(busy)}>
            {busy === "Packing mill zip…" ? "Packing mill zip…" : "Download running mill zip"}
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={Boolean(busy)}>
            <Upload size={16} />
            {busy || "Upload grok-workspace.zip"}
          </Button>
          <Button
            variant="ghost"
            disabled={!update?.backups?.length || Boolean(busy)}
            onClick={async () => {
              setBusy("Restoring last mill copy…");
              try {
                const res = await fetch("/api/mill-rollback", { method: "POST" });
                const body = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
                if (!res.ok || body.ok === false) throw new Error(body.message || "Restore failed.");
                setSettings({ reloadAt: Date.now() });
                toast.success("Restored the last mill copy. Reloading…");
                window.setTimeout(() => window.location.reload(), 1600);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not restore.");
                setBusy("");
              }
            }}
          >
            Restore last copy
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".zip,application/zip"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void installZip(file);
            }}
          />
        </div>
      </div>

      <div className="panel pi-panel">
        <div className="library-head">
          <h2>Pi stats</h2>
          <Button size="sm" variant="ghost" onClick={() => void loadPi()}>
            Refresh
          </Button>
        </div>
        {pi ? (
          <>
            <div className="stat-grid three">
              <article className="stat-card">
                <div className="stat-label">
                  <HardDrive size={14} /> SD card
                </div>
                <div className="stat-value">{pi.disk.percent}%</div>
                <div className="pi-meter">
                  <b style={{ width: `${Math.min(100, pi.disk.percent)}%` }} />
                </div>
                <div className="stat-sub">
                  {pi.disk.usedLabel} used · {pi.disk.freeLabel} free · {pi.disk.totalLabel}
                </div>
              </article>
              <article className="stat-card">
                <div className="stat-label">Memory</div>
                <div className="stat-value">{pi.memory.percent}%</div>
                <div className="pi-meter">
                  <b style={{ width: `${Math.min(100, pi.memory.percent)}%` }} />
                </div>
                <div className="stat-sub">
                  {pi.memory.usedLabel} of {pi.memory.totalLabel}
                </div>
              </article>
              <article className="stat-card">
                <div className="stat-label">
                  <Thermometer size={14} /> Heat / uptime
                </div>
                <div className="stat-value">{pi.tempC != null ? `${pi.tempC}°` : "—"}</div>
                <div className="stat-sub">
                  Up {uptimeLabel(pi.uptimeSec)} · load {pi.load.join(" / ")}
                </div>
              </article>
            </div>
            <p className="lede" style={{ marginTop: 10 }}>
              <Wifi size={14} /> {pi.hostname}
              {pi.ips.length ? ` · ${pi.ips.map((row) => row.address).join(" · ")}` : ""}
              {pi.throttled ? ` · throttle ${pi.throttled}` : ""}
            </p>
            <div className="header-actions" style={{ marginTop: 12 }}>
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    const next = await syncMillClock();
                    setClock(next);
                    toast.success(
                      next.systemSet
                        ? "Pi clock set from this phone."
                        : "Phone time saved. TV birthdays, announcements, and backups will use it until the Pi lets us set the system clock.",
                    );
                  } catch {
                    toast.error("Could not sync the mill clock.");
                  }
                }}
              >
                Sync mill clock from this phone
              </Button>
            </div>
            <p className="lede" style={{ marginTop: 8 }}>
              {clock
                ? `${millClockLabel(clock)}${clock.systemSet ? " · Pi system clock is set." : " · using phone offset until the Pi lets us set the clock."}`
                : "Checking mill clock…"}
            </p>
          </>
        ) : (
          <p className="lede">Waiting for Pi stats…</p>
        )}
        <div className="header-actions" style={{ marginTop: 14 }}>
          <Button
            variant="secondary"
            onClick={() =>
              setConfirm({
                title: "Reload the mill TV?",
                body: "The TV page refreshes. Takes a few seconds. Production numbers stay.",
                confirmLabel: "Reload TV",
                onConfirm: () => {
                  setConfirm(null);
                  setSettings({ reloadAt: Date.now() });
                  void flushKioskNow();
                  void millEvent("tv-reload", "Reloaded mill TV");
                  toast.success("TV is reloading.");
                },
              })
            }
          >
            <Monitor size={16} />
            Reload TV
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              setConfirm({
                title: "Reboot the Raspberry Pi?",
                body: "The TV will go dark for about a minute while the Pi starts back up.",
                items: ["Tons, slides, and people stay in the data folder", "The display comes back by itself"],
                confirmLabel: "Reboot Pi",
                danger: true,
                onConfirm: () => {
                  setConfirm(null);
                  setBusy("Rebooting Pi…");
                  void (async () => {
                    try {
                      await millEvent("pi-reboot", "Rebooted mill Pi from Admin");
                      const res = await fetch("/api/mill-reboot", { method: "POST" });
                      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
                      if (!res.ok || body.ok === false) throw new Error(body.message || "Reboot failed.");
                      toast.success(body.message || "Pi is rebooting.");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Could not reboot the Pi.");
                      setBusy("");
                    }
                  })();
                },
              })
            }
            disabled={Boolean(busy)}
          >
            <Power size={16} />
            Reboot Pi
          </Button>
        </div>
      </div>

      <div className="panel">
        <h2>Clean leftover files</h2>
        <p className="lede">
          Clears mill update zips in temp and expired shout-outs. Off-TV slides stay in the library until you delete them on Slides.
        </p>
        <div className="header-actions" style={{ marginTop: 14 }}>
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                const res = await fetch("/api/mill-cleanup", { method: "POST" });
                const body = (await res.json()) as { removed?: string[]; bytes?: number };
                const expired = expiredShoutouts(people);
                if (expired.length) {
                  setPeople(people.filter((person) => !expired.some((row) => row.id === person.id)));
                  void flushKioskNow();
                }
                toast.success(
                  `Cleaned ${body.removed?.length ?? 0} temp file${(body.removed?.length ?? 0) === 1 ? "" : "s"} and ${expired.length} expired shout-out${expired.length === 1 ? "" : "s"}.`,
                );
              } catch {
                toast.error("Could not clean files.");
              }
            }}
          >
            Clean temp files and expired shout-outs
          </Button>
        </div>
      </div>

      <div className="panel">
        <h2>Mill snapshots</h2>
        <p className="lede">
          Automatic copies of tons, people, and settings. Seven daily and four weekly. Slides files stay in the media folder.
        </p>
        <div className="header-actions" style={{ marginTop: 14 }}>
          <Button
            variant="secondary"
            onClick={async () => {
              setBusy("Saving mill snapshot…");
              try {
                const res = await fetch("/api/mill-snapshot", { method: "POST" });
                const body = (await res.json()) as { ok?: boolean; message?: string; snapshot?: { name?: string }; name?: string };
                if (!res.ok || body.ok === false) throw new Error(body.message || "Snapshot failed.");
                toast.success(`Saved ${body.snapshot?.name || body.name || "mill snapshot"}.`);
                await loadSafety();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not snapshot.");
              } finally {
                setBusy("");
              }
            }}
            disabled={Boolean(busy)}
          >
            Save mill snapshot now
          </Button>
        </div>
        <div className="library-list" style={{ marginTop: 12 }}>
          {snapshots.slice(0, 8).map((row) => (
            <div key={row.name} className="library-item">
              <div>
                <div className="library-name">{row.name}</div>
                <div className="people-meta">
                  {row.kind || "snapshot"} {row.at ? `· ${row.at}` : ""} {row.reason ? `· ${row.reason}` : ""}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setConfirm({
                    title: `Restore ${row.name}?`,
                    body: "This replaces today's tons, people, plant board, and settings with that snapshot. The TV reloads. Current mill data is snapshotted first.",
                    confirmLabel: "Restore snapshot",
                    danger: true,
                    onConfirm: async () => {
                      setConfirm(null);
                      setBusy("Restoring snapshot…");
                      try {
                        const res = await fetch("/api/mill-restore", {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ name: row.name }),
                        });
                        const body = (await res.json()) as { ok?: boolean; message?: string };
                        if (!res.ok || body.ok === false) throw new Error(body.message || "Restore failed.");
                        setSettings({ reloadAt: Date.now() });
                        toast.success("Snapshot restored. Reloading…");
                        window.setTimeout(() => window.location.reload(), 1200);
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Could not restore.");
                        setBusy("");
                      }
                    },
                  })
                }
              >
                Restore
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>What happened</h2>
        <p className="lede">Mill floor log — locked weeks, corrections, resets, announcements, and updates.</p>
        <ul className="mill-log">
          {log.length ? (
            log.slice(0, 12).map((row, index) => (
              <li key={`${row.at}-${index}`}>
                <strong>{row.event}</strong>
                <span>{row.at}</span>
                {row.detail ? <em>{row.detail}</em> : null}
              </li>
            ))
          ) : (
            <li>
              <em>Nothing logged yet.</em>
            </li>
          )}
        </ul>
      </div>

      <div className="panel">
        <h2>Reset production numbers</h2>
        <p className="lede">These only touch tons. People, plant board, slides, and clock stay put.</p>
        <div className="header-actions" style={{ marginTop: 16 }}>
          <Button
            variant="secondary"
            onClick={() =>
              setConfirm({
                title: "Wipe every Saturday?",
                body: "Clears the open week and all locked history. Conquest map goes even. Does not change people, plant board, slides, or display settings.",
                items: [`${production.history.length} locked Saturdays`, `Open week ${formatWeekEnding(production.weekEnding)}`],
                confirmLabel: "Wipe all tons",
                danger: true,
                onConfirm: () => {
                  resetAllProduction();
                  setConfirm(null);
                  void flushKioskNow();
                  void millEvent("production-reset", `Cleared ${production.history.length} Saturdays`);
                  toast.success("All production numbers are cleared. TV will catch up.");
                },
              })
            }
          >
            <RotateCcw size={16} />
            Reset all production numbers
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              setConfirm({
                title: "Load the 2026 Saturday book?",
                body: "Replaces production history with the mill sheet. Does not change people, plant board, slides, ticker, or clock.",
                items: [`${production.history.length} Saturdays on the board now will be replaced`],
                confirmLabel: "Load Saturday book",
                onConfirm: () => {
                  loadSaturdayBook();
                  setConfirm(null);
                  void flushKioskNow();
                  void millEvent("saturday-book", "Loaded 2026 mill sheet into production history");
                  toast.success("2026 Saturday book is loaded. People and plant board were left alone.");
                },
              })
            }
          >
            <RefreshCw size={16} />
            Load 2026 Saturday book
          </Button>
          <Button variant="ghost" onClick={() => void loadNewApp()}>
            Reload this browser
          </Button>
        </div>
      </div>

      <div className="panel">
        <h2>Admin code</h2>
        <p className="lede">Change this so only you can open Admin. Keep it off the office phones.</p>
        <div className="header-actions" style={{ marginTop: 14 }}>
          <Input className="pin-input" inputMode="numeric" autoComplete="off" value={pin} onChange={(event) => setPin(event.target.value)} />
          <Button
            onClick={() => {
              if (pin.trim().length < 4) {
                toast.error("Use at least 4 numbers.");
                return;
              }
              writeAdminPin(pin.trim());
              toast.success("Admin code saved on this browser.");
            }}
          >
            <KeyRound size={16} />
            Save code
          </Button>
        </div>
      </div>
    </section>
  );
}
