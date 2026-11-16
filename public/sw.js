// Offline support. Pages you have opened are kept and served when the network is down;
// any other page falls back to /offline. Build files under /_next/static never change, so they are cached once.
// shortcut: the cache is never pruned, bump CACHE to clear it if it grows too large.
const CACHE = "punter-v1";

const keep = (request, response) => {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
};

self.addEventListener("install", (event) => {
  // The offline page and the build files it links to, so it is styled even on a first visit.
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const response = await fetch("/offline");
      // An error page must never become the offline page; failing here retries the install on the next visit.
      if (!response.ok) throw new Error("offline page unavailable");
      const html = await response.clone().text();
      await cache.put("/offline", response);
      // One missing file must not sink the rest.
      await Promise.allSettled([...new Set(html.match(/\/_next\/static\/[^"'\\ )]+/g) ?? [])].map((file) => cache.add(file)));
    })(),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== location.origin) return;

  if (request.mode === "navigate") {
    // Network first, so a page is never stale while online.
    event.respondWith(
      fetch(request)
        .then((response) => keep(request, response))
        .catch(async () => (await caches.match(request)) ?? (await caches.match("/offline"))),
    );
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(caches.match(request).then((hit) => hit ?? fetch(request).then((response) => keep(request, response))));
  }
});
