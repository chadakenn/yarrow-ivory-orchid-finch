import { o as __toESM } from "../_runtime.mjs";
import { a as MILL_COPY, i as DEFAULT_SETTINGS, s as PLANT_NAMES } from "./data-F7qCzk8B.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as useDisplayStore, E as ytdProduction, T as weeklyGraph, b as rankedProduction, m as formatWeekEnding, p as formatTons, s as applyAppUpdate, v as productionRecords } from "./store-COqNrb3J.mjs";
import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as Flag, d as RefreshCw, f as Presentation, g as KeyRound, h as MonitorPlay, l as Save, r as Trophy, t as Users, u as RotateCcw, x as Bell, y as CalendarClock } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useKioskSyncStatus } from "./router-DbzfnbCy.mjs";
import { a as removeDeck, n as cn, o as toggleDeck, r as importFiles, s as useMediaLibrary, t as MILL_HEX } from "./mills-BEzbeQad.mjs";
import { a as CartesianGrid, i as Line, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as LineChart } from "../_libs/recharts+[...].mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ControlRoom-CqNX-UY-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Button({ className, variant = "primary", size = "md", asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn("inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-tight transition-transform duration-[var(--motion-quick)] ease-[var(--ease-out)] disabled:opacity-50", size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm", variant === "primary" && "bg-accent text-accent-fg hover:opacity-90 active:scale-[0.98]", variant === "secondary" && "border border-border bg-elevated text-fg hover:bg-surface", variant === "ghost" && "text-muted hover:bg-elevated hover:text-fg", variant === "danger" && "bg-danger text-white hover:opacity-90", className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-accent/50", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-24 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-accent/50", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-muted", className),
		...props
	});
}
var PIN_KEY = "breakroom-admin-pin";
var PIN_REV_KEY = "breakroom-admin-pin-rev";
var UNLOCK_KEY = "breakroom-admin-unlocked";
var DEFAULT_PIN = "1231";
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
function writeAdminPin(pin) {
	try {
		localStorage.setItem(PIN_KEY, pin);
		localStorage.setItem(PIN_REV_KEY, pin);
	} catch {}
}
function emptyDraft() {
	return Object.fromEntries(PLANT_NAMES.map((name) => [name, ""]));
}
function plantsFromDraft(draft) {
	return PLANT_NAMES.map((name) => ({
		name,
		tons: Math.max(0, Number.parseFloat(draft[name] || "0") || 0)
	}));
}
var NAV = [
	{
		id: "production",
		label: "Production",
		icon: Trophy
	},
	{
		id: "slides",
		label: "Slides",
		icon: Presentation
	},
	{
		id: "board",
		label: "Plant pages",
		icon: Flag
	},
	{
		id: "people",
		label: "People",
		icon: Users
	},
	{
		id: "display",
		label: "Display",
		icon: CalendarClock
	}
];
function ControlRoom({ room = "office" }) {
	const [tab, setTab] = (0, import_react.useState)("production");
	const production = useDisplayStore((s) => s.production);
	const ranked = (0, import_react.useMemo)(() => rankedProduction(production.plants), [production.plants]);
	const ytd = (0, import_react.useMemo)(() => ytdProduction(production), [production]);
	const records = (0, import_react.useMemo)(() => productionRecords(production), [production]);
	const graph = (0, import_react.useMemo)(() => weeklyGraph(production, 12), [production]);
	const chartData = graph.weeks.map((week) => ({
		label: week.label,
		...week.values
	}));
	if (room === "admin") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {
		tab,
		setTab,
		admin: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpdatePanel, {})
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		tab,
		setTab,
		children: [
			tab === "production" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductionPanel, {
				ranked,
				ytd,
				chartData,
				graph,
				records
			}) : null,
			tab === "slides" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidesPanel, {}) : null,
			tab === "board" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardPanel, {}) : null,
			tab === "people" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeoplePanel, {}) : null,
			tab === "display" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayPanel, {}) : null
		]
	});
}
function Shell({ tab, setTab, admin, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "control-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "control-nav",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "control-brand",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "control-mark",
							children: "NB"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "control-brand-kicker",
							children: "North Baltimore"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "control-brand-title",
							children: "Breakroom Display"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncPill, {}),
					admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "control-links",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "control-link active",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { size: 16 }), "Admin"]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "control-links",
						children: NAV.map((item) => {
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: cn("control-link", tab === item.id && "active"),
								onClick: () => setTab(item.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 16 }), item.label]
							}, item.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "control-tv-btn",
						children: "Open TV display"
					}),
					admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/office",
						className: "control-admin-link",
						children: "Back to office page"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/admin",
						className: "control-admin-link",
						children: "Admin"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "control-topbar",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "control-brand",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "control-mark",
							children: "NB"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "control-brand-kicker",
							children: "Office page"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "control-brand-title",
							children: "Breakroom"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncPill, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "control-tv-btn",
						children: "Open TV"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "control-main",
				children
			}),
			admin ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "control-dock",
				"aria-label": "Office pages",
				children: NAV.map((item) => {
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: cn("control-dock-link", tab === item.id && "active"),
						onClick: () => setTab(item.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 18 }), item.label]
					}, item.id);
				})
			})
		]
	});
}
function SyncPill() {
	const { status } = useKioskSyncStatus();
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const shown = mounted ? status : "connecting";
	const label = shown === "saving" ? "Saving" : shown === "live" ? "Live" : shown === "error" ? "Retrying" : "Connecting";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("sync-pill", shown),
		children: label
	});
}
function AdminGate({ children }) {
	const [unlocked, setUnlocked] = (0, import_react.useState)(false);
	const [code, setCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		try {
			if (sessionStorage.getItem(UNLOCK_KEY) === "1") setUnlocked(true);
		} catch {}
	}, []);
	if (unlocked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pin-gate",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel",
			style: {
				maxWidth: 420,
				width: "100%"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Admin"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Admin" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lede",
					children: "Enter the mill code to change display settings, wipe numbers, or install a new app version."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (event) => {
						event.preventDefault();
						if (code.trim() === readAdminPin()) {
							try {
								sessionStorage.setItem(UNLOCK_KEY, "1");
							} catch {}
							setUnlocked(true);
							return;
						}
						setError("That code is wrong.");
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "admin-pin",
							children: "Admin code"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "admin-pin",
							className: "pin-input",
							inputMode: "numeric",
							autoComplete: "off",
							placeholder: "1231",
							value: code,
							onChange: (event) => {
								setCode(event.target.value);
								setError("");
							}
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pin-error",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "header-actions",
							style: { marginTop: 14 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Open Admin"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/office",
									children: "Back to office page"
								})
							})]
						})
					]
				})
			]
		})
	});
}
function ProductionPanel({ ranked, ytd, chartData, graph, records }) {
	const production = useDisplayStore((s) => s.production);
	const book = [...records.rows].sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "control-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "control-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Production"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Saturday tons" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lede",
						children: "Type the four mill totals, send them to the TV, then lock Saturday when the week is done."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "week-chip",
					children: ["Week ending ", formatWeekEnding(production.weekEnding)]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeeklyTonsForm, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryCorrection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "library-head",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Last 12 completed weeks" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "chart-legend",
							children: PLANT_NAMES.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
								className: "swatch",
								style: { background: MILL_HEX[name].stroke }
							}), MILL_COPY[name].short] }, name))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "trends-chart",
						style: { height: 240 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
								data: chartData,
								margin: {
									top: 8,
									right: 8,
									left: 0,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "rgba(232,237,243,0.08)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "label",
										stroke: "var(--color-muted)",
										fontSize: 12,
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										stroke: "var(--color-muted)",
										fontSize: 12,
										tickLine: false,
										axisLine: false,
										width: 48
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
									PLANT_NAMES.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
										type: "monotone",
										dataKey: name,
										stroke: MILL_HEX[name].stroke,
										strokeWidth: name === "North Baltimore" ? 3 : 2,
										dot: false
									}, name))
								]
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "lede",
						style: { marginTop: 8 },
						children: [
							graph.count,
							" closed weeks · ",
							ytd.year,
							" YTD leader ",
							ytd.ranked[0]?.name ?? "—",
							". This week ",
							ranked[0]?.name ?? "—",
							" leads the open board."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Wins and streaks" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mini-records",
					children: book.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("mini-record", row.our && "our"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
								index + 1,
								" ",
								row.name
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [row.wins, " wins"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["streak ", row.currentStreak] })
						]
					}, row.name))
				})]
			})
		]
	});
}
function WeeklyTonsForm() {
	const production = useDisplayStore((s) => s.production);
	const setAllPlantTons = useDisplayStore((s) => s.setAllPlantTons);
	const closeCurrentWeek = useDisplayStore((s) => s.closeCurrentWeek);
	const resetCurrentWeek = useDisplayStore((s) => s.resetCurrentWeek);
	const postAnnouncement = useDisplayStore((s) => s.postAnnouncement);
	const [draft, setDraft] = (0, import_react.useState)(emptyDraft());
	const [confirmLock, setConfirmLock] = (0, import_react.useState)(false);
	const [confirmReset, setConfirmReset] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setDraft(Object.fromEntries(production.plants.map((plant) => [plant.name, plant.tons ? String(plant.tons) : ""])));
		setConfirmLock(false);
		setConfirmReset(false);
	}, [production.plants, production.weekEnding]);
	const plants = plantsFromDraft(draft);
	const preview = rankedProduction(plants);
	const total = plants.reduce((sum, plant) => sum + plant.tons, 0);
	const dirty = PLANT_NAMES.some((name) => (plants.find((plant) => plant.name === name)?.tons ?? 0) !== (production.plants.find((plant) => plant.name === name)?.tons ?? 0));
	const leader = preview[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel tons-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "library-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Enter Saturday tons" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lede",
					children: "Numbers update the order as you type. Send when it looks right."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "office-live-total",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatTons(total) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: leader && total > 0 ? `${leader.name} leads` : "No tons yet" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "ton-grid",
				children: PLANT_NAMES.map((name) => {
					const row = preview.find((item) => item.name === name);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: cn("ton-card", name === "North Baltimore" && "ours", row?.rank === 1 && total > 0 && "is-lead"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ton-head",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "swatch",
									style: { background: MILL_HEX[name].stroke }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: name }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: MILL_COPY[name].short }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ton-rank",
									children: total > 0 && row ? `${row.rank}` : "—"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "ton-input",
							inputMode: "decimal",
							placeholder: "0",
							value: draft[name],
							onChange: (event) => {
								setDraft((prev) => ({
									...prev,
									[name]: event.target.value
								}));
								setConfirmLock(false);
							}
						})]
					}, name);
				})
			}),
			total > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "office-standings",
				"aria-label": "Live order",
				children: preview.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: cn(row.our && "our"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: row.rank }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.name }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: row.tonsDisplay })
					]
				}, row.name))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "header-actions tons-actions",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: !dirty,
						onClick: () => {
							setAllPlantTons(plants);
							toast.success("Tons sent to the TV.");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 16 }), dirty ? "Send to TV" : "On the TV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: confirmLock ? "danger" : "secondary",
						onClick: () => {
							if (!confirmLock) {
								setConfirmLock(true);
								return;
							}
							const result = closeCurrentWeek();
							setConfirmLock(false);
							if (result.ok) {
								toast.success("Saturday is locked. New week starts at zero.");
								if (result.nbWin) postAnnouncement(`NORTH BALTIMORE LOCKS SATURDAY · ${result.tonsDisplay} TONS. THE MAP IS OURS.`, "celebration", 6);
							} else toast.error(result.message);
						},
						children: confirmLock ? "Tap again to lock Saturday" : "Lock Saturday"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => {
							if (!confirmReset) {
								setConfirmReset(true);
								return;
							}
							resetCurrentWeek();
							setConfirmReset(false);
							toast.success("This week is back to zero.");
						},
						children: confirmReset ? "Tap again to reset" : "Reset this week"
					})
				]
			})
		]
	});
}
function HistoryCorrection() {
	const production = useDisplayStore((s) => s.production);
	const updateHistoryWeek = useDisplayStore((s) => s.updateHistoryWeek);
	const weeks = (0, import_react.useMemo)(() => production.history.slice().sort((a, b) => b.weekEnding.localeCompare(a.weekEnding)).slice(0, 16), [production.history]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [weekId, setWeekId] = (0, import_react.useState)(weeks[0]?.id ?? "");
	const selected = weeks.find((week) => week.id === weekId) ?? weeks[0];
	const selectedKey = selected ? `${selected.id}:${selected.plants.map((plant) => `${plant.name}:${plant.tons}`).join("|")}` : "";
	const [draft, setDraft] = (0, import_react.useState)(emptyDraft());
	(0, import_react.useEffect)(() => {
		if (!weeks.some((week) => week.id === weekId) && weeks[0]) setWeekId(weeks[0].id);
	}, [weekId, weeks]);
	(0, import_react.useEffect)(() => {
		const week = weeks.find((entry) => `${entry.id}:${entry.plants.map((plant) => `${plant.name}:${plant.tons}`).join("|")}` === selectedKey);
		if (!week) {
			setDraft(emptyDraft());
			return;
		}
		setDraft(Object.fromEntries(week.plants.map((plant) => [plant.name, plant.tons ? String(plant.tons) : ""])));
	}, [selectedKey, weeks]);
	if (!weeks.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel tons-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "correction-toggle",
			onClick: () => setOpen((value) => !value),
			"aria-expanded": open,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Fix a locked Saturday" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Only if last week was typed wrong. Map and records rebuild from the new totals." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: open ? "Hide" : "Open" })]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "library-head",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "select",
					value: selected?.id ?? "",
					onChange: (event) => setWeekId(event.target.value),
					"aria-label": "Locked Saturday",
					children: weeks.map((week) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: week.id,
						children: [
							formatWeekEnding(week.weekEnding),
							" · ",
							week.winners.join(" & ")
						]
					}, week.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "ton-grid",
				children: PLANT_NAMES.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: cn("ton-card", name === "North Baltimore" && "ours"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ton-head",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "swatch",
							style: { background: MILL_HEX[name].stroke }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: name })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "ton-input",
						inputMode: "decimal",
						placeholder: "0",
						value: draft[name],
						onChange: (event) => setDraft((prev) => ({
							...prev,
							[name]: event.target.value
						}))
					})]
				}, name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "header-actions",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => {
						if (!selected) return;
						const next = plantsFromDraft(draft);
						if (next.reduce((sum, plant) => sum + plant.tons, 0) <= 0) {
							toast.error("Enter tons before saving the correction.");
							return;
						}
						updateHistoryWeek(selected.id, next);
						toast.success("Saturday corrected. Map and records updated.");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 16 }), "Save correction"]
				})
			})
		] }) : null]
	});
}
function SlidesPanel() {
	const { decks, ready } = useMediaLibrary();
	const [over, setOver] = (0, import_react.useState)(false);
	const onFiles = async (files) => {
		try {
			await importFiles(files, (label) => toast.message(label));
			toast.success("Slides are on the TV.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not read that file.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "control-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "control-header",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Slides"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "PowerPoint on the TV" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lede",
						children: "Drop a .pptx, PDF, or image. It plays before the production boards."
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: cn("upload-drop", over && "over", !ready && "busy"),
				onDragOver: (event) => {
					event.preventDefault();
					setOver(true);
				},
				onDragLeave: () => setOver(false),
				onDrop: (event) => {
					event.preventDefault();
					setOver(false);
					onFiles([...event.dataTransfer.files]);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presentation, { size: 28 }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Drop a PowerPoint here" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PPTX, PDF, or images" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						hidden: true,
						multiple: true,
						accept: ".pptx,.pdf,image/*",
						onChange: (event) => {
							onFiles([...event.target.files ?? []]);
							event.target.value = "";
						}
					})
				]
			}),
			decks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "library-list",
				children: decks.map((deck) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("library-item", deck.enabled && "on"),
					children: [
						deck.slides[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: deck.slides[0].src,
							alt: "",
							className: "library-thumb"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "library-thumb" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "library-name",
							children: [deck.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "lede",
								children: [
									deck.slides.length,
									" slide",
									deck.slides.length === 1 ? "" : "s"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => void toggleDeck(deck.id, !deck.enabled),
							children: deck.enabled ? "On TV" : "Off"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => void removeDeck(deck.id),
							children: "Remove"
						})
					]
				}, deck.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "empty-note",
				children: "No slides yet. Drop a PowerPoint and it plays before the production boards."
			})
		]
	});
}
var BOARD_FIELDS = [
	{
		key: "title",
		label: "Title"
	},
	{
		key: "subtitle",
		label: "Subtitle"
	},
	{
		key: "goalText",
		label: "Today's goal"
	},
	{
		key: "todayFocus",
		label: "Today's focus"
	},
	{
		key: "safetyFocus",
		label: "Safety focus"
	},
	{
		key: "maintenance",
		label: "Maintenance"
	},
	{
		key: "shipping",
		label: "Shipping / loads"
	},
	{
		key: "staffing",
		label: "Staffing / coverage"
	},
	{
		key: "managerNote",
		label: "Manager note"
	}
];
function BoardPanel() {
	const board = useDisplayStore((s) => s.plantBoard);
	const setPlantBoard = useDisplayStore((s) => s.setPlantBoard);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "control-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "control-header",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Plant pages"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "North Baltimore board" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lede",
					children: "What the mill needs to see today. Empty fields stay off the TV."
				})
			] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "check-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: board.enabled,
						onChange: (event) => setPlantBoard({
							...board,
							enabled: event.target.checked,
							updatedAt: Date.now()
						})
					}), "Show plant board on the TV"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lede",
					style: { marginTop: 8 },
					children: board.updatedAt ? `Last saved ${new Date(board.updatedAt).toLocaleString()}` : "Not sent yet. Type below and it saves as you go."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "form-grid",
					style: { marginTop: 16 },
					children: BOARD_FIELDS.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: field.label }), field.key === "managerNote" || field.key === "todayFocus" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: String(board[field.key] ?? ""),
						onChange: (event) => setPlantBoard({
							...board,
							[field.key]: event.target.value,
							updatedAt: Date.now()
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: String(board[field.key] ?? ""),
						onChange: (event) => setPlantBoard({
							...board,
							[field.key]: event.target.value,
							updatedAt: Date.now()
						})
					})] }, field.key))
				})
			]
		})]
	});
}
function PeoplePanel() {
	const people = useDisplayStore((s) => s.people);
	const addPerson = useDisplayStore((s) => s.addPerson);
	const updatePerson = useDisplayStore((s) => s.updatePerson);
	const removePerson = useDisplayStore((s) => s.removePerson);
	const [draft, setDraft] = (0, import_react.useState)({
		name: "",
		kind: "recognition",
		date: "",
		message: ""
	});
	(0, import_react.useEffect)(() => {
		setDraft((prev) => prev.date ? prev : {
			...prev,
			date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "control-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "control-header",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "People"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Birthdays and shout-outs" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lede",
						children: "They rotate on the TV after production and the map."
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "form-grid",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.name,
							onChange: (event) => setDraft((prev) => ({
								...prev,
								name: event.target.value
							}))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "select",
							value: draft.kind,
							onChange: (event) => setDraft((prev) => ({
								...prev,
								kind: event.target.value
							})),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "recognition",
								children: "Recognition"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "birthday",
								children: "Birthday"
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: draft.date,
							onChange: (event) => setDraft((prev) => ({
								...prev,
								date: event.target.value
							}))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Message" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.message,
							onChange: (event) => setDraft((prev) => ({
								...prev,
								message: event.target.value
							}))
						})] })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "header-actions",
					style: { marginTop: 14 },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							if (!draft.name.trim()) {
								toast.error("Add a name.");
								return;
							}
							addPerson({
								kind: draft.kind,
								name: draft.name.trim(),
								date: draft.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
								endDate: "",
								message: draft.message.trim(),
								enabled: true
							});
							setDraft({
								name: "",
								kind: "recognition",
								date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
								message: ""
							});
							toast.success("On the TV.");
						},
						children: "Add to TV"
					})
				})]
			}),
			people.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "people-list",
				children: people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("people-card", person.enabled && "on"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "people-kind",
							children: person.kind
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "people-name",
							children: person.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "people-meta",
							children: [person.date || "No date", person.message ? ` · ${person.message}` : ""]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "people-actions",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => updatePerson(person.id, { enabled: !person.enabled }),
							children: person.enabled ? "On TV" : "Off"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => removePerson(person.id),
							children: "Remove"
						})]
					})]
				}, person.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "empty-note",
				children: "Nobody on the TV yet. Add a birthday or shout-out above."
			})
		]
	});
}
function DisplayPanel() {
	const settings = useDisplayStore((s) => s.settings);
	const setSettings = useDisplayStore((s) => s.setSettings);
	const announcement = useDisplayStore((s) => s.announcement);
	const postAnnouncement = useDisplayStore((s) => s.postAnnouncement);
	const clearAnnouncement = useDisplayStore((s) => s.clearAnnouncement);
	const [message, setMessage] = (0, import_react.useState)("");
	const [minutes, setMinutes] = (0, import_react.useState)("5");
	const [kind, setKind] = (0, import_react.useState)("info");
	const live = announcement && announcement.expiresAt > Date.now() ? announcement : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "control-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "control-header",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Display"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Clock, ticker, slide time" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lede",
						children: "How long boards stay on the TV, plus the clock and a takeover message."
					})
				] })
			}),
			live ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "live-announce panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "eyebrow",
					children: "On the TV now"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: live.message })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => {
						clearAnnouncement();
						toast.success("TV is back to the playlist.");
					},
					children: "Clear now"
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Take over the TV" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: message,
						onChange: (event) => setMessage(event.target.value),
						placeholder: "Message for the breakroom"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "header-actions",
						style: { marginTop: 14 },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "select",
								style: { maxWidth: 160 },
								value: kind,
								onChange: (event) => setKind(event.target.value),
								"aria-label": "Message type",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "info",
										children: "Info"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "safety",
										children: "Safety"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "urgent",
										children: "Urgent"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								style: { maxWidth: 100 },
								inputMode: "numeric",
								value: minutes,
								onChange: (event) => setMinutes(event.target.value),
								"aria-label": "Minutes"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => {
									if (!message.trim()) {
										toast.error("Type a message.");
										return;
									}
									postAnnouncement(message.trim(), kind, Math.max(1, Number(minutes) || 5));
									toast.success("TV is showing the message.");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { size: 16 }), "Send"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lede",
						style: { marginTop: 8 },
						children: "Minutes the message stays up. Safety and urgent change the TV color."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Clock and ticker" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "check-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: settings.clockEnabled,
							onChange: (event) => setSettings({ clockEnabled: event.target.checked })
						}), "Show clock"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "check-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: settings.ticker.enabled,
							onChange: (event) => setSettings({ ticker: {
								...settings.ticker,
								enabled: event.target.checked
							} })
						}), "Show ticker"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ticker copy" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: settings.ticker.message,
						onChange: (event) => setSettings({ ticker: {
							...settings.ticker,
							message: event.target.value
						} })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlideTimingPanel, {})
		]
	});
}
var SLIDE_TIMES = [
	{
		key: "presentation",
		label: "PowerPoint slides",
		hint: "Each photo or PPTX page"
	},
	{
		key: "productionWeekly",
		label: "Championship",
		hint: "This week’s tons"
	},
	{
		key: "productionYtd",
		label: "Year to date",
		hint: "Season totals"
	},
	{
		key: "productionTrends",
		label: "Trends",
		hint: "Last 12 weeks"
	},
	{
		key: "productionRecords",
		label: "Records & streaks",
		hint: "Wins and best weeks"
	},
	{
		key: "conquest",
		label: "Conquest map",
		hint: "Give the map time to read"
	},
	{
		key: "plantBoard",
		label: "Plant board",
		hint: "Today’s mill notes"
	},
	{
		key: "people",
		label: "Birthdays & shout-outs",
		hint: "Each person"
	}
];
var MIN_HOLD = 4;
var MAX_HOLD = 90;
function clampHold(value) {
	if (!Number.isFinite(value)) return MIN_HOLD;
	return Math.min(MAX_HOLD, Math.max(MIN_HOLD, Math.round(value)));
}
function SlideTimingPanel() {
	const settings = useDisplayStore((s) => s.settings);
	const setSettings = useDisplayStore((s) => s.setSettings);
	const durations = {
		...DEFAULT_SETTINGS.durations,
		...settings.durations
	};
	const bump = (key, delta) => {
		const current = useDisplayStore.getState().settings;
		const next = {
			...DEFAULT_SETTINGS.durations,
			...current.durations
		};
		setSettings({ durations: {
			...next,
			[key]: clampHold((next[key] ?? MIN_HOLD) + delta)
		} });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "library-head",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "How long each slide stays" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lede",
				children: "The breakroom TV uses these times. Changes hit the playlist on the next slide."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => {
					setSettings({ durations: { ...DEFAULT_SETTINGS.durations } });
					toast.success("Slide times are back to the mill defaults.");
				},
				children: "Reset times"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "timing-list",
			children: SLIDE_TIMES.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "timing-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: row.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.hint })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "timing-step",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `Shorter ${row.label}`,
							onClick: () => bump(row.key, -2),
							disabled: durations[row.key] <= MIN_HOLD,
							children: "−"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							className: "timing-value",
							children: [durations[row.key], /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "sec" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `Longer ${row.label}`,
							onClick: () => bump(row.key, 2),
							disabled: durations[row.key] >= MAX_HOLD,
							children: "+"
						})
					]
				})]
			}, row.key))
		})]
	});
}
function UpdatePanel() {
	const resetDemo = useDisplayStore((s) => s.resetDemo);
	const resetAllProduction = useDisplayStore((s) => s.resetAllProduction);
	const production = useDisplayStore((s) => s.production);
	const { status } = useKioskSyncStatus();
	const [pin, setPin] = (0, import_react.useState)("");
	const [confirmReset, setConfirmReset] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setPin(readAdminPin());
	}, []);
	const loadNewApp = async () => {
		toast.success("Loading the new app…");
		await applyAppUpdate("/");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "control-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "control-header",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Admin only"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Update" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lede",
						children: "Bookmark the TV update page on the Pi. After we ship a change, open it and load the new app. The playlist comes back by itself."
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stat-grid three",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "stat-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "stat-label",
								children: "TV"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "stat-value",
								children: status === "live" || status === "saving" ? "Live" : "Waiting"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "stat-sub",
								children: "Pi display should stay on the TV page, fullscreen"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "stat-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "stat-label",
								children: "Open week"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "stat-value",
								children: formatWeekEnding(production.weekEnding)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "stat-sub",
								children: [production.plants.reduce((sum, plant) => sum + plant.tons, 0).toLocaleString(), " tons typed so far"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "stat-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "stat-label",
								children: "History"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "stat-value",
								children: production.history.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "stat-sub",
								children: "Completed Saturdays on the board"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Install the mill TV" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "how-strip",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "On the Pi, open the TV display and go fullscreen. Leave it there." })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Phones join mill Wi‑Fi and use the office page for tons, slides, and plant pages." })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "When we change the app, open Update TV on your phone, download the mill zip, then upload that zip. The Pi TV refreshes." })] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "header-actions",
						style: { marginTop: 16 },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => void loadNewApp(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 16 }), "Load new app"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/update",
									children: "Open TV update page"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/",
									children: "Open TV display"
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Reset production numbers" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lede",
						children: "Wipes this week and every Saturday in history. The conquest map starts even again. Use this when you first install, or to start a new season."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "header-actions",
						style: { marginTop: 16 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: confirmReset ? "danger" : "secondary",
							onClick: () => {
								if (!confirmReset) {
									setConfirmReset(true);
									return;
								}
								resetAllProduction();
								setConfirmReset(false);
								toast.success("All production numbers are cleared. TV will catch up.");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 16 }), confirmReset ? "Tap again to wipe all tons" : "Reset all production numbers"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => {
								resetDemo();
								setConfirmReset(false);
								toast.success("Demo numbers are back on the TV.");
							},
							children: "Restore demo numbers"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Admin code" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lede",
						children: "Change this so only you can open Admin. Keep it off the office phones."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "header-actions",
						style: { marginTop: 14 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "pin-input",
							inputMode: "numeric",
							autoComplete: "off",
							value: pin,
							onChange: (event) => setPin(event.target.value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => {
								const next = pin.trim();
								if (next.length < 4) {
									toast.error("Use at least 4 numbers.");
									return;
								}
								writeAdminPin(next);
								toast.success("Admin code saved on this browser.");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { size: 16 }), "Save code"]
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { ControlRoom as t };
