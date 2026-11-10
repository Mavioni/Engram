/* Cache only the public app shell. Notes live in the encrypted vault, never here. */
const scope = self.registration.scope;
const PREFIX = `engram-notes-alpha-${new URL(scope).pathname}-`;
const CACHE = `${PREFIX}786b57926faa`;
const shell = new URL("./", scope).href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const response = await fetch(shell, { cache: "reload" });
      if (!response.ok) throw new Error("The app shell could not be cached.");
      const html = await response.clone().text();
      await cache.put(shell, response);
      const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"?#]+)"/gu)].map(
        (match) => new URL(match[1], scope).href,
      );
      await cache.addAll([
        ...assets,
        ...["manifest.webmanifest", "engram-icon.svg", "engram-192.png", "engram-512.png"].map(
          (path) => new URL(path, scope).href,
        ),
      ]);
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    !url.href.startsWith(scope) ||
    url.pathname.includes("/api/")
  )
    return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          if (response.ok) await (await caches.open(CACHE)).put(shell, response.clone());
          return response;
        } catch {
          return (await (await caches.open(CACHE)).match(shell)) ?? Response.error();
        }
      })(),
    );
  } else if (
    url.href.startsWith(new URL("assets/", scope).href) ||
    /\.(?:svg|png|webmanifest)$/u.test(url.pathname)
  ) {
    event.respondWith(
      (async () => {
        // Public hashed assets do not vary by identity. Development preview
        // servers add Vary: Origin, while module-script and precache requests
        // send different Origin headers. Do not let that break offline loading.
        const cached = await (await caches.open(CACHE)).match(event.request, { ignoreVary: true });
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok) await (await caches.open(CACHE)).put(event.request, response.clone());
        return response;
      })(),
    );
  }
});
