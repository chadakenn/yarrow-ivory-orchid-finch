import { ChevronDown, ChevronUp, ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { importFiles, moveDeck, removeDeck, toggleDeck, useMediaLibrary } from "@/lib/media-library";
import { useDisplayStore } from "@/lib/store";
import type { DisplaySettings } from "@/lib/types";
import { cn } from "@/lib/utils";

const HOLD_FIELDS: Array<{ key: keyof DisplaySettings["durations"]; label: string; hint: string }> = [
  { key: "productionWeekly", label: "Championship", hint: "This week's tons" },
  { key: "productionYtd", label: "Year-to-date", hint: "Season standings" },
  { key: "productionTrends", label: "Trends", hint: "Saturday graph" },
  { key: "productionRecords", label: "Records", hint: "Streaks and best weeks" },
  { key: "conquest", label: "Conquest map", hint: "Territory board" },
  { key: "plantBoard", label: "Plant board", hint: "Daily mill notes" },
  { key: "people", label: "People", hint: "Birthdays and shout-outs" },
  { key: "presentation", label: "Uploaded slides", hint: "Each photo / page" },
];

export function SlidesPanel() {
  const settings = useDisplayStore((s) => s.settings);
  const setSettings = useDisplayStore((s) => s.setSettings);
  const { decks, ready } = useMediaLibrary();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState("");
  const [drag, setDrag] = useState(false);
  const onTv = decks.filter((deck) => deck.enabled).reduce((sum, deck) => sum + deck.slides.length, 0);

  const ingest = async (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    setBusy("Preparing slides…");
    try {
      await importFiles(Array.from(files), (label) => setBusy(label));
      toast.success("Slides are on the TV.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that file.");
    } finally {
      setBusy("");
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <section className="control-page">
      <header className="control-header">
        <div>
          <p className="eyebrow">Slides</p>
          <h1>Playlist</h1>
          <p className="lede">Drop photos, PowerPoint, or PDF. The mill turns them into TV slides and keeps the files off the playlist JSON.</p>
        </div>
        <div className="week-chip">{ready ? `${onTv} slide${onTv === 1 ? "" : "s"} on the TV` : "Opening library…"}</div>
      </header>

      <button
        type="button"
        className={cn("upload-drop", drag && "over", busy && "busy")}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDrag(false);
          void ingest(event.dataTransfer.files);
        }}
      >
        <ImagePlus size={28} />
        <strong>{busy || "Drop slides here"}</strong>
        <span>Photos, PowerPoint, or PDF. Phone pictures are resized for the TV.</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp,.pptx,.ppt,.pdf,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          multiple
          onChange={(event) => void ingest(event.target.files)}
        />
      </button>

      <div className="panel">
        <div className="library-head">
          <h2>Uploaded slides</h2>
          <label className="check-row" style={{ margin: 0 }}>
            <input
              type="checkbox"
              checked={settings.decksEnabled !== false}
              onChange={(event) => setSettings({ decksEnabled: event.target.checked })}
            />
            Play uploaded slides on the TV
          </label>
        </div>
        {ready && !decks.length ? (
          <p className="lede">Nothing uploaded yet. Drop a photo above and it starts cycling on the TV.</p>
        ) : null}
        <div className="library-list">
          {decks.map((deck, index) => (
            <div key={deck.id} className={cn("library-item", deck.enabled && "on")}>
              {deck.slides[0] ? (
                <img src={deck.slides[0].src} alt="" className="library-thumb" />
              ) : (
                <div className="library-thumb" />
              )}
              <div>
                <div className="library-name">{deck.name}</div>
                <div className="people-meta">
                  {deck.kind.toUpperCase()} · {deck.slides.length} page{deck.slides.length === 1 ? "" : "s"}
                </div>
              </div>
              <div className="people-actions">
                <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => void moveDeck(deck.id, -1)}>
                  <ChevronUp size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={index === decks.length - 1}
                  onClick={() => void moveDeck(deck.id, 1)}
                >
                  <ChevronDown size={16} />
                </Button>
                <Button size="sm" variant="secondary" onClick={() => void toggleDeck(deck.id, !deck.enabled)}>
                  {deck.enabled ? "On TV" : "Off"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void removeDeck(deck.id);
                    toast.message("Removed from the playlist.");
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Boards on the TV</h2>
        <div className="check-grid">
          <label className="check-row">
            <input
              type="checkbox"
              checked={settings.productionEnabled}
              onChange={(event) => setSettings({ productionEnabled: event.target.checked })}
            />
            Production championship
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={settings.recordsEnabled}
              onChange={(event) => setSettings({ recordsEnabled: event.target.checked })}
            />
            Records and streaks
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={settings.conquestEnabled}
              onChange={(event) => setSettings({ conquestEnabled: event.target.checked })}
            />
            Conquest map
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={settings.peopleEnabled}
              onChange={(event) => setSettings({ peopleEnabled: event.target.checked })}
            />
            Birthdays and shout-outs
          </label>
        </div>
      </div>

      <div className="panel">
        <h2>Hold time</h2>
        <p className="lede">Seconds each board stays on the TV before the next one.</p>
        <div className="duration-grid">
          {HOLD_FIELDS.map((field) => (
            <label key={field.key} className="duration-card">
              <span>
                {field.label}
                <em>{field.hint}</em>
              </span>
              <Input
                inputMode="numeric"
                value={settings.durations[field.key]}
                onChange={(event) =>
                  setSettings({
                    durations: {
                      ...settings.durations,
                      [field.key]: Math.max(4, Number(event.target.value) || 0),
                    },
                  })
                }
              />
              <small>sec</small>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
