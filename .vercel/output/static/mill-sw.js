/* North Baltimore mill TV — serves an installed mill pack. */
const CACHE = "mill-kiosk";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  const networkFirst =
    path === "/update" ||
    path.startsWith("/api/") ||
    path.endsWith("mill-pack.zip") ||
    url.searchParams.has("probe") ||
    url.searchParams.has("boot");

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      if (networkFirst) {
        try {
          return await fetch(event.request);
        } catch {
          return (await cache.match(event.request, { ignoreSearch: true })) || Response.error();
        }
      }
      const exact = await cache.match(event.request, { ignoreSearch: true });
      if (exact) return exact;
      const byPath = await cache.match(path);
      if (byPath) return byPath;
      if (path === "/" || path === "/index.html") {
        const home = (await cache.match("/index.html")) || (await cache.match("/"));
        if (home) return home;
      }
      try {
        return await fetch(event.request);
      } catch {
        return Response.error();
      }
    })(),
  );
});
