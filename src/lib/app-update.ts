declare const __APP_BUILD__: string | undefined;

export const APP_BUILD = typeof __APP_BUILD__ === "string" && __APP_BUILD__ ? __APP_BUILD__ : "dev";

export async function applyAppUpdate(nextPath = "/") {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    try {
      localStorage.removeItem("nb-mill-pack");
    } catch {
      /* ignore */
    }
  } catch {
    /* still reload */
  }
  const url = new URL(nextPath, window.location.origin);
  url.searchParams.set("boot", String(Date.now()));
  window.location.replace(url.toString());
}

export async function remoteAppBuild(): Promise<string | null> {
  try {
    const res = await fetch(`/?probe=${Date.now()}`, {
      cache: "no-store",
      headers: { accept: "text/html" },
    });
    const html = await res.text();
    return html.match(/name="app-build"\s+content="([^"]+)"/i)?.[1] ?? null;
  } catch {
    return null;
  }
}
