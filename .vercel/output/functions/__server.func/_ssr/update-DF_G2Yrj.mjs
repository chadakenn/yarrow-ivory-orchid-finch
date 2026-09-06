import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as useDisplayStore, s as applyAppUpdate, t as APP_BUILD } from "./store-COqNrb3J.mjs";
import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as RefreshCw, n as Upload, v as Download } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/update-DF_G2Yrj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function downloadWorkspaceZip() {
	const res = await fetch("/api/mill-workspace.zip", { cache: "no-store" });
	if (!res.ok) throw new Error("Could not download the mill zip.");
	const blob = await res.blob();
	const name = (res.headers.get("content-disposition") || "").match(/filename="?([^"]+)"?/i)?.[1] || "north-baltimore-mill-workspace.zip";
	const href = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = href;
	link.download = name;
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(href), 4e3);
	return name;
}
async function uploadWorkspaceZip(file) {
	const res = await fetch("/api/mill-workspace", {
		method: "POST",
		headers: { "x-filename": file.name },
		body: file
	});
	const text = await res.text();
	if (!res.ok) throw new Error(text || "Could not install that zip.");
	try {
		return JSON.parse(text);
	} catch {
		return {
			files: 0,
			name: file.name
		};
	}
}
function UpdateTv() {
	const setSettings = useDisplayStore((s) => s.setSettings);
	const reloadAt = useDisplayStore((s) => s.settings.reloadAt);
	const [busy, setBusy] = (0, import_react.useState)("off");
	const [note, setNote] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [hover, setHover] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
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
	const runInstall = async (file) => {
		if (!file || busy !== "off") return;
		if (!file.name.toLowerCase().endsWith(".zip")) {
			setError("Choose the mill zip. It ends in .zip.");
			return;
		}
		setBusy("install");
		setError("");
		setNote("Installing the mill zip…");
		try {
			const result = await uploadWorkspaceZip(file);
			setSettings({ reloadAt: Date.now() });
			setNote(`Installed ${result.files} files. The TV will refresh.`);
			window.setTimeout(() => {
				applyAppUpdate("/");
			}, 900);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not install that zip.");
			setBusy("off");
		}
	};
	const runWeb = async () => {
		if (busy !== "off") return;
		setBusy("web");
		await applyAppUpdate("/");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "tv-update",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "tv-update-card pack",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "North Baltimore mill TV"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Update this TV" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lede",
					children: "Do this from your phone. Download the mill zip — the same kind of file as a grok-workspace zip — then upload it here. The Pi TV picks up the new app."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tv-update-meta",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "This TV" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: APP_BUILD })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Last install" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: reloadAt ? new Date(reloadAt).toLocaleTimeString("en-US", {
						hour: "numeric",
						minute: "2-digit"
					}) : "None yet" })] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pack-grid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "pack-panel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "This phone"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "1. Download mill zip" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Saves north-baltimore-mill-workspace.zip to this phone. If you already have a grok-workspace zip, skip this." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "tv-update-go",
								disabled: busy !== "off",
								onClick: () => void runDownload(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 24 }), busy === "download" ? "Preparing zip…" : "Download mill zip"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "pack-panel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "This phone"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "2. Upload mill zip" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Pick the grok-workspace zip from Files, Drive, or Downloads. It installs on the mill site." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								className: "pack-file",
								type: "file",
								accept: ".zip,application/zip,application/x-zip-compressed",
								"aria-label": "Upload mill zip",
								onChange: (event) => {
									const file = event.target.files?.[0];
									event.target.value = "";
									runInstall(file);
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: hover ? "pack-drop on" : "pack-drop",
								disabled: busy !== "off",
								onClick: () => fileRef.current?.click(),
								onDragEnter: (event) => {
									event.preventDefault();
									setHover(true);
								},
								onDragOver: (event) => {
									event.preventDefault();
									setHover(true);
								},
								onDragLeave: () => setHover(false),
								onDrop: (event) => {
									event.preventDefault();
									setHover(false);
									runInstall(event.dataTransfer.files[0]);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 28 }), busy === "install" ? "Installing…" : "Upload zip from this phone"]
							})
						]
					})]
				}),
				note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "tv-update-ready",
					children: note
				}) : null,
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pack-error",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "tv-update-web",
					disabled: busy !== "off",
					onClick: () => void runWeb(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 16 }), "Refresh this TV"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "tv-update-back",
					children: "Back to the TV playlist"
				})
			]
		})
	});
}
//#endregion
export { UpdateTv as component };
