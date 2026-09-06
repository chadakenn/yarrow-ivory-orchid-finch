import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as useDisplayStore, t as APP_BUILD } from "./store-COqNrb3J.mjs";
import { _ as createRootRoute, b as require_jsx_runtime, d as HeadContent, g as createFileRoute, h as lazyRouteComponent, m as Outlet, p as createRouter, u as Scripts, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as literal, c as string, i as boolean, l as union, n as any, o as number, r as array, s as object, t as _enum } from "../_libs/zod.mjs";
import { i as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kiosk-C7xPUTEN.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var plantSchema = object({
	name: _enum([
		"Marshville",
		"Henderson",
		"North Baltimore",
		"Albertville"
	]),
	tons: number().nonnegative()
});
var productionSchema = object({
	weekEnding: string(),
	lastUpdated: number().nullable(),
	plants: array(plantSchema),
	history: array(object({
		id: string(),
		weekEnding: string(),
		plants: array(plantSchema),
		winners: array(_enum([
			"Marshville",
			"Henderson",
			"North Baltimore",
			"Albertville"
		]))
	}))
});
var fetchKiosk = createServerFn({ method: "GET" }).handler(createSsrRpc("72c76414a7186669e32012ed00d32065407d8803434ea7546c58c3b7e8d01cd6"));
var saveKiosk = createServerFn({ method: "POST" }).validator(object({
	production: productionSchema,
	plantBoard: any(),
	settings: any(),
	announcement: any()
})).handler(createSsrRpc("c49be3cbe29504f0a3cf7c2e25665d0dbd1ae5def75a2e358da1c07014fa9b0f"));
var listRemoteDecks = createServerFn({ method: "GET" }).handler(createSsrRpc("896535e7cc8c39fbda5ca0491dd9fcf2520793609ccd7a9ea9cf06aad2265bcf"));
var saveRemoteDeck = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	name: string(),
	kind: _enum([
		"pptx",
		"pdf",
		"image"
	]),
	enabled: boolean(),
	createdAt: number(),
	slides: array(object({ src: string() }))
})).handler(createSsrRpc("40a353c2b56330e8713d14f69817c76fc6b1d310ae41df1c028e2db231f05b44"));
var toggleRemoteDeck = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	enabled: boolean()
})).handler(createSsrRpc("3bb244513fad74173ae6fea06af30d24fe5b29fecd75a0e06023d970459da166"));
var removeRemoteDeck = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(createSsrRpc("0bfa6c90cba78e6cd4b52bf29d3264bb4eae039020e78368a3a02251228047e4"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DbzfnbCy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var ready = false;
var dirty = false;
var version = 0;
var timer = null;
var pushing = false;
var listeners = /* @__PURE__ */ new Set();
var status = "connecting";
var lastSaved = null;
function setStatus(next, at = lastSaved) {
	status = next;
	lastSaved = at;
	for (const listener of listeners) listener(status, lastSaved);
}
function snapshot() {
	const state = useDisplayStore.getState();
	return {
		production: state.production,
		plantBoard: state.plantBoard,
		settings: state.settings,
		announcement: state.announcement
	};
}
async function pushNow() {
	if (pushing) return;
	pushing = true;
	dirty = false;
	setStatus("saving");
	try {
		const result = await saveKiosk({ data: snapshot() });
		version = result.updatedAt;
		if (!dirty) setStatus("live", result.updatedAt);
	} catch {
		dirty = true;
		setStatus("error");
	} finally {
		pushing = false;
		if (dirty) queuePush();
	}
}
function queuePush() {
	if (!ready) return;
	dirty = true;
	if (timer) clearTimeout(timer);
	timer = setTimeout(() => {
		pushNow();
	}, 700);
}
function markKioskDirty() {
	queuePush();
}
async function hydrateKiosk() {
	try {
		const remote = await fetchKiosk();
		version = remote.updatedAt;
		useDisplayStore.setState({
			production: remote.production,
			plantBoard: remote.plantBoard,
			settings: remote.settings,
			announcement: remote.announcement
		});
		ready = true;
		setStatus("live", remote.updatedAt);
	} catch {
		ready = true;
		setStatus("error");
		queuePush();
	}
}
async function pullKiosk() {
	if (!ready || dirty || pushing) return;
	try {
		const remote = await fetchKiosk();
		if (remote.updatedAt <= version) {
			if (status !== "live") setStatus("live", lastSaved);
			return;
		}
		version = remote.updatedAt;
		useDisplayStore.setState({
			production: remote.production,
			plantBoard: remote.plantBoard,
			settings: remote.settings,
			announcement: remote.announcement
		});
		setStatus("live", remote.updatedAt);
	} catch {
		setStatus("error");
	}
}
function useKioskSyncStatus() {
	const [state, setState] = (0, import_react.useState)({
		status,
		lastSaved
	});
	(0, import_react.useEffect)(() => {
		const listener = (next, at) => setState({
			status: next,
			lastSaved: at
		});
		listeners.add(listener);
		listener(status, lastSaved);
		return () => {
			listeners.delete(listener);
		};
	}, []);
	return state;
}
function KioskSync() {
	(0, import_react.useEffect)(() => {
		hydrateKiosk();
		const id = window.setInterval(() => {
			pullKiosk();
		}, 4e3);
		const unsub = useDisplayStore.subscribe((current, previous) => {
			if (!ready) return;
			if (current.production === previous.production && current.plantBoard === previous.plantBoard && current.settings === previous.settings && current.announcement === previous.announcement) return;
			markKioskDirty();
		});
		return () => {
			window.clearInterval(id);
			unsub();
		};
	}, []);
	return null;
}
var styles_default = "/assets/styles-BM42R8iS.css";
var APP_NAME = "Breakroom Display";
var Route$5 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#0b0f14"
			},
			{
				name: "app-build",
				content: APP_BUILD
			},
			{
				name: "description",
				content: "North Baltimore 50 TPH mill communications hub — production, people, and mill conquest."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Cinzel:wght@600;700;800&family=Cinzel+Decorative:wght@700;900&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KioskSync, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "bottom-right",
				toastOptions: { style: {
					background: "#18212c",
					border: "1px solid color-mix(in oklab, #e8edf3 12%, transparent)",
					color: "#e8edf3"
				} }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$4 = () => import("./routes-BkmjczF3.mjs");
var Route$4 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./admin-7O26cgff.mjs");
var Route$3 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./control-DNkALJU1.mjs");
var Route$2 = createFileRoute("/control")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./office-Cfmfddiv.mjs");
var Route$1 = createFileRoute("/office")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./update-DF_G2Yrj.mjs");
var Route = createFileRoute("/update")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$4.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$5
	}),
	AdminRoute: Route$3.update({
		id: "/admin",
		path: "/admin",
		getParentRoute: () => Route$5
	}),
	ControlRoute: Route$2.update({
		id: "/control",
		path: "/control",
		getParentRoute: () => Route$5
	}),
	OfficeRoute: Route$1.update({
		id: "/office",
		path: "/office",
		getParentRoute: () => Route$5
	}),
	UpdateRoute: Route.update({
		id: "/update",
		path: "/update",
		getParentRoute: () => Route$5
	})
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { saveRemoteDeck as a, removeRemoteDeck as i, useKioskSyncStatus as n, toggleRemoteDeck as o, listRemoteDecks as r, router_exports as t };
