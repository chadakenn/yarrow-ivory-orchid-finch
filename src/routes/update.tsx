import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, RefreshCw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { applyAppUpdate } from "@/lib/app-update";
import { APP_VERSION } from "@/lib/brand";
import { BakeryLogo } from "@/components/ui/bakery-logo";
import { useDisplayStore } from "@/lib/store";
import { downloadWorkspaceZip, uploadWorkspaceZip } from "@/lib/workspace-zip";

export const Route = createFileRoute("/update")({ component: UpdateTv });

function UpdateTv() {
  const setSettings = useDisplayStore((s) => s.setSettings);
  const reloadAt = useDisplayStore((s) => s.settings.reloadAt);
  const [busy, setBusy] = useState<"off" | "download" | "install" | "web">("off");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [hover, setHover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const runDownload = async () => {
    if (busy !== "off") return;
    setBusy("download");
    setError("");
    setNote("Preparing the mill zip…");
    try {
      const name = await downloadWorkspaceZip();
      setNote(`${name} is on this phone. Then upload it below.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the mill zip.");
    } finally {
      setBusy("off");
    }
  };

  const runInstall = async (file: File | undefined) => {
    if (!file || busy !== "off") return;
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".zip")) {
      setError("Choose the mill zip. It ends in .zip.");
      return;
    }
    setBusy("install");
    setError("");
    setNote("Installing the mill zip…");
    try {
      const result = await uploadWorkspaceZip(file);
      const at = Date.now();
      setSettings({ reloadAt: at });
      setNote(`Installed ${result.files} files. The TV will refresh.`);
      window.setTimeout(() => {
        void applyAppUpdate("/display");
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not install that zip.");
      setBusy("off");
    }
  };

  const runWeb = async () => {
    if (busy !== "off") return;
    setBusy("web");
    await applyAppUpdate("/display");
  };

  return (
    <div className="tv-update">
      <div className="tv-update-card pack">
        <BakeryLogo size="md" />
        <p className="eyebrow" style={{ marginTop: 12 }}>North Baltimore mill TV · v{APP_VERSION}</p>
        <h1>Update this TV</h1>
        <p className="lede">
          Do this from your phone. Download the mill zip — the same kind of file as a grok-workspace
          zip — then upload it here. The Pi TV picks up the new app.
        </p>
        <div className="tv-update-meta">
          <div>
            <span>This TV</span>
            <strong>v{APP_VERSION}</strong>
          </div>
          <div>
            <span>Last install</span>
            <strong>{reloadAt ? new Date(reloadAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "None yet"}</strong>
          </div>
        </div>

        <div className="pack-grid">
          <section className="pack-panel">
            <p className="eyebrow">This phone</p>
            <h2>1. Download mill zip</h2>
            <p>Saves north-baltimore-mill-workspace.zip to this phone. If you already have a grok-workspace zip, skip this.</p>
            <button type="button" className="tv-update-go" disabled={busy !== "off"} onClick={() => void runDownload()}>
              <Download size={24} />
              {busy === "download" ? "Preparing zip…" : "Download mill zip"}
            </button>
          </section>
          <section className="pack-panel">
            <p className="eyebrow">This phone</p>
            <h2>2. Upload mill zip</h2>
            <p>Pick the grok-workspace zip from Files, Drive, or Downloads. It installs on the mill site.</p>
            <input
              ref={fileRef}
              className="pack-file"
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              aria-label="Upload mill zip"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                void runInstall(file);
              }}
            />
            <button
              type="button"
              className={hover ? "pack-drop on" : "pack-drop"}
              disabled={busy !== "off"}
              onClick={() => fileRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setHover(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setHover(true);
              }}
              onDragLeave={() => setHover(false)}
              onDrop={(event) => {
                event.preventDefault();
                setHover(false);
                void runInstall(event.dataTransfer.files[0]);
              }}
            >
              <Upload size={28} />
              {busy === "install" ? "Installing…" : "Upload zip from this phone"}
            </button>
          </section>
        </div>

        {note ? <p className="tv-update-ready">{note}</p> : null}
        {error ? <p className="pack-error">{error}</p> : null}

        <button type="button" className="tv-update-web" disabled={busy !== "off"} onClick={() => void runWeb()}>
          <RefreshCw size={16} />
          Refresh this TV
        </button>
        <Link to="/office" className="tv-update-back">
          Back to the TV playlist
        </Link>
      </div>
    </div>
  );
}
