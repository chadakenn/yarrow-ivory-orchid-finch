import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pause, Play, Settings2, SkipBack, SkipForward } from "lucide-react";
import { APP_BUILD, applyAppUpdate, remoteAppBuild } from "@/lib/app-update";
import { APP_VERSION, DEVELOPER } from "@/lib/brand";
import { ConquestSlide, DeckSlide, PeopleSlide, PlantBoardSlide, ProductionSlide, RecordsSlide, TrendsSlide } from "@/components/display/slides";
import { useMediaLibrary } from "@/lib/media-library";
import { buildSlides } from "@/lib/slides";
import { useDisplayStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function ClockOverlay({
  enabled,
  position,
}: {
  enabled: boolean;
  position: "top-right" | "top-left" | "bottom-left";
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!enabled || !now) return null;
  return (
    <div className={cn("clock-overlay", position)}>
      <div className="clock-time">
        {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
      </div>
      <div className="clock-date">
        {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </div>
      <div className="clock-credit">
        v{APP_VERSION} · powered by {DEVELOPER}
      </div>
    </div>
  );
}

function Ticker({ message, speed, hidden }: { message: string; speed: "slow" | "normal" | "fast"; hidden: boolean }) {
  if (hidden || !message) return null;
  const duration = speed === "slow" ? 42 : speed === "fast" ? 18 : 28;
  return (
    <div className="ticker-overlay" aria-hidden="true">
      <div className="ticker-track" style={{ animationDuration: `${duration}s` }}>
        <span>{message}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}

const ANNOUNCE_COPY = {
  info: { label: "Information", tone: "info" },
  safety: { label: "Safety notice", tone: "safety" },
  urgent: { label: "Urgent", tone: "urgent" },
  celebration: { label: "Celebration", tone: "celebration" },
} as const;

function TvUpdater() {
  const [status, setStatus] = useState<"idle" | "ready" | "updating">("idle");
  const started = useRef(false);

  useEffect(() => {
    if (APP_BUILD === "dev") return;
    let alive = true;
    const tick = async () => {
      const remote = await remoteAppBuild();
      if (!alive || !remote || remote === "dev" || remote === APP_BUILD) return;
      setStatus("ready");
      if (started.current) return;
      started.current = true;
      window.setTimeout(() => {
        setStatus("updating");
        void applyAppUpdate("/");
      }, 4000);
    };
    void tick();
    const id = window.setInterval(() => void tick(), 120000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  if (status === "idle") return null;
  return (
    <div className="tv-update-banner">
      {status === "updating" ? "Loading the new app…" : "New app found. This TV will update."}
    </div>
  );
}

export function TvDisplay() {
  const production = useDisplayStore((s) => s.production);
  const plantBoard = useDisplayStore((s) => s.plantBoard);
  const people = useDisplayStore((s) => s.people);
  const announcement = useDisplayStore((s) => s.announcement);
  const settings = useDisplayStore((s) => s.settings);
  const clearAnnouncement = useDisplayStore((s) => s.clearAnnouncement);
  const { decks } = useMediaLibrary();

  const slides = useMemo(
    () => buildSlides({ production, plantBoard, people, announcement, settings }, decks),
    [production, plantBoard, people, announcement, settings, decks],
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [chrome, setChrome] = useState(true);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  const slide = slides[index] ?? slides[0];
  const slideId = slide?.id ?? "";
  const holdMs = Math.max(2, Number(slide?.duration) || 12) * 1000;
  const liveAnnouncement = announcement && announcement.expiresAt > Date.now() ? announcement : null;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("boot")) {
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    const stamp = Number(settings.reloadAt || 0);
    if (!stamp) return;
    const key = "nb-reload-at";
    const prev = Number(sessionStorage.getItem(key) || "0");
    sessionStorage.setItem(key, String(stamp));
    if (prev && stamp > prev) void applyAppUpdate("/");
  }, [settings.reloadAt]);

  useEffect(() => {
    if (!liveAnnouncement && announcement) clearAnnouncement();
  }, [liveAnnouncement, announcement, clearAnnouncement]);

  useEffect(() => {
    if (paused || liveAnnouncement || !slideId) return;
    const total = slides.length;
    const id = window.setTimeout(() => {
      setIndex((current) => (total ? (current + 1) % total : 0));
    }, holdMs);
    return () => window.clearTimeout(id);
  }, [index, paused, liveAnnouncement, slideId, holdMs, slides.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setIndex((i) => (slides.length ? (i + 1) % slides.length : 0));
      if (event.key === "ArrowLeft") setIndex((i) => (slides.length ? (i - 1 + slides.length) % slides.length : 0));
      if (event.key === " ") {
        event.preventDefault();
        setPaused((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  const bumpChrome = () => {
    setChrome(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setChrome(false), 2800);
  };

  useEffect(() => {
    bumpChrome();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <div className="tv-shell" onMouseMove={bumpChrome} onClick={bumpChrome}>
      <TvUpdater />
      <div
        className={cn(
          "tv-stage",
          settings.clockEnabled && "has-clock",
          settings.clockEnabled && `clock-${settings.clockPosition}`,
          settings.ticker.enabled && "has-ticker",
        )}
      >
        {liveAnnouncement ? (
          <div className={cn("announce-board", ANNOUNCE_COPY[liveAnnouncement.type].tone)}>
            <div className="announce-kicker">{ANNOUNCE_COPY[liveAnnouncement.type].label}</div>
            <div className="announce-message">{liveAnnouncement.message}</div>
            <div className="announce-sub">Returns to the playlist automatically</div>
          </div>
        ) : slide ? (
          <div key={slide.id} className={slide.kind === "deck" ? "tv-slide deck" : "tv-slide"}>
            {slide.kind === "deck" ? (
              <DeckSlide src={slide.src} title={slide.title} page={slide.page} pages={slide.pages} />
            ) : null}
            {slide.kind === "production" ? (
              <ProductionSlide
                title={slide.title}
                period={slide.period}
                metric={slide.metric}
                plants={slide.plants}
                showWins={slide.showWins}
              />
            ) : null}
            {slide.kind === "trends" ? <TrendsSlide graph={slide.graph} /> : null}
            {slide.kind === "conquest" ? (
              <ConquestSlide
                mode={slide.mode}
                period={slide.period}
                weekLabel={slide.weekLabel}
                live={slide.live}
                sourceLabel={slide.sourceLabel}
                leaderName={slide.leaderName}
                leaderboardTitle={slide.leaderboardTitle}
                scoreRows={slide.scoreRows}
                territories={slide.territories}
                transfers={slide.transfers}
                owners={slide.owners}
                statusTitle={slide.statusTitle}
                statusDetail={slide.statusDetail}
              />
            ) : null}
            {slide.kind === "records" ? <RecordsSlide records={slide.records} /> : null}
            {slide.kind === "plant-board" ? (
              <PlantBoardSlide board={slide.board} updatedLabel={slide.updatedLabel} />
            ) : null}
            {slide.kind === "person" ? <PeopleSlide person={slide.person} /> : null}
          </div>
        ) : (
          <div className="tv-empty">Nothing is queued for the display.</div>
        )}

        <ClockOverlay enabled={settings.clockEnabled} position={settings.clockPosition} />
        {settings.ticker.enabled ? (
          <Ticker message={settings.ticker.message} speed={settings.ticker.speed} hidden={false} />
        ) : null}

        <div className={cn("tv-chrome", chrome ? "on" : "")}>
          <Link to="/control" className="tv-control-link">
            <Settings2 size={16} />
            Control room
          </Link>
          <Link to="/update" className="tv-control-link">
            Update TV
          </Link>
          <div className="tv-transport">
            <button type="button" onClick={() => setIndex((i) => (slides.length ? (i - 1 + slides.length) % slides.length : 0))} aria-label="Previous slide">
              <SkipBack size={16} />
            </button>
            <button type="button" onClick={() => setPaused((v) => !v)} aria-label={paused ? "Play" : "Pause"}>
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button type="button" onClick={() => setIndex((i) => (slides.length ? (i + 1) % slides.length : 0))} aria-label="Next slide">
              <SkipForward size={16} />
            </button>
            <div className="tv-dots">
              {slides.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn("tv-dot", i === index ? "active" : "")}
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${item.id}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
