from pathlib import Path

sw = r'''/* DINGEL HAFIZIA MADRASA ERP — PWA SERVICE WORKER v2 */
"use strict";

const CACHE_NAME = "dingel-hafizia-erp-v2";
const APP_SHELL = [
  "./",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./students.json",
  "./logo.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Always fetch HTML from the network first so GitHub Pages updates
  // are not hidden behind an old cached index.html.
  if (event.request.mode === "navigate" ||
      url.pathname.endsWith(".html")) {
    event.respondWith(
      fetch(event.request)
        .then(response => response)
        .catch(() => caches.match(event.request).then(r => r || caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request)
        .then(response => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
'''
p=Path("/mnt/data/service-worker.js")
p.write_text(sw,encoding="utf-8")
print("Created",p)
      
