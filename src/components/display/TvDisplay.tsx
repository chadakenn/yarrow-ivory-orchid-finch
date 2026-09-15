import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pause, Play, Settings2, SkipBack, SkipForward } from "lucide-react";
import { ConquestSlide, DeckSlide, PeopleSlide, PlantBoardSlide, ProductionSlide, RecordsSlide, TrendsSlide } from "@/components/display/slides";
import { useMediaLibrary } from "@/lib/media-library";
import { buildSlides } from "@/lib/slides";
import { useDisplayStore } from "@/lib/store";
import { buildTicker } from "@/lib/ticker";
import { APP_VERSION, DEVELOPER } from "@/lib/brand";
import { millNow, loadMillClock } from "@/lib/mill-clock";
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
    void loadMillClock();
    setNow(millNow());
    const id = window.setInterval(() => setNow(millNow()), 1000);
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
        v{APP_VERSION} · {DEVELOPER}
      </div>
    </div>
  );
}

function Ticker({ message, speed, hidden }: { message: string; speed: "slow" | "normal" | "fast"; hidden: boolean }) {
  if (hidden || !message) return null;
  const duration = speed === "slow" ? 42 : speed === "fast" ? 18 : 28;
  return (
    <div className="ticker-overlay" aria-hidden="true">
      <span className="bakery-ticker">
        <img src="/bakery-feeds.svg" alt="" />
      </span>
      <div className="ticker-viewport">
        <div className="ticker-track" style={{ animationDuration: `${duration}s` }}>
          <span>{message}</span>
          <span>{message}</span>
        </div>
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

export function TvDisplay() {
  const production = useDisplayStore((s) => s.production);
  const plantBoard = useDisplayStore((s) => s.plantBoard);
  const people = useDisplayStore((s) => s.people);
  const announcement = useDisplayStore((s) => s.announcement);
  const settings = useDisplayStore((s) => s.settings);
  const { decks } = useMediaLibrary();

  const slides = useMemo(
    () => buildSlides({ production, plantBoard, people, announcement, settings }, decks),
    [production, plantBoard, people, announcement, settings, decks],
  );

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [chrome, setChrome] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const boot = useRef(Date.now());
  const slidesRef = useRef(slides);
  const currentIdRef = useRef(currentId);
  slidesRef.current = slides;
  currentIdRef.current = currentId;

  useEffect(() => {
    void loadMillClock();
  }, []);

  useEffect(() => {
    if (settings.reloadAt && settings.reloadAt > boot.current) {
      window.location.reload();
    }
  }, [settings.reloadAt]);

  useEffect(() => {
    if (!slides.length) return;
    if (!currentId || !slides.some((item) => item.id === currentId)) {
      setCurrentId(slides[0].id);
    }
  }, [slides, currentId]);

  const index = Math.max(0, slides.findIndex((item) => item.id === currentId));
  const slide = slides[index] ?? slides[0];
  const liveAnnouncement = announcement && announcement.expiresAt > millNow().getTime() ? announcement : null;
  const slideId = slide?.id ?? "";
  const holdMs = Math.max(2, Number(slide?.duration) || 8) * 1000;

  const step = (dir: 1 | -1) => {
    const list = slidesRef.current;
    if (!list.length) return;
    const here = Math.max(0, list.findIndex((item) => item.id === (currentIdRef.current ?? list[0].id)));
    const next = list[(here + dir + list.length) % list.length];
    if (next) setCurrentId(next.id);
  };

  useEffect(() => {
    if (paused || liveAnnouncement || !slideId) return;
    const id = window.setTimeout(() => step(1), holdMs);
    return () => window.clearTimeout(id);
  }, [slideId, holdMs, paused, liveAnnouncement]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
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

  const hideTicker = Boolean(liveAnnouncement);
  const hideClock = Boolean(liveAnnouncement);

  return (
    <div className="tv-shell" onMouseMove={bumpChrome} onClick={bumpChrome}>
      <div className={cn("tv-stage", settings.clockEnabled && "has-clock", settings.ticker.enabled !== false && "has-ticker")}>
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

        <ClockOverlay
          enabled={settings.clockEnabled && !hideClock}
          position={settings.clockPosition}
        />
        {settings.ticker.enabled !== false ? (
          <Ticker
            message={buildTicker({ production, people }, settings, millNow())}
            speed={settings.ticker.speed}
            hidden={hideTicker}
          />
        ) : null}

        <div className={cn("tv-chrome", chrome ? "on" : "")}>
          <Link to="/control" className="tv-control-link">
            <Settings2 size={16} />
            Control room
          </Link>
          <div className="tv-transport">
            <button type="button" onClick={() => step(-1)} aria-label="Previous slide">
              <SkipBack size={16} />
            </button>
            <button type="button" onClick={() => setPaused((v) => !v)} aria-label={paused ? "Play" : "Pause"}>
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next slide">
              <SkipForward size={16} />
            </button>
            <div className="tv-dots">
              {slides.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn("tv-dot", i === index ? "active" : "")}
                  onClick={() => setCurrentId(item.id)}
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
