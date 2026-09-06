import { o as __toESM } from "../_runtime.mjs";
import { o as OUR_PLANT, s as PLANT_NAMES } from "./data-F7qCzk8B.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as format } from "../_libs/date-fns.mjs";
import { C as useDisplayStore, E as ytdProduction, S as territoryGeometry, T as weeklyGraph, _ as makeArrowPath, a as TERRITORY_BY_ID, b as rankedProduction, c as capitalOf, d as continentBounds, f as countBoard, g as lastClosedPair, h as islandPath, i as REGION_ORDER, l as captureLabelPoint, m as formatWeekEnding, n as LAND_SRC, o as VOID_SRC, r as MAP_VIEW, s as applyAppUpdate, u as conquestContext, v as productionRecords, w as visibleCaptures, x as remoteAppBuild, y as rankChangeTrends } from "./store-COqNrb3J.mjs";
import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as Award, _ as Flag, a as SkipForward, b as Cake, c as Settings2, m as Pause, o as SkipBack, p as Play, s as Shield } from "../_libs/lucide-react.mjs";
import { i as initials, n as cn, s as useMediaLibrary, t as MILL_HEX } from "./mills-BEzbeQad.mjs";
import { a as CartesianGrid, i as Line, n as YAxis, o as ResponsiveContainer, r as XAxis, t as LineChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BkmjczF3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PigGlyph({ fill = "currentColor" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		fill,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12.5 33c-3.4-1.8-6.2-.6-7.4 2.2 2.2.8 4.6.6 7.6-.4z" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "30",
				cy: "38",
				rx: "16.5",
				ry: "13.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "46.5",
				cy: "33.5",
				r: "11.2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "56.4",
				cy: "35.8",
				rx: "6.2",
				ry: "5.1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M40.2 25.4 L46.2 11.6 L53.4 26.2 Z" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "20.2",
				y: "48.4",
				width: "6.2",
				height: "9.2",
				rx: "2.1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "32.4",
				y: "48.6",
				width: "6.2",
				height: "9",
				rx: "2.1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "43",
				y: "46.4",
				width: "5.6",
				height: "8.4",
				rx: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "49.2",
				cy: "31.4",
				r: "1.7",
				fill: "#1a140c"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "58.4",
				cy: "35.2",
				rx: "1.15",
				ry: "1.55",
				fill: "#1a140c"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "55.6",
				cy: "35.4",
				rx: "1.05",
				ry: "1.45",
				fill: "#1a140c"
			})
		]
	});
}
function PigMark({ fill = "currentColor", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 64 64",
		width: "64",
		height: "64",
		className,
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PigGlyph, { fill })
	});
}
function MillCrest({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 96 112",
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "crest-gold",
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#f4e2b0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "45%",
						stopColor: "#d7b56a"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#8d6a32"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "crest-metal",
				x1: "0",
				y1: "0",
				x2: "1",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: "#2a241c"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: "#0d0b09"
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 78 C16 92 32 102 48 108 C64 102 80 92 80 78 L80 34 C68 38 56 28 48 22 C40 28 28 38 16 34 Z",
				fill: "url(#crest-metal)",
				stroke: "url(#crest-gold)",
				strokeWidth: "2.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M22 72 C22 84 34 93 48 98 C62 93 74 84 74 72 L74 40 C64 43 55 35 48 30 C41 35 32 43 22 40 Z",
				fill: "#16120e",
				stroke: "url(#crest-gold)",
				strokeWidth: "1.1",
				opacity: "0.95"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				transform: "translate(16 34)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PigGlyph, { fill: "#f3efe4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M30 18 L48 8 L66 18 L60 22 L48 14 L36 22 Z",
				fill: "url(#crest-gold)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M44 8 L48 2 L52 8 Z",
				fill: "url(#crest-gold)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M14 44 C8 56 10 78 22 92",
				fill: "none",
				stroke: "url(#crest-gold)",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M82 44 C88 56 86 78 74 92",
				fill: "none",
				stroke: "url(#crest-gold)",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M18 50 C12 60 14 74 24 84",
				fill: "none",
				stroke: "url(#crest-gold)",
				strokeWidth: "1.2",
				opacity: "0.7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M78 50 C84 60 82 74 72 84",
				fill: "none",
				stroke: "url(#crest-gold)",
				strokeWidth: "1.2",
				opacity: "0.7"
			})
		]
	});
}
function TargetMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 64 64",
		width: "64",
		height: "64",
		className,
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "32",
					cy: "32",
					r: "20"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "32",
					cy: "32",
					r: "10"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M32 6 V16 M32 48 V58 M6 32 H16 M48 32 H58" })
			]
		})
	});
}
function TrophyMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 64 64",
		width: "64",
		height: "64",
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M18 14 H46 V24 C46 34 40 40 32 40 C24 40 18 34 18 24 Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M46 16 H54 C56 16 58 18 58 22 C58 30 50 34 46 34",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M18 16 H10 C8 16 6 18 6 22 C6 30 14 34 18 34",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M28 40 H36 L38 52 H26 Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "20",
				y: "52",
				width: "24",
				height: "5",
				rx: "1.5",
				fill: "currentColor"
			})
		]
	});
}
var MILL_SHORT = {
	"North Baltimore": "NB",
	Henderson: "HEN",
	Marshville: "MAR",
	Albertville: "ALB"
};
function PigFlag({ x, y, color, scale = 1 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		transform: `translate(${Math.round(x)} ${Math.round(y)}) scale(${scale})`,
		className: "cq-flag",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: 4,
				cy: 18,
				rx: 7,
				ry: 2.2,
				fill: "rgba(0,0,0,.35)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: 0,
				y1: -16,
				x2: 0,
				y2: 18,
				className: "cq-flag-pole"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M1.2 -15 C10 -18 16 -12 26 -16 L26 -2 C16 -3 10 3 1.2 1.4 Z",
				fill: color,
				className: "cq-flag-cloth"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				transform: "translate(5.2 -14.6) scale(0.22)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PigGlyph, { fill: "#f4f0e6" })
			})
		]
	});
}
function MillName({ name, x, y, compact }) {
	const cls = compact ? "cq-label-name cq-compact" : "cq-label-name";
	if (name === "North Baltimore") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x,
		y: y - (compact ? 11 : 14),
		className: cls,
		children: "NORTH"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x,
		y: y + (compact ? 9 : 12),
		className: cls,
		children: "BALTIMORE"
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x,
		y,
		className: cls,
		children: name.toUpperCase()
	});
}
function PlaceName({ name, x, y }) {
	const parts = name.toUpperCase().split(" ");
	if (parts.length > 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x,
		y: y - 7,
		className: "cq-prov-name",
		children: parts[0]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x,
		y: y + 8,
		className: "cq-prov-name",
		children: parts.slice(1).join(" ")
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x,
		y,
		className: "cq-prov-name",
		children: parts[0]
	});
}
function MarchArrow({ d, color, delay, duration }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: "cq-arrow-token",
		style: {
			offsetPath: `path('${d}')`,
			["--cq-delay"]: delay,
			["--cq-dur"]: duration
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M -6 -14 L 22 0 L -6 14 L 2 0 Z",
			fill: color
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M -24 -14 L 4 0 L -24 14 L -16 0 Z",
			fill: color,
			opacity: .88
		})]
	});
}
function Burst({ x, y }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		transform: `translate(${Math.round(x)} ${Math.round(y)})`,
		className: "cq-burst",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				r: 6,
				className: "cq-burst-core"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				r: 18,
				className: "cq-burst-ring"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				r: 32,
				className: "cq-burst-halo"
			}),
			[
				0,
				45,
				90,
				135,
				180,
				225,
				270,
				315
			].map((deg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M0 -8 L2 -22 L0 -28 L-2 -22 Z",
				className: "cq-burst-ray",
				transform: `rotate(${deg})`
			}, deg))
		]
	});
}
function mixToward(from, to, t) {
	return [from[0] * (1 - t) + to[0] * t, from[1] * (1 - t) + to[1] * t];
}
function IncomingCapture({ cap, from, taken }) {
	const tone = MILL_HEX[cap.winner];
	const [labelX, labelY] = captureLabelPoint(from, taken);
	const pillW = 188;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: "cq-incoming",
		style: { ["--takeover-glow"]: tone.glow },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: taken.path,
				fill: tone.stroke,
				className: "cq-chunk-glow"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: taken.path,
				fill: "none",
				stroke: tone.stroke,
				className: "cq-taken-ring"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Burst, {
				x: taken.centroid[0],
				y: taken.centroid[1]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PigFlag, {
				x: taken.centroid[0] + 10,
				y: taken.centroid[1] - 8,
				color: tone.stroke,
				scale: .66
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				className: "cq-capture-callout",
				transform: `translate(${labelX} ${labelY})`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: -94,
						y: -16,
						width: pillW,
						height: 38,
						rx: 8,
						className: "cq-capture-pill"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
						x: 0,
						y: 0,
						className: "cq-capture-label",
						children: [MILL_SHORT[cap.winner], " TAKES"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: 0,
						y: 14,
						className: "cq-capture-sub",
						children: cap.territoryName.toUpperCase()
					})
				]
			})
		]
	});
}
function ConquestMap({ territories, transfers, owners, mode, live }) {
	const lookup = (0, import_react.useMemo)(() => Object.fromEntries(territories.map((row) => [row.name, row])), [territories]);
	const geom = (0, import_react.useMemo)(() => territoryGeometry(), []);
	const held = (0, import_react.useMemo)(() => countBoard(owners), [owners]);
	const captures = (0, import_react.useMemo)(() => visibleCaptures(transfers), [transfers]);
	const takenIds = (0, import_react.useMemo)(() => new Set(captures.map((cap) => cap.territoryId)), [captures]);
	const continentBoxes = (0, import_react.useMemo)(() => Object.fromEntries(REGION_ORDER.map((name) => [name, continentBounds(name)])), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: live ? "conquest-map-svg is-live" : "conquest-map-svg",
		viewBox: `0 0 ${MAP_VIEW.w} ${MAP_VIEW.h}`,
		preserveAspectRatio: "xMidYMid meet",
		"aria-label": "Mill conquest map",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "cq-nb",
					x1: "0",
					y1: "0",
					x2: "1",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#145fbd"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#0a2748"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "cq-marshville",
					x1: "0",
					y1: "0",
					x2: "1",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#496f2d"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#142519"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "cq-henderson",
					x1: "0",
					y1: "0",
					x2: "1",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#7c2b25"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#281311"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "cq-albertville",
					x1: "0",
					y1: "0",
					x2: "1",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#67369d"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#21152f"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
					id: "cq-label-shade",
					cx: "50%",
					cy: "50%",
					r: "50%",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "rgba(4,6,10,.72)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "70%",
							stopColor: "rgba(4,6,10,.28)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "rgba(4,6,10,0)"
						})
					]
				}),
				Object.values(geom).map((view) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
					id: `cq-prov-${view.id}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: view.path })
				}, `clip-${view.id}`))
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				className: "cq-water",
				x: 0,
				y: 0,
				width: MAP_VIEW.w,
				height: MAP_VIEW.h,
				rx: 10
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("image", {
				href: VOID_SRC,
				x: 0,
				y: 0,
				width: MAP_VIEW.w,
				height: MAP_VIEW.h,
				preserveAspectRatio: "xMidYMid slice",
				opacity: .42
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 0,
				y: 0,
				width: MAP_VIEW.w,
				height: MAP_VIEW.h,
				fill: "rgba(4,6,10,.42)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: islandPath(),
				className: "cq-island"
			}),
			Object.values(geom).map((view) => {
				const owner = owners[view.id] ?? view.home;
				const tone = MILL_HEX[owner];
				const [minX, minY, maxX, maxY] = continentBoxes[view.home];
				const bw = Math.max(80, maxX - minX);
				const bh = Math.max(80, maxY - minY);
				const enemyFront = view.neighbors.some((nid) => (owners[nid] ?? TERRITORY_BY_ID[nid]?.home) !== owner);
				const taken = takenIds.has(view.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: "cq-region",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: view.path,
							className: "cq-land-shadow",
							transform: "translate(3 8)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: view.path,
							fill: `url(#cq-${tone.token})`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							clipPath: `url(#cq-prov-${view.id})`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("image", {
									href: LAND_SRC[owner],
									x: minX - bw * .04,
									y: minY - bh * .04,
									width: bw * 1.08,
									height: bh * 1.08,
									preserveAspectRatio: "xMidYMid slice"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
									x: minX - 12,
									y: minY - 12,
									width: bw + 24,
									height: bh + 24,
									fill: tone.dark,
									opacity: owner === view.home ? .22 : .52
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
									x: minX - 12,
									y: minY - 12,
									width: bw + 24,
									height: bh + 24,
									fill: tone.stroke,
									opacity: owner === view.home ? .14 : .42,
									style: { mixBlendMode: "color" }
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: view.path,
							fill: "none",
							stroke: taken ? tone.accent : tone.stroke,
							className: taken ? "cq-land cq-leader" : enemyFront ? "cq-land cq-front" : "cq-land cq-internal",
							style: { ["--cq-glow"]: tone.glow }
						})
					]
				}, view.id);
			}),
			Object.values(geom).map((view) => {
				const owner = owners[view.id] ?? view.home;
				if (owner === view.home) return null;
				const tone = MILL_HEX[owner];
				const hqTooClose = REGION_ORDER.some((mill) => {
					const cap = geom[capitalOf(mill).id];
					return Math.hypot(view.label[0] - cap.label[0], view.label[1] - cap.label[1]) < 92;
				});
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [hqTooClose || takenIds.has(view.id) ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceName, {
					name: view.name,
					x: view.label[0],
					y: view.label[1]
				}), takenIds.has(view.id) ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: view.centroid[0],
					cy: view.centroid[1] + (hqTooClose ? 0 : 18),
					r: 4.2,
					fill: tone.stroke,
					stroke: "#070c12",
					strokeWidth: 1.15
				})] }, `occ-${view.id}`);
			}),
			REGION_ORDER.map((name) => {
				const spec = capitalOf(name);
				const view = geom[spec.id];
				const row = lookup[name];
				const tone = MILL_HEX[name];
				const isOurs = name === OUR_PLANT;
				const leader = mode === "season" ? Boolean(row?.seasonLeader) : Boolean(row?.leader);
				const tons = mode === "season" ? row?.ytdTonsDisplay ?? "0" : row?.weeklyTonsDisplay ?? "0";
				const tonsLabel = mode === "season" ? "YTD TONS" : "WEEKLY TONS";
				const count = held[name] ?? 0;
				const compact = count <= 2;
				const nameY = isOurs && !compact ? view.label[1] - 8 : view.label[1];
				const statY = isOurs && !compact ? view.label[1] + 42 : view.label[1] + (compact ? 22 : 30);
				const flagX = view.centroid[0] + (name === "Henderson" || name === "Albertville" ? -78 : 72);
				const flagY = view.centroid[1] - (compact ? 28 : 40);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: view.label[0],
						cy: view.label[1] + 6,
						rx: compact ? 108 : isOurs ? 150 : 132,
						ry: compact ? 58 : isOurs ? 84 : 72,
						fill: "url(#cq-label-shade)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MillName, {
						name,
						x: view.label[0],
						y: nameY,
						compact
					}),
					isOurs && !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: view.label[0] - 54,
						y: view.label[1] + 18,
						width: 108,
						height: 18,
						rx: 9,
						className: "cq-our-ribbon"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: view.label[0],
						y: view.label[1] + 31,
						className: "cq-label-our",
						children: "OUR MILL"
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: view.label[0],
						y: statY,
						className: "cq-label-small",
						children: compact ? "ARMIES" : tonsLabel
					}),
					compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: view.label[0],
						y: statY + 28,
						className: "cq-label-tons",
						children: tons
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						transform: `translate(${view.label[0] + (compact ? 0 : isOurs ? 78 : 70)} ${compact ? statY + 28 : statY + 10})`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								r: compact ? 15 : 16,
								className: leader ? "cq-army-disc is-lead" : "cq-army-disc",
								style: { ["--cq-glow"]: tone.glow }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								r: compact ? 15 : 16,
								fill: tone.dark,
								stroke: tone.stroke,
								strokeWidth: 2.2
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								y: 5,
								className: "cq-army-num",
								children: count
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PigFlag, {
						x: flagX,
						y: flagY,
						color: tone.stroke,
						scale: compact ? .64 : .72
					})
				] }, `hq-${name}`);
			}),
			captures.map((cap) => {
				const from = geom[cap.fromId];
				const taken = geom[cap.territoryId];
				if (!from || !taken) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IncomingCapture, {
					cap,
					from,
					taken
				}, `cap-${cap.territoryId}`);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				className: "cq-attacks",
				children: captures.map((cap) => {
					const from = geom[cap.fromId];
					const taken = geom[cap.territoryId];
					if (!from || !taken) return null;
					const start = mixToward(from.centroid, taken.centroid, .16);
					const end = mixToward(taken.centroid, from.centroid, .18);
					const route = makeArrowPath(start, end, cap.major ? 22 : -16);
					const tone = MILL_HEX[cap.winner];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						style: { ["--takeover-glow"]: tone.glow },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: route,
								stroke: tone.stroke,
								className: "cq-takeover-route"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarchArrow, {
								d: route,
								color: tone.stroke,
								delay: cap.major ? "0.12s" : "0.9s",
								duration: cap.major ? "2.4s" : "2.9s"
							}),
							cap.major ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarchArrow, {
								d: route,
								color: tone.stroke,
								delay: "1.05s",
								duration: "2.2s"
							}) : null
						]
					}, `atk-${cap.territoryId}`);
				})
			})
		]
	});
}
function DeckSlide({ src, title, page, pages }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "deck-board",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: `${title} slide ${page}`,
			className: "deck-image"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "deck-caption",
			children: [
				title,
				" · ",
				page,
				"/",
				pages
			]
		})]
	});
}
function ProductionSlide({ title, period, metric, plants, showWins }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "production-board",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "production-head",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "production-eyebrow",
					children: "PIG FEED · MULTI-MILL PRODUCTION"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "production-title",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "production-sub",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: metric }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", period] })]
				})
			]
		}), plants.map((plant) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `production-row rank-${plant.rank}${plant.our ? " our" : ""}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "production-place",
					children: plant.rank
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "production-main",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "production-name-line",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "production-name",
								children: plant.name
							}), plant.our ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "our-badge",
								children: "OUR MILL"
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "production-gap",
							children: showWins ? `${plant.wins} WEEKLY WIN${plant.wins === 1 ? "" : "S"} · ${plant.gapLabel}` : plant.gapLabel
						}),
						plant.trendLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `production-trend ${plant.trendClass}`,
							children: plant.trendLabel
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "production-bar",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "production-bar-fill",
								style: {
									width: `${plant.barPercent}%`,
									background: MILL_HEX[plant.name].stroke
								}
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "production-score",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "production-tons",
						children: plant.tonsDisplay
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "production-unit",
						children: "TONS RUN"
					})]
				})
			]
		}, plant.name))]
	});
}
function TrendsSlide({ graph }) {
	const chartData = graph.weeks.map((week) => ({
		label: week.label,
		...week.values
	}));
	const lastIndex = Math.max(0, chartData.length - 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "trends-board",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "production-head",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "production-eyebrow",
					children: "PIG FEED · SATURDAY FINALS"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "production-title",
					children: "Weekly Tonnage Trends"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "production-sub",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
						"Last ",
						graph.count,
						" closed weeks"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"· Week ending ",
						graph.latestLabel || "—",
						graph.previousLabel ? ` · vs ${graph.previousLabel}` : ""
					] })]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "trends-layout",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "trends-chart-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "trends-legend",
					children: PLANT_NAMES.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `trends-legend-item${name === "North Baltimore" ? " our" : ""}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "trends-swatch",
								style: { background: MILL_HEX[name].stroke }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: name }),
							name === "North Baltimore" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "OUR MILL" }) : null
						]
					}, name))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "trends-chart",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: chartData,
							margin: {
								top: 8,
								right: 16,
								left: 4,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "rgba(232,237,243,0.08)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									stroke: "#8b97a8",
									fontSize: 13,
									tickLine: false,
									axisLine: false,
									interval: 0,
									dy: 4
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "#8b97a8",
									fontSize: 13,
									tickLine: false,
									axisLine: false,
									width: 54,
									tickFormatter: (value) => Math.round(value).toLocaleString("en-US")
								}),
								PLANT_NAMES.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: name,
									stroke: MILL_HEX[name].stroke,
									strokeWidth: name === "North Baltimore" ? 4 : 2.4,
									dot: (props) => {
										const { cx, cy, index } = props;
										if (index !== lastIndex || cx == null || cy == null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {}, `${name}-${index}`);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
											cx,
											cy,
											r: name === "North Baltimore" ? 7 : 5.5,
											fill: MILL_HEX[name].stroke,
											stroke: "#0a1018",
											strokeWidth: 2
										}, `${name}-last`);
									},
									activeDot: false,
									isAnimationActive: false
								}, name))
							]
						})
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "trends-side",
				children: graph.mills.map((mill) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `trends-mill${mill.our ? " our" : ""}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "trends-mill-head",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "trends-swatch",
									style: { background: MILL_HEX[mill.name].stroke }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "trends-mill-name",
									children: mill.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "trends-mill-rank",
									children: ["#", mill.rank]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "trends-mill-tons",
							children: mill.tonsDisplay
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `trends-mill-delta ${mill.dir}`,
							children: [
								mill.symbol,
								" ",
								mill.deltaDisplay
							]
						})
					]
				}, mill.name))
			})]
		})]
	});
}
function ConquestSlide({ mode, weekLabel, live, territories, transfers, owners, statusTitle, statusDetail }) {
	const applied = transfers.filter((t) => t.applied);
	const captureStatus = applied.length ? applied.map((row) => `${row.winner.toUpperCase()} TAKES ${row.territoryName.toUpperCase()}`).join("  ·  ") : statusTitle.toUpperCase();
	const captureDetail = applied.length ? "LIKE RISK. ATTACK ONLY A COUNTRY YOU TOUCH." : statusDetail.toUpperCase();
	const weeklySorted = [...territories].sort((a, b) => a.weeklyRank - b.weeklyRank);
	const ytdSorted = [...territories].sort((a, b) => a.seasonRank - b.seasonRank);
	const held = countBoard(owners);
	const controlSorted = [...territories].map((row) => ({
		...row,
		territories: held[row.name] ?? 0
	})).sort((a, b) => {
		const t = b.territories - a.territories;
		if (t) return t;
		return a.name.localeCompare(b.name);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "conquest-board",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "conquest-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "conquest-brand",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MillCrest, { className: "conquest-crest" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "conquest-title",
							children: "MILL CONQUEST BOARD"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "conquest-subtitle",
							children: "PLAN. PRODUCE. DELIVER. CONQUER."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "conquest-kicker",
							children: "PIG FEED. MULTI-MILL PRODUCTION. BUILT ON TEAMWORK."
						})
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "conquest-week-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "conquest-week-date",
						children: live ? `${weekLabel} · LIVE` : weekLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "conquest-week-rule",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PigMark, {
							className: "conquest-week-pig",
							fill: "currentColor"
						}), "YTD CONTROL. ONE MAP."]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "conquest-main",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "conquest-scene",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConquestMap, {
						territories,
						transfers,
						owners,
						mode,
						live
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "conquest-sidebar",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "conquest-panel weekly-panel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "conquest-panel-title",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cq-star" }),
									" WEEKLY TONS ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cq-star" })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "conquest-weekly-list",
								children: weeklySorted.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `conquest-weekly-row${row.our ? " our" : ""}`,
									style: { ["--row-tone"]: MILL_HEX[row.name].stroke },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "conquest-mill-shield",
											"aria-hidden": "true",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PigMark, { fill: "#f4f0e6" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "conquest-weekly-meta",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "conquest-weekly-name",
												children: [row.name.toUpperCase(), row.our ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "OUR MILL" }) : null]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "conquest-weekly-tons",
											children: row.weeklyTonsDisplay
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `conquest-trend ${row.trendDir}`,
											children: row.trendSymbol
										})
									]
								}, row.name))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "conquest-panel ytd-panel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "conquest-panel-title",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cq-star" }),
									" YTD TOTAL TONS ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cq-star" })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "conquest-ytd-table",
								children: ytdSorted.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `conquest-ytd-row${row.our ? " our" : ""}`,
									style: { ["--row-tone"]: MILL_HEX[row.name].stroke },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "conquest-ytd-rank",
											children: row.seasonRank
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "conquest-ytd-name",
											children: row.name.toUpperCase()
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "conquest-ytd-value",
											children: row.ytdTonsDisplay
										})
									]
								}, row.name))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "conquest-panel control-panel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "conquest-panel-title",
								children: "TERRITORIES CONTROLLED"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "conquest-control-row",
								children: controlSorted.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "conquest-control-mill",
									style: { ["--row-tone"]: MILL_HEX[row.name].stroke },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "conquest-control-shield",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PigMark, { fill: "#f4f0e6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: row.territories })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "conquest-control-label",
										children: row.name.toUpperCase()
									})]
								}, row.name))
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "conquest-footer",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "conquest-footer-news",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TargetMark, { className: "conquest-footer-icon" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "conquest-footer-value",
							children: captureStatus
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "conquest-footer-detail",
							children: captureDetail
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "conquest-footer-center",
						"aria-hidden": "true",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cq-chevron-pack left" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cq-swords-mark" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cq-chevron-pack right" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "conquest-footer-slogan",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "conquest-slogan",
							children: mode === "season" ? "CONTROL THE SEASON." : "ONE WEEK. ONE MAP. ONE WINNER."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrophyMark, { className: "conquest-trophy" })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "conquest-credit",
				children: "POWERED BY CHADAK47"
			})
		]
	});
}
function RecordsSlide({ records }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "records-board",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "records-head",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "records-eyebrow",
						children: "PIG FEED · PRODUCTION RECORD BOOK"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "records-title",
						children: "PRODUCTION RECORDS & STREAKS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "records-sub",
						children: [
							records.completedWeeks,
							" COMPLETED WEEK",
							records.completedWeeks === 1 ? "" : "S",
							" · FINAL SATURDAY TOTALS"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "records-highlights",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "records-highlight primary",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "records-label",
								children: "CURRENT CHAMPION"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "records-value",
								children: records.latestWinnerLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "records-detail",
								children: records.latestWeekDisplay
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "records-highlight",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "records-label",
								children: "RECORD WEEK"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "records-value",
								children: [
									records.overallBest.name,
									" · ",
									records.overallBest.tonsDisplay,
									" TONS"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "records-detail",
								children: records.overallBest.weekDisplay
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "records-highlight",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "records-label",
								children: "BIGGEST WINNING MARGIN"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "records-value",
								children: [
									records.biggestWin.name,
									" · +",
									records.biggestWin.marginDisplay,
									" TONS"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "records-detail",
								children: records.biggestWin.weekDisplay
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "records-table-head",
				children: [
					"MILL",
					"WINS",
					"CURRENT STREAK",
					"LONGEST STREAK",
					"PERSONAL BEST"
				].map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "records-cell",
					children: label
				}, label))
			}),
			records.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `records-table-row${row.our ? " our" : ""}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "records-cell",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "records-name",
							children: [row.name, row.our ? " · OUR MILL" : ""]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "records-cell",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "records-number",
							children: row.wins
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "records-caption",
							children: "WEEKLY WINS"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "records-cell",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "records-number",
							children: row.currentStreak
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "records-caption",
							children: "WEEKS"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "records-cell",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "records-number",
							children: row.longestStreak
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "records-caption",
							children: "WEEKS"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "records-cell",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "records-number",
							children: row.bestWeekDisplay
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "records-caption",
							children: "TONS RUN"
						})]
					})
				]
			}, row.name))
		]
	});
}
var BOARD_SECTIONS = [
	{
		key: "goalText",
		label: "Today's Goal",
		icon: Flag
	},
	{
		key: "todayFocus",
		label: "Today's Focus",
		icon: Shield
	},
	{
		key: "safetyFocus",
		label: "Safety Focus",
		icon: Shield
	},
	{
		key: "maintenance",
		label: "Maintenance",
		icon: Shield
	},
	{
		key: "shipping",
		label: "Shipping / Loads",
		icon: Flag
	},
	{
		key: "staffing",
		label: "Staffing / Coverage",
		icon: Award
	},
	{
		key: "managerNote",
		label: "Manager Note",
		icon: Award
	}
];
function PlantBoardSlide({ board, updatedLabel }) {
	const sections = BOARD_SECTIONS.map((section) => ({
		...section,
		text: String(board[section.key] ?? "").trim()
	})).filter((section) => section.text);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "plant-board-slide",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "plant-board-head",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "plant-board-kicker",
					children: "North Baltimore · Daily Operations"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "plant-board-title",
					children: board.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "plant-board-sub",
					children: board.subtitle
				})
			] }), updatedLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "plant-board-stamp",
				children: ["UPDATED ", updatedLabel]
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "plant-board-grid",
			children: sections.map((section) => {
				const Icon = section.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `plant-board-card${section.key === "goalText" ? " goal" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "plant-board-label",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							size: 14,
							strokeWidth: 2.2
						}), section.label]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "plant-board-text",
						children: section.text
					})]
				}, section.key);
			})
		})]
	});
}
function PeopleSlide({ person }) {
	const birthday = person.kind === "birthday";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `person-slide ${person.kind}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "person-visual",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "person-fallback",
				children: initials(person.name)
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "person-copy",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "person-kicker",
					children: birthday ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cake, {
						size: 18,
						strokeWidth: 2
					}), " Happy birthday"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, {
						size: 18,
						strokeWidth: 2
					}), " Employee recognition"] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "person-name",
					children: person.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "person-message",
					children: person.message || (birthday ? "Wishing you a great birthday!" : "Thank you for your hard work!")
				})
			]
		})]
	});
}
function buildSlides(state, decks = []) {
	const slides = [];
	const { production, settings, plantBoard, people } = state;
	const d = settings.durations;
	if (settings.decksEnabled !== false) {
		const hold = Math.max(4, d.presentation ?? 10);
		for (const deck of decks.filter((item) => item.enabled && item.slides.length)) deck.slides.forEach((slide, index) => {
			slides.push({
				id: `deck-${deck.id}-${index}`,
				kind: "deck",
				duration: hold,
				src: slide.src,
				title: deck.name,
				page: index + 1,
				pages: deck.slides.length
			});
		});
	}
	const lastClosed = lastClosedPair(production);
	const weekly = rankedProduction(production.plants, {}, rankChangeTrends(production.plants, lastClosed.current));
	const ytd = ytdProduction(production);
	const conquest = conquestContext(production);
	const records = productionRecords(production);
	const graph = weeklyGraph(production, 12);
	if (settings.productionEnabled) {
		slides.push({
			id: "prod-weekly",
			kind: "production",
			duration: d.productionWeekly,
			title: "FEED MILL PRODUCTION CHAMPIONSHIP",
			period: `Week ending ${formatWeekEnding(production.weekEnding)}`,
			metric: "TONS RUN",
			plants: weekly
		});
		slides.push({
			id: "prod-ytd",
			kind: "production",
			duration: d.productionYtd,
			title: `${ytd.year} YEAR-TO-DATE CHAMPIONSHIP`,
			period: `${ytd.year} YTD`,
			metric: "YTD TONS RUN",
			plants: ytd.ranked,
			showWins: true
		});
		if (graph.weeks.length) slides.push({
			id: "prod-trends",
			kind: "trends",
			duration: d.productionTrends ?? 16,
			graph
		});
	}
	if (settings.recordsEnabled) slides.push({
		id: "records",
		kind: "records",
		duration: d.productionRecords,
		records
	});
	if (settings.conquestEnabled) {
		const seasonRows = conquest.ytdRanked.map((row) => {
			const match = conquest.territories.find((t) => t.name === row.name);
			return {
				name: row.name,
				rank: row.rank,
				our: row.our,
				displayValue: match.ytdTonsDisplay,
				territories: match.territories
			};
		});
		slides.push({
			id: "conquest-season",
			kind: "conquest",
			duration: d.conquest,
			mode: "season",
			period: `${conquest.year} season conquest · week-by-week control`,
			weekLabel: `WEEK ${conquest.weekNumber} • ${conquest.weekRangeDisplay}`,
			live: conquest.weeklyLive,
			sourceLabel: "YTD CAMPAIGN",
			leaderName: conquest.seasonLeader,
			leaderboardTitle: "YTD TOTAL TONS",
			scoreRows: seasonRows,
			territories: conquest.territories,
			transfers: conquest.lastTransfers,
			owners: conquest.owners,
			statusTitle: conquest.seasonLeader ? `${conquest.seasonLeader} controls the campaign` : "Season campaign waiting for results",
			statusDetail: `24 countries. Capitals hold. Last ${conquest.campaignWeeks} week${conquest.campaignWeeks === 1 ? "" : "s"} of border wars.`
		});
	}
	const sectionsFilled = [
		plantBoard.goalText,
		plantBoard.todayFocus,
		plantBoard.safetyFocus,
		plantBoard.maintenance,
		plantBoard.shipping,
		plantBoard.staffing,
		plantBoard.managerNote
	].some((value) => value.trim());
	if (plantBoard.enabled && sectionsFilled) slides.push({
		id: "plant-board",
		kind: "plant-board",
		duration: d.plantBoard,
		board: plantBoard,
		updatedLabel: plantBoard.updatedAt ? format(plantBoard.updatedAt, "MMM d · h:mm a") : ""
	});
	if (settings.peopleEnabled) {
		const today = /* @__PURE__ */ new Date();
		const month = today.getMonth() + 1;
		const day = today.getDate();
		const visible = people.filter((person) => {
			if (!person.enabled) return false;
			if (person.kind === "birthday") {
				const parts = person.date.split("-");
				return Number(parts[1]) === month && Math.abs(Number(parts[2]) - day) <= 7;
			}
			const start = person.date;
			const end = person.endDate || person.date;
			const iso = format(today, "yyyy-MM-dd");
			return iso >= start && iso <= end;
		});
		for (const person of visible.length ? visible : people.filter((p) => p.enabled).slice(0, 2)) slides.push({
			id: `person-${person.id}`,
			kind: "person",
			duration: d.people,
			person
		});
	}
	return slides;
}
function ClockOverlay({ enabled, position }) {
	const [now, setNow] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setNow(/* @__PURE__ */ new Date());
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => window.clearInterval(id);
	}, []);
	if (!enabled || !now) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("clock-overlay", position),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "clock-time",
			children: now.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "clock-date",
			children: now.toLocaleDateString("en-US", {
				weekday: "long",
				month: "long",
				day: "numeric"
			})
		})]
	});
}
function Ticker({ message, speed, hidden }) {
	if (hidden || !message) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "ticker-overlay",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ticker-track",
			style: { animationDuration: `${speed === "slow" ? 42 : speed === "fast" ? 18 : 28}s` },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: message }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: message })]
		})
	});
}
var ANNOUNCE_COPY = {
	info: {
		label: "Information",
		tone: "info"
	},
	safety: {
		label: "Safety notice",
		tone: "safety"
	},
	urgent: {
		label: "Urgent",
		tone: "urgent"
	},
	celebration: {
		label: "Celebration",
		tone: "celebration"
	}
};
function TvUpdater() {
	const [status, setStatus] = (0, import_react.useState)("idle");
	const started = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		let alive = true;
		const tick = async () => {
			const remote = await remoteAppBuild();
			if (!alive || !remote || remote === "dev" || remote === "1788636867310") return;
			setStatus("ready");
			if (started.current) return;
			started.current = true;
			window.setTimeout(() => {
				setStatus("updating");
				applyAppUpdate("/");
			}, 4e3);
		};
		tick();
		const id = window.setInterval(() => void tick(), 12e4);
		return () => {
			alive = false;
			window.clearInterval(id);
		};
	}, []);
	if (status === "idle") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "tv-update-banner",
		children: status === "updating" ? "Loading the new app…" : "New app found. This TV will update."
	});
}
function TvDisplay() {
	const production = useDisplayStore((s) => s.production);
	const plantBoard = useDisplayStore((s) => s.plantBoard);
	const people = useDisplayStore((s) => s.people);
	const announcement = useDisplayStore((s) => s.announcement);
	const settings = useDisplayStore((s) => s.settings);
	const clearAnnouncement = useDisplayStore((s) => s.clearAnnouncement);
	const { decks } = useMediaLibrary();
	const slides = (0, import_react.useMemo)(() => buildSlides({
		production,
		plantBoard,
		people,
		announcement,
		settings
	}, decks), [
		production,
		plantBoard,
		people,
		announcement,
		settings,
		decks
	]);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [paused, setPaused] = (0, import_react.useState)(false);
	const [chrome, setChrome] = (0, import_react.useState)(true);
	const hideTimer = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (index >= slides.length) setIndex(0);
	}, [index, slides.length]);
	const slide = slides[index] ?? slides[0];
	const slideId = slide?.id ?? "";
	const holdMs = Math.max(2, Number(slide?.duration) || 12) * 1e3;
	const liveAnnouncement = announcement && announcement.expiresAt > Date.now() ? announcement : null;
	(0, import_react.useEffect)(() => {
		if (new URLSearchParams(window.location.search).has("boot")) window.history.replaceState({}, "", "/");
	}, []);
	(0, import_react.useEffect)(() => {
		const stamp = Number(settings.reloadAt || 0);
		if (!stamp) return;
		const key = "nb-reload-at";
		const prev = Number(sessionStorage.getItem(key) || "0");
		sessionStorage.setItem(key, String(stamp));
		if (prev && stamp > prev) applyAppUpdate("/");
	}, [settings.reloadAt]);
	(0, import_react.useEffect)(() => {
		if (!liveAnnouncement && announcement) clearAnnouncement();
	}, [
		liveAnnouncement,
		announcement,
		clearAnnouncement
	]);
	(0, import_react.useEffect)(() => {
		if (paused || liveAnnouncement || !slideId) return;
		const total = slides.length;
		const id = window.setTimeout(() => {
			setIndex((current) => total ? (current + 1) % total : 0);
		}, holdMs);
		return () => window.clearTimeout(id);
	}, [
		index,
		paused,
		liveAnnouncement,
		slideId,
		holdMs,
		slides.length
	]);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key === "ArrowRight") setIndex((i) => slides.length ? (i + 1) % slides.length : 0);
			if (event.key === "ArrowLeft") setIndex((i) => slides.length ? (i - 1 + slides.length) % slides.length : 0);
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
	(0, import_react.useEffect)(() => {
		bumpChrome();
		return () => {
			if (hideTimer.current) window.clearTimeout(hideTimer.current);
		};
	}, []);
	const hideTicker = slide?.kind === "conquest" || slide?.kind === "trends" || slide?.kind === "deck" || Boolean(liveAnnouncement);
	const hideClock = Boolean(liveAnnouncement) || slide?.kind === "conquest" || slide?.kind === "trends";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "tv-shell",
		onMouseMove: bumpChrome,
		onClick: bumpChrome,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TvUpdater, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "tv-stage",
			children: [
				liveAnnouncement ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("announce-board", ANNOUNCE_COPY[liveAnnouncement.type].tone),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "announce-kicker",
							children: ANNOUNCE_COPY[liveAnnouncement.type].label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "announce-message",
							children: liveAnnouncement.message
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "announce-sub",
							children: "Returns to the playlist automatically"
						})
					]
				}) : slide ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: slide.kind === "deck" ? "tv-slide deck" : "tv-slide",
					children: [
						slide.kind === "deck" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckSlide, {
							src: slide.src,
							title: slide.title,
							page: slide.page,
							pages: slide.pages
						}) : null,
						slide.kind === "production" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductionSlide, {
							title: slide.title,
							period: slide.period,
							metric: slide.metric,
							plants: slide.plants,
							showWins: slide.showWins
						}) : null,
						slide.kind === "trends" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendsSlide, { graph: slide.graph }) : null,
						slide.kind === "conquest" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConquestSlide, {
							mode: slide.mode,
							period: slide.period,
							weekLabel: slide.weekLabel,
							live: slide.live,
							sourceLabel: slide.sourceLabel,
							leaderName: slide.leaderName,
							leaderboardTitle: slide.leaderboardTitle,
							scoreRows: slide.scoreRows,
							territories: slide.territories,
							transfers: slide.transfers,
							owners: slide.owners,
							statusTitle: slide.statusTitle,
							statusDetail: slide.statusDetail
						}) : null,
						slide.kind === "records" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordsSlide, { records: slide.records }) : null,
						slide.kind === "plant-board" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlantBoardSlide, {
							board: slide.board,
							updatedLabel: slide.updatedLabel
						}) : null,
						slide.kind === "person" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeopleSlide, { person: slide.person }) : null
					]
				}, slide.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "tv-empty",
					children: "Nothing is queued for the display."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockOverlay, {
					enabled: settings.clockEnabled && !hideClock,
					position: settings.clockPosition
				}),
				settings.ticker.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticker, {
					message: settings.ticker.message,
					speed: settings.ticker.speed,
					hidden: hideTicker
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("tv-chrome", chrome ? "on" : ""),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/control",
							className: "tv-control-link",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { size: 16 }), "Control room"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/update",
							className: "tv-control-link",
							children: "Update TV"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tv-transport",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setIndex((i) => slides.length ? (i - 1 + slides.length) % slides.length : 0),
									"aria-label": "Previous slide",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { size: 16 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setPaused((v) => !v),
									"aria-label": paused ? "Play" : "Pause",
									children: paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 16 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setIndex((i) => slides.length ? (i + 1) % slides.length : 0),
									"aria-label": "Next slide",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { size: 16 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "tv-dots",
									children: slides.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: cn("tv-dot", i === index ? "active" : ""),
										onClick: () => setIndex(i),
										"aria-label": `Show ${item.id}`
									}, item.id))
								})
							]
						})
					]
				})
			]
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TvDisplay, {});
}
//#endregion
export { Home as component };
